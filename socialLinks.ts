// Centrale configuratie voor social media URL's.
// Vul de echte profielen in via Vite env variabelen (zie README) of hieronder als fallback.
// Voor productie: maak een .env bestand met:
// VITE_INSTAGRAM_URL=https://www.instagram.com/ jouw-profiel
// VITE_PINTEREST_URL=https://www.pinterest.com/ jouw-profiel

const instagramEnv = import.meta.env?.VITE_INSTAGRAM_URL as string | undefined
const pinterestEnv = import.meta.env?.VITE_PINTEREST_URL as string | undefined

export const socialLinks = {
  instagram: instagramEnv || 'https://www.instagram.com/gifteez.nl/',
  pinterest: pinterestEnv || 'https://nl.pinterest.com/gifteez01/',
}

export type SocialKey = keyof typeof socialLinks
