import "../global.css"; 
import { useEffect } from 'react';
import { useRouter, Stack } from 'expo-router';
import { AMAProvider } from '@react-native-ama/core';


export default function RootLayout() {
  const router = useRouter();
  const isAuthenticated = false; 

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [isAuthenticated]);

  return (
    <AMAProvider>
      <Stack>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)/index" options={{ headerShown: false }} />
      </Stack>
    </AMAProvider>
  );
}