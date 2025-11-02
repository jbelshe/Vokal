import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Birthday } from '../types/birthday';
import { sendOtp, verifyOtp, checkIfUserExists, saveProfile } from '../api/auth';
import { Profile } from '../types/profile';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  phoneNumber: string | null;
  existingUser: boolean;
  profile: Profile | null;
  session: any | null;
  isOnboarding: boolean;
  setPhoneNumber: (phone: string | null) => void;
  setOtpInput: (otp: string | null) => void;
  setIsOnboarding: (isOnboarding: boolean) => void;
  handleSendOtp: (phoneNumber: string) => Promise<void>;
  handleVerifyOtp: (otpInput: string) => Promise<boolean>;
  handleCheckIfUserExists: (phoneNumber: string) => Promise<void>;
  signIn: (tokenOrUser: string | any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
  saveProfileToDatabase: (currProfile : Profile) => Promise<boolean>;
};
  

// Creates context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'session_user'; // store token or serialized user

// Provider for the context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState<boolean>(false); // assume user doesn't exist 
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile>({
      phoneNumber: null,
      firstName: null,
      lastName: null,
      email: null,
      zipCode: null,
      gender: null,
      birthday: null,
      emailSubscribed: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (raw) {
          // You can store a token string OR a JSON stringified user. Handle both:
          setUser(raw.startsWith('{') ? JSON.parse(raw) : { id: 'token', email: undefined });
        }
      } finally {
        console.log("Setting loading to false")
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (phoneNumber) {
      console.log('Phone number set:', phoneNumber);
    }
  }, [phoneNumber]);

  const signIn = async (tokenOrUser: string | any | null) => {
    console.log("Signing in...")
    if (typeof tokenOrUser === 'string') {
      await SecureStore.setItemAsync(SESSION_KEY, tokenOrUser);
      setUser({ id: 'token' });
    } else if (tokenOrUser) {
      const json = JSON.stringify(tokenOrUser);
      await SecureStore.setItemAsync(SESSION_KEY, json);
      setUser(tokenOrUser);
    }
  };

  const signOut = async () => {
    console.log("Signing out...")
    await SecureStore.deleteItemAsync(SESSION_KEY);
    updateProfile(null);
    setUser(null);
    setSession(null);
    setExistingUser(false);
    setIsOnboarding(true);
    setPhoneNumber(null);
    setOtpInput(null);
  };

  const handleSendOtp = async (phoneNumber: string) => {
    try {
      setPhoneNumber(phoneNumber);
      await sendOtp(phoneNumber!);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  }

const updateProfile = (updates: Partial<Profile> | null) => {
  console.log('Updating profile with:', updates); // Debug log
  if (updates === null) {
    setProfile({
      phoneNumber: null,
      firstName: null,
      lastName: null,
      email: null,
      zipCode: null,
      gender: null,
      birthday: null,
      emailSubscribed: false
    });
  } else {
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      console.log('New profile state:', newProfile); // Debug log
      return newProfile;
    });
  }
};

  // Type guard to check if an object is a complete Profile
  const isProfile = (obj: any): obj is Profile => {
    return obj && 
           'phoneNumber' in obj && 
           'firstName' in obj && 
           'lastName' in obj && 
           'email' in obj && 
           'zipCode' in obj && 
           'gender' in obj && 
           'birthday' in obj && 
           'emailSubscribed' in obj;
  };


  const handleVerifyOtp = async (otpInput: string): Promise<boolean> => {
    try {
      setOtpInput(otpInput);
      const result = await verifyOtp(("1" + phoneNumber!), otpInput!);   // TODO: Handle country codes
      if (result) { 
        const { session, user } = result;
        console.log("session:", session);
        console.log("user:", user);
        setUser(user);
        setSession(session);
        return true;
      }
      console.error('OTP verification failed', result);
      return false;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  const handleCheckIfUserExists = async (phoneNumber: string): Promise<void> => {
    try {
      setPhoneNumber(phoneNumber);
      const exists = await checkIfUserExists(phoneNumber);
      setExistingUser(exists);
      console.log('User exists:', exists); // logs the new value
    } catch (error) {
      console.error('Error checking if user exists:', error);
    }
  }

  const saveProfileToDatabase = async (currProfile: Profile): Promise<boolean> => {
    try {
      if (!session) {
        console.error('Cannot save profile: missing session data');
        return false;
      }

      const success = await saveProfile(currProfile, session);
      return success;
    } catch (error) {
      console.error('Error saving profile to database:', error);
      return false;
    }
  }

  const value = useMemo(() => ({
    user,
    loading,
    existingUser,
    isOnboarding,
    phoneNumber,
    profile,
    session,
    setPhoneNumber,
    setOtpInput,
    handleSendOtp,
    handleVerifyOtp,
    handleCheckIfUserExists,
    signIn,
    signOut,
    setIsOnboarding,
    updateProfile,
    saveProfileToDatabase,
  }), [user, loading, isOnboarding, phoneNumber, existingUser, profile, session]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;  // returns whatever is passed to AuthContext.Provider value={value}
}
