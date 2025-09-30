
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, Gift, GiftProfile, UserPreferences, NotificationSettings } from '../types';
import { auth, db, firebaseEnabled } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile as fbUpdateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import UserService from '../services/userService';

const GUEST_FAVORITES_KEY = 'gifteezFavorites';
const USERS_KEY = 'gifteezUsers';
const CURRENT_USER_ID_KEY = 'gifteezCurrentUserId';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (firebaseEnabled && auth && db) {
            const unsub = onAuthStateChanged(auth, async (fbUser) => {
                if (!fbUser) {
                    setCurrentUser(null);
                    setLoading(false);
                    return;
                }
                try {
                    const userRef = doc(db, 'users', fbUser.uid);
                    const snap = await getDoc(userRef);
                    if (snap.exists()) {
                        const u = snap.data() as User;
                        setCurrentUser(u);
                    } else {
                        // First login after signup: create user doc
                        const base: User = {
                            id: fbUser.uid,
                            name: fbUser.displayName || fbUser.email || 'Gebruiker',
                            email: fbUser.email || '',
                            favorites: [],
                            profiles: [],
                            preferences: UserService.getDefaultPreferences(),
                            createdAt: new Date().toISOString(),
                            lastActive: new Date().toISOString(),
                            notifications: UserService.getDefaultNotificationSettings()
                        };
                        await setDoc(userRef, base);
                        setCurrentUser(base);
                    }
                } catch (e) {
                    console.error('Error loading user from Firestore', e);
                    setCurrentUser(null);
                } finally {
                    setLoading(false);
                }
            });
            return () => unsub();
        } else {
            // Fallback: keep legacy localStorage mode
            try {
                const currentUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
                if (currentUserId) {
                    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
                    const user = users.find(u => u.id === currentUserId);
                    if (user) {
                        const { password, ...userWithoutPassword } = user;
                        setCurrentUser(userWithoutPassword);
                    }
                }
            } catch (e) {
                console.error("Error loading user from localStorage", e);
            } finally {
                setLoading(false);
            }
        }
    }, []);

    const getUsers = (): User[] => {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        } catch {
            return [];
        }
    };

    const saveUsers = (users: User[]) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };
    
    // Merge guest favorites into user's account and clear guest favorites
    const mergeGuestFavorites = (user: User): User => {
        try {
            const guestFavorites: Gift[] = JSON.parse(localStorage.getItem(GUEST_FAVORITES_KEY) || '[]');
            if (guestFavorites.length > 0) {
                const userFavoriteNames = new Set(user.favorites.map(f => f.productName));
                const uniqueNewFavorites = guestFavorites.filter(gf => !userFavoriteNames.has(gf.productName));
                
                const updatedUser = { ...user, favorites: [...user.favorites, ...uniqueNewFavorites] };
                localStorage.removeItem(GUEST_FAVORITES_KEY);
                return updatedUser;
            }
        } catch (e) {
            console.error("Error merging guest favorites", e);
        }
        return user;
    };


    const login = async (email: string, passwordInput: string): Promise<User | null> => {
        if (firebaseEnabled && auth && db) {
            try {
                const cred = await signInWithEmailAndPassword(auth, email, passwordInput);
                const userRef = doc(db, 'users', cred.user.uid);
                const snap = await getDoc(userRef);
                if (!snap.exists()) return null;

                // Merge guest favorites on login
                let u = snap.data() as User;
                u = mergeGuestFavorites(u);
                await setDoc(userRef, u, { merge: true });
                setCurrentUser(u);
                return u;
            } catch (e) {
                console.error('Firebase login error', e);
                return null;
            }
        }
        // Legacy fallback
        const users = getUsers();
        let user = users.find(u => u.email === email && u.password === passwordInput);
        if (user) {
            user = mergeGuestFavorites(user);
            const updatedUsers = users.map(u => u.id === user?.id ? user : u);
            saveUsers(updatedUsers);
            localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
            const { password, ...userWithoutPassword } = user;
            setCurrentUser(userWithoutPassword);
            return userWithoutPassword;
        }
        return null;
    };

    const signup = async (name: string, email: string, passwordInput: string): Promise<User | null> => {
        if (firebaseEnabled && auth && db) {
            try {
                const cred = await createUserWithEmailAndPassword(auth, email, passwordInput);
                if (cred.user && name) {
                    try { await fbUpdateProfile(cred.user, { displayName: name }); } catch {}
                }
                let newUser: User = {
                    id: cred.user.uid,
                    name,
                    email,
                    favorites: [],
                    profiles: [],
                    preferences: UserService.getDefaultPreferences(),
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    notifications: UserService.getDefaultNotificationSettings()
                };
                newUser = mergeGuestFavorites(newUser);
                await setDoc(doc(db, 'users', cred.user.uid), newUser);
                setCurrentUser(newUser);
                return newUser;
            } catch (e) {
                console.error('Firebase signup error', e);
                return null;
            }
        }
        // Legacy fallback
        const users = getUsers();
        if (users.some(u => u.email === email)) return null;
        let newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            password: passwordInput,
            favorites: [],
            profiles: [],
            preferences: UserService.getDefaultPreferences(),
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            notifications: UserService.getDefaultNotificationSettings()
        };
        newUser = mergeGuestFavorites(newUser);
        saveUsers([...users, newUser]);
        localStorage.setItem(CURRENT_USER_ID_KEY, newUser.id);
        const { password, ...userWithoutPassword } = newUser;
        setCurrentUser(userWithoutPassword);
        return userWithoutPassword;
    };

    const logout = () => {
        if (firebaseEnabled && auth) {
            signOut(auth).catch(console.error);
        }
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_ID_KEY);
    };

    const resetPassword = async (email: string): Promise<boolean> => {
        if (firebaseEnabled && auth) {
            try {
                await sendPasswordResetEmail(auth, email);
                return true;
            } catch (e) {
                console.error('Password reset error', e);
                return false;
            }
        }
        // Legacy fallback not supported
        return false;
    };

    const toggleFavorite = (gift: Gift) => {
        if (!currentUser) return;

        if (firebaseEnabled && db) {
            const userRef = doc(db, 'users', currentUser.id);
            const isCurrentlyFavorite = currentUser.favorites.some(fav => fav.productName === gift.productName);
            const updatedFavorites = isCurrentlyFavorite
                ? currentUser.favorites.filter(f => f.productName !== gift.productName)
                : [...currentUser.favorites, gift];
            updateDoc(userRef, { favorites: updatedFavorites }).catch(console.error);
            setCurrentUser({ ...currentUser, favorites: updatedFavorites });
            return;
        }
        // Legacy fallback
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex === -1) return;
        const isCurrentlyFavorite = users[userIndex].favorites.some(fav => fav.productName === gift.productName);
        const updatedFavorites = isCurrentlyFavorite
            ? users[userIndex].favorites.filter(fav => fav.productName !== gift.productName)
            : [...users[userIndex].favorites, gift];
        users[userIndex].favorites = updatedFavorites;
        saveUsers(users);
        setCurrentUser({ ...currentUser, favorites: updatedFavorites });
    };

    const isFavorite = (gift: Gift): boolean => {
        return currentUser?.favorites.some(fav => fav.productName === gift.productName) || false;
    };

    const updateUserInStorageAndState = async (updatedUser: User) => {
        if (firebaseEnabled && db) {
            await updateDoc(doc(db, 'users', updatedUser.id), {
                name: updatedUser.name,
                profiles: updatedUser.profiles,
                favorites: updatedUser.favorites,
            }).catch(console.error);
            setCurrentUser(updatedUser);
            return;
        }
        // Legacy fallback
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updatedUser };
            saveUsers(users);
            const { password, ...userWithoutPassword } = users[userIndex];
            setCurrentUser(userWithoutPassword);
        }
    };

    const addProfile = async (profileData: Omit<GiftProfile, 'id'>) => {
        if (!currentUser) return;
        const newProfile = { ...profileData, id: Date.now().toString() };
        const updatedUser = { ...currentUser, profiles: [...currentUser.profiles, newProfile] };
        updateUserInStorageAndState(updatedUser);
    };

    const updateProfile = async (profileToUpdate: GiftProfile) => {
        if (!currentUser) return;
        const updatedProfiles = currentUser.profiles.map(p => p.id === profileToUpdate.id ? profileToUpdate : p);
        const updatedUser = { ...currentUser, profiles: updatedProfiles };
        updateUserInStorageAndState(updatedUser);
    };
    
    const deleteProfile = async (profileId: string) => {
        if (!currentUser) return;
        const updatedProfiles = currentUser.profiles.filter(p => p.id !== profileId);
        const updatedUser = { ...currentUser, profiles: updatedProfiles };
        updateUserInStorageAndState(updatedUser);
    };

    // Enhanced user management methods
    const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
        if (!currentUser) return;
        
        const updatedPreferences = { ...currentUser.preferences, ...preferences };
        const updatedUser = { ...currentUser, preferences: updatedPreferences };
        
        if (firebaseEnabled && db) {
            await UserService.updateUserPreferences(currentUser.id, updatedPreferences);
        }
        
        updateUserInStorageAndState(updatedUser);
    };

    const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
        if (!currentUser) return;
        
        const updatedSettings = { ...currentUser.notifications, ...settings };
        const updatedUser = { ...currentUser, notifications: updatedSettings };
        
        if (firebaseEnabled && db) {
            await UserService.updateNotificationSettings(currentUser.id, updatedSettings);
        }
        
        updateUserInStorageAndState(updatedUser);
    };

    const syncFavorites = async () => {
        if (!currentUser || !firebaseEnabled || !db) return;
        
        try {
            const mergedFavorites = await UserService.syncFavorites(currentUser.id, currentUser.favorites);
            const updatedUser = { 
                ...currentUser, 
                favorites: mergedFavorites,
                favoritesSyncedAt: new Date().toISOString()
            };
            setCurrentUser(updatedUser);
        } catch (error) {
            console.error('Error syncing favorites:', error);
        }
    };

    const updateAvatar = async (avatar: string) => {
        if (!currentUser) return;
        
        const updatedUser = { ...currentUser, avatar };
        
        if (firebaseEnabled && db) {
            await UserService.updateAvatar(currentUser.id, avatar);
        }
        
        updateUserInStorageAndState(updatedUser);
    };

    const getFavoritesByCategory = () => {
        if (!currentUser) return {};
        return UserService.getFavoritesByCategory(currentUser.favorites);
    };

    const exportFavorites = async () => {
        if (!currentUser) return '{}';
        return UserService.exportFavorites(currentUser.favorites);
    };

    const importFavorites = async (data: string) => {
        if (!currentUser) return;
        
        try {
            const importedFavorites = await UserService.importFavorites(data);
            const mergedFavorites = UserService.mergeFavorites(currentUser.favorites, importedFavorites);
            const updatedUser = { ...currentUser, favorites: mergedFavorites };
            
            if (firebaseEnabled && db) {
                await UserService.syncFavorites(currentUser.id, mergedFavorites);
            }
            
            updateUserInStorageAndState(updatedUser);
        } catch (error) {
            console.error('Error importing favorites:', error);
            throw error;
        }
    };


    const value = {
        currentUser,
        loading,
        login,
        signup,
        logout,
        toggleFavorite,
        isFavorite,
        resetPassword,
        addProfile,
        updateProfile,
        deleteProfile,
        // Enhanced methods
        updateUserPreferences,
        updateNotificationSettings,
        syncFavorites,
        updateAvatar,
        getFavoritesByCategory,
        exportFavorites,
        importFavorites,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use the AuthContext
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    return context;
};