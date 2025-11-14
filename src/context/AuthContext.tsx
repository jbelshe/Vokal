import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Birthday } from '../types/birthday';
import { sendOtp, verifyOtp, checkIfUserExists, saveProfile, checkSession, fetchUserProfile } from '../api/auth';
import { Profile } from '../types/profile';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AppState, AppStateStatus } from 'react-native';

type AuthContextType = {
  loading: boolean;
  phoneNumber: string | null;
  existingUser: boolean;
  profile: Profile | null;
  session: Session | null;
  isOnboarding: boolean;
  setPhoneNumber: (phone: string | null) => void;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setOtpInput: (otp: string | null) => void;
  setIsOnboarding: (isOnboarding: boolean) => void;
  handleSendOtp: (phoneNumber: string) => Promise<void>;
  handleVerifyOtp: (otpInput: string) => Promise<boolean>;
  handleCheckIfUserExists: (phoneNumber: string) => Promise<void>;
  signIn: (tokenOrUser: string | any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
  saveProfileToDatabase: (currProfile: Profile) => Promise<boolean>;
};


// Creates context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'session_user'; // store token or serialized user


/*
function reducer(state, action) {
  switch (action.type) {
    case 'accept': return { ...state, hasAccepted: true };
    case 'complete': return { ...state, isComplete: true };
    case 'pay': return { ...state, hasPaid: true };
    default: return state;
  }
}

const [state, dispatch] = useReducer(reducer, {
  hasAccepted: false,
  isComplete: false,
  hasPaid: false
});

const canAdvance = Object.values(state).every(Boolean);

*/ 

// Provider for the context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState<boolean>(false); // assume user doesn't exist 
  const [existingSession, setExistingSession] = useState<"checking" | "pre_existing" | "non_existing">("checking");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile>({
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
  });


  const [initialized, setInitialized] = useState(false);

  const isAuthConfirmed = (p: Profile | null) => {
    console.log("isProfile:", !!p?.firstName)
    return !!p?.firstName;
  }

  const shouldBypassOTP = (session: Session | null, p: Profile | null) => {
    console.log("isAuthConfirmed:", !!session && isAuthConfirmed(p), !!session, isAuthConfirmed(p));
    return !!session && isAuthConfirmed(p);
  }

  useEffect(() => {
    console.log("Session:", session?.refresh_token)
  }, [session]);

  useEffect(() => {
    console.log("Initialized:", initialized)
  }, [initialized]);

  useEffect(() => {
    console.log("Updated profile...", profile.userId);
  }, [profile]);


  useEffect(() => {
    // (1) Rehydrate on app launch
    let mounted = true;
    (async () => { // call async so we can await the getSession() call
      try {
        const { data } = await supabase.auth.getSession(); // reads persisted session if any
        if (!mounted) return;  // prevent setting state on unmounted component

        const initialSession = data.session ?? null;
        console.log("Initialization Session:", initialSession?.refresh_token, "User:", initialSession?.user?.id, )
        setSession(initialSession);
        setInitialized(true);

        const initialUser = initialSession?.user ?? null;
        console.log("Initialization User:", initialUser)
        if (initialUser) {
          try {
            const userProfile = await fetchUserProfile(initialUser.id, "");
            if (!mounted) return;
            console.log("User profile fetched:", userProfile);
            updateProfile(userProfile);
            const bypass = shouldBypassOTP(initialSession, userProfile);
            console.log("On Rehydrate Should bypass OTP:", bypass);
            setIsOnboarding(!bypass);
          } catch (error) {
            if (!mounted) return;
            console.error('Error fetching profile:', error);
            updateProfile(null);
          }
        } else {
          updateProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // (2) Global auth subscription: keep session in sync + handle sign-out
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        try {
          if (!mounted) return;
          console.log("App Level Event:", event, "Current Session:", currentSession?.refresh_token, "User:", currentSession?.user?.id)
          setSession(currentSession); // reflect SIGNED_IN/TOKEN_REFRESHED/SIGNED_OUT
          if (event === 'SIGNED_OUT') {
            setSession(null);
            setInitialized(false);
            updateProfile(null);
            // signOut();
          }
          

          const user = currentSession?.user ?? null;
          if (!user) {
            updateProfile(null);
            return;
          }
          // Fetch/refresh profile whenever we know we have a user
          const userProfile = await fetchUserProfile(user.id, "");
          if (!mounted) return;
          updateProfile(userProfile);
          const bypass = shouldBypassOTP(currentSession, userProfile);
          console.log("On Auth State Change Should bypass OTP:", bypass);
          setIsOnboarding(!bypass);
          // Prefer logging from local variables to avoid stale closures
          console.log("Profile userId:", userProfile?.userId, "Session userId:", user.id);

        } catch (error) {
          if (!mounted) return;
          console.error("Auth handler error:", error);
          updateProfile(null);
        } finally {
          if (mounted) setLoading(false);
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

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session?.refresh_token, "User:", session?.user?.id);
      setSession(session);
      setLoading(false);
    });

    return () => { // this runs on cleanup
      mounted = false;
      sub.subscription.unsubscribe();
      appStateSub.remove();
    }

  }, []);



  // useEffect(() => {
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //     async (event, currentSession) => {
  //       console.log("Auth state changed:", event);
  //       setSession(currentSession);

  //       if (currentSession?.user) {
  //         try {
  //           const userProfile = await fetchUserProfile(
  //             currentSession.user.id,
  //             currentSession.user.phone!
  //           );
  //           console.log("User profile fetched:", userProfile);
  //           updateProfile(userProfile);
  //         } catch (error) {
  //           console.error('Error fetching profile:', error);
  //           updateProfile(null);
  //         }
  //       } else {
  //         updateProfile(null);
  //       }
  //       console.log("Setting Loading to false");
  //       setLoading(false);
  //       const { data } = await supabase.auth.getSession()
  //       console.log("GetSession:", data.session?.access_token);
  //       console.log("Profile:", profile.userId, "Session:", session?.user?.id);
  //     }
  //   );



  //   return () => subscription.unsubscribe();
  // }, []);



  useEffect(() => {
    console.log("Updated existing session...", existingSession);
    console.log("Access token: ", session?.access_token);
    console.log("User ID: ", profile.userId);
    if (existingSession === "checking") {
      return;
    }
    else if (existingSession === "pre_existing") {
      setLoading(false);
      setIsOnboarding(false);
      console.log("User is logged in and profile is set");
    }
    else if (existingSession === "non_existing") {
      setLoading(false);
      console.log("User is not logged in or profile is not set");
    }
  }, [existingSession]);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const savedSessionJson = await SecureStore.getItemAsync(SESSION_KEY);
  //       if (savedSessionJson) {
  //         const savedSession = JSON.parse(savedSessionJson);
  //         if (savedSession?.access_token) {
  //           try {
  //             const sessionValid = await checkSession(savedSession);
  //             console.log("Session valid:", sessionValid);
  //             await updateSession(parseSessionRaw(sessionValid));
  //             if (sessionValid) {
  //               console.log("User:", sessionValid.user)
  //               try {
  //                 if (sessionValid.user.phone) {
  //                   const userProfile = await fetchUserProfile(sessionValid.user.id, sessionValid.user.phone);
  //                   if (userProfile) {
  //                     await updateProfile(userProfile);
  //                     setExistingSession('pre_existing');
  //                   }
  //                   else {
  //                     setExistingSession('non_existing');
  //                     console.error('Error fetching user profile');
  //                   }
  //                 } else {
  //                   setExistingSession('non_existing');
  //                   console.error('Phone number is required to fetch user profile');
  //                 }
  //               } catch (error) {
  //                 setExistingSession('non_existing');
  //                 console.error('Error fetching user profile:', error);
  //               }
  //             }
  //             else {
  //               setExistingSession('non_existing');
  //               console.error('Error retreiving session');
  //             }

  //           } catch (error) {
  //             setExistingSession('non_existing');
  //             console.error('Error checking session:', error);
  //             await SecureStore.deleteItemAsync(SESSION_KEY);
  //             return;
  //           }
  //         }

  //       }
  //     } 
  //     catch (error) {
  //       setExistingSession('non_existing');
  //       console.error('Error checking session:', error);
  //       await SecureStore.deleteItemAsync(SESSION_KEY);
  //       return;
  //     }
  //     // finally {
  //     //   console.log("Access token: ", session.access_token);
  //     //   console.log("User ID: ", profile.userId);
  //     //   if (session.access_token && profile.userId) {
  //     //     setLoading(false);
  //     //     setIsOnboarding(false);
  //     //     console.log("User is logged in and profile is set");
  //     //   } else {
  //     //     console.log("User is not logged in or profile is not set");
  //     //     setLoading(false);
  //     //   }
  //     // }
  //   })();
  // }, []);

  useEffect(() => {
    if (phoneNumber) {
      console.log('Phone number set:', phoneNumber);
    }
  }, [phoneNumber]);

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

      // Update the session state with the properly typed session
      setSession(sessionToSave);
    }
  };

  /**
   * Updates the session state and persists it to secure storage
   * @param newSession Partial session object or null to clear the session
   */
  const updateSession = async (newSession: Partial<Session> | null) => {
    if (newSession === null) {
      // Clear session
      setSession({
        access_token: "",
        refresh_token: "",
        token_type: "bearer" as const,
        expires_in: 0,
        expires_at: 0,
        user: { id: "", app_metadata: {}, aud: "", created_at: "", user_metadata: {} }
      });
    } else {
      // Update session with new values
      setSession(prev => {
        if (!prev) {
          return {
            access_token: newSession.access_token || "",
            refresh_token: newSession.refresh_token || "",
            expires_at: newSession.expires_at || 0,
            token_type: newSession.token_type || "bearer",
            expires_in: 3600, // Default expiry time
            user: { id: "", app_metadata: {}, aud: "", created_at: "", user_metadata: {} }
          };
        }
        return {
          ...prev,
          ...newSession,
          token_type: newSession.token_type || "bearer",
          user: newSession.user ? { ...prev.user, ...newSession.user } : prev.user
          // token_type: updatedSession.token_type,
        };

        // // Persist to secure storage

        // console.log("sessionToStore: ", sessionToStore)

        // SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionToStore))
        //   .catch(error => console.error('Error saving session:', error));

        // return updatedSession;
      });
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      await updateSession(null);
      await updateProfile(null);
      setExistingUser(false);
      setIsOnboarding(true);
      setPhoneNumber(null);
      setOtpInput(null);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSendOtp = async (phoneNumber: string) => {
    try {
      setPhoneNumber(phoneNumber);
      await sendOtp(phoneNumber!);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  }

  const updateProfile = async (updates: Partial<Profile> | null) => {
    // console.log('Updating profile with:', updates); // Debug log
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
        userId: null,
        role: null,
      });
    } else {
      setProfile(prev => {
        const newProfile = { ...prev, ...updates };
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
    'userId' in obj &&
      'role' in obj;
  };

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
      // Include all other required Profile fields with default values
      phoneNumber: null,
      firstName: null,
      lastName: null,
      email: null,
      zipCode: null,
      gender: null,
      birthday: null,
      emailSubscribed: false
    };
  }


  const handleVerifyOtp = async (otpInput: string): Promise<boolean> => {
    try {
      setOtpInput(otpInput);
      const result = await verifyOtp(("1" + phoneNumber!), otpInput!);   // TODO: Handle country codes
      if (result) {
        const parsedSession = parseSessionRaw(result.newSession);
        const parsedUser = parseUserMetaRaw(result.newUser);
        await updateProfile(parsedUser);
        await updateSession(parsedSession);

        if (existingUser) {
          console.log("User exists... signing in")
          signIn(parsedSession)
          setIsOnboarding(false);
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
    loading,
    existingUser,
    isOnboarding,
    phoneNumber,
    profile,
    session,
    setPhoneNumber,
    setOtpInput,
    handleSendOtp,
    setSession,
    handleVerifyOtp,
    handleCheckIfUserExists,
    signIn,
    signOut,
    setIsOnboarding,
    updateProfile,
    saveProfileToDatabase,
  }), [loading, isOnboarding, phoneNumber, existingUser, profile, session]);

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
