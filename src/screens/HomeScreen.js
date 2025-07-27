import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuranLogo } from '../components/QuranLogo';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import ContinueReading from '../components/ContinueReading';
import DailyRecommendations from '../components/DailyRecommendations';
import HifzCard from '../components/HifzCard';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadStreak, updateStreak, getLast7DaysStreak } from '../store/streakSlice';
import * as Animatable from 'react-native-animatable';
import analytics from '../services/analyticsService';
export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { streak, readingHistory } = useSelector(s => s.streak);
  const [refreshing, setRefreshing] = useState(false);
  const [hifzRefreshKey, setHifzRefreshKey] = useState(0);

  // Get last 7 days streak data
  const last7Days = getLast7DaysStreak(readingHistory);

  useEffect(() => {
    console.log('[HOME SCREEN] Component mounted');
    
    // Track screen view
    analytics.trackScreenView('HomeScreen', {
      streak_count: streak,
      has_reading_history: readingHistory.length > 0,
    });
    
    dispatch(loadStreak());
    
    // Auto-increment streak when app is opened (once per day)
    const markDailyStreak = async () => {
      try {
        console.log('[HOME SCREEN] Checking if streak should be updated for app open');
        dispatch(updateStreak());
      } catch (error) {
        console.log('[HOME SCREEN] Error updating streak on app open:', error);
      }
    };
    
    markDailyStreak();
    
    return () => {
      console.log('[HOME SCREEN] Component unmounting');
    };
  }, []);

  // Add focus listener to refresh HifzCard when returning from other screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[HOME SCREEN] Screen focused, refreshing HifzCard');
      setHifzRefreshKey(prev => prev + 1);
    });
    return unsubscribe;
  }, [navigation]);

  const handleStreakPress = () => {
    console.log('[HOME SCREEN] Streak button pressed, current streak:', streak);
    
    // Track navigation event
    analytics.trackNavigationEvent('HomeScreen', 'StreakScreen', 'button_tap');
    analytics.trackUserAction('view_streak', { current_streak: streak });
    
    navigation.navigate('Streak');
  };

  const handleQuranPress = () => {
    console.log('[HOME SCREEN] Quran button pressed');
    
    // Track navigation event
    analytics.trackNavigationEvent('HomeScreen', 'QuranScreen', 'button_tap');
    analytics.trackUserAction('start_reading', { from_screen: 'home' });
    
    navigation.navigate('Quran');
  };

  const handleSurahsPress = () => {
    console.log('[HOME SCREEN] All Surahs button pressed');
    
    // Track navigation event
    analytics.trackNavigationEvent('HomeScreen', 'SurahsScreen', 'button_tap');
    analytics.trackUserAction('browse_surahs', { from_screen: 'home' });
    
    navigation.navigate('Quran', { screen: 'QuranTabs', params: { screen: 'SurahsList' } });
  };

  const handleAskDoubtPress = () => {
    console.log('[HOME SCREEN] Ask Doubt button pressed');
    
    // Track navigation event
    analytics.trackNavigationEvent('HomeScreen', 'AskDoubtScreen', 'button_tap');
    analytics.trackUserAction('ask_doubt', { from_screen: 'home' });
    
    navigation.navigate('AskDoubt');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { 
            console.log('[HOME SCREEN] Pull to refresh triggered');
            setRefreshing(true);
            // Refresh streak data and check for updates
            dispatch(loadStreak());
            dispatch(updateStreak()); // Also check if streak should be updated
            setTimeout(() => setRefreshing(false), 1000);
          }} />
        }
        contentContainerStyle={tw`pb-8`}
        showsVerticalScrollIndicator={false}
      >
      {/* Header with Avatar and Greeting */}
      <View style={tw`px-6 pt-4 mb-6`}> 
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center flex-1`}>
            <View style={tw`w-12 h-12 bg-emerald-500 rounded-full items-center justify-center mr-3`}>
              <Text style={tw`text-white font-semibold text-base`}>AB</Text>
            </View>
            <View style={tw`flex-1`}> 
              <Text style={tw`text-xl font-bold text-gray-900`}>Assalamu Alaikum</Text>
              <Text style={tw`text-base text-gray-500`}>Abdul Bayees</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={tw`bg-emerald-100 rounded-full px-3 py-2 flex-row items-center`}
            onPress={handleStreakPress}
          >
            <Ionicons name="flame" size={16} color="#059669" style={tw`mr-1`} />
            <Text style={tw`text-emerald-700 font-bold text-sm`}>{streak}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Compact Streak Section */}
      <View style={tw`px-6 mb-6`}>
        <View style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100`}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <Text style={tw`text-lg font-bold text-gray-900`}>
              Last 7 Days 📊
            </Text>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="flame" size={16} color="#059669" />
              <Text style={tw`text-sm font-medium text-emerald-600 ml-1`}>
                {last7Days.filter(day => day.hasRead).length}/7
              </Text>
            </View>
          </View>

          {/* Compact Days Row */}
          <View style={tw`flex-row justify-between mb-3`}>
            {last7Days.map((day, index) => (
              <View key={day.date} style={tw`items-center`}>
                <Text style={tw`text-xs text-gray-500 mb-1`}>
                  {day.dayName.charAt(0)}
                </Text>
                <View
                  style={tw`w-7 h-7 rounded-full ${
                    day.isToday && day.hasRead ? 'bg-emerald-500' :
                    day.isToday && !day.hasRead ? 'bg-gray-300 border-emerald-500 border-2' :
                    day.hasRead ? 'bg-emerald-400' : 'bg-gray-200 border-red-400 border-2'
                  } items-center justify-center shadow-sm`}
                >
                  {day.hasRead ? (
                    <Ionicons name="checkmark" size={12} color="white" />
                  ) : day.isToday ? (
                    <View style={tw`w-2 h-2 bg-emerald-500 rounded-full`} />
                  ) : null}
                </View>
                <Text style={tw`text-xs ${
                  day.hasRead || day.isToday ? 'text-emerald-600 font-medium' : 'text-gray-500'
                } mt-1`}>
                  {day.dayNumber}
                </Text>
              </View>
            ))}
          </View>

          {/* Info Footer */}
          <View style={tw`flex-row items-center justify-center pt-2 border-t border-gray-100`}>
            <Ionicons name="information-circle" size={12} color="#059669" style={tw`mr-1`} />
            <Text style={tw`text-xs text-gray-500`}>
              Opening the app daily counts! 🔥
            </Text>
          </View>
        </View>
      </View>

      {/* Hifz Tracker Card */}
      <View style={tw`px-6 mb-6`}>
        <HifzCard key={hifzRefreshKey} navigation={navigation} />
      </View>

      {/* Quick Actions */}
      <View style={tw`px-6 mb-6`}> 
        <Text style={tw`text-lg font-bold text-gray-900 mb-4`}>Quick Actions</Text>
        <View style={tw`flex-row flex-wrap justify-between`}>
          {/* Read Quran - Google Green Gradient */}
          <TouchableOpacity
            onPress={handleQuranPress}
            style={tw`w-[48%] rounded-2xl mb-3 shadow-lg`}
            accessibilityLabel="Read Quran Page by Page"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#34D399', '#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`rounded-2xl p-4 items-center`}
            >
              <View style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3`}>
                <Ionicons name="book-outline" size={24} color="white" />
              </View>
              <Text style={tw`text-sm font-semibold text-white`}>Read Quran</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Ask Doubt - Google Blue Gradient */}
          <TouchableOpacity
            onPress={handleAskDoubtPress}
            style={tw`w-[48%] rounded-2xl mb-3 shadow-lg`}
            accessibilityLabel="Ask Islamic Questions"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#60A5FA', '#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`rounded-2xl p-4 items-center`}
            >
              <View style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3`}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
              </View>
              <Text style={tw`text-sm font-semibold text-white`}>Ask Doubt</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Progress - Google Purple Gradient */}
          <TouchableOpacity
            onPress={handleStreakPress}
            style={tw`w-[48%] rounded-2xl mb-3 shadow-lg`}
            accessibilityLabel="View Streak"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#A78BFA', '#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`rounded-2xl p-4 items-center`}
            >
              <View style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3`}>
                <Ionicons name="trophy-outline" size={24} color="white" />
              </View>
              <Text style={tw`text-sm font-semibold text-white`}>Progress</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Most Read Surahs */}
      <View style={tw`px-6 mb-6`}>
        <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>Most Read</Text>
        <View style={tw`bg-white rounded-2xl p-3 shadow-sm border border-gray-100`}>
          <View style={tw`flex-row flex-wrap justify-between`}>
            {[
              { name: 'Al-Waqi\'ah', page: 534, color: '#8B5CF6' },
              { name: 'Al-Muzammil', page: 574, color: '#059669' },
              { name: 'Ayat al-Kursi', page: 40, color: '#DC2626' },
              { name: 'Ar-Rahman', page: 531, color: '#EA580C' },
              { name: 'Yaseen', page: 440, color: '#7C3AED' },
              { name: 'Al-Mulk', page: 562, color: '#0284C7' },
              { name: 'As-Sajdah', page: 415, color: '#BE185D' }
            ].map((surah, index) => (
              <TouchableOpacity
                key={surah.name}
                onPress={() => {
                  console.log('Navigating to page:', surah.page);
                  navigation.navigate('Quran', {
                    screen: 'QuranPage',
                    params: { initialPage: surah.page }
                  });
                }}
                style={[
                  tw`px-3 py-2 rounded-lg mb-2 mr-2`,
                  { backgroundColor: surah.color + '15' }
                ]}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    tw`text-xs font-semibold`,
                    { color: surah.color }
                  ]}
                >
                  {surah.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      {/* Continue Reading Section */}
      <View style={tw`px-6 mb-6`}>
        <ContinueReading navigation={navigation} />
      </View>

      {/* Daily Recommendations */}
      <View style={tw`px-6 mb-6`}>
        <DailyRecommendations navigation={navigation} />
      </View>
      
    </ScrollView>
    </SafeAreaView>
  );
}
