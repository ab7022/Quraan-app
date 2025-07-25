import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { QuranLogo } from '../components/QuranLogo';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import SurahCard from '../components/SurahCard';
import ContinueReading from '../components/ContinueReading';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadStreak, updateStreak } from '../store/streakSlice';
import Shimmer from '../components/Shimmer';

const SUGGESTIONS = [
  { time: 'fajr', surahs: [36] }, // Yaseen
  { time: 'maghrib', surahs: [67, 56] }, // Mulk, Waqiah
  { day: 5, surahs: [18] }, // Friday: Kahf
];

function getCurrentSuggestions(surahs) {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  let suggested = [];
  if (day === 5) suggested.push(18); // Friday
  if (hour >= 4 && hour < 8) suggested.push(36); // Fajr
  if (hour >= 17 && hour < 21) suggested.push(67, 56); // Maghrib
  return surahs.filter(s => suggested.includes(s.number));
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const streak = useSelector(s => s.streak.streak);
  const [refreshing, setRefreshing] = useState(false);
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[HOME SCREEN] Component mounted');
    dispatch(loadStreak());
    loadSurahs();
    
    return () => {
      console.log('[HOME SCREEN] Component unmounting');
    };
  }, []);

  const handleStreakPress = () => {
    console.log('[HOME SCREEN] Streak button pressed, current streak:', streak);
    navigation.navigate('Streak');
  };

  const handleSurahPress = (surah) => {
    console.log('[HOME SCREEN] Surah card pressed:', surah.englishName, surah.number);
    navigation.navigate('Surahs', { surahId: surah.number, name: surah.englishName });
  };

  const handleQuranPress = () => {
    console.log('[HOME SCREEN] Quran button pressed');
    navigation.navigate('Quran');
  };

  const handleSurahsPress = () => {
    console.log('[HOME SCREEN] All Surahs button pressed');
    navigation.navigate('Surahs');
  };

  const handleJuzPress = () => {
    console.log('[HOME SCREEN] Juz button pressed');
    navigation.navigate('Juz');
  };

  const loadSurahs = async () => {
    console.log('[HOME SCREEN] Loading surahs from API');
    setLoading(true);
    try {
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const json = await res.json();
      if (json.code === 200) {
        console.log('[HOME SCREEN] Successfully loaded', json.data.length, 'surahs');
        setSurahs(json.data);
      } else {
        console.log('[HOME SCREEN] API returned error code:', json.code);
        setSurahs([]);
      }
    } catch (e) {
      console.error('[HOME SCREEN] Error loading surahs:', e);
      setSurahs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const suggestions = getCurrentSuggestions(surahs);

  return (
    <ScrollView
      style={tw`bg-white dark:bg-black flex-1`}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { 
          console.log('[HOME SCREEN] Pull to refresh triggered');
          setRefreshing(true); 
          loadSurahs(); 
        }} />
      }
      contentContainerStyle={tw`pb-8`}
    >
      <View style={tw`px-6 pt-7 mb-5 flex-row items-center`}> 
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
      
      <View style={tw`px-6 mb-2`}> 
        <Text style={tw`text-lg font-bold text-black dark:text-white mb-2`}>Smart Suggestions</Text>
        {loading ? (
          <Shimmer height={60} style={tw`mb-2`} />
        ) : suggestions.length ? (
          suggestions.map((s) => (
            <SurahCard
              key={s.number}
              surah={s}
              isSuggested
              onPress={() => handleSurahPress(s)}
            />
          ))
        ) : (
          <Text style={tw`text-gray-500 dark:text-gray-400`}>No suggestions at this time</Text>
        )}
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
  );
}
