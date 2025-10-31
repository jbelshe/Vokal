import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Birthday } from '../types/birthday';
import { sendOtp, verifyOtp, checkIfUserExists } from '../api/auth';

type User = { id: string; email?: string } | null;
type Profile = {
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  zipCode: string | null;
  gender: string | null;
  birthday: Birthday | null;
  emailSubscribed: boolean;
};

type AuthContextType = {
  user: User;
  loading: boolean;
  phoneNumber: string | null;
  existingUser: boolean;
  profile: Profile | null;
  setPhoneNumber: (phone: string | null) => void;
  setOtpInput: (otp: string | null) => void;
  handleSendOtp: (phoneNumber: string) => Promise<void>;
  handleVerifyOtp: (otpInput: string) => Promise<boolean>;
  handleCheckIfUserExists: (phoneNumber: string) => Promise<void>;
  signIn: (tokenOrUser: string | User) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
};
  

// Creates context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'session_user'; // store token or serialized user

// Provider for the context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState<boolean>(false); // assume user doesn't exist 
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
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (phoneNumber) {
      console.log('Phone number set:', phoneNumber);
    }
  }, [phoneNumber]);

  const signIn = async (tokenOrUser: string | User) => {
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
    await SecureStore.deleteItemAsync(SESSION_KEY);
    updateProfile(null);
    setUser(null);
    setExistingUser(false);
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
    if (updates === null) {
      setProfile({
        phoneNumber: null,
        firstName: null,
        lastName: null,
        email: null,
        zipCode: null,
        gender: null,
        birthday: null,
        emailSubscribed: false,
      });
    } else {
      setProfile(prev => ({
        ...(prev || {
          phoneNumber: null,
          firstName: null,
          lastName: null,
          email: null,
          zipCode: null,
          gender: null,
          birthday: null,
          emailSubscribed: false,
        }),
        ...updates
      }));
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
        console.log("session, user:", session, user)
        return true;
      }
      console.error('OTP verification failed');
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
      console.log('User exists:', existingUser);
      console.log('User exists:', exists); // logs the new value
    } catch (error) {
      console.error('Error checking if user exists:', error);
    }
  }

  const value = useMemo(() => ({
    user,
    loading,
    existingUser,
    phoneNumber,
    profile,
    setPhoneNumber,
    setOtpInput,
    handleSendOtp,
    handleVerifyOtp,
    handleCheckIfUserExists,
    signIn,
    signOut,
    updateProfile,
  }), [user, loading, phoneNumber, existingUser, profile]);

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
