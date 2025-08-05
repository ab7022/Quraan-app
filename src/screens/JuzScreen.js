import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import analytics from '../services/analyticsService';

const SectionHeader = ({ title }) => (
  <View style={tw`px-4 py-2 bg-gray-100`}>
    <Text style={tw`text-sm text-gray-500 uppercase font-normal tracking-wide`}>
      {title}
    </Text>
  </View>
);

const JuzItem = ({ item, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-white px-4 py-4 border-b border-gray-200`}
    activeOpacity={0.3}
  >
    <View style={tw`flex-row items-center`}>
      {/* Juz Number */}
      <View
        style={tw`w-12 h-12 rounded-lg bg-gray-100 items-center justify-center mr-3`}
      >
        <Text style={tw`text-lg font-semibold text-gray-700`}>
          {item.juz_number}
        </Text>
      </View>

      {/* Juz Info */}
      <View style={tw`flex-1`}>
        <Text style={tw`text-base font-medium text-black mb-1`}>
          Juz {item.juz_number}
        </Text>
        <Text style={tw`text-sm text-gray-500`}>
          Para {item.juz_number} • 20 pages
        </Text>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </View>
  </TouchableOpacity>
);

// Mapping of Juz number to starting page in Mushaf
const juzToPageMapping = {
  1: 1,
  2: 22,
  3: 42,
  4: 62,
  5: 82,
  6: 102,
  7: 122,
  8: 142,
  9: 162,
  10: 182,
  11: 202,
  12: 222,
  13: 242,
  14: 262,
  15: 282,
  16: 302,
  17: 322,
  18: 342,
  19: 362,
  20: 382,
  21: 402,
  22: 422,
  23: 442,
  24: 462,
  25: 482,
  26: 502,
  27: 522,
  28: 542,
  29: 562,
  30: 582,
};

export default function JuzScreen() {
  const [juzList, setJuzList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    // Track screen view
    analytics.trackScreenView('JuzScreen', {
      total_juz: 30,
    });

    fetchJuz();
  }, []);

  async function fetchJuz() {
    setLoading(true);
    try {
      // AlQuran.cloud API provides meta data for all 30 Juz
      const juzData = [];
      for (let i = 1; i <= 30; i++) {
        juzData.push({
          number: i,
          juz_number: i,
        });
      }
      setJuzList(juzData);
    } catch (e) {
      setJuzList([]);
    } finally {
      setLoading(false);
    }
  }

  const handleJuzPress = juz => {
    const pageNumber = juzToPageMapping[juz.juz_number] || 1;
    navigation.navigate('QuranPage', { initialPage: pageNumber });
  };

  // Helper function to get Juz description
  function getJuzDescription(juzNumber) {
    const descriptions = {
      1: 'Al-Fatihah & Al-Baqarah',
      2: 'Al-Baqarah continues',
      3: 'Al-Baqarah & Ali Imran',
      4: 'Ali Imran & An-Nisa',
      5: 'An-Nisa continues',
      6: 'An-Nisa & Al-Maidah',
      7: 'Al-Maidah & Al-Anam',
      8: 'Al-Anam & Al-Araf',
      9: 'Al-Araf & Al-Anfal',
      10: 'Al-Anfal & At-Tawbah',
      11: 'At-Tawbah & Yunus',
      12: 'Yunus & Hud',
      13: 'Hud & Yusuf',
      14: 'Yusuf & Ar-Rad',
      15: 'Ar-Rad & Ibrahim',
      16: 'Ibrahim & Al-Hijr',
      17: 'Al-Hijr & An-Nahl',
      18: 'An-Nahl & Al-Isra',
      19: 'Al-Isra & Al-Kahf',
      20: 'Al-Kahf & Maryam',
      21: 'Maryam & Ta-Ha',
      22: 'Ta-Ha & Al-Anbiya',
      23: 'Al-Anbiya & Al-Hajj',
      24: 'Al-Hajj & Al-Muminun',
      25: 'Al-Muminun & An-Nur',
      26: 'An-Nur & Al-Furqan',
      27: 'Al-Furqan & Ash-Shuara',
      28: 'Ash-Shuara & An-Naml',
      29: 'An-Naml & Al-Qasas',
      30: 'Al-Qasas to An-Nas',
    };

    return descriptions[juzNumber] || `Part ${juzNumber} of Quran`;
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <StatusBar backgroundColor="#f3f4f6" barStyle="dark-content" />

      {loading ? (
        <View style={tw`flex-1`}>
          <SectionHeader title="Loading Juz" />
          <View style={tw`bg-white border-t border-gray-200`}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <View key={idx} style={tw`px-4 py-4 border-b border-gray-200`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-12 h-12 rounded-lg bg-gray-200 mr-3`} />
                  <View style={tw`flex-1`}>
                    <View style={tw`h-4 bg-gray-200 rounded mb-2 w-2/3`} />
                    <View style={tw`h-3 bg-gray-200 rounded w-1/2`} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={tw`flex-1`}>
          <SectionHeader title="30 Juz Parts" />
          <FlatList
            data={juzList}
            keyExtractor={item => item.juz_number.toString()}
            renderItem={({ item }) => (
              <JuzItem item={item} onPress={() => handleJuzPress(item)} />
            )}
            style={tw`bg-white border-t border-gray-200`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-20`}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
