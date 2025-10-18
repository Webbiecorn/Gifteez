import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import Button from './Button';

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  processing: number;
}

export const BulkProductImporter: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<ImportStats>({ total: 0, success: 0, failed: 0, processing: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setComplete(false);
    setErrors([]);
    
    try {
      // Read file
      const text = await file.text();
      const products = JSON.parse(text);
      
      if (!Array.isArray(products)) {
        throw new Error('File must contain an array of products');
      }

      console.log(`📦 Importing ${products.length} products...`);
      setStats({ total: products.length, success: 0, failed: 0, processing: products.length });

      // Import in batches (Firestore limit is 500 per batch)
      const BATCH_SIZE = 450; // Leave some margin
      let successCount = 0;
      let failedCount = 0;
      const errorMessages: string[] = [];

      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const batchProducts = products.slice(i, i + BATCH_SIZE);
        
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);

        for (const product of batchProducts) {
          try {
            // Validate required fields
            if (!product.id || !product.name) {
              throw new Error(`Product missing required fields: ${JSON.stringify(product).substring(0, 100)}`);
            }

            const docRef = doc(collection(db, 'products'), product.id);
            
            // Prepare product data
            const productData = {
              ...product,
              price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
              giftScore: typeof product.giftScore === 'number' ? product.giftScore : parseFloat(product.giftScore) || 5,
              active: product.active !== undefined ? product.active : true,
              createdAt: product.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              importedAt: new Date().toISOString()
            };

            batch.set(docRef, productData, { merge: true });
          } catch (error) {
            failedCount++;
            errorMessages.push(`Product ${product.id || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // Commit batch
        try {
          await batch.commit();
          successCount += batchProducts.length;
          
          setStats({
            total: products.length,
            success: successCount,
            failed: failedCount,
            processing: products.length - successCount - failedCount
          });
        } catch (error) {
          failedCount += batchProducts.length;
          errorMessages.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          setStats({
            total: products.length,
            success: successCount,
            failed: failedCount,
            processing: products.length - successCount - failedCount
          });
        }
      }

      setErrors(errorMessages);
      setComplete(true);
      
      console.log('✅ Import complete!');
      console.log(`   Success: ${successCount}`);
      console.log(`   Failed: ${failedCount}`);
      
    } catch (error) {
      console.error('Import error:', error);
      setErrors([error instanceof Error ? error.message : 'Unknown error occurred']);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Bulk Product Import</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Upload een JSON bestand met producten om ze toe te voegen aan de database.
          Het bestand moet een array van producten bevatten met de volgende velden:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
          <li><strong>id</strong>: Unieke product identifier (verplicht)</li>
          <li><strong>name</strong>: Product naam (verplicht)</li>
          <li><strong>price</strong>: Prijs in euros</li>
          <li><strong>image / imageUrl</strong>: Afbeelding URL</li>
          <li><strong>affiliateLink</strong>: Affiliate link</li>
          <li><strong>description</strong>: Product beschrijving</li>
          <li><strong>category</strong>: Categorie</li>
          <li><strong>tags</strong>: Array van tags</li>
          <li><strong>brand, merchant, source, giftScore, etc.</strong></li>
        </ul>
      </div>

      <div className="mb-6">
        <label className="block">
          <span className="sr-only">Choose file</span>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            disabled={importing}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
      </div>

      {importing && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <span className="text-gray-700">Importeren...</span>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Totaal:</span>
                <span className="ml-2 font-semibold">{stats.total}</span>
              </div>
              <div>
                <span className="text-gray-600">Verwerken:</span>
                <span className="ml-2 font-semibold text-blue-600">{stats.processing}</span>
              </div>
              <div>
                <span className="text-gray-600">Geslaagd:</span>
                <span className="ml-2 font-semibold text-green-600">{stats.success}</span>
              </div>
              <div>
                <span className="text-gray-600">Mislukt:</span>
                <span className="ml-2 font-semibold text-red-600">{stats.failed}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-purple-600 h-full transition-all duration-300"
                  style={{ width: `${(stats.success / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {complete && (
        <div className="mb-6">
          <div className={`rounded-lg p-4 ${stats.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {stats.failed === 0 ? (
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <h3 className="font-semibold">Import Voltooid</h3>
            </div>
            <div className="text-sm">
              <p>✅ {stats.success} producten succesvol geïmporteerd</p>
              {stats.failed > 0 && (
                <p className="text-red-600">❌ {stats.failed} producten mislukt</p>
              )}
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-red-900">Errors ({errors.length})</h3>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {errors.slice(0, 10).map((error, i) => (
                <p key={i} className="text-sm text-red-700 mb-1">
                  {error}
                </p>
              ))}
              {errors.length > 10 && (
                <p className="text-sm text-red-600 italic">
                  ... en {errors.length - 10} meer errors
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          onClick={() => window.location.reload()}
          variant="secondary"
          disabled={importing}
        >
          Reset
        </Button>
        
        {complete && stats.success > 0 && (
          <Button
            onClick={() => window.location.href = '/admin/deals'}
            variant="primary"
          >
            Ga naar Deals Beheer
          </Button>
        )}
      </div>
    </div>
  );
};
