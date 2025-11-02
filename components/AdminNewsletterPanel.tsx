import React, { useState, useEffect, useCallback } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from '../services/firebase'
import { MailIcon, UserCircleIcon, ShareIcon, CheckCircleIcon } from './IconComponents'
import type { NewsletterSubscriber } from '../types'

type AdminNewsletterSubscriber = NewsletterSubscriber & {
  id: string
  isActive: boolean
}

type FirestoreTimestamp = { toDate?: () => Date }

const normalizeTimestamp = (value: Date | string | FirestoreTimestamp | undefined): Date => {
  if (value instanceof Date) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }
  const date = value?.toDate?.()
  if (date instanceof Date) {
    return date
  }
  return new Date()
}

export const AdminNewsletterPanel: React.FC = () => {
  const hasWindow = typeof window !== 'undefined'
  const [subscribers, setSubscribers] = useState<AdminNewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')

  // Campaign form
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [testEmail, setTestEmail] = useState('')

  const showAlert = (message: string) => {
    if (hasWindow) {
      window.alert(message)
      return
    }
    console.warn('Alert skipped (no window available):', message)
  }

  const loadSubscribers = useCallback(async () => {
    try {
      setLoading(true)
      // Don't use orderBy - subscribedAt might be a string
      const snapshot = await getDocs(collection(db, 'newsletter_subscribers'))

      const data = snapshot.docs.map((doc) => {
        const docData = doc.data() as Partial<AdminNewsletterSubscriber> & {
          subscribedAt?: Date | string | FirestoreTimestamp
          unsubscribedAt?: Date | string | FirestoreTimestamp
        }

        const status: AdminNewsletterSubscriber['status'] =
          docData.status ?? (docData.isActive === false ? 'unsubscribed' : 'active')
        const subscribedAt = normalizeTimestamp(docData.subscribedAt)
        const unsubscribedAtValue = docData.unsubscribedAt

        return {
          id: doc.id,
          email: docData.email ?? '',
          name: docData.name,
          status,
          source: docData.source ?? 'admin',
          preferences: docData.preferences,
          subscribedAt,
          unsubscribedAt: unsubscribedAtValue ? normalizeTimestamp(unsubscribedAtValue) : undefined,
          isActive: status === 'active',
        }
      })

      // Sort in JavaScript instead
      data.sort((a, b) => b.subscribedAt.getTime() - a.subscribedAt.getTime())

      setSubscribers(data)
    } catch (error) {
      console.error('Error loading subscribers:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSubscribers()
  }, [loadSubscribers])

  const handleSendTest = async () => {
    if (!testEmail || !subject || !htmlContent) {
      showAlert('Vul alle velden in')
      return
    }

    try {
      setSending(true)
      const functions = getFunctions()
      const sendCampaign = httpsCallable(functions, 'sendNewsletterCampaign')

      await sendCampaign({
        subject,
        htmlContent,
        textContent: stripHtml(htmlContent),
        testEmail,
      })

      setSuccess('Test email verzonden! ✅')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error sending test:', error)
      const message = error instanceof Error ? error.message : 'Onbekende fout'
      showAlert(`Fout: ${message}`)
    } finally {
      setSending(false)
    }
  }

  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  const activeSubscribers = subscribers.filter((s) => s.isActive === true)
  const unsubscribed = subscribers.filter((s) => s.isActive === false)

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Laden...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
          <div className="flex items-center gap-3">
            <UserCircleIcon className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-600">Actieve Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">{activeSubscribers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
          <div className="flex items-center gap-3">
            <MailIcon className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Afgemeld</p>
              <p className="text-3xl font-bold text-gray-900">{unsubscribed.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {subscribers.length > 0 ? '+' : ''}
                {subscribers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Send Campaign */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShareIcon className="w-6 h-6 text-primary" />
          Nieuwsbrief Versturen
        </h2>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Onderwerp *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Bijvoorbeeld: Wekelijkse Cadeau Tips 🎁"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">HTML Content *</label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Plak hier je HTML email template..."
              rows={12}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 Tip: Gebruik een email template builder zoals{' '}
              <a
                href="https://beefree.io"
                target="_blank"
                rel="noopener"
                className="text-primary underline"
              >
                Beefree
              </a>{' '}
              of{' '}
              <a
                href="https://unlayer.com"
                target="_blank"
                rel="noopener"
                className="text-primary underline"
              >
                Unlayer
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Test Email Adres
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="jouw@email.nl"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSendTest}
              disabled={sending || !subject || !htmlContent || !testEmail}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MailIcon className="w-5 h-5" />
              {sending ? 'Versturen...' : 'Stuur Test Email'}
            </button>

            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-rose-600 px-6 py-3 font-semibold text-white shadow-md opacity-50 cursor-not-allowed"
              title="Bulk sending komt binnenkort"
            >
              <ShareIcon className="w-5 h-5" />
              Verstuur naar Alle Subscribers (Coming Soon)
            </button>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Subscribers ({activeSubscribers.length} actief)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Naam
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Bron
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Datum
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeSubscribers.map((sub, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sub.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {sub.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sub.subscribedAt
                      ? new Date(sub.subscribedAt).toLocaleDateString('nl-NL')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeSubscribers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MailIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Nog geen subscribers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminNewsletterPanel
