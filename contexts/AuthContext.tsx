
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, Gift, GiftProfile } from '../types';
import { loadFirebase, getFirebaseSync } from '../services/firebase';
// Firebase symbols worden dynamisch geladen; types importeren voor TS hints
import type { User as FBUser } from 'firebase/auth';

// We gebruiken dynamic imports binnen functies om bundle klein te houden.

const GUEST_FAVORITES_KEY = 'gifteezFavorites';
const USERS_KEY = 'gifteezUsers';
const CURRENT_USER_ID_KEY = 'gifteezCurrentUserId';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Start lazy load firebase;
        loadFirebase().then(async ({ auth, db, enabled }) => {
            if (enabled && auth && db) {
                const { onAuthStateChanged } = await import('firebase/auth');
                const { doc, getDoc, setDoc } = await import('firebase/firestore');
                const unsub = onAuthStateChanged(auth, async (fbUser) => {
                if (!fbUser) {
                    setCurrentUser(null);
                    setLoading(false);
                    return;
                }
                try {
                        const userRef = doc(db, 'users', fbUser.uid);
                        const snap = await getDoc(userRef);
                    let u: User;
                    if (snap.exists()) {
                        u = snap.data() as User;
                    } else {
                        // First login after signup: create user doc
                        u = {
                            id: fbUser.uid,
                            name: fbUser.displayName || fbUser.email || 'Gebruiker',
                            email: fbUser.email || '',
                            emailVerified: fbUser.emailVerified,
                            favorites: [],
                            profiles: [],
                        };
                    }
                    // Always attempt to merge any guest favorites on login
                    const merged = mergeGuestFavorites(u);
                    // Persist merged state (merge to avoid overwriting other fields)
                        await setDoc(userRef, merged, { merge: true });
                    setCurrentUser({ ...merged, emailVerified: fbUser.emailVerified });
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
        }).catch(() => {
            // On any load failure, fallback to legacy
            setLoading(false);
        });
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
        const fb = getFirebaseSync();
        if (fb?.enabled && fb.auth && fb.db) {
            try {
                const { signInWithEmailAndPassword } = await import('firebase/auth');
                const { doc, getDoc, setDoc } = await import('firebase/firestore');
                const cred = await signInWithEmailAndPassword(fb.auth, email, passwordInput);
                const userRef = doc(fb.db, 'users', cred.user.uid);
                const snap = await getDoc(userRef);
                if (!snap.exists()) return null;

                // Merge guest favorites on login
                let u = snap.data() as User;
                u = mergeGuestFavorites(u);
                await setDoc(userRef, u, { merge: true });
                setCurrentUser({ ...u, emailVerified: cred.user.emailVerified });
                return u;
            } catch (e) {
                console.error('Firebase login error', e);
                throw e;
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
        const fb = getFirebaseSync();
        if (fb?.enabled && fb.auth && fb.db) {
            try {
                const { createUserWithEmailAndPassword, updateProfile: fbUpdateProfile } = await import('firebase/auth');
                const { doc, setDoc } = await import('firebase/firestore');
                const cred = await createUserWithEmailAndPassword(fb.auth, email, passwordInput);
                if (cred.user && name) {
                    try { await fbUpdateProfile(cred.user, { displayName: name }); } catch {}
                }
                let newUser: User = {
                    id: cred.user.uid,
                    name,
                    email,
                    emailVerified: cred.user.emailVerified,
                    favorites: [],
                    profiles: [],
                };
                newUser = mergeGuestFavorites(newUser);
                await setDoc(doc(fb.db, 'users', cred.user.uid), newUser);
                setCurrentUser(newUser);
                return newUser;
            } catch (e) {
                console.error('Firebase signup error', e);
                throw e;
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
        };
        newUser = mergeGuestFavorites(newUser);
        saveUsers([...users, newUser]);
        localStorage.setItem(CURRENT_USER_ID_KEY, newUser.id);
        const { password, ...userWithoutPassword } = newUser;
        setCurrentUser(userWithoutPassword);
        return userWithoutPassword;
    };

    const logout = () => {
        const fb = getFirebaseSync();
        if (fb?.enabled && fb.auth) {
            import('firebase/auth').then(m => m.signOut(fb.auth!)).catch(console.error);
        }
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_ID_KEY);
    };

    const resetPassword = async (email: string): Promise<boolean> => {
        const fb = getFirebaseSync();
        if (fb?.enabled && fb.auth) {
            try {
                const { sendPasswordResetEmail } = await import('firebase/auth');
                await sendPasswordResetEmail(fb.auth, email);
                return true;
            } catch (e) {
                console.error('Password reset error', e);
                return false;
            }
        }
        // Legacy fallback not supported
        return false;
    };

    const loginWithGoogle = async (): Promise<User | null> => {
        const fb = getFirebaseSync();
        if (fb?.enabled && fb.auth && fb.db) {
            try {
                const { GoogleAuthProvider, signInWithRedirect } = await import('firebase/auth');
                const provider = new GoogleAuthProvider();
                await signInWithRedirect(fb.auth, provider);
                return null; // Flow continues after redirect
            } catch (e) {
                console.error('Google login error', e);
                throw e;
            }
        }
        // Legacy fallback: not supported
        return null;
    };

    const sendVerificationEmailWrapper = async (): Promise<boolean> => {
        const fb = getFirebaseSync();
        if (fb?.enabled && fb.auth) {
            try {
                if (!fb.auth.currentUser) return false;
                // Force Dutch templates and use our site as the action URL host
                try { fb.auth.languageCode = 'nl'; } catch {}
                const actionCodeSettings = {
                    url: `${window.location.origin}/account`,
                    // For web we don't handle in-app, just open in browser
                    handleCodeInApp: false,
                } as const;
                const { sendEmailVerification } = await import('firebase/auth');
                await sendEmailVerification(fb.auth.currentUser, actionCodeSettings);
                return true;
            } catch (e) {
                console.error('Send verification error', e);
                return false;
            }
        }
        return false;
    };

    const refreshAuthUser = async (): Promise<boolean> => {
        const fb = getFirebaseSync();
        if (fb?.enabled && fb.auth) {
            try {
                if (!fb.auth.currentUser) return false;
                const { reload } = await import('firebase/auth');
                await reload(fb.auth.currentUser);
                // Sync emailVerified flag into our state
                if (currentUser) {
                    setCurrentUser({ ...currentUser, emailVerified: fb.auth.currentUser.emailVerified });
                }
                return true;
            } catch (e) {
                console.error('Reload user error', e);
                return false;
            }
        }
        return false;
    };

    const toggleFavorite = async (gift: Gift) => {
        if (!currentUser) return;

        const fb = getFirebaseSync();
        if (fb?.enabled && fb.db) {
            const { doc, updateDoc } = await import('firebase/firestore');
            const userRef = doc(fb.db, 'users', currentUser.id);
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
        const fb = getFirebaseSync();
        if (fb?.enabled && fb.db) {
            const { doc, updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(fb.db, 'users', updatedUser.id), {
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


    const value = {
        currentUser,
        loading,
        login,
        signup,
    loginWithGoogle,
        logout,
    toggleFavorite,
        isFavorite,
    resetPassword,
    sendVerificationEmail: sendVerificationEmailWrapper,
    refreshAuthUser,
        addProfile,
        updateProfile,
        deleteProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};