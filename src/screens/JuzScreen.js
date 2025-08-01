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
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: '#f2f2f7' }]}>
      <StatusBar backgroundColor="#f2f2f7" barStyle="dark-content" />

      <View style={tw`px-4 pt-4 pb-4`}>
        <View
          style={tw`flex flex-row justify-between align-center items-center mb-1 pl-4`}
        >
          <Text
            style={[
              tw`text-3xl font-bold text-gray-700 mb-0`,
              { letterSpacing: -0.5 },
            ]}
          >
            Juz
          </Text>
          <Text style={tw`text-gray-500 text-base font-medium`}>30 Parts</Text>
        </View>
      </View>

      {/* Apple-Style Content */}
      <View style={tw`flex-1 px-4 mb-12`}>
        {loading ? (
          <View style={tw`flex-1`}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <View
                key={idx}
                style={[
                  tw`bg-white rounded-2xl p-4 mb-3 mx-2`,
                  {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  },
                ]}
              >
                <Shimmer height={60} style={tw`rounded-xl`} />
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
                style={tw`mb-3 mx-2`}
                activeOpacity={0.6}
              >
                <View
                  style={[
                    tw`bg-white  rounded-2xl overflow-hidden`,
                    {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    },
                  ]}
                >
                  <View style={tw`px-4 py-4`}>
                    <View style={tw`flex-row items-center`}>
                      {/* Apple-Style Number Circle */}
                      <View
                        style={[
                          tw`w-10 h-10 rounded-full items-center justify-center mr-4`,
                          { backgroundColor: '#34c759' },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-white font-semibold`,
                            { fontSize: 15 },
                          ]}
                        >
                          {item.juz_number}
                        </Text>
                      </View>

                      {/* Content */}
                      <View style={tw`flex-1`}>
                        <View
                          style={tw`flex-row items-center justify-between mb-1`}
                        >
                          <Text
                            style={[
                              tw`text-gray-900 font-semibold`,
                              { fontSize: 17, letterSpacing: -0.3 },
                            ]}
                          >
                            Juz {item.juz_number}
                          </Text>
                          <Text style={tw`text-gray-400 text-sm font-medium`}>
                            Page {juzToPageMapping[item.juz_number]}
                          </Text>
                        </View>

                        <Text style={tw`text-gray-500 text-sm font-medium`}>
                          {getJuzDescription(item.juz_number)}
                        </Text>

                        <View style={tw`flex-row items-center mt-2`}>
                          <View
                            style={[
                              tw`px-2 py-1 rounded-lg`,
                              { backgroundColor: '#e3f2fd' },
                            ]}
                          >
                            <Text
                              style={[
                                tw`text-xs font-medium`,
                                { color: '#1976d2' },
                              ]}
                            >
                              Part {item.juz_number}/30
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Apple-Style Chevron */}
                      <View style={tw`ml-3`}>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#c7c7cc"
                        />
                      </View>
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
