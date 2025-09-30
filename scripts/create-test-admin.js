// Script om een test admin gebruiker aan te maken
// Run dit bestand in de browser console op gifteez-7533b.web.app

(async function createTestAdmin() {
  console.log('🔧 Creating test admin account...');
  
  const testEmail = 'test@gifteez.nl';
  const testPassword = 'Admin123!';
  
  try {
    // Import Firebase auth (werkt alleen als je op de site bent)
    const { auth } = await import('./services/firebase.js');
    const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js');
    
    console.log('📧 Attempting to create account:', testEmail);
    
    // Probeer account aan te maken
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    
    console.log('✅ Test admin account created successfully!');
    console.log('📧 Email:', testEmail);
    console.log('🔐 Password:', testPassword);
    console.log('🚀 You can now access /admin with these credentials');
    
    return {
      email: testEmail,
      password: testPassword,
      success: true
    };
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Account already exists, trying to sign in...');
      
      try {
        await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('✅ Successfully signed in to existing account');
        console.log('📧 Email:', testEmail);
        console.log('🔐 Password:', testPassword);
        
        return {
          email: testEmail,
          password: testPassword,
          success: true
        };
      } catch (signInError) {
        console.error('❌ Failed to sign in:', signInError.message);
        return { success: false, error: signInError.message };
      }
    } else {
      console.error('❌ Failed to create account:', error.message);
      return { success: false, error: error.message };
    }
  }
})();