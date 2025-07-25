import React, { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';
import tw from 'twrnc';

export default function Shimmer({ height = 24, width = '100%', style }) {
  const translateX = useRef(new Animated.Value(-100)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 350,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  return (
    <View style={[tw`bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden`, { height, width }, style]}>
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          height: '100%',
          width: '40%',
          backgroundColor: '#e5e7eb33',
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}
