import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import JuzCard from '../components/JuzCard';
import Shimmer from '../components/Shimmer';
import { useNavigation } from '@react-navigation/native';
import analytics from '../services/analyticsService';

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

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Clean Header */}
      <View style={tw`bg-white px-6 py-4 mb-2`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-2xl font-bold text-gray-900`}>
              Juz Collection
            </Text>
            <Text style={tw`text-base text-gray-600 mt-1`}>
              30 Parts • Complete Quran Division
            </Text>
          </View>

          {/* Stats Card */}
          <View style={tw`bg-green-100 px-4 py-3 rounded-xl`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="library-outline" size={18} color="#059669" />
              <Text style={tw`text-green-700 font-bold text-lg ml-2`}>30</Text>
            </View>
            <Text style={tw`text-green-600 text-xs font-medium`}>
              Total Juz
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={tw`flex-1 px-6`}>
        {loading ? (
          <View>
            {Array.from({ length: 6 }).map((_, idx) => (
              <View key={idx} style={tw`bg-gray-50 rounded-xl p-4 mb-3`}>
                <Shimmer height={60} style={tw`rounded-lg`} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={juzList}
            keyExtractor={(item, index) => `juz-${item.juz_number || index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleJuzPress(item)}
                style={tw`mb-3`}
                activeOpacity={0.7}
              >
                <View
                  style={tw`bg-white rounded-xl p-5 border border-gray-200`}
                >
                  <View style={tw`flex-row items-center justify-between`}>
                    {/* Left Content */}
                    <View style={tw`flex-1 mr-4`}>
                      <View style={tw`flex-row items-center mb-3`}>
                        <View
                          style={tw`w-12 h-12 bg-green-500 rounded-xl items-center justify-center mr-4`}
                        >
                          <Text style={tw`text-white font-bold text-lg`}>
                            {item.juz_number}
                          </Text>
                        </View>
                        <View style={tw`flex-1`}>
                          <Text
                            style={tw`text-gray-900 font-bold text-lg mb-1`}
                          >
                            Juz {item.juz_number}
                          </Text>
                          <Text style={tw`text-gray-600 text-sm`}>
                            {getJuzDescription(item.juz_number)}
                          </Text>
                        </View>
                      </View>

                      <View style={tw`flex-row items-center flex-wrap`}>
                        <View
                          style={tw`bg-blue-100 rounded-lg px-3 py-1 mr-2 mb-1`}
                        >
                          <Text style={tw`text-blue-700 text-xs font-medium`}>
                            Page {juzToPageMapping[item.juz_number]}
                          </Text>
                        </View>
                        <View
                          style={tw`bg-purple-100 rounded-lg px-3 py-1 mr-2 mb-1`}
                        >
                          <Text style={tw`text-purple-700 text-xs font-medium`}>
                            📖 Verses
                          </Text>
                        </View>
                        <View
                          style={tw`bg-green-100 rounded-lg px-3 py-1 mb-1`}
                        >
                          <Text style={tw`text-green-700 text-xs font-medium`}>
                            🕊️ Part {item.juz_number}/30
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Right Arrow */}
                    <View
                      style={tw`w-12 h-12 bg-gray-50 rounded-xl items-center justify-center`}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#059669"
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-6`}
          />
        )}
      </View>
    </SafeAreaView>
  );

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
}
