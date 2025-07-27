import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const FriendsStreak = () => {
  return (
    <View style={tw`bg-white dark:bg-gray-800 rounded-xl p-6 items-center`}>
      <Ionicons name="people-outline" size={48} color="#9CA3AF" style={tw`mb-3`} />
      <Text style={tw`text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2`}>
        Friends Feature Coming Soon
      </Text>
      <Text style={tw`text-sm text-gray-500 dark:text-gray-500 text-center`}>
        Connect with friends and track reading progress together in future updates!
      </Text>
    </View>
  );
};

export default FriendsStreak;
