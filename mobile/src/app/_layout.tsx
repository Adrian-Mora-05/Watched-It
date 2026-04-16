import "@/global.css"; 
import { View } from "react-native";
import { Stack } from 'expo-router';
import { AMAProvider } from '@react-native-ama/core';
import { SessionProvider, useSession } from '@/hooks/ctx';
import { SplashScreenController } from '@/hooks/splash';

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
  return (
    <View accessibilityLanguage="es" style={{ flex: 1 }}>
      <AMAProvider>
        <Stack>
          <Stack.Protected guard={!!session}>
            <Stack.Screen name="(home)" />
          </Stack.Protected>
          <Stack.Protected guard={!session}>
            <Stack.Screen name="(auth)/sign-in" />
          </Stack.Protected>
        </Stack>
      </AMAProvider>
    </View>
  );
}