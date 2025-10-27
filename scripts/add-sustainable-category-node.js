// Node.js script om "Duurzame Cadeaus" categorie toe te voegen
// Run: node scripts/add-sustainable-category-node.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Firebase Admin SDK initialiseren
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../gifteez-7533b-firebase-adminsdk.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key niet gevonden.');
  console.error('   Zet de GOOGLE_APPLICATION_CREDENTIALS environment variable');
  console.error('   of plaats gifteez-7533b-firebase-adminsdk.json in de root directory');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'gifteez-7533b'
});

const db = getFirestore(app);

async function addSustainableCategory() {
  console.log('🌱 Adding Duurzame Cadeaus category...\n');
  
  try {
    // Lees product IDs uit JSON file
    const productsPath = path.join(__dirname, '../public/data/shop-like-you-give-a-damn-import-ready.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const productIds = productsData.map(p => p.id.toString());
    
    console.log(`✅ Loaded ${productIds.length} product IDs from JSON file`);
    
    // Haal huidige categorieën op
    const docRef = db.collection('dealCategoryBlocks').doc('current');
    const snapshot = await docRef.get();
    
    let currentCategories = [];
    if (snapshot.exists) {
      const data = snapshot.data();
      currentCategories = data.categories || [];
      console.log(`📦 Found ${currentCategories.length} existing categories:`);
      currentCategories.forEach(cat => console.log(`   - ${cat.title}`));
    } else {
      console.log('📦 No existing categories found, creating new document');
    }
    
    // Check of Duurzame Cadeaus al bestaat
    const existingIndex = currentCategories.findIndex(cat => 
      cat.title === 'Duurzame Cadeaus' || cat.id.includes('duurzame')
    );
    
    if (existingIndex !== -1) {
      console.log('\n⚠️  Duurzame Cadeaus category already exists, updating...');
      currentCategories[existingIndex].itemIds = productIds;
      currentCategories[existingIndex].description = '🌿 Bewuste en ecologische geschenken van Shop Like You Give A Damn. Prachtige sets met vegan en duurzame producten. Perfect voor mensen die van de aarde houden.';
    } else {
      // Nieuwe categorie object
      const newCategory = {
        id: 'duurzame-cadeaus-' + Date.now().toString(36),
        title: 'Duurzame Cadeaus',
        description: '🌿 Bewuste en ecologische geschenken van Shop Like You Give A Damn. Prachtige sets met vegan en duurzame producten. Perfect voor mensen die van de aarde houden.',
        itemIds: productIds
      };
      
      currentCategories.push(newCategory);
      console.log(`\n✅ Created new category: ${newCategory.id}`);
    }
    
    // Sla op in Firestore
    await docRef.set({
      categories: currentCategories,
      updatedAt: new Date().toISOString(),
      version: 1
    });
    
    console.log('\n🎉 SUCCESS! Duurzame Cadeaus category added to Firestore!');
    console.log(`📦 Total categories: ${currentCategories.length}`);
    console.log(`🌱 Products in category: ${productIds.length}`);
    console.log('\n🔄 Ga naar https://gifteez-7533b.web.app/deals');
    console.log('   Klik op "Vernieuw collectie" om de categorie te zien!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Failed to add category:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addSustainableCategory();
