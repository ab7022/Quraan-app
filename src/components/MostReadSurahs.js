import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';
import analytics from '../services/analyticsService';

export default function MostReadSurahs({ navigation }) {
  const mostReadSurahs = [
    { name: "Al-Waqi'ah", page: 534, color: '#8B5CF6' },
    { name: 'Al-Muzammil', page: 574, color: '#059669' },
    { name: 'Ayat al-Kursi', page: 40, color: '#DC2626' },
    { name: 'Ar-Rahman', page: 531, color: '#EA580C' },
    { name: 'Yaseen', page: 440, color: '#7C3AED' },
    { name: 'Al-Mulk', page: 562, color: '#0284C7' },
    { name: 'As-Sajdah', page: 415, color: '#BE185D' },
  ];

  const handleSurahPress = (surah) => {
    console.log('[MOST READ] Navigating to surah:', surah.name, 'page:', surah.page);

    // Track navigation event
    analytics.trackNavigationEvent('HomeScreen', 'QuranPageScreen', 'most_read_surah');
    analytics.trackUserAction('read_popular_surah', { 
      surah_name: surah.name,
      page_number: surah.page,
      from_component: 'most_read'
    });

    navigation.navigate('Quran', {
      screen: 'QuranPage',
      params: { initialPage: surah.page },
    });
  };

  return (
    <View style={tw`px-6 mb-6`}>
      <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>
        Most Read
      </Text>
      <View
        style={tw`bg-white rounded-2xl p-3 shadow-sm border border-gray-100`}
      >
        <View style={tw`flex-row flex-wrap justify-between`}>
          {mostReadSurahs.map((surah, index) => (
            <TouchableOpacity
              key={surah.name}
              onPress={() => handleSurahPress(surah)}
              style={[
                tw`px-3 py-2 rounded-lg mb-2 mr-2`,
                { backgroundColor: surah.color + '15' },
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
  );
}
