import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import analytics from '../services/analyticsService';

export default function QuickActions({ navigation }) {
  const colorAnimation = useRef(new Animated.Value(0)).current;

  // Start color animation when component mounts
  React.useEffect(() => {
    const startColorAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startColorAnimation();
  }, []);

  const handleQuranPress = () => {
    console.log('[QUICK ACTIONS] Quran button pressed');

    // Track navigation event
    analytics.trackNavigationEvent('HomeScreen', 'QuranScreen', 'button_tap');
    analytics.trackUserAction('start_reading', { from_screen: 'home' });

    navigation.navigate('Quran');
  };

  const handleAskDoubtPress = () => {
    console.log('[QUICK ACTIONS] Ask Doubt button pressed');

    // Track navigation event
    analytics.trackNavigationEvent(
      'HomeScreen',
      'AskDoubtScreen',
      'button_tap'
    );
    analytics.trackUserAction('ask_doubt', { from_screen: 'home' });

    navigation.navigate('AskDoubt');
  };

  const handleStreakPress = () => {
    console.log('[QUICK ACTIONS] Progress button pressed');

    // Track navigation event
    analytics.trackNavigationEvent(
      'HomeScreen',
      'StreakScreen',
      'streak_button_tap'
    );
    analytics.trackUserAction('view_streak', {
      from_component: 'quick_actions',
    });

    // Navigate to dedicated Streak screen
    navigation.navigate('Streak');
  };

  // Interpolate background color
  const animatedBackgroundColor = colorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(236, 253, 245)', 'rgb(187, 247, 208)'], // emerald-50 to emerald-200
  });

  return (
    <View style={tw`px-6 mb-6`}>
      <Text style={tw`text-xl font-bold text-gray-900 mb-4`}>
        Quick Actions
      </Text>

      {/* Main Actions Row */}
      <View style={tw`flex-row gap-3 mb-3`}>
        {/* Read Quran - Primary Action */}
        <Animated.View
          style={[
            tw`flex-1 rounded-2xl p-2 border border-emerald-200 flex-row items-center`,
            { backgroundColor: animatedBackgroundColor },
          ]}
        >
          <TouchableOpacity
            onPress={handleQuranPress}
            style={tw`flex-1 flex-row items-center`}
            accessibilityLabel="Read Quran Page by Page"
            activeOpacity={0.8}
          >
            <View
              style={tw`w-12 h-12 bg-emerald-100 rounded-2xl items-center justify-center mr-3`}
            >
              <Text style={tw`text-2xl`}>📖</Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-emerald-800 font-bold text-sm mb-1`}>
                Read Quran
              </Text>
              <Text style={tw`text-emerald-600 text-xs`}>Page by page</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#059669"
              style={tw`opacity-60`}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Ask Doubt */}
        <TouchableOpacity
          onPress={handleAskDoubtPress}
          style={tw`flex-1 bg-blue-50 rounded-2xl p-2 border border-blue-200 flex-row items-center`}
          accessibilityLabel="Ask Islamic Questions"
          activeOpacity={0.8}
        >
          <View
            style={tw`w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-3`}
          >
            <Text style={tw`text-2xl`}>🤲</Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-blue-800 font-bold text-xs mb-1`}>
              Ask Doubt
            </Text>
            <Text style={tw`text-blue-600 text-xs`}>Islamic Q&A</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#3B82F6"
            style={tw`opacity-60`}
          />
        </TouchableOpacity>
      </View>

      {/* Secondary Actions Row */}
      <View style={tw`flex-row gap-3`}>
        {/* Learn Quran */}
        <TouchableOpacity
          onPress={() => navigation.navigate('LearnQuran')}
          style={tw`flex-1 bg-orange-50 rounded-2xl p-4 border border-orange-200 flex-row items-center`}
          accessibilityLabel="Learn Quran with Expert Teachers"
          activeOpacity={0.8}
        >
          <View
            style={tw`w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-3`}
          >
            <Text style={tw`text-lg`}>🎓</Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-orange-800 font-semibold text-sm mb-1`}>
              Learn Quran
            </Text>
            <Text style={tw`text-orange-600 text-xs`}>With teachers</Text>
          </View>
        </TouchableOpacity>

        {/* Progress */}
        <TouchableOpacity
          onPress={handleStreakPress}
          style={tw`flex-1 bg-purple-50 rounded-2xl p-4 border border-purple-200 flex-row items-center`}
          accessibilityLabel="View Reading Progress"
          activeOpacity={0.8}
        >
          <View
            style={tw`w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3`}
          >
            <Text style={tw`text-lg`}>📊</Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-purple-800 font-semibold text-sm mb-1`}>
              Progress
            </Text>
            <Text style={tw`text-purple-600 text-xs`}>View stats</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
