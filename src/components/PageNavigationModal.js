import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

// Popular Quran pages with their corresponding Surahs
const FAMOUS_PAGES = [
  { page: 1, name: "Al-Fatiha", description: "The Opening" },
  { page: 2, name: "Al-Baqarah", description: "Beginning of The Cow" },
  { page: 49, name: "Al-Imran", description: "Family of Imran" },
  { page: 103, name: "An-Nisa", description: "The Women" },
  { page: 142, name: "Al-Ma'idah", description: "The Table Spread" },
  { page: 182, name: "Al-An'am", description: "The Cattle" },
  { page: 208, name: "Al-A'raf", description: "The Heights" },
  { page: 262, name: "At-Tawbah", description: "The Repentance" },
  { page: 293, name: "Yunus", description: "Jonah" },
  { page: 337, name: "Yusuf", description: "Joseph" },
  { page: 368, name: "Ibrahim", description: "Abraham" },
  { page: 385, name: "Al-Kahf", description: "The Cave" },
  { page: 404, name: "Maryam", description: "Mary" },
  { page: 428, name: "Al-Hajj", description: "The Pilgrimage" },
  { page: 467, name: "Ash-Shu'ara", description: "The Poets" },
  { page: 502, name: "Al-Ahzab", description: "The Confederates" },
  { page: 534, name: "Ya-Sin", description: "Ya Sin" },
  { page: 583, name: "Al-Mulk", description: "The Sovereignty" },
];

export default function PageNavigationModal({ isVisible, onClose, currentPage, onPageSelect }) {
  const [searchText, setSearchText] = useState('');
  const [inputPage, setInputPage] = useState(currentPage.toString());

  const filteredPages = FAMOUS_PAGES.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const goToPage = () => {
    const pageNum = parseInt(inputPage);
    if (pageNum >= 1 && pageNum <= 604) {
      onPageSelect(pageNum);
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-white dark:bg-black`}>
        {/* Header */}
        <View style={tw`px-4 pt-12 pb-4 border-b border-gray-200 dark:border-gray-700`}>
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <Text style={tw`text-xl font-bold text-black dark:text-white`}>
              Navigate to Page
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Page Input */}
          <View style={tw`flex-row items-center mb-4`}>
            <View style={tw`flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 mr-3`}>
              <TextInput
                style={tw`flex-1 text-black dark:text-white text-lg`}
                value={inputPage}
                onChangeText={setInputPage}
                keyboardType="numeric"
                placeholder="Page number (1-604)"
                placeholderTextColor="#9CA3AF"
                maxLength={3}
              />
            </View>
            <TouchableOpacity
              onPress={goToPage}
              style={tw`bg-green-600 px-4 py-2 rounded-lg`}
            >
              <Text style={tw`text-white font-semibold`}>Go</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={tw`flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2`}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={tw`mr-2`} />
            <TextInput
              style={tw`flex-1 text-black dark:text-white`}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search Surah..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Quick Navigation */}
        <View style={tw`px-4 py-3 border-b border-gray-200 dark:border-gray-700`}>
          <Text style={tw`text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2`}>
            Quick Jump
          </Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {[1, 50, 100, 200, 300, 400, 500, 600].map(page => (
              <TouchableOpacity
                key={page}
                onPress={() => {
                  onPageSelect(page);
                  onClose();
                }}
                style={tw`px-3 py-1 rounded-full ${
                  currentPage === page 
                    ? 'bg-green-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text style={tw`text-sm font-medium ${
                  currentPage === page 
                    ? 'text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {page}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Famous Pages List */}
        <FlatList
          data={filteredPages}
          keyExtractor={(item) => item.page.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onPageSelect(item.page);
                onClose();
              }}
              style={tw`px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${
                currentPage === item.page ? 'bg-green-50 dark:bg-green-900/20' : ''
              }`}
            >
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg font-semibold text-black dark:text-white`}>
                    {item.name}
                  </Text>
                  <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>
                    {item.description}
                  </Text>
                </View>
                <View style={tw`items-end`}>
                  <Text style={tw`text-lg font-bold text-green-600 dark:text-green-400`}>
                    {item.page}
                  </Text>
                  {currentPage === item.page && (
                    <Text style={tw`text-xs text-green-600 dark:text-green-400`}>
                      Current
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}
