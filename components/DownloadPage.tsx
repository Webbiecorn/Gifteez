import React from 'react'
import Button from './Button'
import { DownloadIcon, CheckCircleIcon } from './IconComponents'
import type { NavigateTo } from '../types'

interface DownloadPageProps {
  navigateTo: NavigateTo
}

const DownloadPage: React.FC<DownloadPageProps> = ({ navigateTo }) => {
  return (
    <div className="bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-2xl text-center animate-fade-in">
            <CheckCircleIcon className="w-20 h-20 mx-auto text-green-500" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mt-4">
              Bedankt voor je inschrijving!
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Je bent succesvol toegevoegd aan onze nieuwsbrief. Je ontvangt binnenkort de beste
              cadeau-ideeën in je inbox.
            </p>
            <p className="mt-2 text-gray-700">
              Klik op de knop hieronder om je gratis 'Ultieme Cadeau Planner' te downloaden.
            </p>

            <div className="mt-8">
              <a
                href="/downloads/Ultieme_Cadeau_Planner_Gifteez_2025.pdf"
                download="Ultieme_Cadeau_Planner_Gifteez_2025.pdf"
              >
                <Button variant="accent">
                  <div className="flex items-center gap-2">
                    <DownloadIcon className="w-6 h-6" />
                    <span>Download de Planner</span>
                  </div>
                </Button>
              </a>
            </div>
          </div>

          {/* Upsell Section */}
          <div
            className="bg-primary text-white p-8 rounded-lg shadow-xl text-center animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <h2 className="font-display text-3xl font-bold">Vond je de planner handig?</h2>
            <p className="mt-2 text-gray-200">
              Til je cadeau-skills naar een hoger niveau met ons premium e-book "Het Jaar Rond
              Perfecte Cadeaus". Nu beschikbaar in de winkel!
            </p>
            <div className="mt-6">
              <Button variant="accent" onClick={() => navigateTo('home')} disabled>
                E-book binnenkort beschikbaar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DownloadPage
