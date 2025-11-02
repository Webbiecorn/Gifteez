import React, { useState, useEffect } from 'react'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../services/firebase'

interface ImageUploadProps {
  onImageUpload: (url: string, filename: string) => void
  onImageDelete?: (url: string) => void
  currentImage?: string
  allowedTypes?: string[]
  maxSizeMB?: number
  folder?: string
  className?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageDelete,
  currentImage,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSizeMB = 5,
  folder = 'blog-images',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const storageAvailable = Boolean(storage)

  useEffect(() => {
    if (!storageAvailable) {
      setUrlInput(currentImage ?? '')
    }
  }, [currentImage, storageAvailable])

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Alleen ${allowedTypes.map((t) => t.split('/')[1]).join(', ')} bestanden zijn toegestaan`
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Bestand is te groot. Maximaal ${maxSizeMB}MB toegestaan`
    }

    return null
  }

  const generateFileName = (originalName: string): string => {
    const timestamp = Date.now()
    const extension = originalName.split('.').pop()
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
    return `${cleanName}-${timestamp}.${extension}`
  }

  const uploadFile = async (file: File) => {
    if (!storageAvailable || !storage) {
      throw new Error('Firebase Storage is niet geconfigureerd')
    }

    const validationError = validateFile(file)
    if (validationError) {
      throw new Error(validationError)
    }

    const fileName = generateFileName(file.name)
    const storageRef = ref(storage, `${folder}/${fileName}`)

    // Upload het bestand
    const snapshot = await uploadBytes(storageRef, file, {
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    })

    // Krijg de download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return { url: downloadURL, filename: fileName }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const { url, filename } = await uploadFile(file)
      onImageUpload(url, filename)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Er is een fout opgetreden bij het uploaden'
      setError(message)
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!currentImage) return
    if (!storageAvailable || !storage) {
      if (onImageDelete) {
        onImageDelete(currentImage)
      }
      setUrlInput('')
      return
    }

    try {
      // Extract filename from URL to delete from storage
      const url = new URL(currentImage)
      const pathSegments = url.pathname.split('/')
      const encodedPath = pathSegments[pathSegments.length - 1]
      const decodedPath = decodeURIComponent(encodedPath.split('?')[0])

      const storageRef = ref(storage, decodedPath)
      await deleteObject(storageRef)

      if (onImageDelete) {
        onImageDelete(currentImage)
      }
    } catch (err: unknown) {
      console.error('Delete error:', err)
      setError('Er is een fout opgetreden bij het verwijderen')
    }
  }

  const handleManualSubmit = () => {
    setError(null)
    const trimmed = urlInput.trim()
    if (!trimmed) {
      setError('Voer een geldige afbeeldings-URL in')
      return
    }
    try {
      if (!trimmed.startsWith('data:')) {
        // Validate absolute URL
        const url = new URL(trimmed)
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Ongeldig protocol')
        }
      }
      onImageUpload(trimmed, trimmed.split('/').pop() || trimmed)
    } catch (err: unknown) {
      console.warn('Invalid image URL provided', err)
      setError('De URL lijkt ongeldig. Gebruik een volledige https:// link of data URI.')
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      {currentImage && (
        <div className="relative inline-block">
          <img
            src={currentImage}
            alt="Current upload"
            className="max-w-xs max-h-48 rounded-lg border border-gray-200 object-cover"
          />
          <button
            onClick={handleDeleteImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
            title="Afbeelding verwijderen"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Area */}
      {storageAvailable ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="space-y-4">
            {isUploading ? (
              <>
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600">Uploaden...</p>
              </>
            ) : (
              <>
                <div className="text-4xl text-gray-400">📸</div>
                <div>
                  <p className="text-lg font-medium text-gray-900">Sleep een afbeelding hierheen</p>
                  <p className="text-sm text-gray-500 mt-1">of klik om een bestand te selecteren</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {allowedTypes.map((t) => t.split('/')[1].toUpperCase()).join(', ')} • Max{' '}
                    {maxSizeMB}MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-dashed border-rose-200 bg-rose-50 p-6 text-left">
          <p className="text-sm text-rose-600">
            Firebase Storage is niet ingesteld. Plak een directe afbeeldings-URL (bijvoorbeeld vanaf
            je CDN of hosting) of gebruik een data-URI.
          </p>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-rose-200 p-3 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleManualSubmit}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
            >
              URL gebruiken
            </button>
            <p className="text-xs text-rose-500">
              Tip: upload via{' '}
              <a
                href="https://imgur.com/upload"
                target="_blank"
                rel="noreferrer noopener"
                className="underline"
              >
                Imgur
              </a>{' '}
              of je eigen opslag en plak de link hier.
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
