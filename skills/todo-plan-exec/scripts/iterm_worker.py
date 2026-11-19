#!/usr/bin/env python3
"""Right-hand iTerm2 pane running the executor's Claude Code session (skill todo-plan-exec).

The orchestrator (left pane) calls this from its Bash tool. Which pane is the worker
is stored in ~/.claude/todo-plan-exec/state/<uuid of the orchestrator's pane>.json,
so every orchestrator gets its own worker.

  iterm_worker.py split  --cwd DIR      open the right pane (unless it already exists)
  iterm_worker.py start  --cwd DIR --handoff F --session S1 --orchestrator NAME
                         [--model M] [--answers TEXT] [--preamble FILE]
                                        exit the old claude in the pane, start a new one
                                        with the preamble + the handoff as its prompt
  iterm_worker.py status                what runs in the right pane
  iterm_worker.py close                 /exit in the right pane

The Croatian subcommands and flags (pokreni, stanje, zatvori, --sesija,
--orkestrator, --odgovori) are accepted as aliases.

Needs: iTerm2 → Settings → General → Magic → Enable Python API, and `pip install iterm2`.
"""
import argparse
import asyncio
import json
import os
import shlex
import sys
from pathlib import Path

import iterm2

SKILL = Path(__file__).resolve().parent.parent
STATE_DIR = Path.home() / ".claude" / "todo-plan-exec" / "state"
# iTerm2 reports claude's jobName as its version (e.g. "2.1.325"), not "claude",
# so "is a shell in the pane" is the reliable test for "claude has exited".
SHELLS = {"zsh", "-zsh", "bash", "-bash", "fish", "-fish", "login", "sh"}


def my_uuid() -> str:
    sid = os.environ.get("ITERM_SESSION_ID", "")
    if ":" not in sid:
        sys.exit("ERROR: no ITERM_SESSION_ID; the orchestrator must run in an iTerm2 pane")
    return sid.split(":", 1)[1]


def state_path() -> Path:
    return STATE_DIR / f"{my_uuid()}.json"


def load_state() -> dict:
    p = state_path()
    return json.loads(p.read_text()) if p.exists() else {}


def save_state(s: dict) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state_path().write_text(json.dumps(s, indent=2))


def worker(app, state):
    sid = state.get("radnik") or state.get("worker")
    return app.get_session_by_id(sid) if sid else None


async def job(s) -> str:
    return (await s.async_get_variable("jobName")) or ""


async def wait_for_shell(s, seconds: float) -> bool:
    for _ in range(int(seconds * 2)):
        if (await job(s)) in SHELLS:
            return True
        await asyncio.sleep(0.5)
    return False


def pick_preamble(explicit) -> Path:
    if explicit:
        p = Path(explicit)
        return p if p.is_absolute() else SKILL / p
    for name in ("preamble.md", "preambula.md"):
        if (SKILL / name).exists():
            return SKILL / name
    sys.exit(f"ERROR: no preamble.md or preambula.md in {SKILL}")


async def split(app, a):
    state = load_state()
    if (s := worker(app, state)):
        print(f"OK worker already exists: {s.session_id}")
        return
    me = app.get_session_by_id(my_uuid())
    if me is None:
        sys.exit("ERROR: cannot find my own pane in iTerm2")
    new = await me.async_split_pane(vertical=True)
    await new.async_set_name("worker (todo-plan-exec)")
    await new.async_send_text(f"cd {shlex.quote(a.cwd)}\r")
    save_state({"worker": new.session_id, "cwd": a.cwd})
    print(f"OK right pane: {new.session_id}")


async def exit_claude(s) -> str:
    """Return the pane to a shell. /exit is the clean way; Ctrl-C only if it does not help."""
    if (await job(s)) in SHELLS:
        return "shell"
    await s.async_send_text("\x1b")          # close any open menu
    await asyncio.sleep(0.3)
    await s.async_send_text("/exit")
    await asyncio.sleep(0.5)
    await s.async_send_text("\r")
    if await wait_for_shell(s, 20):
        return "exit"
    for _ in range(3):
        await s.async_send_text("\x03")
        await asyncio.sleep(1)
    if await wait_for_shell(s, 10):
        return "ctrl-c"
    sys.exit(f"ERROR: claude in the right pane does not exit (job: {await job(s)})")


async def start(app, a):
    state = load_state()
    s = worker(app, state)
    if not s:
        sys.exit("ERROR: no right pane; run `split` first")
    handoff = Path(a.handoff).resolve()
    if not handoff.exists():
        sys.exit(f"ERROR: no handoff {handoff}")
    pre_path = pick_preamble(a.preamble)
    croatian = pre_path.name == "preambula.md"
    pre = pre_path.read_text()
    for k, v in {"{ORKESTRATOR}": a.orchestrator, "{ORCHESTRATOR}": a.orchestrator,
                 "{SESIJA}": a.session, "{SESSION}": a.session,
                 "{HANDOFF}": str(handoff)}.items():
        pre = pre.replace(k, v)
    answers = ""
    if a.answers:
        head = ("ODGOVORI KORISNIKA (na pitanja s vrha handoffa):" if croatian
                else "USER ANSWERS (to the questions at the top of the handoff):")
        answers = f"{head}\n{a.answers}\n\n"
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    prompt = STATE_DIR / f"{my_uuid()}-{a.session}.prompt.md"
    prompt.write_text(pre + "\n" + answers + handoff.read_text())

    how = await exit_claude(s)
    await s.async_send_text("clear\r")
    model = f" --model {shlex.quote(a.model)}" if a.model else ""
    # bypassPermissions: the executor runs unattended; the human gates live in the
    # handoff and the preamble, not in permission prompts nobody is watching.
    cmd = (f"cd {shlex.quote(a.cwd)} && claude --permission-mode bypassPermissions{model} "
           f"\"$(cat {shlex.quote(str(prompt))})\"\r")
    await s.async_send_text(cmd)
    await asyncio.sleep(4)
    state.update({"session": a.session, "prompt": str(prompt), "cwd": a.cwd})
    save_state(state)
    print(f"OK {a.session} started (previous: {how}; now: {await job(s)})")


async def status(app, a):
    st = load_state()
    s = worker(app, st)
    if not s:
        print("no worker")
        return
    print(json.dumps({**st, "job": await job(s)}, ensure_ascii=False))


async def close(app, a):
    s = worker(app, load_state())
    print("no worker" if not s else f"OK {await exit_claude(s)}")


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    sp = sub.add_parser("split")
    sp.add_argument("--cwd", required=True)
    st = sub.add_parser("start", aliases=["pokreni"])
    st.add_argument("--cwd", required=True)
    st.add_argument("--handoff", required=True)
    st.add_argument("--session", "--sesija", dest="session", required=True)
    st.add_argument("--orchestrator", "--orkestrator", dest="orchestrator", required=True)
    st.add_argument("--model")
    st.add_argument("--answers", "--odgovori", dest="answers",
                    help="the user's answers to the questions at the top of the handoff")
    st.add_argument("--preamble", help="preamble file (default: preamble.md, else preambula.md)")
    sub.add_parser("status", aliases=["stanje"])
    sub.add_parser("close", aliases=["zatvori"])
    a = p.parse_args()
    fn = {"split": split, "start": start, "pokreni": start, "status": status,
          "stanje": status, "close": close, "zatvori": close}[a.cmd]

    async def run(conn):
        app = await iterm2.async_get_app(conn)
        await fn(app, a)

    iterm2.run_until_complete(run)


if __name__ == "__main__":
    main()
