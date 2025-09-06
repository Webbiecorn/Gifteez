import React, { useState, FormEvent } from 'react';
import { ShowToast } from '../types';
import Button from './Button';
import Accordion from './Accordion';
import { MailIcon, InstagramIcon, PinterestIcon, SpinnerIcon } from './IconComponents';

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
    if (!validate()) return;

    setFormStatus('submitting');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a successful response
    setFormStatus('success');
    showToast('Bericht succesvol verzonden!');
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // To reset the form after a while
    setTimeout(() => setFormStatus('idle'), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if(errors[name]) {
        setErrors(prev => ({...prev, [name]: ''}))
    }
  };

  const inputClass = (fieldName: keyof typeof formData) => `w-full p-3 border rounded-md focus:outline-none focus:ring-2 transition-colors bg-white ${errors[fieldName] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'}`;


  return (
    <div className="bg-light-bg">
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary">Neem Contact Op</h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">Vragen, opmerkingen of suggesties? We horen graag van je!</p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-lg shadow-lg h-full">
              <h2 className="font-display text-3xl font-bold text-primary mb-6">Stuur ons een bericht</h2>
              {formStatus === 'success' ? (
                <div className="text-center p-8 bg-green-50 rounded-lg">
                    <h3 className="font-display text-2xl font-bold text-green-700">Bedankt voor je bericht!</h3>
                    <p className="mt-2 text-green-600">We nemen zo snel mogelijk contact met je op.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block font-bold text-gray-700 mb-1">Naam</label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={inputClass('name')} required />
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block font-bold text-gray-700 mb-1">E-mailadres</label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass('email')} required />
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block font-bold text-gray-700 mb-1">Onderwerp</label>
                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} className={inputClass('subject')} required />
                    {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="block font-bold text-gray-700 mb-1">Bericht</label>
                    <textarea id="message" name="message" rows={6} value={formData.message} onChange={handleInputChange} className={inputClass('message')} required></textarea>
                    {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
                  </div>
                  <div>
                    <Button type="submit" variant="accent" disabled={formStatus === 'submitting'} className="w-full flex items-center justify-center">
                      {formStatus === 'submitting' ? (
                        <>
                          <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                          Verzenden...
                        </>
                      ) : (
                        'Verstuur Bericht'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="font-display text-2xl font-bold text-primary mb-4">Direct Contact</h3>
                <div className="space-y-4">
                    <a href="mailto:info@gifteez.nl" className="flex items-center gap-4 group">
                        <MailIcon className="w-6 h-6 text-primary" />
                        <span className="text-gray-700 group-hover:text-accent transition-colors">info@gifteez.nl</span>
                    </a>
        <a href="https://www.instagram.com/gifteez.nl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
          <InstagramIcon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
          <span className="text-gray-700 group-hover:text-accent transition-colors">Volg ons op Instagram</span>
        </a>
        <a href="https://www.pinterest.com/gifteez01/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
          <PinterestIcon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
          <span className="text-gray-700 group-hover:text-accent transition-colors">Bekijk ons op Pinterest</span>
        </a>
                </div>
            </div>
             <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="font-display text-2xl font-bold text-primary mb-2">Veelgestelde Vragen</h3>
                <Accordion title="Hoe werkt de AI GiftFinder?">
                  De GiftFinder gebruikt een geavanceerd AI-model (Gemini) om jouw input over de ontvanger, gelegenheid en budget te analyseren. Op basis daarvan genereert het een lijst met passende en creatieve cadeau-suggesties.
                </Accordion>
                <Accordion title="Zijn jullie aanbevelingen onafhankelijk?">
                  Ja, onze AI is getraind om de best mogelijke cadeaus te vinden op basis van jouw criteria. We werken samen met webshops via affiliate links, wat betekent dat wij een kleine commissie kunnen verdienen als je iets koopt via onze site. Dit heeft echter geen invloed op de suggesties die je krijgt.
                </Accordion>
                <Accordion title="Hoe kan ik adverteren op Gifteez.nl?">
                  Voor samenwerkingen of advertentiemogelijkheden kun je het beste contact met ons opnemen via het formulier hiernaast of door een e-mail te sturen naar info@gifteez.nl.
                </Accordion>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;