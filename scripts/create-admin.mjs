#!/usr/bin/env node
/**
 * Creates (or repairs) a Softronics administrator account.
 *
 *   npm run admin:create -- otimg197@gmail.com
 *   npm run admin:create -- otimg197@gmail.com --role owner
 *   echo 'my-strong-password' | npm run admin:create -- someone@example.com --password-stdin
 *
 * What it does:
 *   1. adds the email to public.admin_allowlist (if absent)
 *   2. creates the Supabase Auth user, with a generated strong password unless
 *      one is piped in via --password-stdin
 *   3. ensures the matching public.admin_users row exists and is active
 *
 * Security notes:
 *   - passwords are never written to disk, to the database, or to the repository
 *   - a generated password is printed exactly once; change it after first sign-in
 *   - requires SUPABASE_SERVICE_ROLE_KEY, which must only ever exist locally or
 *     in your hosting provider's encrypted environment settings
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

for (const file of ['.env.local', '.env']) {
  const full = path.join(process.cwd(), file);
  if (existsSync(full)) dotenv.config({ path: full });
}

const args = process.argv.slice(2);
const email = args.find((arg) => !arg.startsWith('-'));
const roleFlagIndex = args.indexOf('--role');
const role = roleFlagIndex >= 0 ? args[roleFlagIndex + 1] : 'owner';
const usePasswordStdin = args.includes('--password-stdin');

const VALID_ROLES = ['owner', 'admin', 'editor'];

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
}

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  fail('Provide an email address:  npm run admin:create -- you@example.com');
}
if (!VALID_ROLES.includes(role)) {
  fail(`Role must be one of: ${VALID_ROLES.join(', ')}`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  fail(
    'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Add them to .env.local first.',
  );
}

function generatePassword() {
  // 24 bytes of entropy, URL-safe, plus guaranteed symbol/digit variety.
  return `${crypto.randomBytes(18).toString('base64url')}-Aa1!`;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8').trim();
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  let password = null;
  let generated = false;

  if (usePasswordStdin) {
    password = await readStdin();
    if (!password || password.length < 8) fail('Piped password must be at least 8 characters.');
  } else {
    password = generatePassword();
    generated = true;
  }

  console.log(`\nProvisioning ${email} as "${role}"…`);

  // 1. allowlist
  const { error: allowlistError } = await supabase
    .from('admin_allowlist')
    .upsert({ email, role, note: 'Created by scripts/create-admin.mjs' }, { onConflict: 'email' });

  if (allowlistError) {
    fail(`Could not write admin_allowlist: ${allowlistError.message}. Have the migrations been run?`);
  }
  console.log('  allowlist   ok');

  // 2. auth user
  let userId = null;
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: email.split('@')[0] },
  });

  if (createError) {
    const alreadyExists =
      createError.status === 422 || /already (been )?registered|exists/i.test(createError.message);

    if (!alreadyExists) fail(`Could not create the auth user: ${createError.message}`);

    console.log('  auth user   already exists, leaving the password unchanged');
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listError) fail(`Could not look up the existing user: ${listError.message}`);
    const match = list.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (!match) {
      fail('The user exists but could not be found in the first 200 accounts. Use the Supabase dashboard.');
    }
    userId = match.id;
    generated = false;
  } else {
    userId = created.user.id;
    console.log('  auth user   created');
  }

  // 3. dashboard profile (the migration trigger normally does this; this is a repair path)
  const { error: profileError } = await supabase.from('admin_users').upsert(
    {
      id: userId,
      email,
      full_name: email.split('@')[0],
      role,
      is_active: true,
    },
    { onConflict: 'id' },
  );

  if (profileError) fail(`Could not write admin_users: ${profileError.message}`);
  console.log('  profile     ok');

  console.log('\nDone. Sign in at /admin/login');
  if (generated) {
    console.log('\n  Temporary password (shown once, not stored anywhere):');
    console.log(`  ${password}`);
    console.log('\n  Change it after your first sign-in: Supabase dashboard -> Authentication -> Users.\n');
  } else {
    console.log('  Use the existing password for this account.\n');
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
