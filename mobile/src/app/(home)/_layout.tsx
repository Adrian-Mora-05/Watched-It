import { Stack } from 'expo-router';

export default function HomeLayout() {

  return (

    <Stack screenOptions={{ headerShown: false }}>

      <Stack.Screen
        name="(tabs)"
      />

      <Stack.Screen
        name="movie/[id]"
      />

      <Stack.Screen
        name="show/[id]"
      />

      <Stack.Screen
        name="list/[id]"
      />

      <Stack.Screen
        name="user/[id]"
      />

    </Stack>
  );
}