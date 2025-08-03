import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuranLogo } from '../components/QuranLogo';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import ContinueReading from '../components/ContinueReading';
import DailyRecommendations from '../components/DailyRecommendations';
import LearnQuranCard from '../components/LearnQuranCard';
import HifzCard from '../components/HifzCard';
import QuickActions from '../components/QuickActions';
import MostReadSurahs from '../components/MostReadSurahs';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadStreak,
  updateStreak,
  getLast7DaysStreak,
} from '../store/streakSlice';
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
        console.log(
          '[HOME SCREEN] Checking if streak should be updated for app open'
        );
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
  const getUserInitials = name => {
    if (!name || name.trim() === '') return '🕌';

    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  };

  const getFirstName = name => {
    if (!name || name.trim() === '') return '';
    return name.trim().split(' ')[0];
  };

  const handleStreakPress = () => {
    console.log('[HOME SCREEN] Streak button pressed, current streak:', streak);

    // Track navigation event
    analytics.trackNavigationEvent(
      'HomeScreen',
      'StreakScreen',
      'streak_button_tap'
    );
    analytics.trackUserAction('view_streak', { current_streak: streak });

    // Navigate to dedicated Streak screen
    navigation.navigate('Streak');
  };

  // Interpolate background color - removed since it's now in QuickActions component

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView
        style={tw`flex-1`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              console.log('[HOME SCREEN] Pull to refresh triggered');
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
              <TouchableOpacity
                style={tw`w-12 h-12  items-center justify-center mr-4 `}
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.7}
              >
                <View style={tw`w-11 h-11 rounded-full bg-gray-200 border-2 border-gray-300 items-center justify-center`}>
                  <Ionicons name="person" size={24} color="#6B7280" />
                </View>
              </TouchableOpacity>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xl font-bold text-gray-900`}>
                  Welcome
                  {userName ? `, ${getFirstName(userName)}` : ''}
                </Text>
                <Text style={tw`text-base text-gray-500`}>
                  {userName
                    ? 'Welcome back to your spiritual journey'
                    : 'Welcome to your spiritual journey'}
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

        {/* Weekly Progress Tracker */}
        <View style={tw`px-6 mb-4 `}>
          <TouchableOpacity onPress={handleStreakPress} activeOpacity={0.92}>
            <LinearGradient
              colors={['#F0FDF4', '#DCFCE7', '#BBF7D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`rounded-2xl p-5 shadow-sm border border-gray-100`}
            >
              {/* Clean Header */}
              <View style={tw`flex-row items-center justify-between mb-2`}>
                <View style={tw`flex-row items-center`}>
                  <View>
                    <Text
                      style={tw`text-base justify-center items-center font-bold text-gray-900`}
                    >
                      Reading Progress
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress Circles Row */}
              <View style={tw`flex-row justify-between items-center mb-2`}>
                {last7Days.map((day, index) => (
                  <View key={day.date} style={tw`items-center flex-1`}>
                    {/* Circle */}
                    {day.hasRead ? (
                      <LinearGradient
                        colors={['#22C55E', '#16A34A', '#15803D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={tw`w-11 h-11 rounded-full items-center justify-center mb-2 shadow-sm border-2 border-white`}
                      >
                        <Text style={tw`text-base`}>💫</Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          tw`w-11 h-11 rounded-full items-center justify-center mb-2 border-2`,
                          {
                            backgroundColor: day.isToday
                              ? '#ECFDF5'
                              : '#FFFFFF',
                            borderColor: day.isToday ? '#22C55E' : '#E5E7EB',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                          },
                        ]}
                      >
                        {day.isToday ? (
                          <View
                            style={tw`w-3 h-3 bg-emerald-500 rounded-full`}
                          />
                        ) : (
                          <Text style={tw`text-base`}>😭</Text>
                        )}
                      </View>
                    )}

                    {/* Day Label */}
                    <Text
                      style={[
                        tw`text-xs font-semibold`,
                        {
                          color: day.hasRead
                            ? '#22C55E'
                            : day.isToday
                              ? '#22C55E'
                              : '#6B7280',
                        },
                      ]}
                    >
                      {day.dayName.slice(0, 3)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Status Message */}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <QuickActions navigation={navigation} />

        {/* Hifz Tracker Card */}
        <View style={tw`px-6 mb-6`}>
          <HifzCard key={hifzRefreshKey} navigation={navigation} />
        </View>

        <View style={tw`px-6 mb-4`}>
          <ContinueReading navigation={navigation} />
        </View>

        <MostReadSurahs navigation={navigation} />

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
