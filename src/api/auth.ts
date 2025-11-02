import { supabase } from '../lib/supabase';
import { Birthday } from '../types/birthday';

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

/**
 * Sends an OTP to the given phone number using Supabase Auth.
 * This is the React Native equivalent of the Dart example.
 */
export async function sendOtp(phone: string) {
  try {
    console.log(`Sending OTP to ${phone}`);
    const { error } = await supabase.auth.signInWithOtp({
      phone: "1" + phone,
      options: { shouldCreateUser: true }, 
    });

    if (error) throw error;
    console.log(`OTP sent successfully to ${phone}`);
  } catch (err) {
    console.error('Error sending OTP:', err);
    throw err;
  }
}


export async function checkIfUserExists(phone: string) {
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
    console.log(data)
    console.log(data["exists"])
    return data["exists"];
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

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms', 
    });

    if (error) throw error;

    const session = data.session;
    const user = data.user;

    if (session && user) {
      console.log(' OTP verified for user:', user.id);
      return { session, user };
    } else {
      console.warn('TP verification failed — no session returned');
      return null;
    }
  } catch (err) {
    console.error('verifyOtp exception:', err);
    throw err;
  }
}

/**
 * Saves profile data to Supabase database after user completes profile creation.
 * This function sets the session and then inserts/updates the profile in the database.
 */
export async function saveProfile(profile: Profile, session: any): Promise<boolean> {
  try {
    console.log('Saving profile to database:', profile);
    
    // Set the session so we're authenticated when making database calls
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (sessionError) {
      console.error('Error setting session:', sessionError);
      return false;
    }

    // Convert birthday to ISO date format for database
    let birthdayDate: string | null = null;
    if (profile.birthday) {
      if ('isoDate' in profile.birthday) {
        birthdayDate = profile.birthday.isoDate;
      } else if (profile.birthday.month && profile.birthday.day && profile.birthday.year) {
        // Format as YYYY-MM-DD
        birthdayDate = `${profile.birthday.year}-${String(profile.birthday.month).padStart(2, '0')}-${String(profile.birthday.day).padStart(2, '0')}`;
      }
    }

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting authenticated user:', userError);
      return false;
    }
    console.log('Authenticated user:', user);

    let email_val: string;
    if (profile.email) {
      email_val = 'all_emails';
    } else {
      email_val = 'no_emails';
    }
    const payload = {
      id: user.id, // Use the auth user's ID
      display_name: profile.firstName + ' ' + profile.lastName,
      role: 'user',
      email: profile.email,
      zip_code: profile.zipCode,
      gender: profile.gender,
      date_of_birth: birthdayDate,
      email_subscription: email_val,
      updated_at: new Date().toISOString(),
    }

    // Insert or update profile in the database
    // Assuming a 'profiles' table exists with these columns
    console.log(payload)
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
