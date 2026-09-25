import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

type Props = { onFinish: () => void };

export function AnimatedSplash({ onFinish }: Props) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const appear = useRef(new Animated.Value(0)).current;
  const overlay = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(appear, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
      Animated.timing(overlay, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, [scale, appear, overlay, onFinish]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.wrap, { opacity: overlay }]}
    >
      <Animated.View
        style={{
          alignItems: "center",
          opacity: appear,
          transform: [{ scale }],
        }}
      >
        <Ionicons name="nutrition" size={72} color="#A3E635" />
        <Text style={styles.title}>Protein Tracker</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#0E0F0D",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#F5F7F2",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 14,
    letterSpacing: -0.5,
  },
});
