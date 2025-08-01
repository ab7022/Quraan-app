import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import Shimmer from '../components/Shimmer';
import { useDispatch } from 'react-redux';
import { updateStreak, saveLastReadPage } from '../store/streakSlice';

export default function SurahDetailScreen({ surahId, name, onBack }) {
  const [verses, setVerses] = useState([]);
  const [surahInfo, setSurahInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchVerses();
    // Save this as the last read page
    if (surahId && name) {
      dispatch(
        saveLastReadPage({
          type: 'surah',
          id: surahId,
          name: name,
          lastReadAt: new Date().toISOString(),
        })
      );
    }
  }, [surahId]);

  async function fetchVerses() {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani-quran-academy`
      );
      const json = await res.json();
      if (json.code === 200) {
        setSurahInfo(json.data);
        setVerses(json.data.ayahs);
        dispatch(updateStreak());
      } else {
        setVerses([]);
      }
    } catch (e) {
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={tw`flex-1 bg-white dark:bg-black`}>
      <View
        style={tw`flex-row items-center px-4 pt-7 pb-2 bg-white dark:bg-black`}
      >
        <TouchableOpacity
          onPress={onBack}
          style={tw`p-2 rounded-full bg-gray-100 dark:bg-gray-800 mr-3`}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#4F8A10" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-black dark:text-white`}>
          {surahInfo?.englishName || name}
        </Text>
      </View>
      {loading ? (
        <View style={tw`px-5 mt-3`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Shimmer key={i} height={36} style={tw`mb-2`} />
          ))}
        </View>
      ) : (
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`px-5 pb-10`}>
          <Text
            style={tw`text-center text-2xl font-bold text-green-900 dark:text-green-200 mb-4 mt-3`}
          >
            {surahInfo?.name}
          </Text>
          <Text
            style={tw`text-center text-base text-gray-700 dark:text-gray-300 mb-6`}
          >
            {surahInfo?.englishNameTranslation} | {surahInfo?.numberOfAyahs}{' '}
            Ayah
          </Text>
          {verses.map((v, index) => (
            <View
              key={`verse-${v.number || `${v.numberInSurah}-${index}`}`}
              style={tw`mb-6`}
            >
              <Text
                style={tw`text-xl font-semibold text-right text-black dark:text-white`}
              >
                {v.text}
              </Text>
              <Text
                style={tw`text-xs text-gray-500 dark:text-gray-400 text-right mt-1`}
              >
                Ayah {v.numberInSurah}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
