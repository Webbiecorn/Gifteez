#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { argv, exit } from 'node:process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

if (argv.length < 5) {
  console.error('Usage: node scripts/update-admin-password.mjs <email> <currentPassword> <newPassword>');
  exit(1);
}

const [, , email, currentPassword, newPassword] = argv;

async function main() {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env');
  const envRaw = await readFile(envPath, 'utf8');
  const match = envRaw.match(/^VITE_FIREBASE_API_KEY=(.*)$/m);
  if (!match) {
    throw new Error('VITE_FIREBASE_API_KEY not found in .env');
  }
  const apiKey = match[1].trim();

  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const signInRes = await fetch(signInUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: currentPassword, returnSecureToken: true })
  });

  if (!signInRes.ok) {
    const errorData = await signInRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || signInRes.statusText);
  }

  const signInData = await signInRes.json();
  console.log('✅ Signed in to existing user');

  const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;
  const updateRes = await fetch(updateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: signInData.idToken, password: newPassword, returnSecureToken: false })
  });

  if (!updateRes.ok) {
    const updateError = await updateRes.json().catch(() => ({}));
    throw new Error(updateError.error?.message || updateRes.statusText);
  }

  console.log('🔐 Password updated successfully');
}

main().catch((err) => {
  console.error('❌ Failed to update password:', err.message);
  exit(1);
});
