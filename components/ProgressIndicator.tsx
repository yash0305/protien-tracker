import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** 0..1 — the fraction of the ring that is filled. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
};

const clamp = (n: number) => Math.min(1, Math.max(0, n));

export function ProgressIndicator({
  progress,
  size = 124,
  strokeWidth = 11,
  color,
  trackColor,
  children,
}: Props) {
  const anim = useRef(new Animated.Value(clamp(progress))).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamp(progress),
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // strokeDashoffset isn't supported by the native driver
    }).start();
  }, [progress, anim]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
