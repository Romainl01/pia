import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Sign in with Apple. Returns the session on success, or null if the user cancels.
 * Throws on actual errors (missing token, Supabase errors).
 *
 * Flow: Apple native auth → identity token → Supabase token exchange → session
 */
async function signInWithApple(): Promise<Session | null> {
  let credential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (error: any) {
    // User cancelled the Apple sign-in prompt — not an error
    if (error.code === 'ERR_REQUEST_CANCELED') {
      return null;
    }
    throw error;
  }

  if (!credential.identityToken) {
    throw new Error('No identity token received from Apple');
  }

  // Exchange Apple's identity token with Supabase
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Apple only sends the name on the very first sign-in.
  // Persist it to the profile immediately so we don't lose it.
  const fullName = credential.fullName;
  if (fullName?.givenName && data.session?.user?.id) {
    const name = [fullName.givenName, fullName.familyName]
      .filter(Boolean)
      .join(' ');

    await (supabase
      .from('profiles') as any)
      .update({ full_name: name })
      .eq('id', data.session.user.id);
  }

  return data.session;
}

async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): ReturnType<typeof supabase.auth.onAuthStateChange> {
  return supabase.auth.onAuthStateChange(callback);
}

export const authService = {
  signInWithApple,
  signOut,
  getSession,
  onAuthStateChange,
};
