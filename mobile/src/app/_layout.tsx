import "@/global.css";
import { View } from "react-native";
import { Stack } from 'expo-router';
import { AMAProvider } from '@react-native-ama/core';
import { SessionProvider, useSession } from '@/hooks/ctx';
import { SplashScreenController } from '@/hooks/splash';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";

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