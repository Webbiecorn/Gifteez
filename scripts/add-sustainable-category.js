// Script om "Duurzame Cadeaus" categorie toe te voegen aan dealCategoryBlocks
// Kopieer deze code en plak in de browser console op: https://gifteez-7533b.web.app/admin

(async function addSustainableCategory() {
  console.log('🌱 Adding Duurzame Cadeaus category...');
  
  try {
    // Import Firebase modules dynamically
    const firebaseApp = await import('https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js');
    const firestore = await import('https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js');
    
    // Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyDpirwxblDvuNkBzDFWFJlvLo9G7b-u_kI",
      authDomain: "gifteez-7533b.firebaseapp.com",
      projectId: "gifteez-7533b",
      storageBucket: "gifteez-7533b.firebasestorage.app",
      messagingSenderId: "730803686353",
      appId: "1:730803686353:web:8ba5b0cd5c4ed2efd21d42",
      measurementId: "G-L5VTY67YHF"
    };
    
    // Initialize Firebase
    const app = firebaseApp.initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    
    console.log('✅ Firebase initialized');
    
    // Haal huidige categorieën op
    const docRef = firestore.doc(db, 'dealCategoryBlocks', 'current');
    const snapshot = await firestore.getDoc(docRef);
    
    let currentCategories = [];
    if (snapshot.exists()) {
      const data = snapshot.data();
      currentCategories = data.categories || [];
      console.log('📦 Found', currentCategories.length, 'existing categories');
    } else {
      console.log('📦 No existing categories found, creating new document');
    }
    
    // Check of Duurzame Cadeaus al bestaat
    const exists = currentCategories.some(cat => 
      cat.title === 'Duurzame Cadeaus' || cat.id.includes('duurzame')
    );
    
    if (exists) {
      console.log('ℹ️ Duurzame Cadeaus category already exists');
      console.log('Current categories:', currentCategories.map(c => c.title));
      return { success: true, message: 'Category already exists' };
    }
    
    // Haal alle SLYGAD product IDs op
    console.log('📦 Loading Shop Like You Give A Damn products...');
    const productsRef = firestore.collection(db, 'products');
    const q = firestore.query(
      productsRef,
      firestore.where('source', '==', 'shop-like-you-give-a-damn'),
      firestore.where('active', '==', true),
      firestore.limit(20)
    );
    
    const querySnapshot = await firestore.getDocs(q);
    const productIds = querySnapshot.docs.map(doc => doc.id);
    
    console.log('✅ Found', productIds.length, 'Shop Like You Give A Damn products');
    
    if (productIds.length === 0) {
      console.error('❌ No products found with source "shop-like-you-give-a-damn"');
      return { success: false, error: 'No products found' };
    }
    
    // Nieuwe categorie object
    const newCategory = {
      id: 'duurzame-cadeaus-' + Date.now().toString(36),
      title: 'Duurzame Cadeaus',
      description: '🌿 Bewuste en ecologische geschenken van Shop Like You Give A Damn. Prachtige sets met vegan en duurzame producten. Perfect voor mensen die van de aarde houden.',
      itemIds: productIds
    };
    
    // Voeg nieuwe categorie toe
    const updatedCategories = [...currentCategories, newCategory];
    
    // Sla op in Firestore
    await firestore.setDoc(docRef, {
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
      version: 1
    });
    
    console.log('✅ Duurzame Cadeaus category added successfully!');
    console.log('🌱 Category ID:', newCategory.id);
    console.log('📦 Total products in category:', productIds.length);
    console.log('📦 Total categories:', updatedCategories.length);
    console.log('🔄 Ga naar /deals en klik op "Vernieuw collectie" om de nieuwe categorie te zien!');
    
    return {
      success: true,
      categoryId: newCategory.id,
      totalCategories: updatedCategories.length,
      productCount: productIds.length
    };
    
  } catch (error) {
    console.error('❌ Failed to add category:', error);
    console.error('Error details:', error.message);
    return { success: false, error: error.message };
  }
})();
