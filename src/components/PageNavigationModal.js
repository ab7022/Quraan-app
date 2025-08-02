import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

// iOS Settings Style Components
const SectionHeader = ({ title }) => (
  <View style={tw`px-4 py-2 bg-gray-100`}>
    <Text style={tw`text-sm text-gray-500 uppercase font-normal tracking-wide`}>
      {title}
    </Text>
  </View>
);

const SettingsItem = ({ 
  title, 
  subtitle, 
  onPress, 
  rightElement, 
  isSelected = false,
  showChevron = true 
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      tw`bg-white px-4 py-3 border-b border-gray-200`,
      isSelected && tw`bg-blue-50`
    ]}
    activeOpacity={0.3}
  >
    <View style={tw`flex-row items-center justify-between`}>
      <View style={tw`flex-1`}>
        <Text style={[
          tw`text-base text-black`,
          isSelected && tw`text-blue-500 font-medium`
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={tw`text-sm text-gray-500 mt-0.5`}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={tw`flex-row items-center`}>
        {rightElement}
        {showChevron && (
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color="#C7C7CC" 
            style={tw`ml-2`}
          />
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// Popular Quran pages with their corresponding Surahs
const FAMOUS_PAGES = [
  { page: 1, name: 'Al-Fatiha', description: 'The Opening' },
  { page: 2, name: 'Al-Baqarah', description: 'Beginning of The Cow' },
  { page: 49, name: 'Al-Imran', description: 'Family of Imran' },
  { page: 103, name: 'An-Nisa', description: 'The Women' },
  { page: 142, name: "Al-Ma'idah", description: 'The Table Spread' },
  { page: 182, name: "Al-An'am", description: 'The Cattle' },
  { page: 208, name: "Al-A'raf", description: 'The Heights' },
  { page: 262, name: 'At-Tawbah', description: 'The Repentance' },
  { page: 293, name: 'Yunus', description: 'Jonah' },
  { page: 337, name: 'Yusuf', description: 'Joseph' },
  { page: 368, name: 'Ibrahim', description: 'Abraham' },
  { page: 385, name: 'Al-Kahf', description: 'The Cave' },
  { page: 404, name: 'Maryam', description: 'Mary' },
  { page: 428, name: 'Al-Hajj', description: 'The Pilgrimage' },
  { page: 467, name: "Ash-Shu'ara", description: 'The Poets' },
  { page: 502, name: 'Al-Ahzab', description: 'The Confederates' },
  { page: 534, name: 'Ya-Sin', description: 'Ya Sin' },
  { page: 583, name: 'Al-Mulk', description: 'The Sovereignty' },
];

export default function PageNavigationModal({
  isVisible,
  onClose,
  currentPage,
  onPageSelect,
}) {
  const [searchText, setSearchText] = useState('');
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    if (isVisible) {
      setInputPage(currentPage.toString());
      setSearchText('');
    }
  }, [isVisible, currentPage]);

  const filteredPages = FAMOUS_PAGES.filter(
    item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase()) ||
      item.page.toString().includes(searchText)
  );

  const goToPage = () => {
    const pageNum = parseInt(inputPage);
    if (pageNum >= 1 && pageNum <= 604) {
      onPageSelect(pageNum);
      onClose();
    }
  };

  const handlePageSelect = (page) => {
    onPageSelect(page);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
        <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />
        
        {/* iOS-Style Navigation Header */}
        <View style={tw`bg-gray-100 border-b border-gray-200`}>
          <View style={tw`flex-row items-center justify-between px-4 py-3`}>
            <TouchableOpacity
              onPress={onClose}
              style={tw`py-1`}
              activeOpacity={0.3}
            >
              <Text style={tw`text-lg text-blue-500`}>Done</Text>
            </TouchableOpacity>

            <Text style={tw`text-lg font-semibold text-black`}>
              Go to Page
            </Text>

            <View style={tw`w-12`} />
          </View>
        </View>

        <ScrollView 
          style={tw`flex-1`}
          showsVerticalScrollIndicator={false}
        >
          {/* Direct Page Input Section */}
          <SectionHeader title="Jump to Page" />
          <View style={tw`bg-white`}>
            <View style={tw`px-4 py-3 border-b border-gray-200`}>
              <View style={tw`flex-row items-center gap-3`}>
                <View style={tw`flex-1 bg-gray-100 rounded-xl px-3 py-2`}>
                  <TextInput
                    style={tw`text-base text-black`}
                    value={inputPage}
                    onChangeText={setInputPage}
                    keyboardType="numeric"
                    placeholder="Page number (1-604)"
                    placeholderTextColor="#8E8E93"
                    maxLength={3}
                    returnKeyType="go"
                    onSubmitEditing={goToPage}
                  />
                </View>
                <TouchableOpacity
                  onPress={goToPage}
                  style={tw`bg-blue-500 px-4 py-2 rounded-xl`}
                  activeOpacity={0.8}
                >
                  <Text style={tw`text-white font-semibold`}>Go</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Navigation Section */}
          <SectionHeader title="Quick Jump" />
          <View style={tw`bg-white`}>
            <View style={tw`px-4 py-3 border-b border-gray-200`}>
              <View style={tw`flex-row flex-wrap gap-2`}>
                {[1, 50, 100, 200, 300, 400, 500, 600].map(page => (
                  <TouchableOpacity
                    key={page}
                    onPress={() => handlePageSelect(page)}
                    style={[
                      tw`px-3 py-2 rounded-xl`,
                      currentPage === page 
                        ? tw`bg-blue-500` 
                        : tw`bg-gray-100`
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        tw`text-sm font-medium`,
                        currentPage === page 
                          ? tw`text-white` 
                          : tw`text-black`
                      ]}
                    >
                      {page}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Search Section */}
          <SectionHeader title="Search Surah" />
          <View style={tw`bg-white`}>
            <View style={tw`px-4 py-3 border-b border-gray-200`}>
              <View style={tw`flex-row items-center bg-gray-100 rounded-xl px-3 py-2`}>
                <Ionicons
                  name="search"
                  size={16}
                  color="#8E8E93"
                  style={tw`mr-2`}
                />
                <TextInput
                  style={tw`flex-1 text-base text-black`}
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search Surah..."
                  placeholderTextColor="#8E8E93"
                  returnKeyType="search"
                />
              </View>
            </View>
          </View>

          {/* Famous Pages Section */}
          <SectionHeader title="Popular Pages" />
          <View style={tw`bg-white mb-4`}>
            {filteredPages.map((item, index) => (
              <SettingsItem
                key={item.page}
                title={item.name}
                subtitle={item.description}
                onPress={() => handlePageSelect(item.page)}
                isSelected={currentPage === item.page}
                rightElement={
                  <View style={tw`items-end`}>
                    <Text style={[
                      tw`text-base font-semibold`,
                      currentPage === item.page ? tw`text-blue-500` : tw`text-gray-500`
                    ]}>
                      Page {item.page}
                    </Text>
                    {currentPage === item.page && (
                      <Text style={tw`text-xs text-blue-500 mt-0.5`}>
                        Current
                      </Text>
                    )}
                  </View>
                }
                showChevron={false}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
