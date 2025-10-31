import { supabase } from '../lib/supabase';

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

