import { use, createContext, type PropsWithChildren, useEffect } from 'react';
import { useStorageState } from './useStorageState';
import { login } from '@/services/auth.service';
import { LoginUser } from "@shared/user.schema";
import { router } from 'expo-router';
import { refreshSession } from '@/services/auth.service';

const AuthContext = createContext<{
  signIn: (user: LoginUser) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => null,
  session: null,
  isLoading: false,
});

const slimSession = (session: any) => ({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
  expires_at: session.expires_at,
});

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, sessionJson], setSessionJson] = useStorageState('session');

// On app open, check if token is expired and refresh it via NestJS
useEffect(() => {
  if (isLoading) return;
  if (!sessionJson) return;

  try {
    const parsed = JSON.parse(sessionJson);
    const isExpired = parsed.expires_at * 1000 < Date.now();

    if (isExpired) {
      refreshSession(parsed.refresh_token)
        .then(data => {
          if (data.session) {
            setSessionJson(JSON.stringify(slimSession(data.session)));
          } else {
            setSessionJson(null);
            router.replace('/(auth)/sign-in');
          }
        })
        .catch(() => {
          setSessionJson(null);
          router.replace('/(auth)/sign-in');
        });
    }
  } catch {
    setSessionJson(null);
    router.replace('/(auth)/sign-in');
  }
}, [sessionJson, isLoading]);

  const session = sessionJson
    ? (() => { try { return JSON.parse(sessionJson)?.access_token; } catch { return null; } })()
    : null;

  return (
    <AuthContext.Provider
      value={{
        signIn: async (user: LoginUser) => {
          const data = await login(user);
          setSessionJson(JSON.stringify(slimSession(data.session)));
        },
        signOut: () => {
          setSessionJson(null);
          router.replace('/(auth)/sign-in');
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}