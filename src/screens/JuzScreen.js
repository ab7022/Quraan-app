import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, StatusBar } from 'react-native';
import tw from 'twrnc';
import JuzCard from '../components/JuzCard';
import Shimmer from '../components/Shimmer';
import { useNavigation } from '@react-navigation/native';
import analytics from '../services/analyticsService';

// Mapping of Juz number to starting page in Mushaf
const juzToPageMapping = {
  1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 122, 8: 142, 9: 162, 10: 182,
  11: 202, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
  21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502, 27: 522, 28: 542, 29: 562, 30: 582
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
          juz_number: i
        });
      }
      setJuzList(juzData);
    } catch (e) {
      setJuzList([]);
    } finally {
      setLoading(false);
    }
  }

  const handleJuzPress = (juz) => {
    const pageNumber = juzToPageMapping[juz.juz_number] || 1;
    navigation.navigate('QuranPage', { initialPage: pageNumber });
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-black`}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View style={tw`px-6 pt-4 pb-2 flex-1`}> 
        <Text style={tw`text-2xl font-bold text-black dark:text-white mb-4`}>Juz</Text>
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => <Shimmer key={idx} height={56} style={tw`mb-3`} />)
        ) : (
          <FlatList
            data={juzList}
            keyExtractor={(item, index) => `juz-${item.juz_number || index}`}
            renderItem={({ item }) => (
              <JuzCard
                juz={item}
                onPress={() => handleJuzPress(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
