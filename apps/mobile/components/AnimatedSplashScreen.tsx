import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import * as SplashScreen from 'expo-splash-screen';

export function AnimatedSplashScreen({ children }: { children: React.ReactNode; }) {
  const imageTranslateYAnimation = useMemo(() => new Animated.Value(0), []);
  const imageOpacityAnimation = useMemo(() => new Animated.Value(1), []);
  const childOpacityAnimation = useMemo(() => new Animated.Value(0), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isAppReady) {
      Animated.parallel([
        Animated.timing(imageTranslateYAnimation, {
          toValue: -100,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(imageOpacityAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start(() => {
        setAnimationComplete(true);
      });
      Animated.timing(childOpacityAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [childOpacityAnimation, imageOpacityAnimation, imageTranslateYAnimation, isAppReady]);

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e: any) {
      console.log('onImageLoad error: ', e);
    } finally {
      setAppReady(true);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={{ flex: 1, opacity: childOpacityAnimation }}>
        {isAppReady && children}
      </Animated.View>
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.expoConfig?.splash?.backgroundColor,
              opacity: imageOpacityAnimation,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Animated.Image
            style={{
              width: 200,
              height: 80,
              resizeMode: Constants.expoConfig?.splash?.resizeMode || "contain",
              transform: [
                {
                  translateY: imageTranslateYAnimation,
                },
              ],
            }}
            source={require('../assets/images/splash-icon.png')}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
}