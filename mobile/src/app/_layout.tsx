import "@/global.css";
import { View } from "react-native";
import { Stack, router } from 'expo-router';
import { AMAProvider } from '@react-native-ama/core';
import { SessionProvider, useSession } from '@/hooks/ctx';
import { SplashScreenController } from '@/hooks/splash';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import * as Linking from 'expo-linking'; 
import { useEffect } from 'react';      

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#231709",
  },
};

export default function Root() {
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();

  useEffect(() => {
    // Maneja el link si la app ya estaba abierta
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const { path, queryParams } = Linking.parse(url);
      if (path === 'reset-password' && queryParams?.token) {
        router.push(`/reset-password?token=${queryParams.token}`);
      }
    });

    // Maneja el link si la app estaba cerrada
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const { path, queryParams } = Linking.parse(url);
      if (path === 'reset-password' && queryParams?.token) {
        router.push(`/reset-password?token=${queryParams.token}`);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider style={{ backgroundColor: "#231709" }}>
      <ThemeProvider value={MyTheme}>
        <View accessibilityLanguage="es" style={{ flex: 1, backgroundColor: "#231709" }}>
          <AMAProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "#231709" },
              }}
            >
              <Stack.Protected guard={!!session}>
                <Stack.Screen name="(home)" />
              </Stack.Protected>
              <Stack.Protected guard={!session}>
                <Stack.Screen name="(auth)/sign-in" />
              </Stack.Protected>
            </Stack>
          </AMAProvider>
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}