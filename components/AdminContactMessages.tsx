import React, { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { MailIcon, CheckCircleIcon, XCircleIcon } from './IconComponents'
import type { ContactMessage } from '../types'

export const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<(ContactMessage & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all')

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        repliedAt: doc.data().repliedAt?.toDate(),
      })) as (ContactMessage & { id: string })[]
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', id), { read: true })
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAsReplied = async (id: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', id), {
        replied: true,
        repliedAt: new Date(),
      })
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, replied: true, repliedAt: new Date() } : m))
      )
    } catch (error) {
      console.error('Error marking as replied:', error)
    }
  }

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread') return !m.read
    if (filter === 'replied') return m.replied
    return true
  })

  const unreadCount = messages.filter((m) => !m.read).length
  const repliedCount = messages.filter((m) => m.replied).length

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Laden...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contactberichten</h1>
          <p className="text-gray-600 mt-1">{messages.length} berichten totaal</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-primary to-rose-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alle ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-primary to-rose-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ongelezen ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('replied')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'replied'
                ? 'bg-gradient-to-r from-primary to-rose-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Beantwoord ({repliedCount})
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-md">
            <MailIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Geen berichten gevonden</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-lg shadow-md border-l-4 transition-all hover:shadow-lg ${
                !msg.read
                  ? 'border-primary bg-gradient-to-r from-primary/5 to-transparent'
                  : msg.replied
                    ? 'border-green-500'
                    : 'border-gray-300'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{msg.name}</h3>
                      {!msg.read && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                          NIEUW
                        </span>
                      )}
                      {msg.replied && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3" />
                          Beantwoord
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {msg.email}
                    </a>
                    {msg.subject && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Onderwerp:</strong> {msg.subject}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString('nl-NL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Onbekend'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!msg.read && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className="px-3 py-1.5 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        Markeer gelezen
                      </button>
                    )}
                    {!msg.replied && (
                      <button
                        onClick={() => markAsReplied(msg.id)}
                        className="px-3 py-1.5 text-sm font-semibold text-green-700 border border-green-700 rounded-lg hover:bg-green-700 hover:text-white transition-all"
                      >
                        Markeer beantwoord
                      </button>
                    )}
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${msg.subject || 'Je bericht aan Gifteez'}`}
                      className="px-3 py-1.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      Beantwoorden
                    </a>
                  </div>
                </div>

                {/* Message Content */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                </div>

                {msg.notes && (
                  <div className="mt-4 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-sm text-yellow-900">
                      <strong>Admin notities:</strong> {msg.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminContactMessages
