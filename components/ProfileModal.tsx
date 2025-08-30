
import React, { useState, useEffect, FormEvent } from 'react';
import { GiftProfile } from '../types';
import Button from './Button';
import { XIcon } from './IconComponents';

interface ProfileModalProps {
  profileToEdit: GiftProfile | null;
  onClose: () => void;
  onSave: (profileData: Omit<GiftProfile, 'id'> | GiftProfile) => void;
}

const recipients = ["Partner", "Vriend(in)", "Familielid", "Collega", "Kind", "Anders"];

const ProfileModal: React.FC<ProfileModalProps> = ({ profileToEdit, onClose, onSave }) => {
  const [profile, setProfile] = useState({
    name: '',
    relationship: recipients[0],
    interests: '',
  });

  useEffect(() => {
    if (profileToEdit) {
      setProfile({
        name: profileToEdit.name,
        relationship: profileToEdit.relationship,
        interests: profileToEdit.interests,
      });
    }
  }, [profileToEdit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (profileToEdit) {
      onSave({ ...profileToEdit, ...profile });
    } else {
      onSave(profile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const inputClass = `w-full p-3 border rounded-md focus:outline-none focus:ring-2 transition-colors bg-white border-gray-300 focus:ring-primary`;

  return (
    <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-primary rounded-full transition-colors" aria-label="Sluit modal">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="font-display text-3xl font-bold text-primary mb-6">
          {profileToEdit ? 'Profiel Bewerken' : 'Nieuw Profiel'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block font-bold text-gray-700 mb-1">Naam</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="bv. Mama, Mark, Beste Vriendin"
              required
            />
          </div>
          <div>
            <label htmlFor="relationship" className="block font-bold text-gray-700 mb-1">Relatie</label>
            <select
              id="relationship"
              name="relationship"
              value={profile.relationship}
              onChange={handleInputChange}
              className={inputClass}
            >
              {recipients.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="interests" className="block font-bold text-gray-700 mb-1">Interesses</label>
            <textarea
              id="interests"
              name="interests"
              rows={3}
              value={profile.interests}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="bv. Lezen, Tuinieren, Films, Sport"
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Scheid interesses met een komma.</p>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                Annuleren
            </Button>
            <Button type="submit" variant="accent">
              {profileToEdit ? 'Profiel Opslaan' : 'Profiel Toevoegen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;