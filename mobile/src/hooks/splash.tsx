import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useSession } from './ctx';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});  
    }
  }, [isLoading]);

  return null;
}