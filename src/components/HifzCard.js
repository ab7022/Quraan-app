import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HIFZ_STORAGE_KEY = 'hifz_tracker_data';
const TOTAL_QURAN_PAGES = 604;

export default function HifzCard({ navigation }) {
  const [hifzData, setHifzData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHifzData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHifzData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadHifzData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(HIFZ_STORAGE_KEY);
      if (savedData) {
        setHifzData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading hifz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!hifzData) return 0;
    return (hifzData.memorizedPages / hifzData.totalPages) * 100;
  };

  const calculateDailyTarget = () => {
    if (!hifzData || hifzData.choice === 'completed') return null;
    
    const today = new Date();
    const target = new Date(hifzData.targetDate);
    const daysRemaining = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    const pagesRemaining = hifzData.totalPages - hifzData.memorizedPages;
    
    if (daysRemaining <= 0) return { dailyPages: pagesRemaining, daysRemaining: 0 };
    
    const exactDaily = pagesRemaining / daysRemaining;
    
    // Smart rounding: if less than 1, round to nearest 0.25
    let displayDaily;
    if (exactDaily < 1) {
      displayDaily = Math.ceil(exactDaily * 4) / 4; // Round to nearest 0.25
    } else {
      displayDaily = Math.ceil(exactDaily); // Round up to whole number
    }
    
    return {
      dailyPages: displayDaily,
      daysRemaining
    };
  };

  const getTodayProgress = () => {
    if (!hifzData) return 0;
    const today = new Date().toISOString().split('T')[0];
    return hifzData.dailyProgress[today] || 0;
  };

  if (loading) {
    return (
      <View style={tw`bg-white rounded-2xl p-4 mb-4 border border-amber-200`}>
        <View style={tw`flex-row items-center`}>
          <View style={tw`w-12 h-12 bg-gray-200 rounded-full mr-3 animate-pulse`} />
          <View style={tw`flex-1`}>
            <View style={tw`h-4 bg-gray-200 rounded mb-2 animate-pulse`} />
            <View style={tw`h-3 bg-gray-200 rounded w-3/4 animate-pulse`} />
          </View>
        </View>
      </View>
    );
  }

  if (!hifzData) {
    // No data - show setup card
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Hifz')}
        style={tw`mb-4`}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#10b981', '#059669', '#047857']}
          style={tw`rounded-2xl p-4`}
        >
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3`}>
              <Ionicons name="book-outline" size={24} color="white" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-white font-bold text-lg`}>Start Hifz Journey</Text>
              <Text style={tw`text-white/90 text-sm`}>Track your Quran memorization</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Show existing data
  const progressPercentage = getProgressPercentage();
  const dailyTarget = calculateDailyTarget();
  const todayProgress = getTodayProgress();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Hifz')}
      style={tw`mb-4`}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        style={tw`rounded-2xl p-4`}
      >
        {/* Header */}
        <View style={tw`flex-row items-center justify-between mb-3`}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3`}>
              <Ionicons name="book" size={20} color="white" />
            </View>
            <View>
              <Text style={tw`text-white font-bold text-lg`}>Hifz Progress</Text>
              <Text style={tw`text-white/90 text-sm`}>
                {hifzData.choice === 'completed' ? 'Completed!' : 
                 hifzData.choice === 'memorizing' ? 'In Progress' : 'Planning'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </View>

        {/* Progress */}
        <View style={tw`mb-3`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-white font-semibold`}>
              {hifzData.memorizedPages} / {hifzData.totalPages} Pages
            </Text>
            <Text style={tw`text-white font-semibold`}>
              {progressPercentage.toFixed(1)}%
            </Text>
          </View>
          
          <View style={tw`bg-white/20 rounded-full h-2`}>
            <View 
              style={[
                tw`bg-white rounded-full h-2`,
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>

        {/* Daily Info */}
        {hifzData.choice !== 'completed' && dailyTarget && (
          <View style={tw`flex-row justify-between`}>
            <View style={tw`flex-1 mr-2`}>
              <Text style={tw`text-white/90 text-xs`}>Daily Target</Text>
              <Text style={tw`text-white font-semibold`}>{dailyTarget.dailyPages} pages</Text>
            </View>
            <View style={tw`flex-1 mx-1`}>
              <Text style={tw`text-white/90 text-xs`}>Today</Text>
              <Text style={tw`text-white font-semibold`}>{todayProgress} pages</Text>
            </View>
            <View style={tw`flex-1 ml-2`}>
              <Text style={tw`text-white/90 text-xs`}>Days Left</Text>
              <Text style={tw`text-white font-semibold`}>{dailyTarget.daysRemaining}</Text>
            </View>
          </View>
        )}

        {hifzData.choice === 'completed' && (
          <View style={tw`flex-row items-center justify-center`}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={tw`text-white font-semibold ml-2`}>
              Congratulations! Hifz Completed
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
