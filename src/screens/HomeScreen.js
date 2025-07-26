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
    <SafeAreaView style={tw`flex-1 bg-white`}>
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

      {/* Days of Week */}
      <View style={tw`px-6 mb-6`}>
        <View style={tw`flex-row justify-between`}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <TouchableOpacity 
              key={index}
              style={tw`w-10 h-10 rounded-full items-center justify-center ${
                index === new Date().getDay() 
                  ? 'bg-emerald-500' 
                  : 'bg-gray-100'
              }`}
            >
              <Text style={tw`font-medium text-sm ${
                index === new Date().getDay() ? 'text-white' : 'text-gray-600'
              }`}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
          
          {/* Surahs - Google Blue Gradient */}
          <TouchableOpacity
            onPress={handleSurahsPress}
            style={tw`w-[48%] rounded-2xl mb-3 shadow-lg`}
            accessibilityLabel="Browse Surahs"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#60A5FA', '#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`rounded-2xl p-4 items-center`}
            >
              <View style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3`}>
                <FontAwesome5 name="quran" size={20} color="white" />
              </View>
              <Text style={tw`text-sm font-semibold text-white`}>Surahs</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Juz - Google Orange/Red Gradient */}
          <TouchableOpacity
            onPress={handleJuzPress}
            style={tw`w-[48%] rounded-2xl mb-3 shadow-lg`}
            accessibilityLabel="Browse Juz"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FBBF24', '#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={tw`rounded-2xl p-4 items-center`}
            >
              <View style={tw`w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3`}>
                <MaterialCommunityIcons name="bookmark-box-multiple" size={24} color="white" />
              </View>
              <Text style={tw`text-sm font-semibold text-white`}>Juz</Text>
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
