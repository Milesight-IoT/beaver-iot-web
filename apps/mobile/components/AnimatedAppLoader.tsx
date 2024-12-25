import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

import { AnimatedSplashScreen } from './AnimatedSplashScreen';

export function AnimatedAppLoader({ children }: { children: React.ReactNode; }) {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Font.loadAsync({
        'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
      });
      setSplashReady(true);
    }

    prepare();
  }, []);

  if (!isSplashReady) {
    return null;
  }

  return <AnimatedSplashScreen>{children}</AnimatedSplashScreen>;
}