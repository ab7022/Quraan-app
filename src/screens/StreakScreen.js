import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import { loadStreak } from '../store/streakSlice';

export default function StreakScreen({ navigation }) {
  const streak = useSelector(s => s.streak.streak);
  const dispatch = useDispatch();
  const pulse = React.useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    console.log('[STREAK SCREEN] Component mounted, current streak:', streak);
    dispatch(loadStreak());
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
      ])
    ).start();
    
    return () => {
      console.log('[STREAK SCREEN] Component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log('[STREAK SCREEN] Streak value updated:', streak);
  }, [streak]);

  const handleBackPress = () => {
    console.log('[STREAK SCREEN] Back button pressed');
    navigation.goBack?.();
  };
  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-black`}>
      <View style={tw`flex-1 px-7 pt-6 items-center`}> 
        <TouchableOpacity
          onPress={handleBackPress}
          style={tw`absolute left-6 top-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 z-10`}
          accessibilityLabel="Go back"
        >
        <Ionicons name="chevron-back" size={24} color="#4F8A10" />
      </TouchableOpacity>
      <Animated.View style={[tw`mb-8`, { transform: [{ scale: pulse }] }]}> 
        <Ionicons name="flame" size={80} color="#4F8A10" />
      </Animated.View>
      <Text style={tw`text-3xl font-bold text-green-900 dark:text-green-200 mb-2 text-center`}>{streak} Day{streak === 1 ? '' : 's'} 🔥</Text>
      <Text style={tw`text-base text-gray-600 dark:text-gray-200 mb-6 text-center`}>Keep up your daily Qur’an reading to maintain your streak and build a life-changing habit!</Text>
      <View style={tw`bg-green-50 dark:bg-green-800 w-full rounded-2xl p-6 shadow mt-6`}> 
        <Text style={tw`text-lg font-semibold text-green-800 dark:text-green-100 mb-2`}>How does the streak work?</Text>
        <Text style={tw`text-base text-gray-700 dark:text-gray-200`}>Each day you read a Surah or Juz, your streak increases. Missing a day resets the streak to 1. Your progress is saved on your device.</Text>
      </View>
      </View>
    </SafeAreaView>
  );
}
