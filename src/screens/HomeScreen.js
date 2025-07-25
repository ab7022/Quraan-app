import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuranLogo } from '../components/QuranLogo';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import ContinueReading from '../components/ContinueReading';
import DailyRecommendations from '../components/DailyRecommendations';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadStreak, updateStreak } from '../store/streakSlice';
import * as Animatable from 'react-native-animatable';
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
        <Animatable.View animation={streak > 1 ? "pulse" : undefined} iterationCount="infinite">
          <TouchableOpacity
            onPress={handleStreakPress}
            style={tw`bg-green-100 dark:bg-green-900 rounded-xl px-4 py-4 shadow-lg`}
            accessibilityRole="button"
            accessibilityLabel="View daily reading streak"
          >
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons 
                  name="flame" 
                  size={32} 
                  color={streak > 1 ? "#ff6b6b" : "#4F8A10"} 
                  style={tw`mr-2`} 
                />
                <View>
                  <Text style={tw`text-lg font-bold text-green-800 dark:text-green-100`}>
                    {streak} Day{streak === 1 ? '' : 's'} 🔥
                  </Text>
                  <Text style={tw`text-sm text-green-700 dark:text-green-200`}>
                    {streak > 1 ? "You're on a roll! Keep going!" : "Start your journey today!"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={tw`flex-row mt-2 justify-center`}>
              {[...Array(7)].map((_, i) => (
                <Text key={i} style={tw`mx-1 text-lg`}>
                  {i < streak ? '🔥' : '⭐'}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        </Animatable.View>
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
        <Text style={tw`text-lg font-bold text-black dark:text-white mb-4`}>Quick Start</Text>
        <View style={tw`flex-row flex-wrap gap-3 mb-3`}>
          <TouchableOpacity
            onPress={handleQuranPress}
            style={tw`w-[48%] bg-green-100 dark:bg-green-900 rounded-xl p-4 items-center shadow-lg`}
            accessibilityLabel="Read Quran Page by Page"
            activeOpacity={0.88}
          >
            <Ionicons name="book-outline" size={32} color="#4F8A10" />
            <Text style={tw`mt-2 text-base font-semibold text-green-900 dark:text-green-100`}>Read Quran</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSurahsPress}
            style={tw`w-[48%] bg-blue-100 dark:bg-blue-900 rounded-xl p-4 items-center shadow-lg`}
            accessibilityLabel="Browse Surahs"
            activeOpacity={0.88}
          >
            <FontAwesome5 name="quran" size={32} color="#2563eb" />
            <Text style={tw`mt-2 text-base font-semibold text-blue-900 dark:text-blue-100`}>Surahs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleJuzPress}
            style={tw`w-[48%] bg-yellow-100 dark:bg-yellow-900 rounded-xl p-4 items-center shadow-lg`}
            accessibilityLabel="Browse Juz"
            activeOpacity={0.88}
          >
            <MaterialCommunityIcons name="bookmark-box-multiple" size={32} color="#eab308" />
            <Text style={tw`mt-2 text-base font-semibold text-yellow-900 dark:text-yellow-100`}>Juz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStreakPress}
            style={tw`w-[48%] bg-purple-100 dark:bg-purple-900 rounded-xl p-4 items-center shadow-lg`}
            accessibilityLabel="View Streak"
            activeOpacity={0.88}
          >
            <Ionicons name="trophy-outline" size={32} color="#7e22ce" />
            <Text style={tw`mt-2 text-base font-semibold text-purple-900 dark:text-purple-100`}>Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`w-[48%] bg-red-100 dark:bg-red-900 rounded-xl p-4 items-center shadow-lg`}
            accessibilityLabel="Learn Quran"
            activeOpacity={0.88}
          >
            <Ionicons name="school-outline" size={32} color="#dc2626" />
            <Text style={tw`mt-2 text-base font-semibold text-red-900 dark:text-red-100`}>Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`w-[48%] bg-teal-100 dark:bg-teal-900 rounded-xl p-4 items-center shadow-lg`}
            accessibilityLabel="Daily Azkar"
            activeOpacity={0.88}
          >
            <MaterialCommunityIcons name="moon-waning-crescent" size={32} color="#0d9488" />
            <Text style={tw`mt-2 text-base font-semibold text-teal-900 dark:text-teal-100`}>Azkar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress & Rewards Section */}
      <View style={tw`px-6 mt-4`}>
        <Text style={tw`text-lg font-bold text-black dark:text-white mb-4`}>Weekly Progress</Text>
        <View style={tw`bg-indigo-100 dark:bg-indigo-900 rounded-xl p-4 shadow-lg`}>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={tw`text-base font-semibold text-indigo-900 dark:text-indigo-100`}>
              Goal: 50 pages this week
            </Text>
            <View style={tw`bg-indigo-200 dark:bg-indigo-800 px-3 py-1 rounded-full`}>
              <Text style={tw`text-indigo-900 dark:text-indigo-100`}>23/50</Text>
            </View>
          </View>
          <View style={tw`bg-indigo-200 dark:bg-indigo-800 h-3 rounded-full overflow-hidden`}>
            <View style={tw`bg-indigo-500 w-[46%] h-full`} />
          </View>
          <View style={tw`flex-row justify-between mt-4`}>
            <View style={tw`items-center`}>
              <MaterialCommunityIcons name="star-circle" size={24} color="#4f46e5" />
              <Text style={tw`text-xs mt-1 text-indigo-900 dark:text-indigo-100`}>150 Points</Text>
            </View>
            <View style={tw`items-center`}>
              <MaterialCommunityIcons name="medal" size={24} color="#4f46e5" />
              <Text style={tw`text-xs mt-1 text-indigo-900 dark:text-indigo-100`}>5 Badges</Text>
            </View>
            <View style={tw`items-center`}>
              <MaterialCommunityIcons name="trophy" size={24} color="#4f46e5" />
              <Text style={tw`text-xs mt-1 text-indigo-900 dark:text-indigo-100`}>Level 3</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}
