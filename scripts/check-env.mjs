#!/usr/bin/env node
/**
 * Reports which environment variables are present, without printing any values.
 *
 *   npm run env:check
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';

const root = process.cwd();
const files = ['.env.local', '.env'];
const loaded = [];

for (const file of files) {
  const full = path.join(root, file);
  if (existsSync(full)) {
    dotenv.config({ path: full });
    loaded.push(file);
  }
}

const REQUIRED = [
  ['NEXT_PUBLIC_SITE_URL', 'Canonical URL used for SEO metadata and the sitemap'],
  ['NEXT_PUBLIC_SUPABASE_URL', 'Database, auth and storage'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Public client key, safe to expose'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'Server only. Needed for contact-form inserts and scripts'],
];

const OPTIONAL = [
  ['NEXT_PUBLIC_CONTACT_EMAIL', 'Shown on the website'],
  ['NEXT_PUBLIC_WHATSAPP_NUMBER', 'Hides the WhatsApp link when empty'],
  ['SUPABASE_STORAGE_BUCKET', 'Defaults to "media"'],
  ['DATABASE_URL', 'Only needed for psql or migration tooling'],
  ['AUTH_SECRET', 'Reserved for future auth adapters'],
  ['ADMIN_ALLOWED_EMAILS', 'Extra gate on top of the database allowlist'],
  ['EMAIL_PROVIDER', 'Set to "resend" to enable notification emails'],
  ['RESEND_API_KEY', 'Required when EMAIL_PROVIDER=resend'],
  ['EMAIL_FROM', 'Verified sender address'],
  ['EMAIL_TO', 'Where contact submissions are delivered'],
];

const present = (key) => {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0;
};

console.log('\nSoftronics environment check');
console.log(
  loaded.length > 0 ? `Loaded: ${loaded.join(', ')}` : 'No .env.local found (using process env only)',
);

let missingRequired = 0;

console.log('\nRequired');
for (const [key, note] of REQUIRED) {
  const ok = present(key);
  if (!ok) missingRequired += 1;
  console.log(`  ${ok ? 'set    ' : 'MISSING'}  ${key.padEnd(32)} ${note}`);
}

console.log('\nOptional');
for (const [key, note] of OPTIONAL) {
  console.log(`  ${present(key) ? 'set    ' : '-      '}  ${key.padEnd(32)} ${note}`);
}

if (missingRequired > 0) {
  console.log(
    `\n${missingRequired} required variable(s) missing. Copy .env.example to .env.local and fill them in.\n`,
  );
  process.exitCode = 1;
} else {
  console.log('\nAll required variables are set.\n');
}
