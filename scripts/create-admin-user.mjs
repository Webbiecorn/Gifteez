#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const email = process.argv[2];
const password = process.argv[3];
const displayName = process.argv[4] ?? '';

if (!email || !password) {
  console.error('Usage: node scripts/create-admin-user.mjs <email> <password> [displayName]');
  process.exit(1);
}

const envPath = resolve(__dirname, '../.env');
console.log('🔐 Preparing to create Firebase auth user...');
let apiKey;

try {
  const envRaw = await readFile(envPath, 'utf8');
  const match = envRaw.match(/^VITE_FIREBASE_API_KEY=(.*)$/m);
  if (!match) {
    throw new Error('VITE_FIREBASE_API_KEY not found in .env');
  }
  apiKey = match[1].trim();
} catch (error) {
  console.error('Unable to read Firebase API key from .env:', error.message);
  process.exit(1);
}

const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

try {
  console.log('📡 Sending signup request for', email);

  const signUpResponse = await fetch(signUpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });

  if (!signUpResponse.ok) {
    const errorData = await signUpResponse.json().catch(() => ({}));

    if (errorData.error?.message === 'EMAIL_EXISTS') {
      console.log('ℹ️  Email already exists, attempting to sign in...');
      const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
      const signInResponse = await fetch(signInUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });

      if (!signInResponse.ok) {
        const signInError = await signInResponse.json().catch(() => ({}));
        throw new Error(signInError.error?.message || signInResponse.statusText);
      }

      const signInData = await signInResponse.json();
      console.log('✅ Signed in to existing user');
      await maybeUpdateDisplayName(signInData.idToken);
      reportCredentials();
      process.exit(0);
    }

    throw new Error(errorData.error?.message || signUpResponse.statusText);
  }

  const signUpData = await signUpResponse.json();
  console.log('✅ Firebase user created successfully');
  console.log('   Local ID:', signUpData.localId);

  await maybeUpdateDisplayName(signUpData.idToken);
  reportCredentials();
} catch (error) {
  console.error('❌ Failed to create Firebase user:', error.message);
  process.exit(1);
}

async function maybeUpdateDisplayName(idToken) {
  if (!displayName) return;

  const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;
  const updateResponse = await fetch(updateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, displayName, returnSecureToken: false })
  });

  if (!updateResponse.ok) {
    const updateError = await updateResponse.json().catch(() => ({}));
    console.warn('⚠️  Display name update failed:', updateError.error?.message || updateResponse.statusText);
  } else {
    console.log('📝 Display name set to:', displayName);
  }
}

function reportCredentials() {
  console.log('\nLogin credentials:');
  console.log('  Email:', email);
  console.log('  Password:', password);
}
