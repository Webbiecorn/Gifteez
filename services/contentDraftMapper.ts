import { generateId } from '../components/ContentBuilder'
import { contentStringToBlocks } from './blogMapper'
import type {
  ContentBlockDraft,
  ParagraphBlockDraft,
  ParagraphStyle,
  GiftDraft,
} from '../components/ContentBuilder'
import type { ContentBlock, FAQBlock, Gift, ImageBlock, VerdictBlock } from '../types'

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

const stripHtml = (value: string): string =>
  decodeHtmlEntities(value.replace(/<br\s*\/?>(?=\s*<br)/gi, '\n').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()

const htmlToLines = (html: string): string[] => {
  const matches = Array.from(html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
  if (!matches.length) {
    return html
      .replace(/<br\s*\/?>(?=\s*<br)/gi, '\n\n')
      .replace(/<br\s*\/?>(?!\n)/gi, '\n')
      .split(/<p[^>]*>|<\/p>/gi)
      .map((segment) => stripHtml(segment))
      .filter(Boolean)
  }
  return matches.map((match) => stripHtml(match[1]) || '').filter(Boolean)
}

const parseParagraphHtml = (html: string): { style: ParagraphStyle; text: string } => {
  if (!html) {
    return { style: 'paragraph', text: '' }
  }

  const trimmed = html.trim()
  if (!trimmed) {
    return { style: 'paragraph', text: '' }
  }

  if (/^<\s*ul/i.test(trimmed)) {
    const lines = htmlToLines(trimmed)
    return { style: 'bullets', text: lines.join('\n') }
  }

  if (/^<\s*ol/i.test(trimmed)) {
    const lines = htmlToLines(trimmed)
    return { style: 'numbered', text: lines.join('\n') }
  }

  if (/^<\s*blockquote/i.test(trimmed)) {
    const inner = trimmed
      .replace(/^<\s*blockquote[^>]*>/i, '')
      .replace(/<\s*\/\s*blockquote\s*>$/i, '')
    const text = stripHtml(inner).replace(/\s*\n\s*/g, '\n')
    return { style: 'quote', text }
  }

  const hasHtml = /<[^>]+>/.test(trimmed.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, ''))
  if (!hasHtml || /^<p/i.test(trimmed)) {
    const normalized = trimmed
      .replace(/^<\s*p[^>]*>/i, '')
      .replace(/<\s*\/\s*p\s*>$/i, '')
      .replace(/<br\s*\/?>(?=\s*<br)/gi, '\n\n')
      .replace(/<br\s*\/?>(?!\n)/gi, '\n')
    return { style: 'paragraph', text: decodeHtmlEntities(stripHtml(normalized)) }
  }

  return { style: 'html', text: trimmed }
}

const linesToListHtml = (lines: string[], ordered: boolean): string => {
  const tag = ordered ? 'ol' : 'ul'
  const listClass = ordered
    ? 'list-decimal pl-5 space-y-1 text-gray-700'
    : 'list-disc pl-5 space-y-1 text-gray-700'
  const items = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join('')
  return `<${tag} class="${listClass}">${items}</${tag}>`
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const formatParagraphDraft = (block: ParagraphBlockDraft): string => {
  const text = block.text.trim()
  if (!text) {
    return ''
  }

  switch (block.style) {
    case 'paragraph': {
      const lines = text
        .split(/\n{2,}/)
        .map((segment) => segment.trim())
        .filter(Boolean)
      if (!lines.length) {
        return ''
      }
      if (lines.length === 1) {
        return `<p>${escapeHtml(lines[0]).replace(/\n/g, '<br />')}</p>`
      }
      return lines
        .map((segment) => `<p>${escapeHtml(segment).replace(/\n/g, '<br />')}</p>`)
        .join('')
    }
    case 'bullets': {
      const lines = text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
      if (!lines.length) {
        return ''
      }
      return linesToListHtml(lines, false)
    }
    case 'numbered': {
      const lines = text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
      if (!lines.length) {
        return ''
      }
      return linesToListHtml(lines, true)
    }
    case 'quote':
      return `<blockquote class="bg-rose-50 border-l-4 border-rose-400 px-4 py-3 italic rounded-r-lg"><p>${escapeHtml(text).replace(/\n/g, '<br />')}</p></blockquote>`
    case 'html':
      return text
    default:
      return `<p>${escapeHtml(text)}</p>`
  }
}

const draftGiftToGift = (draft: GiftDraft): Gift => {
  const retailers = draft.retailers
    .map((retailer) => ({
      name: retailer.name.trim(),
      affiliateLink: retailer.affiliateLink.trim(),
    }))
    .filter((retailer) => retailer.name || retailer.affiliateLink)

  return {
    productName: draft.productName.trim(),
    description: draft.description.trim(),
    priceRange: draft.priceRange.trim(),
    imageUrl: draft.imageUrl.trim(),
    retailers,
    tags: draft.tags
      ? draft.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined,
  }
}

const giftToDraft = (gift: Gift): GiftDraft => ({
  productName: gift.productName ?? '',
  description: gift.description ?? '',
  priceRange: gift.priceRange ?? '',
  imageUrl: gift.imageUrl ?? '',
  retailers: (gift.retailers ?? []).length
    ? gift.retailers.map((retailer) => ({
        id: generateId(),
        name: retailer.name ?? '',
        affiliateLink: retailer.affiliateLink ?? '',
      }))
    : [{ id: generateId(), name: '', affiliateLink: '' }],
  tags: gift.tags?.join(', ') ?? '',
  giftType: gift.giftType,
  popularity: gift.popularity,
})

const blockToDraft = (block: ContentBlock): ContentBlockDraft => {
  switch (block.type) {
    case 'heading':
      return {
        id: generateId(),
        type: 'heading',
        text: block.content ?? '',
      }
    case 'paragraph': {
      const parsed = parseParagraphHtml(block.content ?? '')
      return {
        id: generateId(),
        type: 'paragraph',
        style: parsed.style,
        text: parsed.text,
      }
    }
    case 'image': {
      const image = block as ImageBlock
      return {
        id: generateId(),
        type: 'image',
        src: image.src ?? '',
        alt: image.alt ?? '',
        caption: image.caption ?? '',
        href: image.href ?? '',
      }
    }
    case 'gift': {
      return {
        id: generateId(),
        type: 'gift',
        gift: giftToDraft(block.content as Gift),
      }
    }
    case 'faq': {
      const faqBlock = block as FAQBlock
      return {
        id: generateId(),
        type: 'faq',
        items: (faqBlock.items ?? []).map((item) => ({
          id: generateId(),
          question: item.question ?? '',
          answer: item.answer ?? '',
        })),
      }
    }
    case 'verdict': {
      const verdict = block as VerdictBlock
      return {
        id: generateId(),
        type: 'verdict',
        title: verdict.title ?? '',
        text: verdict.content ?? '',
      }
    }
    default:
      return {
        id: generateId(),
        type: 'unsupported',
        label: `Bloktype “${(block as any)?.type ?? 'onbekend'}”`,
        original: block,
      }
  }
}

const draftToBlock = (draft: ContentBlockDraft): ContentBlock | null => {
  switch (draft.type) {
    case 'heading':
      if (!draft.text.trim()) return null
      return { type: 'heading', content: draft.text.trim() }
    case 'paragraph': {
      const html = formatParagraphDraft(draft)
      if (!html) return null
      return { type: 'paragraph', content: html }
    }
    case 'image': {
      if (!draft.src.trim()) return null
      return {
        type: 'image',
        src: draft.src.trim(),
        alt: draft.alt.trim() || undefined,
        caption: draft.caption.trim() || undefined,
        href: draft.href.trim() || undefined,
      }
    }
    case 'gift': {
      const gift = draftGiftToGift(draft.gift)
      if (!gift.productName) {
        return null
      }
      return { type: 'gift', content: gift }
    }
    case 'faq': {
      const items = draft.items
        .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }))
        .filter((item) => item.question && item.answer)
      if (!items.length) {
        return null
      }
      return { type: 'faq', items }
    }
    case 'verdict': {
      if (!draft.title.trim() && !draft.text.trim()) {
        return null
      }
      return {
        type: 'verdict',
        title: draft.title.trim() || 'Ons oordeel',
        content: draft.text.trim(),
      }
    }
    case 'unsupported':
      if (draft.original && typeof draft.original === 'object') {
        return draft.original as ContentBlock
      }
      return null
    default:
      return null
  }
}

const renderBlockHtml = (block: ContentBlock): string => {
  switch (block.type) {
    case 'heading':
      return `<h2>${escapeHtml(block.content ?? '')}</h2>`
    case 'paragraph':
      return block.content ?? ''
    case 'image': {
      const image = block as ImageBlock
      const img = `<img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt ?? '')}" style="max-width:100%;height:auto;border-radius:12px;" />`
      const figure = image.href
        ? `<a href="${escapeHtml(image.href)}" target="_blank" rel="noopener">${img}</a>`
        : img
      const caption = image.caption
        ? `<figcaption style="text-align:center;color:#4b5563;font-size:0.9rem;margin-top:0.5rem;">${escapeHtml(image.caption)}</figcaption>`
        : ''
      return `<figure>${figure}${caption}</figure>`
    }
    case 'gift': {
      const gift = (block.content as Gift) ?? ({} as Gift)
      const retailer = gift.retailers?.[0]
      const button = retailer?.affiliateLink
        ? `<a href="${escapeHtml(retailer.affiliateLink)}" target="_blank" rel="noopener" style="display:inline-block;margin-top:1rem;background:#e11d48;color:white;padding:0.6rem 1.2rem;border-radius:9999px;text-decoration:none;font-weight:600;">Bekijk bij ${escapeHtml(retailer.name || 'retailer')}</a>`
        : ''
      return `<div style="border-radius:16px;border:1px solid #fce7f3;background:#fff5f7;padding:1.5rem;">
        <div style="display:flex;gap:1.25rem;align-items:flex-start;flex-wrap:wrap;">
          ${gift.imageUrl ? `<img src="${escapeHtml(gift.imageUrl)}" alt="${escapeHtml(gift.productName ?? '')}" style="width:140px;height:140px;object-fit:contain;border-radius:12px;background:white;border:1px solid #f1f5f9;padding:0.75rem;" />` : ''}
          <div style="flex:1;min-width:220px;">
            <h3 style="margin:0 0 0.5rem;font-size:1.25rem;color:#111827;">${escapeHtml(gift.productName ?? '')}</h3>
            ${gift.priceRange ? `<p style="margin:0 0 0.5rem;font-weight:600;color:#dc2626;">${escapeHtml(gift.priceRange)}</p>` : ''}
            ${gift.description ? `<p style="margin:0;color:#374151;">${escapeHtml(gift.description)}</p>` : ''}
            ${button}
          </div>
        </div>
      </div>`
    }
    case 'faq': {
      const faq = block as FAQBlock
      if (!faq.items?.length) {
        return ''
      }
      const items = faq.items
        .map(
          (
            item
          ) => `<div style="margin-bottom:1rem;border-bottom:1px solid #e5e7eb;padding-bottom:1rem;">
              <h4 style="margin:0 0 0.5rem;font-size:1rem;color:#0f172a;font-weight:600;">${escapeHtml(item.question)}</h4>
              <p style="margin:0;color:#475569;">${escapeHtml(item.answer)}</p>
            </div>`
        )
        .join('')
      return `<section><h3 style="font-size:1.25rem;color:#111827;margin-bottom:1rem;">Veelgestelde vragen</h3>${items}</section>`
    }
    case 'verdict': {
      const verdict = block as VerdictBlock
      return `<section style="border-radius:16px;border:2px solid #fce7f3;padding:1.5rem;background:#fff;">
        <h3 style="margin:0 0 0.75rem;font-size:1.5rem;color:#9d174d;">${escapeHtml(verdict.title ?? 'Ons oordeel')}</h3>
        <p style="margin:0;color:#334155;line-height:1.6;">${escapeHtml(verdict.content ?? '')}</p>
      </section>`
    }
    default:
      return ''
  }
}

export const draftsToContentBlocks = (drafts: ContentBlockDraft[]): ContentBlock[] =>
  drafts
    .map((draft) => draftToBlock(draft))
    .filter((block): block is ContentBlock => Boolean(block))

export const draftsToHtml = (drafts: ContentBlockDraft[]): string =>
  draftsToContentBlocks(drafts)
    .map((block) => renderBlockHtml(block))
    .filter(Boolean)
    .join('\n\n')

export const draftsToPlainText = (drafts: ContentBlockDraft[]): string =>
  draftsToContentBlocks(drafts)
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return block.content ?? ''
        case 'paragraph':
          return stripHtml(block.content ?? '')
        case 'gift': {
          const gift = block.content as Gift
          return `${gift.productName ?? ''} ${gift.description ?? ''}`
        }
        case 'faq':
          return (block as FAQBlock).items
            .map((item) => `${item.question} ${item.answer}`)
            .join(' ')
        case 'verdict':
          return `${(block as VerdictBlock).title ?? ''} ${(block as VerdictBlock).content ?? ''}`
        default:
          return ''
      }
    })
    .join(' ')

export const contentBlocksToDrafts = (blocks: ContentBlock[]): ContentBlockDraft[] =>
  blocks.map((block) => blockToDraft(block))

export const stringToDrafts = (value: string): ContentBlockDraft[] =>
  contentBlocksToDrafts(contentStringToBlocks(value))

export const normalizeDraftList = (drafts: ContentBlockDraft[]): ContentBlockDraft[] => {
  if (!drafts.length) {
    return [
      {
        id: generateId(),
        type: 'paragraph',
        style: 'paragraph',
        text: '',
      } as ParagraphBlockDraft,
    ]
  }
  return drafts
}
