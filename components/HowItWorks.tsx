import React from 'react'
import { Container } from './layout/Container'

const steps = [
  {
    id: 1,
    title: 'Vertel voor wie',
    description: 'Selecteer of je zoekt voor je partner, vader, zus of collega.',
    icon: '👤',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 2,
    title: 'Kies een vibe',
    description: 'Grappig, romantisch, praktisch of juist luxe?',
    icon: '✨',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 3,
    title: 'Ontvang top-tips',
    description: 'Onze AI en experts tonen direct de beste matches.',
    icon: '🎁',
    color: 'bg-rose-100 text-rose-600',
  },
]

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <Container size="lg">
        <div className="text-center mb-12">
          <span className="text-sm font-bold tracking-wider text-slate-500 uppercase">
            Zo simpel is het
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-black text-slate-900">
            Van zoektocht naar <span className="text-rose-500">glimlach</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-rose-200 -z-10" />

          {steps.map((step) => (
            <div key={step.id} className="relative flex flex-col items-center text-center group">
              <div
                className={`w-24 h-24 rounded-3xl ${step.color} flex items-center justify-center text-4xl shadow-lg mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3`}
              >
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed max-w-xs">{step.description}</p>

              {/* Step number badge */}
              <div className="absolute top-0 right-[25%] md:right-[30%] -mt-2 -mr-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm border-4 border-white">
                {step.id}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default HowItWorks
