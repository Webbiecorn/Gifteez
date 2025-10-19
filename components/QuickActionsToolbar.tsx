import React, { useEffect, useState, useCallback } from 'react'
import { SearchIcon, CheckIcon } from './IconComponents'

interface QuickAction {
  id: string
  label: string
  icon: string
  shortcut: string
  description: string
  action: () => void
}

interface QuickActionsToolbarProps {
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSearch?: () => void
  onQuickAdd?: () => void
  canUndo?: boolean
  canRedo?: boolean
  isSaving?: boolean
}

const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  onSave,
  onUndo,
  onRedo,
  onSearch,
  onQuickAdd,
  canUndo = false,
  canRedo = false,
  isSaving = false,
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    // Detect if user is on Mac
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  const getModifierKey = useCallback(() => {
    return isMac ? '⌘' : 'Ctrl'
  }, [isMac])

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = isMac ? e.metaKey : e.ctrlKey

      // CMD/Ctrl + K: Quick Add
      if (isMod && e.key === 'k') {
        e.preventDefault()
        onQuickAdd?.()
      }

      // CMD/Ctrl + S: Save
      if (isMod && e.key === 's') {
        e.preventDefault()
        onSave?.()
      }

      // CMD/Ctrl + Z: Undo
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) {
          onUndo?.()
        }
      }

      // CMD/Ctrl + Shift + Z: Redo (or CMD/Ctrl + Y on Windows)
      if ((isMod && e.shiftKey && e.key === 'z') || (isMod && e.key === 'y')) {
        e.preventDefault()
        if (canRedo) {
          onRedo?.()
        }
      }

      // CMD/Ctrl + F: Search/Filter
      if (isMod && e.key === 'f') {
        e.preventDefault()
        onSearch?.()
      }

      // Show shortcuts helper with ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowShortcuts(true)
      }

      // Close shortcuts with Escape
      if (e.key === 'Escape') {
        setShowShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMac, onSave, onUndo, onRedo, onSearch, onQuickAdd, canUndo, canRedo])

  const actions: QuickAction[] = [
    {
      id: 'quick-add',
      label: 'Quick Add',
      icon: '⚡',
      shortcut: `${getModifierKey()}+K`,
      description: 'Snel product toevoegen',
      action: () => onQuickAdd?.(),
    },
    {
      id: 'save',
      label: isSaving ? 'Opslaan...' : 'Opslaan',
      icon: isSaving ? '⏳' : '💾',
      shortcut: `${getModifierKey()}+S`,
      description: 'Wijzigingen opslaan',
      action: () => onSave?.(),
    },
    {
      id: 'undo',
      label: 'Ongedaan',
      icon: '↶',
      shortcut: `${getModifierKey()}+Z`,
      description: 'Laatste actie ongedaan maken',
      action: () => canUndo && onUndo?.(),
    },
    {
      id: 'redo',
      label: 'Opnieuw',
      icon: '↷',
      shortcut: isMac ? `${getModifierKey()}+⇧+Z` : `${getModifierKey()}+Y`,
      description: 'Actie opnieuw uitvoeren',
      action: () => canRedo && onRedo?.(),
    },
    {
      id: 'search',
      label: 'Zoeken',
      icon: '🔍',
      shortcut: `${getModifierKey()}+F`,
      description: 'Zoeken/Filteren',
      action: () => onSearch?.(),
    },
  ]

  return (
    <>
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Quick Actions */}
            <div className="flex items-center gap-2">
              {actions.slice(0, 3).map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  disabled={
                    (action.id === 'undo' && !canUndo) ||
                    (action.id === 'redo' && !canRedo) ||
                    (action.id === 'save' && isSaving)
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    (action.id === 'undo' && !canUndo) ||
                    (action.id === 'redo' && !canRedo) ||
                    (action.id === 'save' && isSaving)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-md'
                  }`}
                  title={`${action.description} (${action.shortcut})`}
                >
                  <span className="text-base">{action.icon}</span>
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="hidden md:inline text-xs opacity-75">{action.shortcut}</span>
                </button>
              ))}
            </div>

            {/* Right: Additional Actions + Help */}
            <div className="flex items-center gap-2">
              {actions.slice(3).map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  disabled={
                    (action.id === 'undo' && !canUndo) || (action.id === 'redo' && !canRedo)
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    (action.id === 'undo' && !canUndo) || (action.id === 'redo' && !canRedo)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={`${action.description} (${action.shortcut})`}
                >
                  <span className="text-base">{action.icon}</span>
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="hidden lg:inline text-xs opacity-75">{action.shortcut}</span>
                </button>
              ))}

              {/* Help Button */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Toon shortcuts (?)"
              >
                <span className="text-base">❓</span>
                <span className="hidden sm:inline ml-2">Shortcuts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">⌨️ Keyboard Shortcuts</h2>
                  <p className="text-sm text-gray-600 mt-1">Sneltoetsen om efficiënter te werken</p>
                </div>
                <button
                  onClick={() => setShowShortcuts(false)}
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
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">✨ Snelle Acties</h3>
                  <div className="space-y-2">
                    {actions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{action.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{action.label}</div>
                            <div className="text-sm text-gray-600">{action.description}</div>
                          </div>
                        </div>
                        <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-700 shadow-sm">
                          {action.shortcut}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-3">🎯 Navigatie & Overig</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">❓</span>
                        <div>
                          <div className="font-medium text-gray-900">Toon Shortcuts</div>
                          <div className="text-sm text-gray-600">Deze help pagina openen</div>
                        </div>
                      </div>
                      <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-700 shadow-sm">
                        ?
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🚪</span>
                        <div>
                          <div className="font-medium text-gray-900">Sluit Dialoog</div>
                          <div className="text-sm text-gray-600">Modals/dialogen sluiten</div>
                        </div>
                      </div>
                      <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-700 shadow-sm">
                        Esc
                      </kbd>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-2">💡 Tips</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Alle shortcuts werken in het admin panel</li>
                    <li>
                      • Op Mac gebruik je{' '}
                      <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
                        ⌘
                      </kbd>
                      , op Windows/Linux{' '}
                      <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
                        Ctrl
                      </kbd>
                    </li>
                    <li>• Hover over knoppen voor tooltips met shortcuts</li>
                    <li>
                      • Druk op{' '}
                      <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">
                        ?
                      </kbd>{' '}
                      om deze lijst altijd te tonen
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={() => setShowShortcuts(false)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default QuickActionsToolbar
