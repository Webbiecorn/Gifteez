// Script om een test admin gebruiker aan te maken
// Run dit bestand in de browser console op gifteez-7533b.web.app

(async function createTestAdmin() {
  console.log('🔧 Creating test admin account...');

  const testEmail = 'test@gifteez.nl';
  const testPassword = 'Admin123!';

  const firebaseModule = await import('./services/firebase.js');
  const authProviders = await import('https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js');

  const { auth } = firebaseModule;
  const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = authProviders;

  if (!auth) {
    console.error('❌ Firebase auth is not initialized. Run this script within the Gifteez app.');
    return { success: false, error: 'AUTH_NOT_INITIALIZED' };
  }

  console.log('📧 Attempting to create account:', testEmail);

  try {
    await createUserWithEmailAndPassword(auth, testEmail, testPassword);

    console.log('✅ Test admin account created successfully!');
    console.log('📧 Email:', testEmail);
    console.log('🔐 Password:', testPassword);
    console.log('🚀 You can now access /admin with these credentials');

    return {
      email: testEmail,
      password: testPassword,
      success: true,
    };
  } catch (error) {
    if (error?.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Account already exists, trying to sign in...');

      try {
        await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('✅ Successfully signed in to existing account');
        console.log('📧 Email:', testEmail);
        console.log('🔐 Password:', testPassword);

        return {
          email: testEmail,
          password: testPassword,
          success: true,
        };
      } catch (signInError) {
        console.error('❌ Failed to sign in:', signInError?.message || signInError);
        return { success: false, error: signInError?.message || 'SIGN_IN_FAILED' };
      }
    }

    console.error('❌ Failed to create account:', error?.message || error);
    return { success: false, error: error?.message || 'CREATE_FAILED' };
  }
})();