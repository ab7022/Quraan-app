import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export default function JuzCard({ juz, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={tw`
        flex-row items-center justify-between bg-white dark:bg-gray-900 rounded-2xl px-5 py-4 mb-2 shadow-sm
        border border-gray-200 dark:border-gray-700`}
      accessibilityRole="button"
      accessibilityLabel={`Open Juz ${juz.juz_number}`}
      activeOpacity={0.85}
    >
      <View style={tw`flex-row items-center`}>
        <Ionicons name="list" size={26} color="#4F8A10" style={tw`mr-3`} />
        <View>
          <Text style={tw`text-lg font-semibold text-black dark:text-white`}>
            Juz {juz.juz_number}
          </Text>
          <Text style={tw`text-sm text-gray-500 dark:text-gray-400`}>
            Juz {juz.juz_number}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#4F8A10" />
    </TouchableOpacity>
  );
}
