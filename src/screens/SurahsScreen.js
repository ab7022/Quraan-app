import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import tw from 'twrnc';
import SurahCard from '../components/SurahCard';
import Shimmer from '../components/Shimmer';
import { useNavigation } from '@react-navigation/native';

// Mapping of Surah number to starting page in Mushaf
const surahToPageMapping = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518,
  51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542, 59: 545, 60: 549,
  61: 551, 62: 553, 63: 554, 64: 556, 65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568,
  71: 570, 72: 572, 73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585,
  81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594,
  91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602, 109: 603, 110: 603,
  111: 603, 112: 604, 113: 604, 114: 604
};

export default function SurahsScreen() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchSurahs();
  }, []);

  async function fetchSurahs() {
    setLoading(true);
    try {
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const json = await res.json();
      if (json.code === 200) {
        setSurahs(json.data);
      } else {
        setSurahs([]);
      }
    } catch (e) {
      setSurahs([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSurahPress = (surah) => {
    const pageNumber = surahToPageMapping[surah.number] || 1;
    navigation.navigate('QuranPage', { initialPage: pageNumber });
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-black`}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View style={tw`px-6 pt-4 pb-2 flex-1`}> 
        <Text style={tw`text-2xl font-bold text-black dark:text-white mb-4`}>Surahs</Text>
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => <Shimmer key={idx} height={56} style={tw`mb-3`} />)
        ) : (
          <FlatList
            data={surahs}
            keyExtractor={(item, index) => `surah-${item.number || index}`}
            renderItem={({ item }) => (
              <SurahCard
                surah={item}
                onPress={() => handleSurahPress(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
