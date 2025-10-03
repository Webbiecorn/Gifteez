import React from 'react';
import { NavigateTo } from '../types';
import Button from './Button';
import {
  TargetIcon,
  SparklesIcon,
  CheckCircleIcon,
  GiftIcon,
  UserIcon,
  HeartIcon
} from './IconComponents';
import ImageWithFallback from './ImageWithFallback';
import Meta from './Meta';
import JsonLd from './JsonLd';
import { socialLinks } from '../socialLinks';

interface AboutPageProps {
  navigateTo: NavigateTo;
}

type IconType = React.ComponentType<{ className?: string }>;

const pageTitle = 'Over Gifteez | Cadeaus geven zonder stress';
const pageDescription =
  'Leer het verhaal achter Gifteez kennen, ontdek hoe onze AI GiftFinder cadeaustress wegneemt en ontmoet het team dat dagelijks werkt aan verrassende cadeau-inspiratie.';
const canonicalUrl = 'https://gifteez.nl/over-ons';
const heroImageUrl = 'https://gifteez.nl/images/gifteez-over-ons-blij.png';
const stressImageUrl = 'https://gifteez.nl/images/gifteez-over-ons-stress.png';

const differentiators: Array<{ title: string; description: string; icon: IconType }> = [
  {
    title: 'Superslimme GiftFinder',
    description: 'Onze AI scant continu meer dan 15.000 cadeaus en rekent meteen af met keuzestress.',
    icon: SparklesIcon
  },
  {
    title: 'Persoonlijk op maat',
    description: 'We combineren data met menselijke input, zodat elke suggestie voelt alsof jij hem zelf hebt uitgezocht.',
    icon: HeartIcon
  },
  {
    title: 'Binnen 3 minuten klaar',
    description: 'Van vraag tot kant-en-klare cadeaulijst met winkel links — razendsnel en moeiteloos.',
    icon: TargetIcon
  }
];

const stats: Array<{ label: string; description: string }> = [
  { label: '15.000+', description: 'cadeaus gescreend en dagelijks geüpdatet' },
  { label: '92%', description: 'van testers vindt binnen 5 voorstellen een match' },
  { label: '30+', description: 'gepersonaliseerde categorieën voor iedere gelegenheid' }
];

const milestones: Array<{ year: string; title: string; description: string }> = [
  {
    year: '2024',
    title: 'Start van Gifteez',
    description: 'We begonnen als side-project om onze eigen cadeaustress aan te pakken — en bleven bouwen toen vrienden enthousiast werden.'
  },
  {
    year: '2025',
    title: 'GiftFinder 2.0',
    description: 'We koppelden realtime productfeeds en slimme filters zodat de AI altijd frisse inspiratie serveert.'
  },
  {
    year: 'Vandaag',
    title: 'Jij staat centraal',
    description: 'Feedback van gebruikers stuurt onze roadmap. Elke week testen we verbeteringen om cadeaus nog persoonlijker te maken.'
  }
];

const teamMembers = [
  {
    name: 'Anna van der Meer',
    role: 'Oprichter & Cadeau-strateeg',
    imageUrl: 'https://i.pravatar.cc/150?u=anna',
    bio: 'Anna lanceerde Gifteez vanuit de missie om cadeaustress te verslaan. Ze bewaakt de merkervaring en vertaalt gebruikersfeedback naar nieuwe features.'
  },
  {
    name: 'Bas de Groot',
    role: 'Lead AI Developer',
    imageUrl: 'https://i.pravatar.cc/150?u=bas',
    bio: 'Bas is het technische brein achter de GiftFinder. Hij maakt modellen slimmer met live data en zorgt dat matches relevant en eerlijk blijven.'
  },
  {
    name: 'Sophie de Jong',
    role: 'Content & Inspiratiemanager',
    imageUrl: 'https://i.pravatar.cc/150?u=sophie',
    bio: 'Sophie curateert cadeaucollecties en schrijft gidsen die je creativiteit aanwakkeren. Ze werkt nauw samen met retailers en trendwatchers.'
  }
];

const steps: Array<{
  number: string;
  title: string;
  description: string;
  accentClass: string;
  iconTint: string;
  iconBg: string;
  icon: IconType;
}> = [
  {
    number: '1',
    title: 'Vertel wie je wilt verrassen',
    description: 'Kies relatie, budget, gelegenheid en hobby\'s. Hoe specifieker, hoe scherper de aanbevelingen.',
    accentClass: 'from-primary to-accent',
    iconTint: 'text-primary',
    iconBg: 'bg-primary/10',
    icon: TargetIcon
  },
  {
    number: '2',
    title: 'Laat AI het voorwerk doen',
    description: 'De GiftFinder weegt duizenden cadeaus af op relevantie, persoonlijkheid en beschikbaarheid in realtime.',
    accentClass: 'from-blue-500 to-indigo-600',
    iconTint: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    icon: SparklesIcon
  },
  {
    number: '3',
    title: 'Kies het perfecte cadeau',
    description: 'Je ontvangt een shortlist met direct te bestellen cadeaus en alternatieven voor verschillende prijspunten.',
    accentClass: 'from-pink-500 to-purple-500',
    iconTint: 'text-pink-600',
    iconBg: 'bg-pink-100',
    icon: CheckCircleIcon
  }
];

const sameAsLinks = Object.values(socialLinks).filter(Boolean);

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
    height: 768
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gifteez.nl' },
      { '@type': 'ListItem', position: 2, name: 'Over ons', item: canonicalUrl }
    ]
  },
  about: differentiators.map((item) => ({
    '@type': 'Thing',
    name: item.title,
    description: item.description
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
      height: 512
    }
  }
};

const AboutPage: React.FC<AboutPageProps> = ({ navigateTo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
      <Meta title={pageTitle} description={pageDescription} canonical={canonicalUrl} ogImage={heroImageUrl} />
      <JsonLd data={structuredData} id="about-page-jsonld" />

      <nav aria-label="Breadcrumb" className="bg-secondary/30">
        <ol className="container mx-auto flex items-center gap-2 px-4 py-3 text-sm text-gray-600">
          <li>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="transition-colors hover:text-primary"
            >
              Home
            </button>
          </li>
          <li aria-hidden="true" className="text-gray-400">
            /
          </li>
          <li className="font-semibold text-primary">Over ons</li>
        </ol>
      </nav>

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
              We bouwen aan de slimste cadeau-assistent van Nederland. Bij Gifteez combineren we empathie, data en design om voor iedereen de perfecte verrassing te vinden.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                variant="accent"
                onClick={() => navigateTo('giftFinder')}
                className="px-10 py-4 text-lg font-semibold shadow-lg transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <SparklesIcon className="h-5 w-5" />
                Ontdek de GiftFinder
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
                <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
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
              alt="Blij Gifteez cadeaudoos met de GiftFinder op een laptop"
              width={1152}
              height={768}
              showSkeleton
              fit="contain"
              className="relative overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl"
            />
            <figcaption className="mt-4 text-sm text-gray-600">
              Cadeauvreugde in actie: onze AI GiftFinder helpt je live kiezen.
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
              We geven je niet zomaar een lijst met cadeaus. We bouwen een cadeau-assistent die past bij je situatie, timing en budget — zonder eindeloos scrollen.
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
              We herkennen de stress. Daarom laten we de GiftFinder het moeilijke werk doen.
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
              Cadeaustress kennen we als geen ander: beperkte tijd, eindeloze opties en de druk om origineel te zijn. Met onze AI, curatie en persoonlijke tone-of-voice begeleiden we je stap voor stap naar een cadeau dat past als gegoten.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-1 h-5 w-5 text-primary" />
                <span>Realtime voorraad- en prijscheck zodat je nooit op een dood spoor belandt.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-1 h-5 w-5 text-primary" />
                <span>Duidelijke cadeautypes: duurzaam, gepersonaliseerd, last-minute of juist luxe.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircleIcon className="mt-1 h-5 w-5 text-primary" />
                <span>Onze content- en inspiratiebench zorgt dat je altijd een verhaal vertelt bij je cadeau.</span>
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
              Je hoeft geen research-marathon te lopen. Onze AI vertaalt jouw input direct naar een shortlist met cadeaus die kloppen voor het moment.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map(({ number, title, description, accentClass, iconTint, iconBg, icon: Icon }) => (
              <article
                key={number}
                className="group rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div
                  className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${accentClass} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <span className="text-2xl font-bold">{number}</span>
                </div>
                <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon className={`h-8 w-8 ${iconTint}`} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-3 text-gray-600">{description}</p>
              </article>
            ))}
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
            <h2 className="typo-h2 mt-5 text-gray-900">Van idee aan de keukentafel tot jouw digitale cadeaucollega.</h2>
            <p className="mt-4 text-gray-600">
              Elke mijlpaal kwam dankzij feedback van cadeauliefhebbers zoals jij. En we zijn nog lang niet klaar.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {milestones.map((milestone) => (
              <article key={milestone.year} className="rounded-3xl border border-white/80 bg-white/80 p-8 shadow-xl backdrop-blur">
                <span className="text-sm font-semibold uppercase tracking-wide text-primary/80">{milestone.year}</span>
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
              Het team achter de GiftFinder
            </div>
            <h2 className="typo-h2 mt-6 text-gray-900">Wij combineren tech met warme cadeaulogica.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Een compacte crew met een groot hart voor cadeaus. We werken remote, testen veel en vieren elk succes met iets lekkers.
            </p>
          </div>

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative mx-auto mb-6 h-28 w-28">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  <ImageWithFallback
                    src={member.imageUrl}
                    alt={member.name}
                    className="relative h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                    showSkeleton
                    fit="cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-primary/80 font-medium">{member.role}</p>
                <p className="mt-4 text-sm text-gray-600">{member.bio}</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <HeartIcon className="h-4 w-4" />
                  Teamcadeau
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-blue-500 to-indigo-600 py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-12 left-12 h-32 w-32 rounded-full bg-white" />
          <div className="absolute bottom-16 right-20 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <GiftIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="typo-h1 leading-tight text-white">
              Klaar om cadeaustress achter je te laten?
            </h2>
            <p className="typo-lead mx-auto mt-6 max-w-2xl text-white/90">
              Start vandaag nog met de GiftFinder en ontvang cadeau-inspiratie die past bij jouw budget, persoon en moment.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                variant="accent"
                onClick={() => navigateTo('giftFinder')}
                className="px-10 py-4 text-lg font-semibold shadow-xl transition-transform hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <SparklesIcon className="h-6 w-6" />
                Start direct
              </Button>
              <button
                onClick={() => navigateTo('blog')}
                className="inline-flex items-center gap-2 font-semibold text-white/90 underline decoration-white/60 decoration-2 underline-offset-4 transition-colors hover:text-white"
              >
                <UserIcon className="h-5 w-5" />
                Lees onze inspiratiegidsen
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
