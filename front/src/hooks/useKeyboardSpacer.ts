import { useEffect, useState } from 'react';
import { Keyboard, Platform, KeyboardEvent } from 'react-native';

/**
 * Hook qui fournit une hauteur de spacer dynamique pour éviter les "bandes" vides
 * et garder le contenu visible quand le clavier apparaît.
 */
export function useKeyboardSpacer(basePadding: number = 24, extra: number = 8) {
  const [bottom, setBottom] = useState(basePadding);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      const h = e.endCoordinates?.height || 0;
      // Sur iOS on applique un léger retrait, sur Android un offset réduit
      setBottom(h > 0 ? h + (Platform.OS === 'ios' ? extra : 0) : basePadding);
    };
    const onHide = () => setBottom(basePadding);

    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [basePadding, extra]);

  return bottom;
}
