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

const SurahItem = ({ item, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-white px-4 py-4 border-b border-gray-200`}
    activeOpacity={0.3}
  >
    <View style={tw`flex-row items-center`}>
      {/* Surah Number */}
      <View
        style={tw`w-12 h-12 rounded-lg bg-gray-100 items-center justify-center mr-3`}
      >
        <Text style={tw`text-lg font-semibold text-gray-700`}>
          {item.number}
        </Text>
      </View>

      {/* Surah Info */}
      <View style={tw`flex-1`}>
        <Text style={tw`text-base font-medium text-black mb-1`}>
          {item.englishName}
        </Text>
        <Text style={tw`text-sm text-gray-500`}>
          {item.name} • {item.numberOfAyahs} verses
        </Text>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </View>
  </TouchableOpacity>
);

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
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <StatusBar backgroundColor="#f3f4f6" barStyle="dark-content" />

      {/* Search Section */}
      <View style={tw`px-4 py-3 bg-gray-100`}>
        <View
          style={tw`bg-white rounded-xl border border-gray-200 px-4 py-3 flex-row items-center`}
        >
          <Ionicons name="search" size={18} color="#8E8E93" style={tw`mr-3`} />
          <TextInput
            style={tw`flex-1 text-black text-base`}
            placeholder="Search Surahs"
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={handleSearch}
            selectionColor="#007AFF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={tw`ml-2`}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={tw`flex-1`}>
          <SectionHeader title="Loading Surahs" />
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
          <SectionHeader title={`${filteredSurahs.length} Surahs`} />
          <FlatList
            data={filteredSurahs}
            keyExtractor={item => item.number.toString()}
            renderItem={({ item }) => (
              <SurahItem item={item} onPress={() => handleSurahPress(item)} />
            )}
            style={tw`bg-white border-t border-gray-200`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-20`}
            ListEmptyComponent={
              searchText.length > 0 ? (
                <View style={tw`items-center justify-center py-16 px-4`}>
                  <View
                    style={tw`w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4`}
                  >
                    <Ionicons name="search" size={32} color="#8E8E93" />
                  </View>
                  <Text style={tw`text-lg font-semibold text-black mb-2`}>
                    No Results
                  </Text>
                  <Text style={tw`text-gray-500 text-center`}>
                    Try a different search term or check your spelling.
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}
