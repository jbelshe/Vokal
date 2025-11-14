import { supabase } from './supabase';

export async function authedFetch<T>(fn: () => Promise<T>) {
  const { data: s } = await supabase.auth.getSession();  // emits a 401 SIGNED_OUT event if fails
  if (!s.session) throw new Error('Not signed in');

  try {
    return await fn();
  } catch (e: any) {
    // 401 means the refresh flow failed or token expired
    // The global onAuthStateChange listener will emit SIGNED_OUT.
    // You can also explicitly navigate to login if needed.
    throw e;
  }
}
