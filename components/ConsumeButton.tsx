import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { useApp } from '../context/AppContext';

type Props = {
  done: boolean;
  onPress: () => void;
};

export function ConsumeButton({ done, onPress }: Props) {
  const { colors } = useApp();
  const progress = useRef(new Animated.Value(done ? 1 : 0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: done ? 1 : 0,
      duration: 260,
      useNativeDriver: false, // colour interpolation
    }).start();
  }, [done, progress]);

  const animatePress = (to: number) =>
    Animated.spring(press, { toValue: to, friction: 7, tension: 200, useNativeDriver: true }).start();

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.accent, colors.accentSoft],
  });
  const textColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.onAccent, colors.accentStrong],
  });
  const boxFill = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', colors.accent],
  });
  const boxBorder = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.onAccent, colors.accent],
  });

  return (
    <Animated.View style={{ transform: [{ scale: press }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => !done && animatePress(0.97)}
        onPressOut={() => animatePress(1)}
        disabled={done}
        accessibilityRole="checkbox"
        accessibilityLabel={done ? 'Consumed today' : 'I had 1 serving today'}
        accessibilityState={{ checked: done, disabled: done }}
      >
        <Animated.View style={[styles.button, { backgroundColor }]}>
          <Animated.View style={[styles.box, { backgroundColor: boxFill, borderColor: boxBorder }]}>
            <Animated.View style={{ opacity: progress, transform: [{ scale: progress }] }}>
              <Ionicons name="checkmark" size={16} color={colors.onAccent} />
            </Animated.View>
          </Animated.View>
          <Animated.Text style={[styles.label, { color: textColor }]}>
            {done ? 'Consumed today' : 'I had 1 serving today'}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16, fontWeight: '700' },
});
