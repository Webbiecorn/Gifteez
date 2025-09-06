import React from 'react';
import { topicImage, Topics } from '../services/images';
import { NavigateTo } from '../types';
import Button from './Button';
import { TargetIcon, SparklesIcon, CheckCircleIcon } from './IconComponents';
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
    <div className="bg-light-bg">
      {/* Hero Section */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary">Onze Missie: Een Einde aan Cadeaustress.</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Wij geloven dat het geven van een cadeau een vreugdevolle ervaring moet zijn, geen bron van stress. Daarom hebben we de kracht van AI ingezet om jou te helpen het perfecte geschenk te vinden, voor iedereen en elke gelegenheid.
          </p>
        </div>
      </section>

      {/* How it works Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-display text-3xl font-bold text-center text-primary mb-12">Hoe het werkt in 3 simpele stappen</h2>
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-center items-center h-20 w-20 mx-auto bg-primary text-white rounded-full">
              <TargetIcon className="h-10 w-10" />
            </div>
            <h3 className="font-display text-xl font-bold text-primary mt-6">1. Vertel ons meer</h3>
            <p className="mt-2 text-gray-600">Geef aan voor wie je zoekt, wat je budget is en voor welke gelegenheid. Voeg eventueel hobby's toe voor extra precisie.</p>
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex justify-center items-center h-20 w-20 mx-auto bg-primary text-white rounded-full">
              <SparklesIcon className="h-10 w-10" />
            </div>
            <h3 className="font-display text-xl font-bold text-primary mt-6">2. AI doet de magie</h3>
            <p className="mt-2 text-gray-600">Onze slimme GiftFinder analyseert je input en doorzoekt duizenden mogelijkheden om de beste suggesties te vinden.</p>
          </div>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="flex justify-center items-center h-20 w-20 mx-auto bg-primary text-white rounded-full">
              <CheckCircleIcon className="h-10 w-10" />
            </div>
            <h3 className="font-display text-xl font-bold text-primary mt-6">3. Kies het perfecte cadeau</h3>
            <p className="mt-2 text-gray-600">Ontvang een op maat gemaakte lijst met de leukste cadeaus, compleet met links naar webshops. Kiezen was nog nooit zo makkelijk!</p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="opacity-0 animate-fade-in">
                    <ImageWithFallback src={topicImage(Topics.about, 600, 400)} alt="Het verhaal van Gifteez.nl" className="rounded-lg shadow-xl" />
                </div>
                <div className="opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <h2 className="font-display text-3xl font-bold text-primary">Ons Verhaal</h2>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Gifteez.nl is geboren uit een bekend probleem: de jaarlijkse zoektocht naar originele cadeaus voor verjaardagen, feestdagen en jubilea. We dachten: dat moet makkelijker kunnen. Waarom geen technologie inzetten om ons te helpen bij een van de leukste, maar soms ook lastigste taken die er zijn?
                    </p>
                    <p className="mt-4 text-gray-600 leading-relaxed">
                        Met een passie voor zowel technologie als het blij maken van mensen, zijn we begonnen aan de ontwikkeling van de AI GiftFinder. Onze droom is om van Gifteez.nl dé plek te maken waar iedereen in Nederland moeiteloos en met plezier het perfecte cadeau vindt.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-display text-3xl font-bold text-center text-primary mb-12">Ons Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <div key={member.name} className="text-center opacity-0 animate-fade-in-up" style={{ animationDelay: `${200 * (index + 1)}ms` }}>
              <ImageWithFallback src={member.imageUrl} alt={member.name} className="w-32 h-32 mx-auto rounded-full shadow-lg" />
              <h3 className="font-display text-xl font-bold text-primary mt-6">{member.name}</h3>
              <p className="text-accent font-semibold">{member.role}</p>
              <p className="mt-2 text-gray-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-primary">Klaar om de stress achter je te laten?</h2>
          <p className="mt-2 text-gray-700 max-w-2xl mx-auto">Probeer de GiftFinder vandaag nog en ontdek hoe makkelijk het kan zijn om het perfecte cadeau te vinden.</p>
          <div className="mt-8">
            <Button variant="accent" onClick={() => navigateTo('giftFinder')}>
              Start GiftFinder Nu
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
