import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { MileSightUIProvider } from '@ms-mobile-ui/themed';
import { initI18n } from '@milesight/shared/src/services/i18n';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { SessionProvider } from '@/components/SessionProvider';
import { AnimatedAppLoader } from '@/components/AnimatedAppLoader';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(console.warn);

// 国际化初始化
initI18n('mobile', 'EN');

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView>
      <AnimatedAppLoader>
        <MileSightUIProvider colorMode={colorScheme}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <SessionProvider>
              <Slot />
              <StatusBar style="auto" />
              <Toast />
            </SessionProvider>
          </ThemeProvider>
        </MileSightUIProvider>
      </AnimatedAppLoader>
    </GestureHandlerRootView>
  );
}
