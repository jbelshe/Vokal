import { supabase } from '../lib/supabase';
import { Profile } from '../types/profile';
import { Session } from '@supabase/supabase-js';

/**
 * Sends an OTP to the given phone number using Supabase Auth.
 * This is the React Native equivalent of the Dart example.
 */
export async function sendOtp(phone: string) {
  try {
    console.log('Raw phone input:', phone, 'Type:', typeof phone);
    const cleanedPhone = phone.replace(/\D/g, '');
    const formattedPhone = `+${cleanedPhone}`;
    console.log("Formatted Phone:", formattedPhone)
    console.log(`Sending OTP to ${phone}`);
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: { shouldCreateUser: true }, 
    });

    if (error) throw error;
    console.log(`OTP sent successfully to ${phone}`);
  } catch (err) {
    console.error(`Error sending OTP to ${phone}:`, err);
    throw err;
  }
}


/**
 * Verifies an OTP code sent via SMS using Supabase Auth.
 * Returns the user's session if successful, otherwise throws.
 */
export async function verifyOtp(phone: string, token: string) {
  console.log(`Verifying OTP for ${phone} with token ${token}`);
  if (!phone || !token) {
    console.warn('verifyOtp: missing phone or token');
    return null;
  }
  const cleanedPhone = phone.replace(/\D/g, '');
  const formattedPhone = `+${cleanedPhone}`;
  console.log("Formatted Phone:", formattedPhone)
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms', 
    });

    if (error) throw error;

    const newSession = data.session;
    const newUser = data.user;
    console.log("New User:", newUser)
    if (newUser && newUser.phone) {
      const profile = await fetchUserProfile(newUser.id, newUser.phone!);
      console.log("Profile:", profile)
      return { newSession, profile };
    }
    else {
      console.warn('OTP verification failed — no user returned');
      return { newSession, profile: null };
    }
  } catch (err) {
    console.error('verifyOtp exception:', err);
    throw err;
  }
}

export async function checkIfUserExists(phone: string)  : Promise<boolean>{
    console.log("Checking if user exists for phone:", phone)
    const url = "https://wjhnxvtqvehvhvhlwosk.supabase.co/functions/v1/check-user";
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ phone: "1" + phone }),    // TODO: Handle country codes
    });
    const data = await response.json();
    console.log("User exists:", data)
    console.log(data["exists"])
    return data["exists"];
}

export async function checkSession(savedSession: Session) {
    try {
        const { data: { session }, error } = await supabase.auth.setSession({
            access_token: savedSession.access_token,
            refresh_token: savedSession.refresh_token || ''
        });
        
        if (error) {
            console.error('Session refresh error:', error);
            throw error;
        }

        if (!session) {
            console.error('No session after refresh');
            throw new Error('No session after refresh');
        }

        await supabase.auth.getSession();
        
        return session;
    } catch (error) {
        console.error('Error in checkSession:', error);
        throw error;
    }
}

export async function doesUserExist(userId: string) : Promise<boolean> {
  console.log("[doesUserExist] Checking if user exists - userId:", userId);
  
  try {
    // Supabase automatically uses the active session for queries
    // No need to check/getSession - if session is missing, query will fail with auth error
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      console.log("[doesUserExist] User does NOT exist (PGRST116)");
      return false;
    } else if (error) {
      console.error("[doesUserExist] Query error:", error.code, error.message);
      // If it's an auth error, throw it so caller can handle
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        throw new Error(`Authentication error: ${error.message}`);
      }
      throw error;
    }
    
    console.log("[doesUserExist] User exists:", !!data);
    return true;
  } catch (error) {
    console.error('[doesUserExist] Exception:', error);
    throw error;
  }
}

export async function fetchUserProfile(userId: string, phone: string) {
  try {
    console.log("Fetching user profile for user:", userId)
    // const { data: { user }, error: userError } = await supabase.auth.getUser();
    // console.log("USER:", user)
    // const phone = user?.phone;
    // console.log("PHONE:", phone)
    console.log("Fetching user profile for user:", userId)
    const { data, error } = await supabase.from('profiles')
      .select(`*`)
      .eq('id', userId)
      .single();

      
    if (error) {
      console.log("ERROR:  Valid Token, but no user profile found", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      // throw error;
    }
    if (data) {
      return {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        zipCode: data.zip_code,
        gender: data.gender,
        birthday: data.date_of_birth,
        emailSubscribed: data.email_subscription,
        userId: userId,
        role: data.role,
        phoneNumber: phone,
      }
    }
    if (error) console.log("SAFE ERROR (user doesn't exist yet):", error);
    return data;  // data is None
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}


function convertProfileToDatabaseFormat(profile: Partial<Profile>): any {
  console.log("Converting profile to database format:", profile);
  const result: any = {};

  // Only include the userId if it exists
  if (profile.userId) {
    result.id = profile.userId;
  }

  // Only include fields that are actually present in the partial
  if ('firstName' in profile) {
    result.first_name = profile.firstName ?? null;
  }
  if ('lastName' in profile) {
    result.last_name = profile.lastName ?? null;
  }
  if ('email' in profile) {
    result.email = profile.email ?? null;
  }
  if ('zipCode' in profile) {
    result.zip_code = profile.zipCode ?? null;
  }
  if ('gender' in profile) {
    result.gender = profile.gender ?? null;
  }
  if ('role' in profile && profile.role) {
    result.role = profile.role;
  }

  // Handle birthday if it exists in the partial
  if ('birthday' in profile && profile.birthday) {
    if ('isoDate' in profile.birthday && profile.birthday.isoDate) {
      result.date_of_birth = profile.birthday.isoDate;
    } else if ('year' in profile.birthday) {
      const { year, month, day } = profile.birthday;
      result.date_of_birth = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Handle email subscription if it exists in the partial
  if ('emailSubscribed' in profile) {
    result.email_subscription = profile.emailSubscribed ? 'all_emails' : 'no_emails';
  }

  // Always update the updated_at timestamp
  result.updated_at = new Date().toISOString();

  console.log("Converted profile:", result);
  return result;
}





export async function updateProfile(profile: Partial<Profile>, session: any): Promise<boolean> {

  const payload = convertProfileToDatabaseFormat(profile);
  console.log("Updating profile to:", payload)
  const { error } = await supabase.from('profiles').update(payload).eq('id', profile.userId);
  
  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }



  return true;
}






/**
 * Saves profile data to Supabase database after user completes profile creation.
 * This function sets the session and then inserts/updates the profile in the database.
 */
export async function saveProfile(profile: Profile, session: any): Promise<boolean> {
  try {
    profile.role = 'user'; // Default user to role 'user'
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting authenticated user:', userError);
      return false;
    }
    console.log('Authenticated user:', user);
    profile.userId = user.id;
    
    const payload = convertProfileToDatabaseFormat(profile);

    console.log("\n\n\n\n\n")
    console.log('Saving profile to database:', profile);
    console.log("PAYLOAD:", payload)
    // Insert or update profile in the database
    // Assuming a 'profiles' table exists with these columns
    const { error: dbError } = await supabase
      .from('profiles')
      .insert(payload);

    if (dbError) {
      console.error('Error saving profile to database:', dbError);
      return false;
    }

    console.log('Profile saved successfully');
    return true;
  } catch (err) {
    console.error('saveProfile exception:', err);
    return false;
  }
}
