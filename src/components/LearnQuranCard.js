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
  const glowAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Entrance animation
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        tw`mb-6`,
        {
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 12,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('LearnQuran')}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[tw`rounded-3xl overflow-hidden mx-0`]}
        >
          {/* Apple-Style Gradient Background */}
          <LinearGradient
            colors={['#007AFF', '#0051D5', '#003BB5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`relative`}
          >
            {/* Subtle Pattern Overlay */}
            <View
              style={[
                tw`absolute inset-0 opacity-10`,
                { backgroundColor: '#ffffff' },
              ]}
            />

            {/* Main Content */}
            <View style={tw`p-6`}>
              {/* Header with Badge */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`text-white font-bold mb-1`,
                      { fontSize: 20, letterSpacing: -0.4 },
                    ]}
                  >
                    Learn Quran
                  </Text>
                  <Text
                    style={[
                      tw`text-blue-100 font-medium`,
                      { fontSize: 13, letterSpacing: 0.5 },
                    ]}
                  >
                    1:1 LIVE SESSIONS
                  </Text>
                </View>

                {/* FREE Badge */}
                <Animatable.View
                  animation="pulse"
                  iterationCount="infinite"
                  duration={2000}
                  style={[
                    tw`px-3 py-1 rounded-2xl`,
                    { backgroundColor: '#34c759' },
                  ]}
                >
                  <Text
                    style={[
                      tw`text-white font-bold`,
                      { fontSize: 12, letterSpacing: 0.8 },
                    ]}
                  >
                    FREE
                  </Text>
                </Animatable.View>
              </View>

              {/* Compact Features */}
              <View style={tw`mb-5`}>
                <View style={tw`flex-row items-center mb-3`}>
                  <View
                    style={[
                      tw`w-8 h-8 rounded-2xl items-center justify-center mr-3`,
                      { backgroundColor: 'rgba(255,255,255,0.2)' },
                    ]}
                  >
                    <Ionicons name="person" size={16} color="white" />
                  </View>
                  <Text
                    style={[
                      tw`text-white font-semibold flex-1`,
                      { fontSize: 15 },
                    ]}
                  >
                    Personal Quran Teacher
                  </Text>
                </View>

                <View style={tw`flex-row items-center mb-3`}>
                  <View
                    style={[
                      tw`w-8 h-8 rounded-2xl items-center justify-center mr-3`,
                      { backgroundColor: 'rgba(255,255,255,0.2)' },
                    ]}
                  >
                    <Ionicons name="school" size={16} color="white" />
                  </View>
                  <Text
                    style={[
                      tw`text-white font-semibold flex-1`,
                      { fontSize: 15 },
                    ]}
                  >
                    Certified Islamic Scholars
                  </Text>
                </View>

                <View style={tw`flex-row items-center`}>
                  <View
                    style={[
                      tw`w-8 h-8 rounded-2xl items-center justify-center mr-3`,
                      { backgroundColor: 'rgba(255,255,255,0.2)' },
                    ]}
                  >
                    <Ionicons name="time" size={16} color="white" />
                  </View>
                  <Text
                    style={[
                      tw`text-white font-semibold flex-1`,
                      { fontSize: 15 },
                    ]}
                  >
                    Flexible Schedule
                  </Text>
                </View>
              </View>

              {/* Call to Action */}
              <View
                style={[
                  tw`rounded-2xl p-4 flex-row items-center justify-between`,
                  { backgroundColor: 'rgba(255,255,255,0.15)' },
                ]}
              >
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`text-white font-bold mb-1`,
                      { fontSize: 16, letterSpacing: -0.2 },
                    ]}
                  >
                    Start Free Trial
                  </Text>
                  <Text
                    style={[tw`text-blue-100 font-medium`, { fontSize: 12 }]}
                  >
                    Book your first lesson today
                  </Text>
                </View>

                <View style={tw`flex-row items-center`}>
                  <View
                    style={[
                      tw`w-10 h-10 rounded-full items-center justify-center mr-2`,
                      { backgroundColor: 'rgba(255,255,255,0.3)' },
                    ]}
                  >
                    <Ionicons name="play" size={14} color="white" />
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Compact Trust Indicators */}
      <View style={tw`mt-4 mx-4`}>
        <View style={tw`flex-row items-center justify-center`}>
          <View style={tw`flex-row items-center mr-6`}>
            <View
              style={[
                tw`w-6 h-6 rounded-full items-center justify-center mr-2`,
                { backgroundColor: '#f0f9ff' },
              ]}
            >
              <Ionicons name="people" size={12} color="#0284c7" />
            </View>
            <Text style={[tw`text-gray-600 font-medium`, { fontSize: 13 }]}>
              1K+ Students
            </Text>
          </View>

          <View style={tw`flex-row items-center`}>
            <View
              style={[
                tw`w-6 h-6 rounded-full items-center justify-center mr-2`,
                { backgroundColor: '#fef3c7' },
              ]}
            >
              <Ionicons name="star" size={12} color="#f59e0b" />
            </View>
            <Text style={[tw`text-gray-600 font-medium`, { fontSize: 13 }]}>
              4.9 Rating
            </Text>
          </View>
        </View>

        <View style={tw`flex-row items-center justify-center mt-2`}>
          <View style={tw`w-1.5 h-1.5 bg-green-400 rounded-full mr-2`} />
          <Text
            style={[
              tw`text-gray-500 font-medium`,
              { fontSize: 11, letterSpacing: 0.5 },
            ]}
          >
            TRUSTED WORLDWIDE
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
