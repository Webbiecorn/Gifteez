import React, { useState } from 'react'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import Button from './Button'
import { CheckCircleIcon, XCircleIcon, SpinnerIcon, SearchIcon } from './IconComponents'

const hasWindow = typeof window !== 'undefined'

const showAlert = (message: string): void => {
  if (hasWindow) {
    window.alert(message)
    return
  }
  console.warn('Alert prompt skipped (no window available):', message)
}

const confirmAction = (message: string): boolean => {
  if (hasWindow) {
    return window.confirm(message)
  }
  console.warn('Confirm prompt skipped (no window available):', message)
  return false
}

const getImageConstructor = (): typeof globalThis.Image | undefined => {
  if (!hasWindow) {
    return undefined
  }
  return window.Image
}

interface ProductWithImage {
  id: string
  title: string
  imageUrl: string
  price?: number
  source: string
  collectionName: string
}

interface ValidationResult {
  product: ProductWithImage
  status: 'valid' | 'broken' | 'checking'
  statusCode?: number
}

const ImageValidator: React.FC = () => {
  const [products, setProducts] = useState<ProductWithImage[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [stats, setStats] = useState({ total: 0, valid: 0, broken: 0, checking: 0 })
  const [filter, setFilter] = useState<'all' | 'broken' | 'valid'>('all')

  // Scan Firestore for all products with images
  const scanProducts = async () => {
    setIsScanning(true)
    const foundProducts: ProductWithImage[] = []

    try {
      // Scan manualProducts collection
      const manualProductsRef = collection(db, 'manualProducts')
      const manualSnapshot = await getDocs(manualProductsRef)

      manualSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.imageUrl) {
          foundProducts.push({
            id: doc.id,
            title: data.title || 'Untitled',
            imageUrl: data.imageUrl,
            price: data.price,
            source: data.source || 'manual',
            collectionName: 'manualProducts',
          })
        }
      })

      // Scan amazonProducts collection
      const amazonProductsRef = collection(db, 'amazonProducts')
      const amazonSnapshot = await getDocs(amazonProductsRef)

      amazonSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.imageUrl) {
          foundProducts.push({
            id: doc.id,
            title: data.title || 'Untitled',
            imageUrl: data.imageUrl,
            price: data.price,
            source: 'amazon',
            collectionName: 'amazonProducts',
          })
        }
      })

      // Scan slygadProducts collection
      const slygadProductsRef = collection(db, 'slygadProducts')
      const slygadSnapshot = await getDocs(slygadProductsRef)

      slygadSnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.imageUrl) {
          foundProducts.push({
            id: doc.id,
            title: data.title || 'Untitled',
            imageUrl: data.imageUrl,
            price: data.price,
            source: 'slygad',
            collectionName: 'slygadProducts',
          })
        }
      })

      console.warn(`📸 Found ${foundProducts.length} products with images`)
      setProducts(foundProducts)

      // Initialize validation results
      const initialResults: ValidationResult[] = foundProducts.map((product) => ({
        product,
        status: 'checking' as const,
      }))
      setValidationResults(initialResults)
    } catch (error) {
      console.error('Error scanning products:', error)
      showAlert(
        'Failed to scan products: ' + (error instanceof Error ? error.message : 'Unknown error')
      )
    } finally {
      setIsScanning(false)
    }
  }

  // Validate a single image URL
  const validateImageUrl = async (
    url: string
  ): Promise<{ valid: boolean; statusCode?: number }> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors', // This won't give us status codes but will catch CORS errors
      })

      clearTimeout(timeoutId)

      // For no-cors, we can't read the status, but if it loads, it's likely valid
      // Let's use a more reliable method with an Image object
      const ImageConstructor = getImageConstructor()
      if (!ImageConstructor) {
        console.warn(
          'Image constructor not available; assuming URL is valid in non-browser environment'
        )
        return { valid: true, statusCode: 200 }
      }

      return new Promise((resolve) => {
        const img = new ImageConstructor()
        const safetyTimer = window.setTimeout(() => {
          img.src = ''
          resolve({ valid: false, statusCode: 408 })
        }, 10000)

        img.onload = () => {
          window.clearTimeout(safetyTimer)
          resolve({ valid: true, statusCode: 200 })
        }
        img.onerror = () => {
          window.clearTimeout(safetyTimer)
          resolve({ valid: false, statusCode: 404 })
        }
        img.src = url
      })
    } catch (error) {
      console.error('Error validating image:', url, error)
      return { valid: false, statusCode: 0 }
    }
  }

  // Validate all images
  const validateAllImages = async () => {
    if (products.length === 0) {
      showAlert('Please scan products first')
      return
    }

    setIsValidating(true)
    const results: ValidationResult[] = []

    // Process in batches of 5 to avoid overwhelming the browser
    const batchSize = 5
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)

      const batchResults = await Promise.all(
        batch.map(async (product) => {
          const validation = await validateImageUrl(product.imageUrl)
          return {
            product,
            status: validation.valid ? ('valid' as const) : ('broken' as const),
            statusCode: validation.statusCode,
          }
        })
      )

      results.push(...batchResults)
      setValidationResults([...results])

      // Update stats
      const valid = results.filter((r) => r.status === 'valid').length
      const broken = results.filter((r) => r.status === 'broken').length
      setStats({
        total: products.length,
        valid,
        broken,
        checking: products.length - valid - broken,
      })

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsValidating(false)
    console.warn('✅ Validation complete:', results)
  }

  // Delete a product with broken image
  const deleteProduct = async (result: ValidationResult) => {
    if (!confirmAction(`Are you sure you want to delete "${result.product.title}"?`)) {
      return
    }

    try {
      const docRef = doc(db, result.product.collectionName, result.product.id)
      await deleteDoc(docRef)

      // Remove from local state
      setValidationResults((prev) => prev.filter((r) => r.product.id !== result.product.id))
      setProducts((prev) => prev.filter((p) => p.id !== result.product.id))

      showAlert('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      showAlert(
        'Failed to delete product: ' + (error instanceof Error ? error.message : 'Unknown error')
      )
    }
  }

  // Update image URL for a product
  const updateImageUrl = async (result: ValidationResult, newUrl: string) => {
    try {
      const docRef = doc(db, result.product.collectionName, result.product.id)
      await updateDoc(docRef, { imageUrl: newUrl })

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === result.product.id ? { ...p, imageUrl: newUrl } : p))
      )

      // Re-validate the updated image
      const validation = await validateImageUrl(newUrl)
      setValidationResults((prev) =>
        prev.map((r) =>
          r.product.id === result.product.id
            ? {
                ...r,
                product: { ...r.product, imageUrl: newUrl },
                status: validation.valid ? 'valid' : 'broken',
              }
            : r
        )
      )

      showAlert('Image URL updated successfully')
    } catch (error) {
      console.error('Error updating image URL:', error)
      showAlert(
        'Failed to update image URL: ' + (error instanceof Error ? error.message : 'Unknown error')
      )
    }
  }

  const filteredResults = validationResults.filter((result) => {
    if (filter === 'all') return true
    if (filter === 'broken') return result.status === 'broken'
    if (filter === 'valid') return result.status === 'valid'
    return true
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🖼️ Image Validator</h2>
        <p className="text-gray-600 mb-6">
          Scan your Firestore collections for products with images and validate if the image URLs
          are accessible. This helps identify broken Amazon links or other image hosting issues.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={scanProducts}
            disabled={isScanning || isValidating}
            className="flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <SpinnerIcon className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <SearchIcon className="w-5 h-5" />
                Scan Products
              </>
            )}
          </Button>

          <Button
            onClick={validateAllImages}
            disabled={isValidating || products.length === 0 || isScanning}
            variant="accent"
            className="flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <SpinnerIcon className="w-5 h-5 animate-spin" />
                Validating... ({stats.valid + stats.broken}/{stats.total})
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Validate All Images
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        {validationResults.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.valid}</div>
              <div className="text-sm text-gray-600">Valid Images</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.broken}</div>
              <div className="text-sm text-gray-600">Broken Images</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.checking}</div>
              <div className="text-sm text-gray-600">Checking...</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {validationResults.length > 0 && (
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-medium ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({validationResults.length})
            </button>
            <button
              onClick={() => setFilter('broken')}
              className={`px-4 py-2 font-medium ${
                filter === 'broken'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Broken ({stats.broken})
            </button>
            <button
              onClick={() => setFilter('valid')}
              className={`px-4 py-2 font-medium ${
                filter === 'valid'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Valid ({stats.valid})
            </button>
          </div>
        )}

        {/* Results List */}
        {filteredResults.length > 0 ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredResults.map((result) => (
              <ProductImageRow
                key={result.product.id}
                result={result}
                onDelete={deleteProduct}
                onUpdateUrl={updateImageUrl}
              />
            ))}
          </div>
        ) : validationResults.length > 0 ? (
          <div className="text-center py-8 text-gray-500">No {filter} images found.</div>
        ) : (
          <div className="text-center py-8 text-gray-400">Click "Scan Products" to begin</div>
        )}
      </div>
    </div>
  )
}

// Component for individual product row
const ProductImageRow: React.FC<{
  result: ValidationResult
  onDelete: (result: ValidationResult) => void
  onUpdateUrl: (result: ValidationResult, newUrl: string) => void
}> = ({ result, onDelete, onUpdateUrl }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newUrl, setNewUrl] = useState(result.product.imageUrl)

  const handleSave = () => {
    if (newUrl && newUrl !== result.product.imageUrl) {
      onUpdateUrl(result, newUrl)
      setIsEditing(false)
    }
  }

  return (
    <div
      className={`border rounded-lg p-4 ${
        result.status === 'broken'
          ? 'border-red-200 bg-red-50'
          : result.status === 'valid'
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex gap-4">
        {/* Image Preview */}
        <div className="flex-shrink-0 w-24 h-24 bg-white rounded-lg overflow-hidden border border-gray-200">
          {result.status === 'checking' ? (
            <div className="w-full h-full flex items-center justify-center">
              <SpinnerIcon className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : result.status === 'broken' ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <XCircleIcon className="w-8 h-8 text-red-500" />
            </div>
          ) : (
            <img
              src={result.product.imageUrl}
              alt={result.product.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{result.product.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <span className="px-2 py-0.5 bg-white rounded text-xs font-medium">
                  {result.product.source}
                </span>
                <span className="px-2 py-0.5 bg-white rounded text-xs font-medium">
                  {result.product.collectionName}
                </span>
                {result.product.price && (
                  <span className="font-medium">€{result.product.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0 ml-4">
              {result.status === 'checking' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  Checking
                </span>
              ) : result.status === 'broken' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  <XCircleIcon className="w-4 h-4" />
                  Broken {result.statusCode && `(${result.statusCode})`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  <CheckCircleIcon className="w-4 h-4" />
                  Valid
                </span>
              )}
            </div>
          </div>

          {/* Image URL */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new image URL"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setNewUrl(result.product.imageUrl)
                    setIsEditing(false)
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-xs text-gray-500 truncate font-mono">{result.product.imageUrl}</p>
            </div>
          )}

          {/* Actions */}
          {!isEditing && result.status !== 'checking' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
              >
                Edit URL
              </button>
              {result.status === 'broken' && (
                <button
                  onClick={() => onDelete(result)}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete Product
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Add TrashIcon if it doesn't exist
const TrashIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
)

export default ImageValidator
