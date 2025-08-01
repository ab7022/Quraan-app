import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import Svg, {
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import tw from 'twrnc';

const { width } = Dimensions.get('window');

// Islamic Pattern SVG Component
const IslamicPattern = ({ size = 100, color = '#FFFFFF20' }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <RadialGradient id="grad" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </RadialGradient>
    </Defs>
    <G>
      <Circle cx="50" cy="50" r="20" fill="url(#grad)" />
      <Path d="M30,50 Q50,30 70,50 Q50,70 30,50" fill={color} />
      <Path d="M50,30 Q70,50 50,70 Q30,50 50,30" fill={color} />
    </G>
  </Svg>
);

// Floating Particles Component
const FloatingParticle = ({ delay = 0 }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: -20,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.3,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    setTimeout(animate, delay);
  }, []);

  return (
    <Animated.View
      style={[
        tw`absolute w-2 h-2 bg-white rounded-full`,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
};

export default function LearnQuranCard({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Subtle rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      })
    ).start();

    // Breathing glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={tw`mb-4`}>
      {/* Mysterious Header */}
      <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>
        Learn Quraan from a teacher
      </Text>

      <Animated.View
        style={[{ transform: [{ scale: scaleAnim }] }, tw`relative`]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('LearnQuran')}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={tw`relative overflow-hidden rounded-3xl`}
        >
          {/* Mysterious Gradient Background */}
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`relative`}
          >
            {/* Subtle overlay gradient */}
            <LinearGradient
              colors={['transparent', '#533483', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`absolute inset-0 opacity-40`}
            />

            {/* Main Content */}
            <View style={tw`p-6 relative z-10`}>
              {/* Mystery Icon */}
              <View style={tw`items-center mb-6`}>
                <Animatable.View
                  animation="pulse"
                  iterationCount="infinite"
                  duration={3000}
                  style={tw`relative`}
                >
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={tw`w-16 h-16 rounded-full items-center justify-center`}
                  >
                    <MaterialCommunityIcons
                      name="book-lock"
                      size={32}
                      color="white"
                    />
                  </LinearGradient>
                  {/* Subtle glow */}
                </Animatable.View>
              </View>

              {/* Teasing Content */}
              <View style={tw`items-center mb-6`}>
                <Text style={tw`text-white text-xl font-bold text-center mb-3`}>
                  Something Amazing Awaits...
                </Text>
                <Text
                  style={tw`text-white/80 text-center text-sm leading-5 mb-4`}
                >
                  Discover the secret to perfect Qur'an recitation that
                  thousands are already using
                </Text>

                {/* Mystery hints */}
                <View style={tw`flex-row items-center justify-center mb-4`}>
                  <View style={tw`w-2 h-2 bg-white/60 rounded-full mx-1`} />
                  <View style={tw`w-2 h-2 bg-white/60 rounded-full mx-1`} />
                  <View style={tw`w-2 h-2 bg-white/60 rounded-full mx-1`} />
                </View>
              </View>

              {/* Call to Action */}
              <View style={tw`items-center`}>
                {/* Free badge - more subtle */}

                {/* Main CTA - more compelling */}
                <Animatable.View
                  animation="bounce"
                  iterationCount="infinite"
                  duration={4000}
                  style={tw`w-full`}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={tw`py-4 px-6 rounded-2xl flex-row items-center justify-between`}
                  >
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-white font-bold text-lg`}>
                        Reveal Your Path
                      </Text>
                      <Text style={tw`text-white/80 text-xs`}>
                        Tap to unlock the mystery
                      </Text>
                    </View>
                    <View style={tw`flex-row items-center`}>
                      <Ionicons
                        name="lock-open"
                        size={20}
                        color="white"
                        style={tw`mr-2`}
                      />
                      <Animatable.View
                        animation="fadeIn"
                        iterationCount="infinite"
                        duration={1500}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={24}
                          color="white"
                        />
                      </Animatable.View>
                    </View>
                  </LinearGradient>
                </Animatable.View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Subtle bottom hint */}
        <View style={tw`mt-3 items-center`}>
          <Text style={tw`text-gray-500 text-xs text-center`}>
            👆 Thousands have already discovered this secret
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
