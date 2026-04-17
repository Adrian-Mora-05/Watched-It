import { use, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState';
import { login } from '@/services/auth.service';
import {LoginUser} from "@shared/user.schema";
import { router } from 'expo-router';

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

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  return (
    <AuthContext.Provider
      value={{
        signIn: async (user: LoginUser) => {
          const data = await login(user);
          setSession(data.session.access_token);
        },
        signOut: () => {
          setSession(null);
          router.replace('/(auth)/sign-in');
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
