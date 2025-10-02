import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LAUNCH_KEY = '@first_launch';

export const useFirstLaunch = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      setIsFirstLaunch(value === null); // null signifie première ouverture
    } catch (error) {
      console.error('Erreur lors de la vérification de première ouverture:', error);
      setIsFirstLaunch(true); // En cas d'erreur, considérer comme première ouverture
    } finally {
      setIsLoading(false);
    }
  };

  const markAsLaunched = async () => {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de première ouverture:', error);
    }
  };

  return {
    isFirstLaunch,
    isLoading,
    markAsLaunched,
  };
};