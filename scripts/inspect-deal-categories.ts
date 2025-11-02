import { promises as fs } from 'node:fs'
import path from 'node:path'

const storageMap = new Map<string, string>()

const storage = {
  getItem(key: string) {
    return storageMap.has(key) ? storageMap.get(key)! : null
  },
  setItem(key: string, value: string) {
    storageMap.set(key, String(value))
  },
  removeItem(key: string) {
    storageMap.delete(key)
  },
  clear() {
    storageMap.clear()
  },
  key(index: number) {
    const keys = [...storageMap.keys()]
    return keys[index] ?? null
  },
  get length() {
    return storageMap.size
  },
}

const globalAny = globalThis as any

globalAny.localStorage = storage
const sessionCopy = {
  ...storage,
  setItem(key: string, value: string) {
    storageMap.set(`session:${key}`, String(value))
  },
  getItem(key: string) {
    const value = storageMap.get(`session:${key}`)
    return value === undefined ? null : value
  },
  removeItem(key: string) {
    storageMap.delete(`session:${key}`)
  },
  clear() {
    ;[...storageMap.keys()].forEach((key) => {
      if (key.startsWith('session:')) {
        storageMap.delete(key)
      }
    })
  },
  get length() {
    return [...storageMap.keys()].filter((key) => key.startsWith('session:')).length
  },
  key(index: number) {
    const keys = [...storageMap.keys()].filter((key) => key.startsWith('session:'))
    return keys[index]?.replace(/^session:/, '') ?? null
  },
}

globalAny.sessionStorage = sessionCopy

globalAny.window = {
  localStorage: globalAny.localStorage,
  sessionStorage: globalAny.sessionStorage,
  location: { href: 'http://localhost/' },
  navigator: { userAgent: 'node' },
}

if (!('navigator' in globalAny)) {
  Object.defineProperty(globalAny, 'navigator', {
    value: globalAny.window.navigator,
    configurable: true,
  })
}

const publicDir = path.join(process.cwd(), 'public')

const fetchImpl = async (input: unknown): Promise<Response> => {
  const target =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input && typeof (input as { url?: string }).url === 'string'
          ? (input as { url: string }).url
          : String(input)

  if (target.startsWith('/data/')) {
    const [pathname] = target.split('?')
    const filePath = path.join(publicDir, pathname.replace(/^\/+/, ''))
    try {
      const data = await fs.readFile(filePath, 'utf8')
      const headers = new Headers()
      headers.set('Content-Type', 'application/json; charset=utf-8')
      return new Response(data, { status: 200, headers })
    } catch (error) {
      console.error(`Failed to read local data for ${target}:`, error)
      return new Response('Not Found', { status: 404 })
    }
  }

  throw new Error(`Unsupported fetch target in inspector: ${target}`)
}

globalAny.fetch = fetchImpl
globalAny.window.fetch = fetchImpl

const main = async () => {
  const { DynamicProductService } = await import('../services/dynamicProductService')
  const { ShopLikeYouGiveADamnService } = await import('../services/shopLikeYouGiveADamnService')
  const { PartyProService } = await import('../services/partyProService')
  const { mergeThematicCategories } = await import('../services/thematicDealCategories')

  await DynamicProductService.clearCache()
  ShopLikeYouGiveADamnService.clearCache()
  PartyProService.clearCache()

  await DynamicProductService.loadProducts()

  const [categories, sustainableProducts, partyProducts] = await Promise.all([
    DynamicProductService.getDealCategories(),
    ShopLikeYouGiveADamnService.loadProducts(),
    PartyProService.loadProducts(),
  ])

  const { categories: themedCategories, added } = mergeThematicCategories(
    categories.filter((category) => category.items.length > 0),
    {
      sustainableProducts,
      partyProducts,
    }
  )

  const pretty = themedCategories.map((category) => ({
    title: category.title,
    count: category.items.length,
    sample: category.items.slice(0, 3).map((item) => item.name),
  }))

  console.log(JSON.stringify(pretty, null, 2))
  if (added.length) {
    console.log(JSON.stringify({ added }, null, 2))
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
