import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function SurahCard({ surah, onPress, isSuggested = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tw`
        flex-row items-center justify-between bg-white dark:bg-gray-900 rounded-lg px-3 py-2 mb-1 shadow-sm
        ${isSuggested ? 'border-2 border-green-600' : 'border border-gray-200 dark:border-gray-700'}`}
      accessibilityRole="button"
      accessibilityLabel={`Open Surah ${surah.englishName}`}
      activeOpacity={0.8}
    >
      <View style={tw`flex-row items-center`}>
        <Ionicons
          name="book"
          size={18}
          color={isSuggested ? '#4F8A10' : '#6b7280'}
          style={tw`mr-2`}
        />
        <View>
          <Text style={tw`text-base font-semibold text-black dark:text-white`}>
            {surah.englishName}{' '}
            <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
              ({surah.name})
            </Text>
          </Text>
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
            {surah.englishNameTranslation} • {surah.numberOfAyahs} Ayah
          </Text>
        </View>
      </View>
      {isSuggested && (
        <View style={tw`bg-green-100 px-2 py-0.5 rounded-full`}>
          <Text style={tw`text-green-800 text-xs font-bold`}>Suggested</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
