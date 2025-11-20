import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { sendOtp, verifyOtp, checkIfUserExists, saveProfile, checkSession, fetchUserProfile } from '../api/auth';
import { Profile } from '../types/profile';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AppState, AppStateStatus } from 'react-native';
import { useReducer } from 'react';

type AuthContextType = {
  state : AuthState;
  dispatch: React.Dispatch<AuthAction>;
  handleSendOtp: (phoneNumber: string) => Promise<void>;
  handleVerifyOtp: (otpInput: string) => Promise<boolean>;
  signIn: (tokenOrUser: string | any) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfileToDatabase: (currProfile: Profile) => Promise<boolean>;
};


// Creates context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'session_user'; // store token or serialized user

type AuthState = {
  loading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  profile: Profile | null;
  otpInput: string | null;
  isOnboarding: boolean;
};


type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean, msg?: string }
  | { type: 'SET_SESSION'; payload: Partial<Session> | null, msg?: string }
  | { type: 'SET_PROFILE'; payload: Partial<Profile> | null, msg?: string }
  | { type: 'RESET_PROFILE'; msg?: string }
  | { type: 'RESET_SESSION'; msg?: string }
  | { type: 'SIGN_OUT'; msg?: string }
  | { type: 'SET_ONBOARDING'; payload: boolean, msg?: string };


function authReducer(state : AuthState, action : AuthAction) : AuthState {
  switch(action.type) {
    case 'SET_LOADING':
      console.log("SET_LOADING", action.msg, action.payload)
      return {...state, loading: action.payload}
    case 'SET_SESSION':
      console.log("SET_SESSION", action.msg, action.payload)
      const currentSession = state.session || emptySession; // if no session, use empty session
      const updatedSession = { 
        ...currentSession,
        ...action.payload 

      };
      console.log("LOAD CHECK:", !!updatedSession.access_token, !!state.profile?.firstName, '=>',!!updatedSession.access_token && !!state.profile?.firstName)
      return {
        ...state,
        session: updatedSession,
        isAuthenticated: !!updatedSession.access_token && !!state.profile?.firstName
      }
    case 'SET_PROFILE':
      console.log("SET_PROFILE", action.msg, action.payload)
      const currentProfile = state.profile || emptyProfile; // if no profile, use empty profile
      const updatedProfile = { 
        ...currentProfile,
        ...action.payload 
      };
      console.log("LOAD CHECK:", !!state.session?.access_token, !!updatedProfile?.firstName, '=>',!!state.session?.access_token && !!updatedProfile?.firstName)
      return {
        ...state,
        profile: updatedProfile,
        isAuthenticated: !!state.session?.access_token && !!updatedProfile?.firstName
      }
    case 'RESET_PROFILE':
      console.log("RESET_PROFILE", action.msg)
      return {...state, profile: emptyProfile}
    case 'RESET_SESSION':
      console.log("RESET_SESSION", action.msg)
      return {...state, session: emptySession}
    case 'SET_ONBOARDING':
      console.log("SET_ONBOARDING", action.msg, action.payload)
      return {...state, isOnboarding: action.payload}
    case 'SIGN_OUT':
      console.log("SIGN_OUT", action.msg)
      return {
        ...initialAuthState,
        loading: false
      }
    default:
      return state
  }
}
  


const emptyProfile: Profile = {
  phoneNumber: null,
  firstName: null,
  lastName: null,
  email: null,
  zipCode: null,
  gender: null,
  birthday: null,
  emailSubscribed: false,
  userId: null,
  role: null,
};

const emptySession: Session = {
  access_token: "",
  refresh_token: "",
  token_type: "bearer" as const,
  expires_in: 0,
  expires_at: 0,
  user: { id: "", app_metadata: {}, aud: "", created_at: "", user_metadata: {} }
};

const initialAuthState: AuthState = {
  loading: true,
  isAuthenticated: false,
  otpInput: null,
  session: null,
  profile: emptyProfile,
  isOnboarding: false
};




// Provider for the context
export function AuthProvider({ children }: { children: React.ReactNode }) {


  const [state, dispatch] = useReducer(authReducer, initialAuthState);


  useEffect(() => {
    // (1) Rehydrate on app launch
    let mounted = true;
    (async () => { // call async so we can await the getSession() call
      try {
        const { data } = await supabase.auth.getSession(); // reads persisted session if any
        if (!mounted) return;  // prevent setting state on unmounted component

        const initialSession = data.session ?? null;
        console.log("Initialization Session:", initialSession?.refresh_token, "User:", initialSession?.user?.id, )
        dispatch({ type: 'SET_SESSION', payload: initialSession });

        const initialUser = initialSession?.user ?? null;
        console.log("Initialization User:", initialUser)
        if (initialUser) {
          try {
            const userProfile = await fetchUserProfile(initialUser.id, "");
            if (!mounted) return;
            console.log("User profile fetched:", userProfile);
            if (userProfile) {
              dispatch({ type: 'SET_PROFILE', payload: userProfile, msg: "Call1"});
            } else {
              dispatch({ type: 'SET_ONBOARDING', payload: true, msg: "Call1"});
            }
          } catch (error) {
            if (!mounted) return;
            console.error('Error fetching profile:', error);
            signOut()
          }
        } else {
          signOut()
        }
      } finally {
        if (mounted) dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();

    // (2) Global auth subscription: keep session in sync + handle sign-out
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        try {
          if (!mounted) return;
          console.log("App Level Event:", event, "Current Session:", currentSession?.refresh_token, "User:", currentSession?.user?.id)
          if (event === 'SIGNED_OUT') {
            dispatch({ type: 'SIGN_OUT' });
            return;
          }
          
          try {
            dispatch({ type: 'SET_SESSION', payload: currentSession });   
          } catch (error) {
            if (!mounted) return;
            console.error('Error setting session:', error);
            signOut()
          }
          console.log("SESSION SET, now here")   
          const user = currentSession?.user ?? null;
          if (!user) {
            dispatch({ type: 'RESET_PROFILE' });
            return;
          }
          // Fetch/refresh profile whenever we know we have a user
          const userProfile = await fetchUserProfile(user.id, "");
          console.log("USER PROF:", userProfile)
          if (!mounted) return;
          dispatch({ type: 'SET_PROFILE', payload: userProfile, msg: "Call2" });
        } catch (error) {
          if (!mounted) return;
          console.error("Auth handler error:", error);
          dispatch({ type: 'RESET_PROFILE'})
          dispatch({ type: 'RESET_SESSION'})
        } finally {
          console.log('CHECK ME onAuthStateChange finally', { event, mounted })
          if (mounted) dispatch({ type: 'SET_LOADING', payload: false });
        }


      });

    // (3) App lifecycle: start/stop auto-refresh on foreground/background
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else if (state === 'background') {
        supabase.auth.stopAutoRefresh();
      }
    };

    // Kick once on mount based on current state
    handleAppState(AppState.currentState);
    const appStateSub = AppState.addEventListener('change', handleAppState);

    return () => { // this runs on cleanup
      mounted = false;
      sub.subscription.unsubscribe();
      appStateSub.remove();
    }

  }, []);



  const signIn = async (currSession: any) => {
    console.log("Signing in...");
    console.log("tokenOrUser: ", currSession);

    if (currSession) {
      // Handle both Supabase Session and our custom Session type
      const sessionToSave: Session = {
        access_token: currSession.access_token || '',
        refresh_token: currSession.refresh_token || '',
        token_type: currSession.token_type || 'bearer',
        expires_in: currSession.expires_in || 0,
        user: currSession.user || null,
      };
      supabase.auth.setSession(sessionToSave);
      const json = JSON.stringify(sessionToSave);
      console.log("Saving session: ", json);
      await SecureStore.setItemAsync(SESSION_KEY, json)
        .catch(error => console.error('Error saving session:', error));
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();  // will trigger dispatch('SIGN_OUT') through auth.onAuthStateChange
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSendOtp = async (phoneNumber: string) => {
    try {
      // setPhoneNumber(phoneNumber);
      dispatch({ type: 'SET_PROFILE', payload: { phoneNumber } , msg: "Call4"})
      await sendOtp(phoneNumber!);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  }

  const parseSessionRaw = (sessionNew: any) => {
    return {
      access_token: sessionNew.access_token,
      expires_at: sessionNew.expires_at,
      refresh_token: sessionNew.refresh_token,
      token_type: sessionNew.token_type,
    };
  }

  const parseUserMetaRaw = (userNew: any) => {
    return {
      userId: userNew.id || null,
      role: userNew.role || null,
    };
  }


  const handleVerifyOtp = async (otpInput: string): Promise<boolean> => {
    try {
      const result = await verifyOtp(("1" + state.profile?.phoneNumber!), otpInput!);   // TODO: Handle country codes
      if (result) {
        const parsedSession = parseSessionRaw(result.newSession);
        const parsedUser = parseUserMetaRaw(result.newUser);
        dispatch({ type: 'SET_PROFILE', payload: parsedUser, msg: "Call3" });
        dispatch({ type: 'SET_SESSION', payload: parsedSession });

        if (state.profile?.email) {
          console.log("User exists... signing in")
          signIn(parsedSession)
        }
        return true;
      }
      console.error('OTP verification failed', result);
      return false;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  const saveProfileToDatabase = async (currProfile: Profile): Promise<boolean> => {
    try {
      if (!state.session) {
        console.error('Cannot save profile: missing session data');
        return false;
      }

      const success = await saveProfile(currProfile, state.session);
      console.log("Profile saved successfully", success);
      return success;
    } catch (error) {
      console.error('Error saving profile to database:', error);
      return false;
    }
  }

  const value = useMemo(() => ({
    state,
    dispatch,
    handleSendOtp,
    handleVerifyOtp,
    signIn,
    signOut,  
    saveProfileToDatabase,
  }), [state]);

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
