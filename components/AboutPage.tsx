import React from 'react'
import { socialLinks } from '../socialLinks'
import Breadcrumbs from './Breadcrumbs'
import Button from './Button'
import FAQSchema from './FAQSchema'
import {
  TargetIcon,
  SparklesIcon,
  CheckCircleIcon,
  GiftIcon,
  UserIcon,
  HeartIcon,
} from './IconComponents'
import ImageWithFallback from './ImageWithFallback'
import JsonLd from './JsonLd'
import Meta from './Meta'
import type { NavigateTo } from '../types'

interface AboutPageProps {
  navigateTo: NavigateTo
}

type IconType = React.ComponentType<{ className?: string }>

const pageTitle = 'Over Gifteez | Cadeaus geven zonder stress'
const pageDescription =
  'Leer het verhaal achter Gifteez kennen, ontdek hoe we cadeaustress wegnemen met slimme inspiratie en ontmoet het team dat dagelijks werkt aan verrassende cadeau-ideeën.'
const canonicalUrl = 'https://gifteez.nl/over-ons'
const heroImageUrl = 'https://gifteez.nl/images/gifteez-over-ons-blij.png'
const stressImageUrl = 'https://gifteez.nl/images/gifteez-over-ons-stress.png'

const differentiators: Array<{ title: string; description: string; icon: IconType }> = [
  {
    title: 'Handpicked cadeaucollecties',
    description:
      'Ons team filtert dagelijks het aanbod van retailers en niche makers tot bruikbare shortlistjes.',
    icon: SparklesIcon,
  },
  {
    title: 'Community & data inzichten',
    description:
      'We combineren feedback van cadeaugevers met data, zodat trends en persoonlijke wensen samenkomen.',
    icon: HeartIcon,
  },
  {
    title: 'Partners & snelle links',
    description:
      'We onderhouden warme relaties met betrouwbare winkels voor actuele voorraden, deals en directe shoplinks.',
    icon: TargetIcon,
  },
]

const stats: Array<{ label: string; description: string }> = [
  { label: '15.000+', description: 'cadeaus gescreend en dagelijks geüpdatet' },
  { label: '92%', description: 'van testers vindt binnen 5 voorstellen een match' },
  { label: '30+', description: 'gepersonaliseerde categorieën voor iedere gelegenheid' },
]

const milestones: Array<{ year: string; title: string; description: string }> = [
  {
    year: '2024',
    title: 'Start van Gifteez',
    description:
      'We begonnen als side-project om onze eigen cadeaustress aan te pakken — en bleven bouwen toen vrienden enthousiast werden.',
  },
  {
    year: '2025',
    title: 'Slimme matching 2.0',
    description:
      'We koppelden realtime productfeeds en slimme filters zodat we altijd frisse inspiratie serveren.',
  },
  {
    year: 'Vandaag',
    title: 'Jij staat centraal',
    description:
      'Feedback van gebruikers stuurt onze roadmap. Elke week testen we verbeteringen om cadeaus nog persoonlijker te maken.',
  },
]

const teamMembers = [
  {
    name: 'Kevin',
    role: 'Oprichter & Lead Developer',
    initial: 'K',
    color: 'from-blue-500 to-indigo-600',
    bio: 'Kevin is het technische brein achter Gifteez. Hij bouwt slimme algoritmes die duizenden cadeaus in seconden matchen met de perfecte ontvanger.',
  },
  {
    name: 'Bianca',
    role: 'Content & Inspiratiemanager',
    initial: 'B',
    color: 'from-pink-500 to-rose-600',
    bio: 'Bianca curateert cadeaucollecties en schrijft inspirerende gidsen. Ze werkt nauw samen met retailers en trendwatchers om je altijd de beste ideeën te geven.',
  },
  {
    name: 'Anna',
    role: 'Cadeau-strateeg',
    initial: 'A',
    color: 'from-purple-500 to-violet-600',
    bio: 'Anna vertaalt gebruikersfeedback naar nieuwe features. Ze bewaakt de merkervaring en zorgt dat Gifteez blijft focussen op wat jij écht nodig hebt.',
  },
]

const steps: Array<{
  number: string
  title: string
  description: string
  accentClass: string
  iconTint: string
  iconBg: string
  icon: IconType
}> = [
  {
    number: '1',
    title: 'We luisteren naar jouw verhaal',
    description:
      'Via quiz, e-mail en socials verzamelen we context: voor wie, welke gelegenheid en wat echt belangrijk is.',
    accentClass: 'from-primary to-accent',
    iconTint: 'text-primary',
    iconBg: 'bg-primary/10',
    icon: TargetIcon,
  },
  {
    number: '2',
    title: 'We cureren en testen',
    description:
      'Ons team combineert trenddata met echte proefcadeaus en feedback van partners om lijsten scherp te houden.',
    accentClass: 'from-blue-500 to-indigo-600',
    iconTint: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    icon: SparklesIcon,
  },
  {
    number: '3',
    title: 'Jij kiest en verrast',
    description:
      'We bundelen inspiratielijsten, gidsen en snelle shoplinks per budget en stijl zodat je direct kunt handelen.',
    accentClass: 'from-pink-500 to-purple-500',
    iconTint: 'text-pink-600',
    iconBg: 'bg-pink-100',
    icon: CheckCircleIcon,
  },
]

const sameAsLinks = Object.values(socialLinks).filter(Boolean)

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Over Gifteez',
  description: pageDescription,
  url: canonicalUrl,
  image: [heroImageUrl, stressImageUrl],
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: heroImageUrl,
    width: 1152,
    height: 768,
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gifteez.nl' },
      { '@type': 'ListItem', position: 2, name: 'Over ons', item: canonicalUrl },
    ],
  },
  about: differentiators.map((item) => ({
    '@type': 'Thing',
    name: item.title,
    description: item.description,
  })),
  publisher: {
    '@type': 'Organization',
    name: 'Gifteez',
    url: 'https://gifteez.nl',
    sameAs: sameAsLinks,
    logo: {
      '@type': 'ImageObject',
      url: 'https://gifteez.nl/android-chrome-512x512.png',
      width: 512,
      height: 512,
    },
  },
}

const aboutFAQs = [
  {
    question: 'Wat is Gifteez en hoe helpt het?',
    answer:
      'Gifteez is je cadeaupartner. We combineren handgecurateerde gidsen, dagelijkse deals en een slimme cadeau-coach zodat jij zonder stress iets passends vindt.',
  },
  {
    question: 'Is Gifteez gratis te gebruiken?',
    answer:
      'Ja, Gifteez is volledig gratis te gebruiken. We verdienen commissie op verkopen via onze affiliate partners (Coolblue en Amazon), maar dit heeft geen invloed op de prijs die jij betaalt.',
  },
  {
    question: 'Waar komen de producten vandaan?',
    answer:
      'We tonen producten van gerenommeerde online retailers zoals Coolblue en Amazon. Alle producten worden dagelijks bijgewerkt met de nieuwste prijzen en deals.',
  },
  {
    question: 'Hoe werkt de cadeau-coach precies?',
    answer:
      'Onze coach analyseert je input (budget, gelegenheid, interesses) en matcht dit met productkenmerken, reviews, populariteit en seizoenstrends. Zo krijg je binnen 30 seconden een gepersonaliseerde shortlist van cadeaus die het beste passen.',
  },
  {
    question: 'Kan ik mijn favoriete cadeaus opslaan?',
    answer:
      'Ja! Je kunt cadeaus toevoegen aan je favorieten en deze later terugvinden. Als je ingelogd bent, worden je favorieten automatisch gesynchroniseerd.',
  },
]

const AboutPage: React.FC<AboutPageProps> = ({ navigateTo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
      <Meta
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalUrl}
        ogImage={heroImageUrl}
      />
      <JsonLd data={structuredData} id="about-page-jsonld" />
      <FAQSchema faqs={aboutFAQs} />

      <Breadcrumbs
        items={[{ label: 'Home', onClick: () => navigateTo('home') }, { label: 'Over ons' }]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-blue-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 left-16 h-40 w-40 rounded-full bg-primary/10 blur-xl" />
          <div className="absolute bottom-10 right-20 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto grid gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.05fr,0.95fr] md:py-24 lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm backdrop-blur">
              <HeartIcon className="h-4 w-4" />
              Cadeaus geven met een glimlach
            </div>
            <h1 className="typo-h1 leading-tight text-gray-900">
              Cadeaustress uit,
              <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                cadeaupret aan.
              </span>
            </h1>
            <p className="typo-lead text-gray-700">
              We bouwen aan hét startpunt voor cadeauinspiratie. Bij Gifteez combineren we curatie,
              data en empathie om verrassende ideeën te brengen voor elk moment.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                variant="accent"
                onClick={() => navigateTo('categories')}
                className="px-10 py-4 text-lg font-semibold shadow-lg transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <SparklesIcon className="h-5 w-5" />
                Bekijk cadeaucollecties
              </Button>
              <button
                onClick={() => navigateTo('contact')}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-8 py-3 text-primary transition-colors hover:bg-primary/10"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Plan een demo
              </button>
            </div>

            <dl className="grid gap-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur"
                >
                  <dt className="text-2xl font-bold text-primary">{stat.label}</dt>
                  <dd className="text-sm text-gray-600">{stat.description}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="relative">
            <div className="absolute inset-0 -left-6 -top-6 rounded-3xl bg-gradient-to-tr from-primary/30 via-transparent to-accent/30 blur-xl" />
            <ImageWithFallback
              src="/images/gifteez-over-ons-blij.png"
              alt="Blij Gifteez cadeaudoos helpt met cadeau-inspiratie"
              width={1152}
              height={768}
              showSkeleton
              fit="contain"
              className="relative overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl"
            />
            <figcaption className="mt-4 text-sm text-gray-600">
              Cadeauvreugde in actie: elk idee testen we zelf voordat het in een gids belandt.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Value proposition */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-secondary/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <SparklesIcon className="h-4 w-4" />
              Waarom Gifteez werkt
            </div>
            <h2 className="typo-h2 mt-5 leading-tight text-gray-900">
              Slimme technologie, menselijke empathie en eindeloze inspiratie.
            </h2>
            <p className="mt-4 text-gray-600">
              We geven je niet zomaar een lijst met cadeaus. We bouwen een cadeau-assistent die past
              bij je situatie, timing en budget — zonder eindeloos scrollen.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {differentiators.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/30 text-primary group-hover:scale-110 group-hover:from-primary/20 group-hover:to-accent/40">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-3 text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Stress to joy */}
      <section className="bg-gradient-to-br from-secondary/20 via-white to-secondary/10 py-20">
        <div className="container mx-auto grid gap-16 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <figure className="relative order-last md:order-first">
            <div className="absolute inset-0 -left-8 top-8 rounded-3xl bg-gradient-to-br from-primary/25 via-transparent to-accent/25" />
            <ImageWithFallback
              src="/images/gifteez-over-ons-stress.png"
              alt="Persoon met cadeaustress voor een berg cadeaus"
              width={1152}
              height={768}
              showSkeleton
              fit="contain"
              className="relative rounded-3xl border border-white/60 bg-white shadow-2xl"
            />
            <figcaption className="mt-4 text-sm text-gray-600">
              We herkennen de stress. Daarom helpen we je met het moeilijke werk.
            </figcaption>
          </figure>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
              <CheckCircleIcon className="h-4 w-4" />
              Van stress naar cadeaupret
            </div>
            <h2 className="typo-h2 leading-tight text-gray-900">
              Cadeaus kiezen hoort leuk te zijn. Wij maken het weer eenvoudig én verrassend.
            </h2>
            <p className="text-gray-600">
              Cadeaustress kennen we als geen ander: beperkte tijd, eindeloze opties en de druk om
              origineel te zijn. Met onze curatie, data-inzichten en persoonlijke tone-of-voice
              begeleiden we je stap voor stap naar een cadeau dat past als gegoten.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-1 h-5 w-5 text-primary" />
                <span>
                  Realtime voorraad- en prijscheck zodat je nooit op een dood spoor belandt.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-1 h-5 w-5 text-primary" />
                <span>
                  Duidelijke cadeautypes: duurzaam, gepersonaliseerd, last-minute of juist luxe.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-1 h-5 w-5 text-primary" />
                <span>
                  Onze content- en inspiratiebench zorgt dat je altijd een verhaal vertelt bij je
                  cadeau.
                </span>
              </li>
            </ul>
            <Button
              variant="primary"
              onClick={() => navigateTo('quiz')}
              className="mt-4 inline-flex items-center gap-2 px-8 py-4 text-base font-semibold shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              <TargetIcon className="h-5 w-5" />
              Doe eerst de cadeauquiz
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold uppercase text-white shadow-lg">
              Zo werkt het
            </div>
            <h2 className="typo-h2 mt-6 text-gray-900">
              In drie stappen van idee naar cadeau dat raakt.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Je hoeft geen research-marathon te lopen. We vertalen jouw input en feedback naar
              concrete shortlistjes, gidsen en deals die passen bij het moment.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map(
              ({ number, title, description, accentClass, iconTint, iconBg, icon: Icon }) => (
                <article
                  key={number}
                  className="group rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div
                    className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${accentClass} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <span className="text-2xl font-bold">{number}</span>
                  </div>
                  <div
                    className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${iconBg}`}
                  >
                    <Icon className={`h-8 w-8 ${iconTint}`} />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-gray-900">{title}</h3>
                  <p className="mt-3 text-gray-600">{description}</p>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-gradient-to-r from-blue-50 via-white to-secondary/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
              <GiftIcon className="h-5 w-5" />
              Onze reis
            </div>
            <h2 className="typo-h2 mt-5 text-gray-900">
              Van idee aan de keukentafel tot jouw digitale cadeaucollega.
            </h2>
            <p className="mt-4 text-gray-600">
              Elke mijlpaal kwam dankzij feedback van cadeauliefhebbers zoals jij. En we zijn nog
              lang niet klaar.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {milestones.map((milestone) => (
              <article
                key={milestone.year}
                className="rounded-3xl border border-white/80 bg-white/80 p-8 shadow-xl backdrop-blur"
              >
                <span className="text-sm font-semibold uppercase tracking-wide text-primary/80">
                  {milestone.year}
                </span>
                <h3 className="mt-2 text-xl font-semibold text-gray-900">{milestone.title}</h3>
                <p className="mt-3 text-gray-600">{milestone.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold uppercase text-white shadow-lg">
              Het Gifteez-team
            </div>
            <h2 className="typo-h2 mt-6 text-gray-900">
              Wij combineren tech met warme cadeaulogica.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Een compacte crew met een groot hart voor cadeaus. We werken remote, testen veel en
              vieren elk succes met iets lekkers.
            </p>
          </div>

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="group rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Initiaal cirkel met gradient */}
                <div className="relative mx-auto mb-6 h-28 w-28">
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${member.color} opacity-90 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white drop-shadow-lg">
                      {member.initial}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-primary/80 font-medium mt-1">{member.role}</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">{member.bio}</p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <HeartIcon className="h-4 w-4" />
                  Teamlid
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Moderne versie */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-24">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-pink-500/5 to-rose-500/5 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {/* Content grid */}
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left side - Text content */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm">
                  <SparklesIcon className="h-4 w-4" />
                  Klaar om te beginnen?
                </div>

                <h2 className="typo-h1 mt-6 bg-gradient-to-r from-primary via-rose-600 to-purple-600 bg-clip-text text-transparent">
                  Blader door de beste cadeaulijsten
                </h2>

                <p className="typo-body mt-6 text-gray-700">
                  Dagelijkse inspiratie uit gidsen, collecties en partnerdeals. Geen eindeloos
                  scrollen meer, maar direct bruikbare ideeën voor elk budget.
                </p>

                {/* Features list */}
                <ul className="mt-8 space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-rose-600">
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Curatie door experts én cadeaugevers
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-rose-600">
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Dagelijks verse deals van betrouwbare retailers
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-rose-600">
                      <svg
                        className="h-3.5 w-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Gratis en zonder inloggen direct bruikbaar
                    </span>
                  </li>
                </ul>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button
                    variant="primary"
                    onClick={() => navigateTo('categories')}
                    className="group px-8 py-4 text-base font-semibold shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                  >
                    <GiftIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                    Bekijk cadeaucollecties
                  </Button>
                  <button
                    onClick={() => navigateTo('giftFinder')}
                    className="inline-flex items-center gap-2 font-semibold text-gray-700 transition-colors hover:text-primary"
                  >
                    <UserIcon className="h-5 w-5" />
                    Of laat de cadeau-coach helpen
                  </button>
                </div>
              </div>

              {/* Right side - Visual card */}
              <div className="relative">
                <div className="relative rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-900/5">
                  {/* Decorative gradient border */}
                  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-primary via-rose-500 to-purple-500 opacity-20 blur" />

                  <div className="relative space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-rose-600 shadow-lg">
                        <SparklesIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-500">Gemiddelde tijd</div>
                        <div className="text-3xl font-bold text-gray-900">30 sec</div>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Cadeaus beschikbaar
                        </span>
                        <span className="text-lg font-bold text-primary">5.000+</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Categorieën</span>
                        <span className="text-lg font-bold text-primary">50+</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Tevreden gebruikers
                        </span>
                        <span className="text-lg font-bold text-primary">10.000+</span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-purple-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                          <svg
                            className="h-5 w-5 text-primary"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            "Binnen een minuut had ik 5 perfecte opties. Echt een lifesaver!"
                          </p>
                          <p className="mt-1 text-xs text-gray-500">— Lisa, Amsterdam</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
