import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuranLogo } from '../components/QuranLogo';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import ContinueReading from '../components/ContinueReading';
import DailyRecommendations from '../components/DailyRecommendations';
import LearnQuranCard from '../components/LearnQuranCard';
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
  const [userName, setUserName] = useState('');

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
    loadUserName();
    
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

  const loadUserName = async () => {
    try {
      const savedName = await AsyncStorage.getItem('user_name');
      if (savedName) {
        setUserName(savedName);
      }
    } catch (error) {
      console.log('Error loading user name:', error);
    }
  };

  // Add focus listener to refresh HifzCard when returning from other screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[HOME SCREEN] Screen focused, refreshing HifzCard');
      setHifzRefreshKey(prev => prev + 1);
      // Also reload username when screen is focused in case it was updated
      loadUserName();
    });
    return unsubscribe;
  }, [navigation]);

  // Helper function to get user initials
    const getUserInitials = (name) => {
    if (!name || name.trim() === '') return '🕌';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  };

  const getFirstName = (name) => {
    if (!name || name.trim() === '') return '';
    return name.trim().split(' ')[0];
  };

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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              console.log("[HOME SCREEN] Pull to refresh triggered");
              setRefreshing(true);
              // Refresh streak data and check for updates
              dispatch(loadStreak());
              dispatch(updateStreak()); // Also check if streak should be updated
              setTimeout(() => setRefreshing(false), 1000);
            }}
          />
        }
        contentContainerStyle={tw`pb-8`}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Avatar and Greeting */}
        <View style={tw`px-6 pt-4 mb-6`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View
                style={tw`w-12 h-12 bg-emerald-500 rounded-full items-center justify-center mr-3`}
              >
                <Text style={tw`text-white font-semibold text-base`}>
                  {getUserInitials(userName)}
                </Text>
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xl font-bold text-gray-900`}>
                  Assalamu Alaikum{userName ? `, ${getFirstName(userName)}` : ''}
                </Text>
                <Text style={tw`text-base text-gray-500`}>
                  {userName ? 'Welcome back to your spiritual journey' : 'Welcome to your spiritual journey'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={tw`bg-emerald-100 rounded-full px-3 py-2 flex-row items-center`}
              onPress={handleStreakPress}
            >
              <Ionicons
                name="flame"
                size={16}
                color="#059669"
                style={tw`mr-1`}
              />
              <Text style={tw`text-emerald-700 font-bold text-sm`}>
                {streak}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ultra Compact Streak */}
        <View style={tw`px-6 mb-3`}>
          <TouchableOpacity 
            onPress={handleStreakPress}
            activeOpacity={0.95}
            style={tw`bg-emerald-50 rounded-xl p-3 border border-emerald-100`}
          >
            {/* Compact Header */}
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="flame" size={14} color="#059669" style={tw`mr-1.5`} />
                <Text style={tw`text-xs font-bold text-gray-900`}>
                  Weekly
                </Text>
              </View>
              <Text style={tw`text-xs font-bold text-emerald-600`}>
                {last7Days.filter((day) => day.hasRead).length}/7
              </Text>
            </View>

            {/* Mini Progress Bars */}
            <View style={tw`flex-row justify-between items-center mb-1`}>
              {last7Days.map((day, index) => (
                <View key={day.date} style={tw`items-center flex-1`}>
                  <View style={tw`w-full mx-0.5 h-3 bg-gray-100 rounded-full overflow-hidden`}>
                    <View 
                      style={[
                        tw`w-full rounded-full`,
                        {
                          height: day.hasRead ? '100%' : day.isToday ? '50%' : '0%',
                          backgroundColor: day.hasRead 
                            ? '#10B981' 
                            : day.isToday 
                              ? '#86EFAC' 
                              : 'transparent'
                        }
                      ]}
                    />
                  </View>
                  <Text style={tw`text-xs ${day.hasRead || day.isToday ? 'text-emerald-600' : 'text-gray-400'} mt-0.5`}>
                    {day.dayName.charAt(0)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Mini Status */}
            <Text style={tw`text-xs text-emerald-600 text-center mt-1`}>
              {last7Days.filter(d => d.hasRead).length === 7 
                ? "Perfect! 🔥" 
                : last7Days.find(d => d.isToday)?.hasRead 
                  ? "Done today ✓" 
                  : "Tap for details"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Continue Reading Section */}
        <View style={tw`px-6 mb-6`}>
          <ContinueReading navigation={navigation} />
        </View>
        {/* Quick Actions */}
        <View style={tw`px-6 mb-6`}>
          <Text style={tw`text-lg font-bold text-gray-900 mb-4`}>
            Quick Actions
          </Text>
          <View style={tw`flex-row flex-wrap justify-between`}>
            {/* Read Quran - Google Green Gradient */}
            <TouchableOpacity
              onPress={handleQuranPress}
              style={tw`w-[48%] rounded-2xl mb-3 shadow-lg`}
              accessibilityLabel="Read Quran Page by Page"
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#34D399", "#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={tw`rounded-2xl p-4 items-center`}
              >
                <View
                  style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3`}
                >
                  <Ionicons name="book-outline" size={24} color="white" />
                </View>
                <Text style={tw`text-sm font-semibold text-white`}>
                  Read Quran
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Learn Quran - Orange Gradient */}
            <TouchableOpacity
              onPress={() => navigation.navigate("LearnQuran")}
              style={tw`w-[48%] rounded-2xl mb-3 shadow-lg`}
              accessibilityLabel="Learn Quran with Expert Teachers"
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#F59E0B", "#D97706", "#B45309"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={tw`rounded-2xl p-4 items-center`}
              >
                <View
                  style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3`}
                >
                  <MaterialCommunityIcons
                    name="school-outline"
                    size={24}
                    color="white"
                  />
                </View>
                <Text style={tw`text-sm font-semibold text-white`}>
                  Learn Quran
                </Text>
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
                colors={["#60A5FA", "#3B82F6", "#2563EB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={tw`rounded-2xl p-4 items-center`}
              >
                <View
                  style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3`}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={24}
                    color="white"
                  />
                </View>
                <Text style={tw`text-sm font-semibold text-white`}>
                  Ask Doubt
                </Text>
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
                colors={["#A78BFA", "#8B5CF6", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={tw`rounded-2xl p-4 items-center`}
              >
                <View
                  style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3`}
                >
                  <Ionicons name="trophy-outline" size={24} color="white" />
                </View>
                <Text style={tw`text-sm font-semibold text-white`}>
                  Progress
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        {/* Hifz Tracker Card */}
        <View style={tw`px-6 mb-6`}>
          <HifzCard key={hifzRefreshKey} navigation={navigation} />
        </View>
        {/* Most Read Surahs */}
        <View style={tw`px-6 mb-6`}>
          <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>
            Most Read
          </Text>
          <View
            style={tw`bg-white rounded-2xl p-3 shadow-sm border border-gray-100`}
          >
            <View style={tw`flex-row flex-wrap justify-between`}>
              {[
                { name: "Al-Waqi'ah", page: 534, color: "#8B5CF6" },
                { name: "Al-Muzammil", page: 574, color: "#059669" },
                { name: "Ayat al-Kursi", page: 40, color: "#DC2626" },
                { name: "Ar-Rahman", page: 531, color: "#EA580C" },
                { name: "Yaseen", page: 440, color: "#7C3AED" },
                { name: "Al-Mulk", page: 562, color: "#0284C7" },
                { name: "As-Sajdah", page: 415, color: "#BE185D" },
              ].map((surah, index) => (
                <TouchableOpacity
                  key={surah.name}
                  onPress={() => {
                    console.log("Navigating to page:", surah.page);
                    navigation.navigate("Quran", {
                      screen: "QuranPage",
                      params: { initialPage: surah.page },
                    });
                  }}
                  style={[
                    tw`px-3 py-2 rounded-lg mb-2 mr-2`,
                    { backgroundColor: surah.color + "15" },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[tw`text-xs font-semibold`, { color: surah.color }]}
                  >
                    {surah.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Daily Recommendations */}
        <View style={tw`px-6 mb-6`}>
          <DailyRecommendations navigation={navigation} />
        </View>

        {/* Learn Quran Card */}
        <View style={tw`px-6 mb-20`}>
          <LearnQuranCard navigation={navigation} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
