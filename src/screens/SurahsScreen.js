import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import SurahCard from '../components/SurahCard';
import Shimmer from '../components/Shimmer';
import { useNavigation } from '@react-navigation/native';
import analytics from '../services/analyticsService';

// Mapping of Surah number to starting page in Mushaf
const surahToPageMapping = {
  1: 1,
  2: 2,
  3: 50,
  4: 77,
  5: 106,
  6: 128,
  7: 151,
  8: 177,
  9: 187,
  10: 208,
  11: 221,
  12: 235,
  13: 249,
  14: 255,
  15: 262,
  16: 267,
  17: 282,
  18: 293,
  19: 305,
  20: 312,
  21: 322,
  22: 332,
  23: 342,
  24: 350,
  25: 359,
  26: 367,
  27: 377,
  28: 385,
  29: 396,
  30: 404,
  31: 411,
  32: 415,
  33: 418,
  34: 428,
  35: 434,
  36: 440,
  37: 446,
  38: 453,
  39: 458,
  40: 467,
  41: 477,
  42: 483,
  43: 489,
  44: 496,
  45: 499,
  46: 502,
  47: 507,
  48: 511,
  49: 515,
  50: 518,
  51: 520,
  52: 523,
  53: 526,
  54: 528,
  55: 531,
  56: 534,
  57: 537,
  58: 542,
  59: 545,
  60: 549,
  61: 551,
  62: 553,
  63: 554,
  64: 556,
  65: 558,
  66: 560,
  67: 562,
  68: 564,
  69: 566,
  70: 568,
  71: 570,
  72: 572,
  73: 574,
  74: 575,
  75: 577,
  76: 578,
  77: 580,
  78: 582,
  79: 583,
  80: 585,
  81: 586,
  82: 587,
  83: 587,
  84: 589,
  85: 590,
  86: 591,
  87: 591,
  88: 592,
  89: 593,
  90: 594,
  91: 595,
  92: 595,
  93: 596,
  94: 596,
  95: 597,
  96: 597,
  97: 598,
  98: 598,
  99: 599,
  100: 599,
  101: 600,
  102: 600,
  103: 601,
  104: 601,
  105: 601,
  106: 602,
  107: 602,
  108: 602,
  109: 603,
  110: 603,
  111: 603,
  112: 604,
  113: 604,
  114: 604,
};

export default function SurahsScreen() {
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    // Track screen view
    analytics.trackScreenView('SurahsScreen', {
      total_surahs: 114,
    });

    fetchSurahs();
  }, []);

  async function fetchSurahs() {
    setLoading(true);
    try {
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const json = await res.json();
      if (json.code === 200) {
        setSurahs(json.data);
        setFilteredSurahs(json.data);
      } else {
        setSurahs([]);
        setFilteredSurahs([]);
      }
    } catch (e) {
      setSurahs([]);
      setFilteredSurahs([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSurahPress = surah => {
    const pageNumber = surahToPageMapping[surah.number] || 1;
    navigation.navigate('QuranPage', { initialPage: pageNumber });
  };

  const handleSearch = text => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter(
        surah =>
          surah.englishName.toLowerCase().includes(text.toLowerCase()) ||
          surah.name.includes(text) ||
          surah.englishNameTranslation
            .toLowerCase()
            .includes(text.toLowerCase()) ||
          surah.number.toString().includes(text)
      );
      setFilteredSurahs(filtered);
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: '#f2f2f7' }]}>
      <StatusBar backgroundColor="#f2f2f7" barStyle="dark-content" />

      {/* Apple-Style Header */}
      <View style={tw`px-4 pt-4 pb-4`}>
        <View style={tw`flex flex-row justify-between align-center items-center mb-2 pl-4`}>
          <Text style={[tw`text-3xl font-bold text-gray-700 mb-0`, { letterSpacing: -0.5 }]}>
            Surahs
          </Text>
          <Text style={tw`text-gray-500 text-base font-medium`}>
            114 Chapters
          </Text>
        </View>

        {/* Apple Search Bar */}
        <View style={[
          tw`bg-white rounded-2xl px-4 py-3 flex-row items-center mx-2`,
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }
        ]}>
          <Ionicons name="search" size={18} color="#8e8e93" style={tw`mr-3`} />
          <TextInput
            style={[tw`flex-1 text-gray-900 text-base`, { fontSize: 17 }]}
            placeholder="Search"
            placeholderTextColor="#8e8e93"
            value={searchText}
            onChangeText={handleSearch}
            selectionColor="#007AFF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={tw`ml-2`}>
              <Ionicons name="close-circle-outline" size={20} color="#8e8e93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Apple-Style Content */}
      <View style={tw`flex-1 px-4 mb-12`}>
        {loading ? (
          <View style={tw`flex-1`}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <View key={idx} style={[
                tw`bg-white rounded-2xl p-4 mb-3 mx-2`,
                {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }
              ]}>
                <Shimmer height={60} style={tw`rounded-xl`} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredSurahs}
            keyExtractor={(item, index) => `surah-${item.number || index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSurahPress(item)}
                style={tw`mb-3 mx-2`}
                activeOpacity={0.6}
              >
                <View style={[
                  tw`bg-white rounded-2xl overflow-hidden `,
                  {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }
                ]}>
                  <View style={tw`px-4 py-4 `}>
                    <View style={tw`flex-row items-center`}>
                      {/* Apple-Style Number Circle */}
                      <View style={[
                        tw`w-10 h-10 rounded-full items-center justify-center mr-4`,
                        { backgroundColor: '#007AFF' }
                      ]}>
                        <Text style={[tw`text-white font-semibold`, { fontSize: 15 }]}>
                          {item.number}
                        </Text>
                      </View>

                      {/* Content */}
                      <View style={tw`flex-1`}>
                        <View style={tw`flex-row items-center justify-between mb-1`}>
                          <Text style={[
                            tw`text-gray-900 font-semibold`,
                            { fontSize: 17, letterSpacing: -0.3 }
                          ]}>
                            {item.englishName}
                          </Text>
                          <Text style={tw`text-gray-400 text-sm font-medium`}>
                            {item.numberOfAyahs} verses
                          </Text>
                        </View>
                        
                        <View style={tw`flex-row items-center justify-between`}>
                          <Text style={tw`text-gray-500 text-sm font-medium`}>
                            {item.englishNameTranslation}
                          </Text>
                          <View style={tw`flex-row items-center`}>
                            <View style={[
                              tw`px-2 py-1 rounded-lg mr-2`,
                              { backgroundColor: item.revelationType === 'Meccan' ? '#fff3e0' : '#e8f5e8' }
                            ]}>
                              <Text style={[
                                tw`text-xs font-medium`,
                                { color: item.revelationType === 'Meccan' ? '#f57c00' : '#388e3c' }
                              ]}>
                                {item.revelationType === 'Meccan' ? 'Meccan' : 'Medinan'}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Arabic Name */}
                        <Text style={[
                          tw`text-gray-600 mt-2 text-right`,
                          { fontSize: 16, fontFamily: 'System' }
                        ]}>
                          {item.name}
                        </Text>
                      </View>

                      {/* Apple-Style Chevron */}
                      <View style={tw`ml-3`}>
                        <Ionicons name="chevron-forward" size={18} color="#c7c7cc" />
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-6`}
            ListEmptyComponent={
              searchText.length > 0 ? (
                <View style={tw`items-center justify-center py-16`}>
                  <View style={[
                    tw`w-16 h-16 rounded-full items-center justify-center mb-4`,
                    { backgroundColor: '#f2f2f7' }
                  ]}>
                    <Ionicons name="search-outline" size={32} color="#8e8e93" />
                  </View>
                  <Text style={[
                    tw`text-gray-900 font-semibold text-lg mb-2`,
                    { letterSpacing: -0.3 }
                  ]}>
                    No Results
                  </Text>
                  <Text style={tw`text-gray-500 text-center px-8`}>
                    Try a different search term or check your spelling.
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
