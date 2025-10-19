import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Button from './Button'
import FavoritesPage from './FavoritesPage'
import { LogOutIcon, UserIcon, EditIcon, TrashIcon, PlusCircleIcon } from './IconComponents'
import ProfileModal from './ProfileModal'
import type { NavigateTo, ShowToast, GiftProfile } from '../types'

interface AccountPageProps {
  navigateTo: NavigateTo
  showToast: ShowToast
}

const ProfileCard: React.FC<{
  profile: GiftProfile
  onEdit: () => void
  onDelete: () => void
}> = ({ profile, onEdit, onDelete }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="bg-secondary p-3 rounded-full">
        <UserIcon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-primary text-lg">{profile.name}</h3>
        <p className="text-sm text-gray-600">{profile.interests}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Bewerk profiel"
      >
        <EditIcon className="w-5 h-5" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Verwijder profiel"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  </div>
)

const AccountPage: React.FC<AccountPageProps> = ({ navigateTo, showToast }) => {
  const auth = useContext(AuthContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<GiftProfile | null>(null)

  useEffect(() => {
    // Redirect to login if user is not logged in
    if (!auth?.loading && !auth?.currentUser) {
      navigateTo('login')
    }
  }, [auth, navigateTo])

  if (!auth?.currentUser) {
    return null // or a loading spinner
  }

  const handleLogout = () => {
    auth.logout()
    showToast('Succesvol uitgelogd.')
    navigateTo('home')
  }

  const handleAddNewProfile = () => {
    setEditingProfile(null)
    setIsModalOpen(true)
  }

  const handleEditProfile = (profile: GiftProfile) => {
    setEditingProfile(profile)
    setIsModalOpen(true)
  }

  const handleDeleteProfile = (profileId: string) => {
    if (window.confirm('Weet je zeker dat je dit profiel wilt verwijderen?')) {
      auth.deleteProfile(profileId)
      showToast('Profiel verwijderd.')
    }
  }

  const handleSaveProfile = async (profileData: Omit<GiftProfile, 'id'> | GiftProfile) => {
    if ('id' in profileData) {
      await auth.updateProfile(profileData)
      showToast('Profiel bijgewerkt!')
    } else {
      await auth.addProfile(profileData)
      showToast('Nieuw profiel toegevoegd!')
    }
    setIsModalOpen(false)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {isModalOpen && (
        <ProfileModal
          profileToEdit={editingProfile}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-primary">Mijn Account</h1>
          <p className="mt-2 text-lg text-gray-600">
            Welkom terug, <span className="font-bold">{auth.currentUser.name}</span>!
          </p>
        </div>
        <Button onClick={handleLogout} variant="primary" className="mt-4 md:mt-0 py-2 px-4">
          <div className="flex items-center gap-2">
            <LogOutIcon className="w-5 h-5" />
            <span>Uitloggen</span>
          </div>
        </Button>
      </div>

      {/* Gift Profiles Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-3xl font-bold text-primary">Mijn Cadeauprofielen</h2>
          <Button onClick={handleAddNewProfile} variant="primary" className="py-2 px-4 text-sm">
            <div className="flex items-center gap-2">
              <PlusCircleIcon className="w-5 h-5" />
              <span>Nieuw profiel</span>
            </div>
          </Button>
        </div>
        <p className="text-gray-600 mb-6">
          Sla profielen op voor de mensen aan wie je vaak cadeaus geeft. Dit maakt het zoeken met de
          GiftFinder nog sneller!
        </p>
        <div className="space-y-4">
          {auth.currentUser.profiles.length > 0 ? (
            auth.currentUser.profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onEdit={() => handleEditProfile(profile)}
                onDelete={() => handleDeleteProfile(profile.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Je hebt nog geen profielen aangemaakt.</p>
              <p className="text-gray-400 text-sm">Klik op 'Nieuw profiel' om te beginnen.</p>
            </div>
          )}
        </div>
      </section>

      <FavoritesPage navigateTo={navigateTo} showToast={showToast} />
    </div>
  )
}

export default AccountPage
