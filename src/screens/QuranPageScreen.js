import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import PageNavigationModal from '../components/PageNavigationModal';
import { useDispatch } from 'react-redux';
import { updateStreak } from '../store/streakSlice';

const { width, height } = Dimensions.get('window');

export default function QuranPageScreen({ route }) {
  console.log('[QURAN SCREEN] Component rendering, route params:', route?.params);
  
  const { initialPage } = route?.params || {};
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [totalPages] = useState(604); // Standard Mushaf has 604 pages
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('[QURAN SCREEN] Component mounted, initial page:', initialPage);
    return () => {
      console.log('[QURAN SCREEN] Component unmounting');
    };
  }, []);

  useEffect(() => {
    if (initialPage && initialPage !== currentPage) {
      console.log('[QURAN SCREEN] Updating current page from', currentPage, 'to', initialPage);
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  useEffect(() => {
    console.log('[QURAN SCREEN] Page changed to:', currentPage);
    setLoading(true);
    setImageError(false);
    dispatch(updateStreak());
  }, [currentPage]);

  // Generate SearchTruth.com image URL
  const getPageImageUrl = (pageNumber) => {
    // SearchTruth.com pattern: page 1 = 000010, page 2 = 000011, etc.
    const imageNumber = String(pageNumber + 9).padStart(6, '0');
    return `https://www.searchtruth.com/quran/images/images7/quran_tajwid_${imageNumber}.jpg`;
  };

  const goToPage = (page) => {
    console.log('[QURAN SCREEN] goToPage called with page:', page);
    if (page >= 1 && page <= totalPages) {
      console.log('[QURAN SCREEN] Navigating to page:', page);
      setCurrentPage(page);
    } else {
      console.log('[QURAN SCREEN] Invalid page number:', page, 'Total pages:', totalPages);
    }
  };

  const nextPage = () => {
    console.log('[QURAN SCREEN] Next page button pressed, current page:', currentPage);
    goToPage(currentPage + 1);
  };
  
  const prevPage = () => {
    console.log('[QURAN SCREEN] Previous page button pressed, current page:', currentPage);
    goToPage(currentPage - 1);
  };

  const handleImageLoad = () => {
    console.log('[QURAN SCREEN] Image loaded successfully for page:', currentPage);
    setLoading(false);
  };

  const handleImageError = () => {
    console.error('[QURAN SCREEN] Image failed to load for page:', currentPage);
    setLoading(false);
    setImageError(true);
  };

  const handleModalOpen = () => {
    console.log('[QURAN SCREEN] Navigation modal opened');
    setShowNavModal(true);
  };

  const handleModalClose = () => {
    console.log('[QURAN SCREEN] Navigation modal closed');
    setShowNavModal(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-amber-50 dark:bg-gray-900`}>
      <StatusBar backgroundColor="#FFFBEB" barStyle="dark-content" />
      
      {/* Header */}
      <View style={tw`px-4 py-3 bg-amber-50 dark:bg-gray-900 border-b border-amber-200 dark:border-gray-700`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity
            onPress={handleModalOpen}
            style={tw`flex-row items-center`}
          >
            <Text style={tw`text-lg font-bold text-amber-900 dark:text-amber-100`}>
              Page {currentPage}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#92400e" style={tw`ml-1`} />
          </TouchableOpacity>
          
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-sm text-amber-700 dark:text-amber-300 mr-3`}>
              {currentPage} / {totalPages}
            </Text>
            <TouchableOpacity
              onPress={handleModalOpen}
              style={tw`p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50`}
            >
              <Ionicons name="search" size={20} color="#92400e" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mushaf Page Image */}
      <View style={tw`flex-1 justify-center items-center px-2`}>
        {loading && (
          <View style={tw`absolute z-10 bg-white dark:bg-gray-800 rounded-lg p-4`}>
            <ActivityIndicator size="large" color="#92400e" />
            <Text style={tw`text-amber-800 dark:text-amber-200 mt-2 text-center`}>
              Loading page...
            </Text>
          </View>
        )}
        
        {imageError ? (
          <View style={tw`bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-800`}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" style={tw`mb-4 self-center`} />
            <Text style={tw`text-center text-gray-500 dark:text-gray-400 text-lg mb-2`}>
              صفحہ لوڈ نہیں ہو سکا
            </Text>
            <Text style={tw`text-center text-gray-400 dark:text-gray-500 text-sm mb-4`}>
              Unable to load Mushaf page
            </Text>
            <TouchableOpacity
              onPress={() => {
                console.log('[QURAN SCREEN] Retry button pressed for page:', currentPage);
                setImageError(false);
                setLoading(true);
              }}
              style={tw`px-4 py-2 bg-green-600 rounded-lg self-center`}
            >
              <Text style={tw`text-white font-medium`}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Image
            source={{ uri: getPageImageUrl(currentPage) }}
            style={{
              width: width - 16,
              height: height * 0.65,
              resizeMode: 'contain',
              backgroundColor: '#FFFBEB',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </View>

      {/* Navigation Controls */}
      <View style={tw`px-4 py-3 bg-amber-50 dark:bg-gray-900 border-t border-amber-200 dark:border-gray-700`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity
            onPress={prevPage}
            disabled={currentPage === 1}
            style={tw`flex-row items-center px-4 py-2 rounded-lg ${
              currentPage === 1 
                ? 'bg-gray-100 dark:bg-gray-800' 
                : 'bg-amber-100 dark:bg-amber-900'
            }`}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentPage === 1 ? '#9CA3AF' : '#92400e'} 
            />
            <Text style={tw`ml-1 text-sm font-medium ${
              currentPage === 1 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={tw`flex-row items-center`}>
            <TouchableOpacity
              onPress={() => goToPage(Math.max(1, currentPage - 10))}
              style={tw`px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 mx-1`}
            >
              <Text style={tw`text-xs text-gray-700 dark:text-gray-300`}>-10</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleModalOpen}
              style={tw`mx-3 px-4 py-2 bg-amber-200 dark:bg-amber-800 rounded-lg`}
            >
              <Text style={tw`text-lg font-bold text-amber-900 dark:text-amber-100`}>
                {currentPage}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => goToPage(Math.min(totalPages, currentPage + 10))}
              style={tw`px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 mx-1`}
            >
              <Text style={tw`text-xs text-gray-700 dark:text-gray-300`}>+10</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={nextPage}
            disabled={currentPage === totalPages}
            style={tw`flex-row items-center px-4 py-2 rounded-lg ${
              currentPage === totalPages 
                ? 'bg-gray-100 dark:bg-gray-800' 
                : 'bg-amber-100 dark:bg-amber-900'
            }`}
          >
            <Text style={tw`mr-1 text-sm font-medium ${
              currentPage === totalPages 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              Next
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={currentPage === totalPages ? '#9CA3AF' : '#92400e'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Modal */}
      <PageNavigationModal
        isVisible={showNavModal}
        onClose={handleModalClose}
        currentPage={currentPage}
        onPageSelect={(page) => {
          console.log('[QURAN SCREEN] Page selected from modal:', page);
          setCurrentPage(page);
        }}
      />
    </SafeAreaView>
  );
}
