import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <View style={styles.logoShape}>
            <View style={styles.logoInner}>
              <View style={styles.logoTopLeft} />
              <View style={styles.logoBottomRight} />
            </View>
          </View>
        </View>
        <Animated.Text style={styles.brandText}>MarketingTool</Animated.Text>
        <Animated.Text style={styles.taglineText}>AI-Powered Marketing</Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16132B',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 100,
    height: 100,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoShape: {
    width: 80,
    height: 80,
    backgroundColor: Colors.white,
    borderRadius: 16,
    transform: [{ rotate: '-5deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  logoTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderColor: '#16132B',
    borderTopLeftRadius: 8,
  },
  logoBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 40,
    backgroundColor: '#16132B',
    borderTopLeftRadius: 8,
  },
  brandText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  taglineText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
