import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, type TextStyle } from 'react-native';

type Props = { value: number; style?: TextStyle };

/** Counts smoothly from the previous value to the new one. */
export function AnimatedNumber({ value, style }: Props) {
  const anim = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(id);
  }, [anim]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  return <Text style={style}>{display}</Text>;
}
