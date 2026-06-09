import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const scale = React.useRef(new Animated.Value(0.8)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
    pulse(dot1, 0).start();
    pulse(dot2, 150).start();
    pulse(dot3, 300).start();

    const t = setTimeout(onComplete, 3000);
    return () => clearTimeout(t);
  }, [onComplete, scale, opacity, dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Image
          source={require('../../../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <View style={styles.dots}>
        {[dot1, dot2, dot3].map((a, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
                transform: [
                  { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logo: { width: 192, height: 192 },
  dots: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(200,32,34,0.8)',
  },
});
