import {
  use,
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
  useRef,
  useCallback
} from 'react';
import { useStorageState } from './useStorageState';
import { login, refreshSession } from '@/services/auth.service';
import { getMe, UserProfile } from '@/services/user.service';
import { LoginUser } from "@shared/user.schema";
import { router } from 'expo-router';

const AuthContext = createContext<{
  signIn: (user: LoginUser) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
  user: UserProfile | null;
  isLoadingUser: boolean;
  isReady: boolean;
  refreshUser: () => Promise<void>;
}>({
  signIn: () => Promise.resolve(),
  signOut: () => null,
  session: null,
  isLoading: false,
  user: null,
  isLoadingUser: false,
  isReady: false,
  refreshUser: () => Promise.resolve(),
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const restoredRef = useRef(false);

  const session = sessionJson
    ? (() => {
        try {
          return JSON.parse(sessionJson)?.access_token;
        } catch {
          return null;
        }
      })()
    : null;

  const fetchUser = useCallback(async (token: string) => {
    try {
      setIsLoadingUser(true);
      const profile = await getMe(token);
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
      setIsReady(true);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!sessionJson) return;
    try {
      const parsed = JSON.parse(sessionJson);
      await fetchUser(parsed.access_token);
    } catch {
      // silencioso para no romper app
    }
  }, [sessionJson, fetchUser]);

  useEffect(() => {
    if (isLoading) return;

    if (!sessionJson) {
      setIsReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(sessionJson);
      const isExpired = parsed.expires_at * 1000 < Date.now();

      const restore = async () => {
        if (restoredRef.current) {
          fetchUser(parsed.access_token);
          return;
        }
        restoredRef.current = true;

        if (isExpired) {
          try {
            const data = await refreshSession(parsed.refresh_token);
            if (data.session) {
              setSessionJson(JSON.stringify(slimSession(data.session)));
              fetchUser(data.session.access_token);
            } else {
              setSessionJson(null);
              setUser(null);
              setIsReady(true);
              router.replace('/(auth)/sign-in');
            }
          } catch {
            setSessionJson(null);
            setUser(null);
            setIsReady(true);
            router.replace('/(auth)/sign-in');
          }
        } else {
          fetchUser(parsed.access_token);
        }
      };

      restore();
    } catch {
      setSessionJson(null);
      setUser(null);
      setIsReady(true);
      router.replace('/(auth)/sign-in');
    }
  }, [sessionJson, isLoading, fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (user: LoginUser) => {
          const data = await login(user);
          setSessionJson(JSON.stringify(slimSession(data.session)));
        },
        signOut: () => {
          setSessionJson(null);
          setUser(null);
          setIsReady(false);
          router.replace('/(auth)/sign-in');
        },
        session,
        isLoading,
        user,
        isLoadingUser,
        isReady,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}