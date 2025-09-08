import React from 'react';
import { topicImage, Topics } from '../services/images';
import { NavigateTo } from '../types';
import Button from './Button';
import { TargetIcon, SparklesIcon, CheckCircleIcon, GiftIcon, UserIcon, HeartIcon } from './IconComponents';
import ImageWithFallback from './ImageWithFallback';

interface AboutPageProps {
  navigateTo: NavigateTo;
}

const teamMembers = [
  {
    name: "Anna van der Meer",
    role: "Oprichter & Cadeau-strateeg",
    imageUrl: "https://i.pravatar.cc/150?u=anna",
    bio: "Anna startte Gifteez.nl uit eigen frustratie. Ze is de drijvende kracht achter onze missie om cadeaustress de wereld uit te helpen."
  },
  {
    name: "Bas de Groot",
    role: "Lead AI Developer",
    imageUrl: "https://i.pravatar.cc/150?u=bas",
    bio: "Bas is het technische brein achter de GiftFinder. Hij zorgt ervoor dat onze AI steeds slimmer en beter wordt in het vinden van het perfecte cadeau."
  },
  {
    name: "Sophie de Jong",
    role: "Content & Inspiratie Manager",
    imageUrl: "https://i.pravatar.cc/150?u=sophie",
    bio: "Sophie is verantwoordelijk voor alle inspirerende blogs en cadeaugidsen. Ze heeft een neus voor de laatste trends en de meest unieke ideeën."
  }
];

const AboutPage: React.FC<AboutPageProps> = ({ navigateTo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/4 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full opacity-5"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <HeartIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Ons Verhaal
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Cadeau Stress? Voorbij!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Wij geloven dat het geven van een cadeau een vreugdevolle ervaring moet zijn, geen bron van stress. Daarom hebben we de kracht van AI ingezet om jou te helpen het perfecte geschenk te vinden.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <SparklesIcon className="w-4 h-4" />
                <span>AI Gedreven</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <HeartIcon className="w-4 h-4" />
                <span>Persoonlijk</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <UserIcon className="w-4 h-4" />
                <span>Voor Iedereen</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent text-white rounded-full mb-6">
              <TargetIcon className="w-8 h-8" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Hoe het werkt in 3 simpele stappen
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Van stress naar succes in slechts enkele minuten
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 text-center group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-center items-center h-20 w-20 mx-auto bg-gradient-to-r from-primary to-accent text-white rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold">1</span>
              </div>
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <TargetIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold text-primary mb-4">Vertel ons meer</h3>
              <p className="text-gray-600 leading-relaxed">
                Geef aan voor wie je zoekt, wat je budget is en voor welke gelegenheid. Voeg eventueel hobby's toe voor extra precisie.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 text-center group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-center items-center h-20 w-20 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold">2</span>
              </div>
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <SparklesIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold text-primary mb-4">AI doet de magie</h3>
              <p className="text-gray-600 leading-relaxed">
                Onze slimme GiftFinder analyseert je input en doorzoekt duizenden mogelijkheden om de beste suggesties te vinden.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100 text-center group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-center items-center h-20 w-20 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold">3</span>
              </div>
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-pink-100 rounded-full">
                  <CheckCircleIcon className="h-8 w-8 text-pink-600" />
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold text-primary mb-4">Kies het perfecte cadeau</h3>
              <p className="text-gray-600 leading-relaxed">
                Ontvang een op maat gemaakte lijst met de leukste cadeaus, compleet met links naar webshops. Kiezen was nog nooit zo makkelijk!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl transform rotate-1"></div>
              <ImageWithFallback
                src={'/images/about-story.jpg'}
                alt="Het verhaal van Gifteez.nl"
                width={600}
                height={400}
                showSkeleton
                className="relative rounded-3xl shadow-2xl border border-gray-100"
              />
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-2">
                <HeartIcon className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">Ons Verhaal</span>
              </div>

              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
                Geboren uit een
                <span className="block bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Bekend Probleem
                </span>
              </h2>

              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                <p>
                  Gifteez.nl is geboren uit een bekend probleem: de jaarlijkse zoektocht naar originele cadeaus voor verjaardagen, feestdagen en jubilea. We dachten: dat moet makkelijker kunnen.
                </p>
                <p>
                  Waarom geen technologie inzetten om ons te helpen bij een van de leukste, maar soms ook lastigste taken die er zijn? Met een passie voor zowel technologie als het blij maken van mensen, zijn we begonnen aan de ontwikkeling van de AI GiftFinder.
                </p>
                <p className="font-semibold text-primary">
                  Onze droom is om van Gifteez.nl dé plek te maken waar iedereen in Nederland moeiteloos en met plezier het perfecte cadeau vindt.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">AI Gedreven</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2">
                  <SparklesIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Innovatief</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2">
                  <HeartIcon className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium">Persoonlijk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent text-white rounded-full mb-6">
              <UserIcon className="w-8 h-8" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Ons Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              De mensen achter Gifteez.nl die werken aan een cadeaulozere wereld
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={member.name} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative mb-6">
                  <div className="absolute -top-2 -left-2 w-full h-full bg-gradient-to-r from-primary/20 to-accent/20 rounded-full"></div>
                  <ImageWithFallback
                    src={member.imageUrl}
                    alt={member.name}
                    className="relative w-24 h-24 mx-auto rounded-full shadow-lg border-4 border-white"
                  />
                </div>

                <h3 className="font-display text-xl font-bold text-primary mb-2">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>

                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-2">
                    <HeartIcon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-primary">Passievol</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/4 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8">
              <GiftIcon className="w-10 h-10 text-white" />
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Klaar om de
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Cadeau Stress
              </span>
              Achter Je Te Laten?
            </h2>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10">
              Probeer de GiftFinder vandaag nog en ontdek hoe makkelijk het kan zijn om het perfecte cadeau te vinden.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="accent"
                onClick={() => navigateTo('giftFinder')}
                className="px-10 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-6 h-6" />
                Start GiftFinder Nu
              </Button>

              <button
                onClick={() => navigateTo('quiz')}
                className="text-white/90 hover:text-white font-semibold underline decoration-white/40 decoration-2 underline-offset-4 transition-all duration-300 flex items-center gap-2"
              >
                <TargetIcon className="w-4 h-4" />
                Of doe de quiz eerst
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
