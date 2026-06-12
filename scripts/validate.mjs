#!/usr/bin/env node
// Validate data/*.yaml against schema/cv.schema.json. CI gate: exits non-zero
// on any structural error so a bad edit can never reach the site or PDFs.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import Ajv from "ajv/dist/2020.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(readFileSync(join(root, "schema/cv.schema.json"), "utf8"));
const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
ajv.addSchema(schema, "cv");

const load = (p) => yaml.load(readFileSync(join(root, p), "utf8"));

const docs = {
  profile: { schemaKey: "profile", data: load("data/profile.yaml") },
  experience: { schemaKey: "experience", data: load("data/experience.yaml") },
  skills: { schemaKey: "skills", data: load("data/skills.yaml") },
  education: { schemaKey: "education", data: load("data/education.yaml") },
};

for (const f of readdirSync(join(root, "data/projects")).filter((f) => f.endsWith(".yaml"))) {
  docs[`projects/${f}`] = { schemaKey: "project", data: load(`data/projects/${f}`) };
}

let failed = false;
for (const [name, { schemaKey, data }] of Object.entries(docs)) {
  const validate = ajv.getSchema(`cv#/$defs/${schemaKey}`);
  if (!validate(data)) {
    failed = true;
    console.error(`✗ ${name}`);
    for (const e of validate.errors) console.error(`    ${e.instancePath || "/"} ${e.message}`);
  } else {
    console.log(`✓ ${name}`);
  }
}

// Cross-checks the schema can't express.
const ids = new Set();
for (const [name, { schemaKey, data }] of Object.entries(docs)) {
  if (schemaKey !== "project") continue;
  if (ids.has(data.id)) {
    failed = true;
    console.error(`✗ duplicate project id "${data.id}" in ${name}`);
  }
  ids.add(data.id);
}

process.exit(failed ? 1 : 0);
