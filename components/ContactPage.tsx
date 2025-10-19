import React, { useState, FormEvent } from 'react';
import { ShowToast } from '../types';
import Button from './Button';
import Accordion from './Accordion';
import { MailIcon, InstagramIcon, PinterestIcon, SpinnerIcon, QuestionMarkCircleIcon, CheckIcon } from './IconComponents';
import { socialLinks } from '../socialLinks';
import { pinterestPageVisit, pinterestLead } from '../services/pinterestTracking';
import { gaLead, gaPageView } from '../services/googleAnalytics';
import Meta from './Meta';
import Breadcrumbs from './Breadcrumbs';
import FAQSchema from './FAQSchema';
import rateLimitService from '../services/rateLimitService';

interface ContactPageProps {
  showToast: ShowToast;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const ContactPage: React.FC<ContactPageProps> = ({ showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  // Anti-spam: honeypot + timestamp (must be > 1500ms before submit)
  const [honeypot, setHoneypot] = useState('');
  const [ts] = useState<number>(() => Date.now());

  // Pinterest PageVisit tracking for contact page
  React.useEffect(() => {
    pinterestPageVisit('contact_page', `contact_${Date.now()}`);
    // Google Analytics pageview tracking for contact page
    gaPageView('/contact', 'Contact - Gifteez.nl');
  }, []);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Naam is verplicht.';
    if (!formData.email.trim()) {
      newErrors.email = 'E-mailadres is verplicht.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Voer een geldig e-mailadres in.';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Onderwerp is verplicht.';
    if (!formData.message.trim()) newErrors.message = 'Bericht is verplicht.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    // Rate limiting check
    const rateLimitKey = `contact:${formData.email || 'anonymous'}`;
    if (!rateLimitService.isAllowed(rateLimitKey, 'contact')) {
      const timeUntilReset = Math.ceil(rateLimitService.getTimeUntilReset(rateLimitKey) / 1000 / 60);
      setServerError(`Te veel verzoeken. Probeer het over ${timeUntilReset} minuten opnieuw.`);
      showToast(`Rate limit bereikt. Wacht ${timeUntilReset} minuten.`);
      return;
    }
    
    if (!validate()) return;
    setFormStatus('submitting');
    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, _honeypot: honeypot, _ts: ts })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (data?.errors && typeof data.errors === 'object') {
          setErrors(prev => ({ ...prev, ...data.errors }));
        }
        setServerError(data?.error || 'Er ging iets mis. Probeer opnieuw.');
        setFormStatus('error');
        return;
      }
      setFormStatus('success');
      
      // Pinterest Lead tracking for contact form submission
      pinterestLead('contact_form', `contact_${formData.subject}_${Date.now()}`);
      
      // Google Analytics Lead tracking
      gaLead('contact_form');
      
      showToast('Bericht succesvol verzonden!');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 6000);
    } catch (err) {
      setServerError('Kon geen verbinding maken. Controleer je internetverbinding.');
      setFormStatus('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if(errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}))
    }
  };

  const inputClass = (fieldName: keyof typeof formData) => `w-full p-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 bg-white shadow-sm ${errors[fieldName] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-primary focus:border-primary'}`;

  const contactFAQs = [
    {
      question: "Hoe werkt de AI GiftFinder?",
      answer: "De GiftFinder gebruikt een geavanceerd AI-model (Gemini) om jouw input over de ontvanger, gelegenheid en budget te analyseren. Op basis daarvan genereert het een lijst met passende en creatieve cadeau-suggesties uit duizenden producten van verschillende webshops."
    },
    {
      question: "Zijn jullie aanbevelingen onafhankelijk?",
      answer: "Ja, onze AI is getraind om de best mogelijke cadeaus te vinden op basis van jouw criteria. We werken samen met webshops via affiliate links, wat betekent dat wij een kleine commissie kunnen verdienen als je iets koopt via onze site. Dit heeft echter geen invloed op de suggesties die je krijgt - we tonen altijd de meest relevante cadeaus voor jouw situatie."
    },
    {
      question: "Hoe kan ik adverteren op Gifteez.nl?",
      answer: "Voor samenwerkingen of advertentiemogelijkheden kun je het beste contact met ons opnemen via het formulier hierboven of door een e-mail te sturen naar info@gifteez.nl. We bespreken graag de mogelijkheden voor partnerships met merken, webshops of andere bedrijven in de cadeau-industrie."
    },
    {
      question: "Kan ik cadeausuggesties opslaan of delen?",
      answer: "Absoluut! Je kunt cadeausuggesties opslaan in je persoonlijke verlanglijstje door in te loggen op je account. Ook kun je suggesties eenvoudig delen met vrienden en familie via social media of door een directe link te kopiëren. Zo kun je anderen helpen met het vinden van het perfecte cadeau."
    },
    {
      question: "Wat als ik niet tevreden ben met de suggesties?",
      answer: "Geen probleem! Je kunt de GiftFinder zo vaak gebruiken als je wilt met verschillende criteria. Probeer bijvoorbeeld andere interesses, een ander budget of meer details over de ontvanger toe te voegen. Als je nog steeds niet tevreden bent, neem dan contact met ons op - we helpen je graag persoonlijk verder."
    },
    {
      question: "Is Gifteez.nl gratis te gebruiken?",
      answer: "Ja! Het gebruik van onze AI GiftFinder is volledig gratis. We verdienen alleen een kleine commissie wanneer je via onze affiliate links een cadeau koopt bij een van de partnerwebshops. Dit stelt ons in staat om de service gratis aan te bieden en continu te verbeteren."
    }
  ];


  return (
    <>
      <Meta 
        title="Contact - Neem contact op met Gifteez | Vragen & Support"
        description="Heb je vragen over Gifteez? Neem contact met ons op via het contactformulier of sociale media. We helpen je graag met cadeau-advies, technische vragen of feedback."
      />
      <FAQSchema faqs={contactFAQs} />
      <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-secondary/20">
      
      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Contact' }
        ]}
      />
      
      {/* Hero Section - Modern Clean Design */}
      <section className="relative bg-gradient-to-br from-rose-500 via-primary to-orange-600 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-white rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-16 md:pb-20 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-semibold">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>We zijn online</span>
                </div>
                
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Laten we samen
                  <span className="block bg-gradient-to-r from-yellow-200 via-yellow-300 to-orange-300 bg-clip-text text-transparent mt-2">
                    iets moois maken
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                  Heb je een vraag, feedback of wil je gewoon een vriendelijk praatje maken? We staan voor je klaar!
                </p>

                {/* Contact Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-2xl md:text-3xl font-bold mb-1">{'<24u'}</div>
                    <div className="text-xs md:text-sm text-white/80">Reactietijd</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-2xl md:text-3xl font-bold mb-1">100%</div>
                    <div className="text-xs md:text-sm text-white/80">Persoonlijk</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="text-2xl md:text-3xl font-bold mb-1">24/7</div>
                    <div className="text-xs md:text-sm text-white/80">Formulier</div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-white/80">Volg ons ook op:</span>
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200 border border-white/20"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                  </a>
                  <a
                    href={socialLinks.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200 border border-white/20"
                    aria-label="Pinterest"
                  >
                    <PinterestIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
                  </a>
                </div>
              </div>

              {/* Right Column - Visual Element */}
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Decorative Card Stack */}
                  <div className="relative">
                    <div className="absolute top-0 right-0 w-64 h-80 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 transform rotate-6 shadow-2xl"></div>
                    <div className="absolute top-4 right-4 w-64 h-80 bg-white/15 backdrop-blur-sm rounded-3xl border border-white/20 transform rotate-3 shadow-2xl"></div>
                    <div className="relative w-64 h-80 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl p-8 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <MailIcon className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">Stuur een</div>
                        <div className="text-2xl font-bold text-yellow-300 mb-4">Berichtje! 💬</div>
                        <div className="text-sm text-white/80 leading-relaxed">
                          We reageren altijd binnen 24 uur
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Contact Form */}
              <div className="bg-gradient-to-br from-light-bg to-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="mb-8">
                  <h2 className="typo-h2 mb-4">
                    Stuur ons een bericht
                  </h2>
                  <p className="typo-body text-gray-600">
                    We reageren meestal binnen 24 uur. Vul het formulier in en we nemen zo snel mogelijk contact met je op.
                  </p>
                </div>

                {serverError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {serverError}
                  </div>
                )}

                {formStatus === 'success' ? (
                  <div className="text-center p-8 bg-green-50 rounded-xl border border-green-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-green-700 mb-2">Bedankt voor je bericht!</h3>
                    <p className="text-green-600">We nemen zo snel mogelijk contact met je op.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-live="polite">
                    {/* Honeypot field */}
                    <input
                      type="text"
                      name="_honeypot"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Naam *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={inputClass('name')}
                          placeholder="Jouw naam"
                          required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          E-mailadres *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={inputClass('email')}
                          placeholder="jouw@email.nl"
                          required
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                        Onderwerp *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={inputClass('subject')}
                        placeholder="Waar gaat je vraag over?"
                        required
                      />
                      {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                        Bericht *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        className={`${inputClass('message')} resize-none`}
                        placeholder="Vertel ons meer over je vraag of opmerking..."
                        required
                      />
                      {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={formStatus === 'submitting'}
                      className="w-full bg-gradient-to-r from-primary via-accent to-accent-hover hover:from-primary/90 hover:via-accent/90 hover:to-accent-hover/90 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {formStatus === 'submitting' ? (
                        <div className="flex items-center justify-center gap-2">
                          <SpinnerIcon className="w-5 h-5 animate-spin" />
                          <span>Verzenden...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <MailIcon className="w-5 h-5" />
                          <span>Bericht Versturen</span>
                        </div>
                      )}
                    </Button>

                    {formStatus === 'error' && !serverError && (
                      <p className="text-red-600 text-sm text-center" role="alert">
                        Er ging iets mis. Probeer opnieuw.
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-secondary/10 to-accent/10 p-8 rounded-3xl border border-secondary/20">
                  <h3 className="font-display text-2xl font-bold text-primary mb-6">Direct Contact</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                        <MailIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">E-mail</h4>
                        <a href="mailto:info@gifteez.nl" className="text-accent hover:text-accent-hover transition-colors duration-200 hover:underline">
                          info@gifteez.nl
                        </a>
                        <p className="text-sm text-gray-500 mt-1">Voor algemene vragen</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent to-highlight rounded-xl flex items-center justify-center">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Support</h4>
                        <a href="mailto:support@gifteez.nl" className="text-accent hover:text-accent-hover transition-colors duration-200 hover:underline">
                          support@gifteez.nl
                        </a>
                        <p className="text-sm text-gray-500 mt-1">Voor technische ondersteuning</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center">
                        <CheckIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Reactietijd</h4>
                        <p className="text-gray-600">Binnen 24 uur</p>
                        <p className="text-sm text-gray-500 mt-1">Op werkdagen</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="bg-gradient-to-br from-light-bg to-white p-8 rounded-3xl border border-gray-100">
                  <h3 className="font-display text-2xl font-bold text-primary mb-6">Volg Ons</h3>
                  <p className="text-gray-600 mb-6">
                    Blijf op de hoogte van nieuwe cadeausuggesties en speciale aanbiedingen.
                  </p>
                  <div className="flex gap-4">
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
                      >
                        <InstagramIcon className="w-6 h-6" />
                      </a>
                    )}
                    {socialLinks.pinterest && (
                      <a
                        href={socialLinks.pinterest}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
                      >
                        <PinterestIcon className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-light-bg via-white to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-6">
              <QuestionMarkCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="typo-h2 mb-6 text-primary">
              Veelgestelde
              <span className="block bg-gradient-to-r from-accent to-highlight bg-clip-text text-transparent">
                Vragen
              </span>
            </h2>
            <p className="typo-body text-gray-600 max-w-3xl mx-auto">
              Hier vind je antwoorden op de meest gestelde vragen. Kun je je vraag hier niet vinden? Neem dan gerust contact met ons op.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
              <div className="space-y-4">
                <Accordion title="Hoe werkt de AI GiftFinder?">
                  <div className="text-gray-600 leading-relaxed">
                    De GiftFinder gebruikt een geavanceerd AI-model (Gemini) om jouw input over de ontvanger, gelegenheid en budget te analyseren. Op basis daarvan genereert het een lijst met passende en creatieve cadeau-suggesties uit duizenden producten van verschillende webshops.
                  </div>
                </Accordion>

                <Accordion title="Zijn jullie aanbevelingen onafhankelijk?">
                  <div className="text-gray-600 leading-relaxed">
                    Ja, onze AI is getraind om de best mogelijke cadeaus te vinden op basis van jouw criteria. We werken samen met webshops via affiliate links, wat betekent dat wij een kleine commissie kunnen verdienen als je iets koopt via onze site. Dit heeft echter geen invloed op de suggesties die je krijgt - we tonen altijd de meest relevante cadeaus voor jouw situatie.
                  </div>
                </Accordion>

                <Accordion title="Hoe kan ik adverteren op Gifteez.nl?">
                  <div className="text-gray-600 leading-relaxed">
                    Voor samenwerkingen of advertentiemogelijkheden kun je het beste contact met ons opnemen via het formulier hierboven of door een e-mail te sturen naar <a href="mailto:info@gifteez.nl" className="text-accent hover:text-accent-hover transition-colors duration-200 hover:underline">info@gifteez.nl</a>. We bespreken graag de mogelijkheden voor partnerships met merken, webshops of andere bedrijven in de cadeau-industrie.
                  </div>
                </Accordion>

                <Accordion title="Kan ik cadeausuggesties opslaan of delen?">
                  <div className="text-gray-600 leading-relaxed">
                    Absoluut! Je kunt cadeausuggesties opslaan in je persoonlijke verlanglijstje door in te loggen op je account. Ook kun je suggesties eenvoudig delen met vrienden en familie via social media of door een directe link te kopiëren. Zo kun je anderen helpen met het vinden van het perfecte cadeau.
                  </div>
                </Accordion>

                <Accordion title="Wat als ik niet tevreden ben met de suggesties?">
                  <div className="text-gray-600 leading-relaxed">
                    Geen probleem! Je kunt de GiftFinder zo vaak gebruiken als je wilt met verschillende criteria. Probeer bijvoorbeeld andere interesses, een ander budget of meer details over de ontvanger toe te voegen. Als je nog steeds niet tevreden bent, neem dan contact met ons op - we helpen je graag persoonlijk verder.
                  </div>
                </Accordion>

                <Accordion title="Is Gifteez.nl gratis te gebruiken?">
                  <div className="text-gray-600 leading-relaxed">
                    Ja! Het gebruik van onze AI GiftFinder is volledig gratis. We verdienen alleen een kleine commissie wanneer je via onze affiliate links een cadeau koopt bij een van de partnerwebshops. Dit stelt ons in staat om de service gratis aan te bieden en continu te verbeteren.
                  </div>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default ContactPage;