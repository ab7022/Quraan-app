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
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Clean Header */}
      <View style={tw`bg-white px-6 py-4 mb-2`}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-2xl font-bold text-gray-900`}>
              Surah Collection
            </Text>
            <Text style={tw`text-base text-gray-600 mt-1`}>
              114 Chapters • Complete Quran
            </Text>
          </View>

          {/* Stats Card */}
          <View style={tw`bg-blue-100 px-4 py-3 rounded-xl`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="book-outline" size={18} color="#2563EB" />
              <Text style={tw`text-blue-700 font-bold text-lg ml-2`}>114</Text>
            </View>
            <Text style={tw`text-blue-600 text-xs font-medium`}>Surahs</Text>
          </View>
        </View>

        {/* Compact Search Bar */}
        <View style={tw`bg-gray-50 rounded-lg px-2 py-1 flex-row items-center`}>
          <Ionicons name="search" size={16} color="#6B7280" style={tw`mr-2`} />
          <TextInput
            style={tw`flex-1 text-gray-900 text-sm py-1`}
            placeholder="Search surahs..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={tw`flex-1 px-6`}>
        {loading ? (
          <View>
            {Array.from({ length: 6 }).map((_, idx) => (
              <View key={idx} style={tw`bg-gray-50 rounded-xl p-4 mb-3`}>
                <Shimmer height={70} style={tw`rounded-lg`} />
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
                          style={tw`w-14 h-14 bg-blue-500 rounded-xl items-center justify-center mr-4`}
                        >
                          <Text style={tw`text-white font-bold text-lg`}>
                            {item.number}
                          </Text>
                        </View>
                        <View style={tw`flex-1`}>
                          <Text
                            style={tw`text-gray-900 font-bold text-lg mb-1`}
                          >
                            {item.englishName}
                          </Text>
                          <Text style={tw`text-gray-700 text-base mb-1`}>
                            {item.name}
                          </Text>
                          <Text style={tw`text-gray-600 text-sm`}>
                            {item.englishNameTranslation}
                          </Text>
                        </View>
                      </View>

                      <View style={tw`flex-row items-center flex-wrap`}>
                        <View
                          style={tw`bg-purple-100 rounded-lg px-3 py-1 mr-2 mb-1`}
                        >
                          <Text style={tw`text-purple-700 text-xs font-medium`}>
                            {item.numberOfAyahs} Verses
                          </Text>
                        </View>
                        <View
                          style={tw`bg-green-100 rounded-lg px-3 py-1 mr-2 mb-1`}
                        >
                          <Text style={tw`text-green-700 text-xs font-medium`}>
                            {item.revelationType === 'Meccan'
                              ? '🕋 Meccan'
                              : '🕌 Medinan'}
                          </Text>
                        </View>
                        <View style={tw`bg-blue-100 rounded-lg px-3 py-1 mb-1`}>
                          <Text style={tw`text-blue-700 text-xs font-medium`}>
                            Page {surahToPageMapping[item.number]}
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
                        color="#2563EB"
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-6`}
            ListEmptyComponent={
              searchText.length > 0 ? (
                <View style={tw`bg-gray-50 rounded-xl p-8 items-center`}>
                  <Ionicons
                    name="search-outline"
                    size={48}
                    color="#9CA3AF"
                    style={tw`mb-4`}
                  />
                  <Text style={tw`text-gray-900 font-bold text-lg mb-2`}>
                    No Results Found
                  </Text>
                  <Text style={tw`text-gray-600 text-center`}>
                    Try searching with different keywords or check your spelling
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
