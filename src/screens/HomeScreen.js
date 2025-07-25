import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuranLogo } from '../components/QuranLogo';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import ContinueReading from '../components/ContinueReading';
import DailyRecommendations from '../components/DailyRecommendations';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadStreak, updateStreak } from '../store/streakSlice';

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const streak = useSelector(s => s.streak.streak);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('[HOME SCREEN] Component mounted');
    dispatch(loadStreak());
    
    return () => {
      console.log('[HOME SCREEN] Component unmounting');
    };
  }, []);

  const handleStreakPress = () => {
    console.log('[HOME SCREEN] Streak button pressed, current streak:', streak);
    navigation.navigate('Streak');
  };

  const handleQuranPress = () => {
    console.log('[HOME SCREEN] Quran button pressed');
    navigation.navigate('Quran');
  };

  const handleSurahsPress = () => {
    console.log('[HOME SCREEN] All Surahs button pressed');
    navigation.navigate('Quran', { screen: 'QuranTabs', params: { screen: 'SurahsList' } });
  };

  const handleJuzPress = () => {
    console.log('[HOME SCREEN] Juz button pressed');
    navigation.navigate('Quran', { screen: 'QuranTabs', params: { screen: 'JuzList' } });
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-black`}>
      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { 
            console.log('[HOME SCREEN] Pull to refresh triggered');
            setRefreshing(true);
            // Just refresh the streak data
            dispatch(loadStreak());
            setTimeout(() => setRefreshing(false), 1000);
          }} />
        }
        contentContainerStyle={tw`pb-8`}
      >
      <View style={tw`px-6 pt-4 mb-5 flex-row items-center`}> 
        <QuranLogo size={54} />
        <View style={tw`ml-4`}> 
          <Text style={tw`text-xl font-bold text-black dark:text-white`}>Assalamu Alaikum, Abdul Bayees</Text>
          <Text style={tw`text-base text-gray-600 dark:text-gray-300 mt-1`}>Welcome to your Qur’an journey</Text>
        </View>
      </View>
      <View style={tw`px-6 mb-5`}> 
        <TouchableOpacity
          onPress={handleStreakPress}
          style={tw`flex-row items-center bg-green-100 dark:bg-green-900 rounded-xl px-4 py-3 shadow`}
          accessibilityRole="button"
          accessibilityLabel="View daily reading streak"
        >
          <Ionicons name="flame" size={26} color="#4F8A10" style={tw`mr-2`} />
          <Text style={tw`text-lg font-semibold text-green-800 dark:text-green-100`}>Streak: {streak} day{streak === 1 ? '' : 's'} 🔥</Text>
        </TouchableOpacity>
      </View>
      
      {/* Continue Reading Section */}
      <View style={tw`px-6 mb-5`}>
        <ContinueReading navigation={navigation} />
      </View>

      {/* Daily Recommendations - Smart Suggestions */}
      <View style={tw`px-6 mb-5`}>
        <DailyRecommendations navigation={navigation} />
      </View>
      
      <View style={tw`px-6 mt-4`}> 
        <Text style={tw`text-lg font-bold text-black dark:text-white mb-2`}>Quick Start</Text>
        <View style={tw`gap-3 mb-3`}> 
          <TouchableOpacity
            onPress={handleQuranPress}
            style={tw`bg-green-100 dark:bg-green-900 rounded-xl px-4 py-4 items-center shadow flex-row justify-center`}
            accessibilityLabel="Read Quran Page by Page"
            activeOpacity={0.88}
          >
            <Ionicons name="book-outline" size={28} color="#4F8A10" style={tw`mr-2`} />
            <Text style={tw`text-base font-semibold text-green-900 dark:text-green-100`}>Read Quran (Page View)</Text>
          </TouchableOpacity>
          
          <View style={tw`flex-row gap-3`}> 
            <TouchableOpacity
              onPress={handleSurahsPress}
              style={tw`flex-1 bg-blue-100 dark:bg-blue-900 rounded-xl px-4 py-4 items-center shadow`}
              accessibilityLabel="Browse Surahs"
              activeOpacity={0.88}
            >
              <Ionicons name="list-outline" size={28} color="#2563eb" />
              <Text style={tw`mt-2 text-base font-semibold text-blue-900 dark:text-blue-100`}>Surahs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleJuzPress}
              style={tw`flex-1 bg-yellow-100 dark:bg-yellow-900 rounded-xl px-4 py-4 items-center shadow`}
              accessibilityLabel="Browse Juz"
              activeOpacity={0.88}
            >
              <Ionicons name="list" size={28} color="#eab308" />
              <Text style={tw`mt-2 text-base font-semibold text-yellow-900 dark:text-yellow-100`}>Juz</Text>
            </TouchableOpacity>
          </View>
        </View>
      
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
