import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { toast, ToastType } from '../../lib/toast';
import { useTheme } from '../../context/ThemeContext';

const COLORS = {
  loading: {
    light: { bg: '#1e293b', text: '#f1f5f9' },      // slate-800 / slate-100
    dark:  { bg: '#334155', text: '#f1f5f9' },       // slate-700 / slate-100
  },
  pending: {
    light: { bg: '#92400e', text: '#ffffff' },       // amber-800 / white
    dark:  { bg: '#431407', text: '#fde68a' },       // orange-950 / amber-200
  },
  success: {
    light: { bg: '#15803d', text: '#ffffff' },       // green-700 / white
    dark:  { bg: '#14532d', text: '#bbf7d0' },       // green-900 / green-200
  },
};

export function ToastView() {
  const { isDarkMode } = useTheme();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const opacity = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const fadeIn = () =>
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true });
  const fadeOut = () =>
    Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true });

  useEffect(() => {
    return toast.subscribe(
      (msg, t) => {
        animRef.current?.stop();
        setMessage(msg);
        setType(t);
        if (t === 'loading') {
          animRef.current = fadeIn();
          animRef.current.start();
        } else {
          animRef.current = Animated.sequence([fadeIn(), Animated.delay(2500), fadeOut()]);
          animRef.current.start();
        }
      },
      () => {
        animRef.current?.stop();
        animRef.current = fadeOut();
        animRef.current.start();
      },
    );
  }, [opacity]);

  const mode = isDarkMode ? 'dark' : 'light';
  const { bg, text } = COLORS[type][mode];

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: bg }]} pointerEvents="none">
      <View style={styles.row}>
        {type === 'loading' ? (
          <ActivityIndicator size="small" color={text} />
        ) : (
          <Text style={[styles.icon, { color: text }]}>{type === 'pending' ? '🕐' : '✓'}</Text>
        )}
        <Text style={[styles.text, { color: text }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 24,
    right: 24,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 14,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
});
