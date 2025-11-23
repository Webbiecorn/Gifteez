export type SpotlightDuplicatePlacement = 'supporting' | 'grid'

export interface BlogSpotlightConfig {
  /**
   * Slugs die altijd bovenaan in de spotlight hero/selectie moeten staan.
   * Marketing kan de volgorde aanpassen om partners tijdelijk voorrang te geven.
   */
  prioritySlugs: string[]
  /**
   * Posts die zowel als hero (bovenaan de pagina) als in de spotlightmodule mogen verschijnen.
   */
  duplicateFeaturedPostSlugs?: string[]
  /**
   * Bepaalt waar de duplicaatkaart wordt getoond wanneer bovenstaande array een match bevat.
   * - 'supporting': toon de duplicate in de "Nieuwe partner" zijkaarten.
   * - 'grid': voeg de duplicate toe aan de reguliere kaartengrid.
   */
  duplicatePlacement?: SpotlightDuplicatePlacement
}

export const blogSpotlightConfig: BlogSpotlightConfig = {
  prioritySlugs: ['holland-barrett-partner-spotlight'],
  duplicateFeaturedPostSlugs: ['holland-barrett-partner-spotlight'],
  duplicatePlacement: 'supporting',
}
