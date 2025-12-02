import React, { createContext, useContext, useEffect, useMemo, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { sendOtp, verifyOtp, saveProfile, updateProfile, fetchUserProfile, doesUserExist } from '../api/auth';
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
  saveNewProfileToDatabase: (currProfile: Profile) => Promise<boolean>;
  updateProfileInDatabase: (currProfile: Partial<Profile>) => Promise<boolean>;
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
      const updatedSession = action.payload ? { ...action.payload } as Session : null;
      // Consistent authentication check: user needs session AND firstName (indicating profile is complete)
      console.log("LOAD CHECK:", !!updatedSession?.access_token, !!state.profile?.firstName, '=>',!!updatedSession?.access_token && !!state.profile?.firstName)
      return {
        ...state,
        session: updatedSession,
        isAuthenticated: !!updatedSession?.access_token && !!state.profile?.firstName
      }
    case 'SET_PROFILE':
      console.log("SET_PROFILE", action.msg, action.payload)
      const currentProfile = state.profile || emptyProfile; 
      console.log("User Phone:", state.profile?.phoneNumber, action.payload?.phoneNumber, "=>", state.profile?.phoneNumber || action.payload?.phoneNumber)
      const updatedProfile = { 
        ...currentProfile,
        ...action.payload,
        phoneNumber: state.profile?.phoneNumber || action.payload?.phoneNumber || "",
      };
      // Consistent authentication check: user needs session AND firstName (indicating profile is complete)
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
  
  // Ref to prevent concurrent session processing (race condition guard)
  const isProcessingSession = useRef(false);
  const isInitializing = useRef(true);

  /**
   * Centralized function to handle session changes consistently
   * This prevents duplicate logic and race conditions
   * Wrapped in useCallback to maintain stable reference
   */
  const handleSessionChange = useCallback(async (session: Session | null, source: string) => {
    console.log(`[${source}] handleSessionChange called from ${source}`);
    // Prevent concurrent processing
    if (isProcessingSession.current) {
      console.log(`[${source}] Skipping - already processing session`);
      return;
    }

    if (!session || !session.user) {
      console.log(`[${source}] No session or user, resetting state`);
      dispatch({ type: 'RESET_SESSION' });
      dispatch({ type: 'RESET_PROFILE' });
      dispatch({ type: 'SET_ONBOARDING', payload: false });
      return;
    }

    isProcessingSession.current = true;
    // dispatch({ type: 'SET_LOADING', payload: true, msg: source });

    try {
      const userId = session.user.id;
      const userPhone = session.user.phone!;
      console.log(`[${source}] Processing session for user:`, userId);

      // For INIT: explicitly set session (Supabase may not have loaded it from storage yet)
      // For AUTH_* events: Supabase already has the session active (that's why the event fired)
      if (source === 'INIT') {
        console.log(`[${source}] Setting session for initialization...`);
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token || '',
        });
        if (sessionError) {
          console.error(`[${source}] Error setting session:`, sessionError);
          throw sessionError;
        }
      }

      // Do async operations first (before React state updates to prevent re-render interference)
      console.log(`[${source}] Checking if user exists...`);
      const userExists = await doesUserExist(userId);
      console.log(`[${source}] User exists:`, userExists);
      
      let userProfile = null;
      if (userExists) {
        console.log(`[${source}] Fetching user profile...`);
        userProfile = await fetchUserProfile(userId, userPhone);
        console.log(`[${source}] Profile fetched:`, !!userProfile?.firstName);
      }

      // NOW batch all state updates together after async operations complete
      // This prevents deadlocks from React re-renders during async calls
      dispatch({ type: 'SET_SESSION', payload: session, msg: source });
      
      if (!userExists) {
        console.log(`[${source}] User does not have profile, setting onboarding`);
        dispatch({ type: 'SET_ONBOARDING', payload: true, msg: source });
      } else if (userProfile && userProfile.firstName) {
        console.log(`[${source}] Profile found, setting profile`);
        dispatch({ type: 'SET_PROFILE', payload: userProfile, msg: source });
        dispatch({ type: 'SET_ONBOARDING', payload: false, msg: source });
      } else {
        console.error(`[${source}] Profile incomplete, setting onboarding`);
        dispatch({ type: 'SET_ONBOARDING', payload: true, msg: source });
      }
    } catch (error) {
      console.error(`[${source}] Error processing session:`, error);
      // On error, reset state but don't sign out (let user retry)
      dispatch({ type: 'RESET_SESSION' });
      dispatch({ type: 'RESET_PROFILE' });
      dispatch({ type: 'SET_ONBOARDING', payload: true });
    } finally {
      isProcessingSession.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]); // dispatch is stable from useReducer

  
  useEffect(() => {
    let mounted = true;

    // (1) Initialize: Load persisted session on app launch
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (data.session) {
          console.log("[INIT] Initial session found");
          await handleSessionChange(data.session, 'INIT');
        } else {
          console.log("[INIT] No initial session found");
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error("[INIT] Error loading initial session:", error);
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } finally {
        isInitializing.current = false;
      }
    })();

    // (2) Subscribe to auth state changes - single source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        console.log("[AUTH_EVENT]", event, "Session:", currentSession?.user?.id);

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          dispatch({ type: 'SIGN_OUT' });
          isProcessingSession.current = false;
          return;
        }

        // For other events (SIGNED_IN, TOKEN_REFRESHED, etc.), process the session
        // Skip during initial load to avoid duplicate processing
        if (isInitializing.current && event === 'INITIAL_SESSION') {
          console.log("[AUTH_EVENT] Skipping INITIAL_SESSION - handled by init");
          return;
        }
        dispatch({ type: 'SET_SESSION', payload: currentSession, msg: "handleAuthStateChange" });
      }
    );

    // (3) App lifecycle: start/stop auto-refresh on foreground/background
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else if (state === 'background') {
        supabase.auth.stopAutoRefresh();
      }
    };

    handleAppState(AppState.currentState);
    const appStateSub = AppState.addEventListener('change', handleAppState);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      appStateSub.remove();
    };
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



  const handleVerifyOtp = async (otpInput: string): Promise<boolean> => {
    try {
      const result = await verifyOtp((state.profile?.phoneNumber!), otpInput!);   // TODO: Handle country codes
      if (result && result.newSession) {
        console.log("[VERIFY_OTP] OTP verified successfully");
        
        // Set the session - this will trigger onAuthStateChange which will trigger handleSessionChange
        // and handle profile loading and state updates consistently
        await supabase.auth.setSession({
          access_token: result.newSession.access_token,
          refresh_token: result.newSession.refresh_token,
        });

        dispatch({ type: "SET_PROFILE", payload: result.profile, msg: "handleVerifyOtp" })
        // dispatch({ type: 'SET_SESSION', payload: result.newSession, msg: "handleVerifyOtp" });r
        // onAuthStateChange will handle the rest (profile loading, onboarding state, etc.)
        return true;
      }
      console.error('[VERIFY_OTP] OTP verification failed - no session returned');
      return false;
    } catch (error) {
      console.error('[VERIFY_OTP] Error verifying OTP:', error);
      return false;
    }
  }


  const updateProfileInDatabase = async (currProfile: Partial<Profile>): Promise<boolean> => {
    try {
      if (!state.session) {
        console.error('Cannot update profile: missing session data');
        return false;
      }
      const success = await updateProfile(currProfile, state.session);
      console.log("Profile updated successfully", success);
      return success;
    } catch (error) {
      console.error('Error updating profile to database:', error);
      return false;
    }
  }



  const saveNewProfileToDatabase = async (currProfile: Profile): Promise<boolean> => {
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
    saveNewProfileToDatabase,
    updateProfileInDatabase
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
