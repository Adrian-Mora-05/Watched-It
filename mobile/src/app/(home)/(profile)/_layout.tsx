import { FavoritesProvider } from '@/hooks/favoriteContext';
import {Stack} from 'expo-router';

export default function Layout() {
  return (
    <FavoritesProvider>
      <Stack screenOptions={{headerShown: false}} />
    </FavoritesProvider>
  );
}
