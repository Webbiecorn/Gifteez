import React, { useState } from 'react'
import {
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  WhatsAppIcon,
  LinkedInIcon,
  TelegramIcon,
  MailIcon,
  LinkIcon,
  CheckIcon,
} from './IconComponents'
import type { Gift, BlogPost } from '../types'

interface SocialShareProps {
  item: Gift | BlogPost
  type: 'gift' | 'blog'
  variant?: 'compact' | 'full' | 'floating'
  className?: string
}

interface ShareData {
  title: string
  text: string
  url: string
  imageUrl?: string
}

export const SocialShare: React.FC<SocialShareProps> = ({
  item,
  type,
  variant = 'compact',
  className = '',
}) => {
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState(0)

  const getShareData = (): ShareData => {
    const baseUrl = 'https://gifteez.nl'

    if (type === 'gift') {
      const gift = item as Gift
      return {
        title: `Perfecte cadeau gevonden: ${gift.productName}`,
        text: `Ik vond dit geweldige cadeau via Gifteez! ${gift.productName} - ${gift.description.substring(0, 100)}...`,
        url: `${baseUrl}/gift/${encodeURIComponent(gift.productName.toLowerCase().replace(/\s+/g, '-'))}`,
        imageUrl: gift.imageUrl,
      }
    } else {
      const post = item as BlogPost
      return {
        title: post.title,
        text: `Interessant artikel: ${post.title} - ${post.excerpt.substring(0, 100)}...`,
        url: `${baseUrl}/blog/${post.slug}`,
        imageUrl: post.imageUrl,
      }
    }
  }

  const shareData = getShareData()

  const trackShare = (_platform: string) => {
    setShareCount((prev) => prev + 1)
    // Analytics tracking could be added here
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopied(true)
      trackShare('clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const shareLinks = [
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: 'hover:bg-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`,
      showInCompact: true,
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      color: 'hover:bg-blue-400',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}&hashtags=gifteez,cadeau`,
      showInCompact: true,
    },
    {
      name: 'Pinterest',
      icon: PinterestIcon,
      color: 'hover:bg-red-600',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareData.url)}&media=${encodeURIComponent(shareData.imageUrl || '')}&description=${encodeURIComponent(shareData.text)}`,
      showInCompact: type === 'gift', // Pinterest is more relevant for gifts
    },
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      color: 'hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`,
      showInCompact: true,
    },
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
      color: 'hover:bg-blue-700',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
      showInCompact: false,
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      color: 'hover:bg-blue-500',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`,
      showInCompact: false,
    },
    {
      name: 'Email',
      icon: MailIcon,
      color: 'hover:bg-gray-600',
      url: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)}`,
      showInCompact: false,
    },
  ]

  const handleShare = (platform: string, url: string) => {
    trackShare(platform)
    window.open(url, '_blank', 'width=600,height=400')
  }

  const visibleLinks =
    variant === 'compact' ? shareLinks.filter((link) => link.showInCompact) : shareLinks

  const containerClasses = {
    compact: 'flex items-center gap-2',
    full: 'flex flex-wrap gap-3',
    floating:
      'fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 bg-white shadow-lg rounded-lg p-2 z-50',
  }

  const buttonClasses = {
    compact: 'p-2 rounded-full transition-all duration-200 hover:scale-110',
    full: 'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105',
    floating: 'p-3 rounded-lg transition-all duration-200 hover:scale-110 shadow-md',
  }

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {variant === 'full' && (
        <div className="w-full mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            {type === 'gift' ? 'Deel dit cadeau-idee' : 'Deel dit artikel'}
          </h3>
          <p className="text-sm text-gray-600">
            Help anderen met deze {type === 'gift' ? 'cadeau-inspiratie' : 'waardevolle informatie'}
          </p>
        </div>
      )}

      {/* Social platform buttons */}
      {visibleLinks.map((platform) => {
        const IconComponent = platform.icon
        return (
          <button
            key={platform.name}
            onClick={() => handleShare(platform.name, platform.url)}
            className={`bg-gray-100 text-gray-700 ${platform.color} hover:text-white ${buttonClasses[variant]}`}
            aria-label={`Delen op ${platform.name}`}
          >
            <IconComponent className="w-5 h-5" />
            {variant === 'full' && <span>{platform.name}</span>}
          </button>
        )
      })}

      {/* Copy link button */}
      <button
        onClick={copyToClipboard}
        className={`bg-gray-100 text-gray-700 hover:bg-gray-700 hover:text-white ${buttonClasses[variant]} relative`}
        aria-label="Link kopiëren"
      >
        {copied ? (
          <CheckIcon className="w-5 h-5 text-green-600" />
        ) : (
          <LinkIcon className="w-5 h-5" />
        )}
        {variant === 'full' && <span>{copied ? 'Gekopieerd!' : 'Link kopiëren'}</span>}
      </button>

      {/* Share count (only in full variant) */}
      {variant === 'full' && shareCount > 0 && (
        <div className="text-sm text-gray-500 mt-2">{shareCount} keer gedeeld</div>
      )}
    </div>
  )
}

export default SocialShare
