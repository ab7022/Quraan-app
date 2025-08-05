import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { IOSInlineLoader } from './IOSLoader';

const DAILY_TARGET_STORAGE_KEY = 'daily_target_data';

export default function HifzCard({ navigation }) {
  const [targetData, setTargetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current reading progress from Redux store
  const lastReadPage = useSelector(state => state.streak.lastReadPage);
  const currentPage = lastReadPage?.pageNumber || 1;

  useEffect(() => {
    loadTargetData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTargetData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadTargetData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(DAILY_TARGET_STORAGE_KEY);
      if (savedData) {
        setTargetData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading daily target data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayProgress = () => {
    if (!targetData) return { completed: 0, percentage: 0 };
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = targetData.dailyProgress[today] || 0;
    const percentage = Math.min(
      (todayProgress / targetData.dailyTarget) * 100,
      100
    );
    return { completed: todayProgress, percentage };
  };

  const getStreakInfo = () => {
    if (!targetData) return { current: 0, best: 0 };

    const dates = Object.keys(targetData.dailyProgress).sort().reverse();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from today backwards)
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (targetData.dailyProgress[dateStr] >= targetData.dailyTarget) {
        if (i === 0 || currentStreak > 0) currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    for (const date of dates) {
      if (targetData.dailyProgress[date] >= targetData.dailyTarget) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { current: currentStreak, best: bestStreak };
  };

  const calculateCompletionInfo = () => {
    if (!targetData) return null;

    const totalPages = 604;
    const remainingPages = totalPages - targetData.totalCompleted;
    const daysNeeded = Math.ceil(remainingPages / targetData.dailyTarget);

    const today = new Date();
    const completionDate = new Date(today);
    completionDate.setDate(today.getDate() + daysNeeded);

    return {
      daysNeeded,
      completionDate: completionDate.toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      remainingPages,
    };
  };

  const getOverallProgress = () => {
    const totalPages = 604;
    const todayProgress = getTodayProgress();
    const pagesCompleted = todayProgress.completed;
    const progressPercentage = Math.min(
      (pagesCompleted / totalPages) * 100,
      100
    );
    return {
      currentPage: pagesCompleted,
      totalPages,
      percentage: progressPercentage,
      pagesRead: pagesCompleted,
      pagesRemaining: totalPages - pagesCompleted,
    };
  };

  if (loading) {
    return (
      <View
        style={tw`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm`}
      >
        <IOSInlineLoader text="Loading Hifz progress..." />
      </View>
    );
  }

  if (!targetData) {
    // No data - show setup card
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Hifz')}
        style={tw`mb-4`}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3B82F6', '#2563EB', '#1D4ED8']}
          style={tw`rounded-2xl p-4`}
        >
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3`}
            >
              <Ionicons name="trophy" size={24} color="white" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-white font-bold text-lg`}>
                Set Daily Target
              </Text>
              <Text style={tw`text-white/90 text-sm`}>
                Track your daily Quran reading goal
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Show existing data
  const todayProgress = getTodayProgress();
  const streakInfo = getStreakInfo();
  const completionInfo = calculateCompletionInfo();
  const overallProgress = getOverallProgress();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Hifz')}
      style={tw`mb-0`}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#3B82F6', '#2563EB', '#1D4ED8']}
        style={tw`rounded-2xl p-4`}
      >
        {/* Header */}
        <View style={tw`flex-row items-center justify-between mb-3`}>
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3`}
            >
              <Ionicons name="trophy" size={20} color="white" />
            </View>
            <View>
              <Text style={tw`text-white font-bold text-lg`}>Daily Target</Text>
              <Text style={tw`text-white/90 text-sm`}>Pages Goal</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </View>

        {/* Overall Quran Progress */}
        <View style={tw`mb-3`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="book" size={16} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-semibold`}>Overall Progress</Text>
            </View>
            <Text style={tw`text-white font-semibold`}>
              {overallProgress.percentage.toFixed(1)}%
            </Text>
          </View>

          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-white/90 text-sm`}>
              Page {overallProgress.currentPage} of {overallProgress.totalPages}
            </Text>
            <Text style={tw`text-white/90 text-sm`}>
              {overallProgress.pagesRemaining} pages left
            </Text>
          </View>

          <View style={tw`bg-white/20 rounded-full h-3`}>
            <LinearGradient
              colors={['#ffffff', '#c4cccaff', '#d6d6d6ff']}
              style={[
                tw`rounded-full h-3`,
                { width: `${Math.max(overallProgress.percentage, 2)}%` },
              ]}
            />
          </View>
        </View>

        {/* Completion Date */}
        {completionInfo && (
          <View style={tw`bg-white/10 rounded-xl p-3 mb-1`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons
                  name="calendar"
                  size={16}
                  color="white"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-white/90 text-sm`}>Complete by:</Text>
              </View>
              <Text style={tw`text-white font-bold`}>
                {completionInfo.completionDate}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
