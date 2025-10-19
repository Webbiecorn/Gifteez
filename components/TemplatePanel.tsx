import React, { useState, useEffect } from 'react'
import { TemplateService } from '../services/templateService'
import LoadingSpinner from './LoadingSpinner'
import type { CategoryBlockConfig } from '../services/dealCategoryConfigService'
import type { CategoryTemplate } from '../services/templateService'

interface TemplatePanelProps {
  currentCategories: CategoryBlockConfig[]
  onApplyTemplate: (categories: CategoryBlockConfig[], mode: 'replace' | 'merge') => void
  onClose: () => void
}

const TemplatePanel: React.FC<TemplatePanelProps> = ({
  currentCategories,
  onApplyTemplate,
  onClose,
}) => {
  const [templates, setTemplates] = useState<CategoryTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<CategoryTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [saveTemplateDesc, setSaveTemplateDesc] = useState('')
  const [saveTemplateIcon, setSaveTemplateIcon] = useState('📦')

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const allTemplates = await TemplateService.getAllTemplates()
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTemplate = (template: CategoryTemplate, mode: 'replace' | 'merge') => {
    onApplyTemplate(template.categories, mode)
    onClose()
  }

  const handleSaveAsTemplate = async () => {
    if (!saveTemplateName.trim()) return

    try {
      await TemplateService.saveTemplate({
        name: saveTemplateName,
        description: saveTemplateDesc,
        icon: saveTemplateIcon,
        categories: currentCategories,
      })

      await loadTemplates()
      setShowSaveDialog(false)
      setSaveTemplateName('')
      setSaveTemplateDesc('')
      setSaveTemplateIcon('📦')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Fout bij opslaan template')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Weet je zeker dat je dit template wilt verwijderen?')) return

    try {
      await TemplateService.deleteTemplate(templateId)
      await loadTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Fout bij verwijderen template')
    }
  }

  const handleExportTemplate = (template: CategoryTemplate) => {
    const json = TemplateService.exportTemplate(template)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportTemplate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const template = TemplateService.importTemplate(text)

      const templateId = await TemplateService.saveTemplate(template)
      await loadTemplates()
      alert('Template succesvol geïmporteerd!')
    } catch (error) {
      console.error('Error importing template:', error)
      alert('Fout bij importeren template. Controleer het JSON bestand.')
    }
  }

  const prebuiltTemplates = templates.filter((t) => t.isPrebuilt)
  const customTemplates = templates.filter((t) => !t.isPrebuilt)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Templates & Presets</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gebruik voorgebouwde templates of sla je eigen configuratie op
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Save Current Config */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      💾 Huidige Configuratie Opslaan
                    </h3>
                    <p className="text-sm text-gray-600">
                      Sla je huidige categorieën op als herbruikbaar template (
                      {currentCategories.length} categorieën)
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSaveDialog(!showSaveDialog)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {showSaveDialog ? 'Annuleren' : 'Opslaan als Template'}
                  </button>
                </div>

                {showSaveDialog && (
                  <div className="mt-4 space-y-3 bg-white rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Naam *
                      </label>
                      <input
                        type="text"
                        value={saveTemplateName}
                        onChange={(e) => setSaveTemplateName(e.target.value)}
                        placeholder="Bijv. Zomer Collectie 2025"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beschrijving
                      </label>
                      <textarea
                        value={saveTemplateDesc}
                        onChange={(e) => setSaveTemplateDesc(e.target.value)}
                        placeholder="Korte beschrijving van dit template"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icoon (Emoji)
                      </label>
                      <input
                        type="text"
                        value={saveTemplateIcon}
                        onChange={(e) => setSaveTemplateIcon(e.target.value)}
                        placeholder="📦"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={2}
                      />
                    </div>
                    <button
                      onClick={handleSaveAsTemplate}
                      disabled={!saveTemplateName.trim()}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Template Opslaan
                    </button>
                  </div>
                )}
              </div>

              {/* Prebuilt Templates */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎁 Voorgebouwde Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prebuiltTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{template.icon}</div>
                        <button
                          onClick={() => handleExportTemplate(template)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Exporteer als JSON"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="text-xs text-gray-500 mb-3">
                        {template.categories.length} categorieën
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApplyTemplate(template, 'replace')}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Vervang
                        </button>
                        <button
                          onClick={() => handleApplyTemplate(template, 'merge')}
                          className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                        >
                          Voeg toe
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Templates */}
              {customTemplates.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">🔧 Eigen Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-3xl">{template.icon}</div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleExportTemplate(template)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Exporteer als JSON"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id!)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                              title="Verwijder template"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="text-xs text-gray-500 mb-3">
                          {template.categories.length} categorieën •{' '}
                          {template.createdAt.toLocaleDateString('nl-NL')}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApplyTemplate(template, 'replace')}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Vervang
                          </button>
                          <button
                            onClick={() => handleApplyTemplate(template, 'merge')}
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            Voeg toe
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Import Template */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">📥 Template Importeren</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload een eerder geëxporteerd template JSON bestand
                </p>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportTemplate}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TemplatePanel
