import guidePathConfig from './guide-paths.json'

export const GUIDE_BASE_PATH = guidePathConfig.basePath
export const LEGACY_GUIDE_BASE_PATH = guidePathConfig.legacyBasePath
export const GUIDE_SEGMENT = GUIDE_BASE_PATH.replace(/^\//, '')
export const LEGACY_GUIDE_SEGMENT = LEGACY_GUIDE_BASE_PATH.replace(/^\//, '')

export const buildGuidePath = (slug?: string | null) =>
  slug && slug.length > 0 ? `${GUIDE_BASE_PATH}/${slug}` : GUIDE_BASE_PATH

export const replaceLegacyGuidePathSegment = (value: string) =>
  value.includes(LEGACY_GUIDE_BASE_PATH)
    ? value.replaceAll(LEGACY_GUIDE_BASE_PATH, GUIDE_BASE_PATH)
    : value

export const normalizeGuidePath = (path: string) => {
  if (!path) return path
  if (path.startsWith(GUIDE_BASE_PATH)) return path
  if (path.startsWith(LEGACY_GUIDE_BASE_PATH)) {
    return path.replace(LEGACY_GUIDE_BASE_PATH, GUIDE_BASE_PATH)
  }
  if (path.startsWith(`/${LEGACY_GUIDE_SEGMENT}`)) {
    return path.replace(`/${LEGACY_GUIDE_SEGMENT}`, GUIDE_BASE_PATH)
  }
  return path
}

export const deepReplaceLegacyGuidePaths = <T>(input: T): T => {
  if (typeof input === 'string') {
    return replaceLegacyGuidePathSegment(input) as T
  }
  if (Array.isArray(input)) {
    return input.map((item) => deepReplaceLegacyGuidePaths(item)) as T
  }
  if (input && typeof input === 'object') {
    return Object.entries(input as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        acc[key] = deepReplaceLegacyGuidePaths(value)
        return acc
      },
      {} as Record<string, unknown>
    ) as T
  }
  return input
}
