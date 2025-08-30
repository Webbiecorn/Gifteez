
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, Gift, GiftProfile } from '../types';

const GUEST_FAVORITES_KEY = 'gifteezFavorites';
const USERS_KEY = 'gifteezUsers';
const CURRENT_USER_ID_KEY = 'gifteezCurrentUserId';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // On initial load, check if a user is logged in
        try {
            const currentUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
            if (currentUserId) {
                const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
                const user = users.find(u => u.id === currentUserId);
                if (user) {
                    // Omit password from the state for security simulation
                    const { password, ...userWithoutPassword } = user;
                    setCurrentUser(userWithoutPassword);
                }
            }
        } catch (e) {
            console.error("Error loading user from localStorage", e);
        } finally {
            setLoading(false);
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
        const users = getUsers();
        if (users.some(u => u.email === email)) {
            return null; // Email already exists
        }

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
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_ID_KEY);
    };

    const toggleFavorite = (gift: Gift) => {
        if (!currentUser) return;

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex === -1) return;

        const isCurrentlyFavorite = users[userIndex].favorites.some(fav => fav.productName === gift.productName);
        
        let updatedFavorites: Gift[];
        if (isCurrentlyFavorite) {
            updatedFavorites = users[userIndex].favorites.filter(fav => fav.productName !== gift.productName);
        } else {
            updatedFavorites = [...users[userIndex].favorites, gift];
        }

        users[userIndex].favorites = updatedFavorites;
        saveUsers(users);
        setCurrentUser({ ...currentUser, favorites: updatedFavorites });
    };

    const isFavorite = (gift: Gift): boolean => {
        return currentUser?.favorites.some(fav => fav.productName === gift.productName) || false;
    };

    const updateUserInStorageAndState = (updatedUser: User) => {
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
        logout,
        toggleFavorite,
        isFavorite,
        addProfile,
        updateProfile,
        deleteProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};