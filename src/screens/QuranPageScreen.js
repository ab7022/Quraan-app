import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar, Image, ActivityIndicator, SafeAreaView, Animated, Easing, InteractionManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import tw from 'twrnc';
import PageNavigationModal from '../components/PageNavigationModal';
import { useDispatch } from 'react-redux';
import { updateStreak, saveLastReadPage } from '../store/streakSlice';

const { width, height } = Dimensions.get('window');

export default function QuranPageScreen({ route }) {
  console.log('[QURAN SCREEN] Component rendering, route params:', route?.params);
  
  const navigation = useNavigation();
  const { initialPage } = route?.params || {};
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [totalPages] = useState(604); // Standard Mushaf has 604 pages
  const [preloadedPages, setPreloadedPages] = useState(new Set()); // Track preloaded pages
  const [isTransitioning, setIsTransitioning] = useState(false); // Prevent multiple transitions
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Swipe gesture handling
  const onGestureEvent = (event) => {
    const { translationX, velocityX } = event.nativeEvent;
    
    // More sensitive swipe detection
    const minSwipeDistance = width * 0.2; // Reduced to 20% for easier swiping
    const minVelocity = 300; // Reduced threshold for faster response
    
    if (Math.abs(translationX) > minSwipeDistance || Math.abs(velocityX) > minVelocity) {
      if (translationX > 0 && velocityX >= 0) {
        // Swipe right - go to next page
        console.log('[QURAN SCREEN] Swipe right detected - going to next page');
        nextPage();
      } else if (translationX < 0 && velocityX <= 0) {
        // Swipe left - go to previous page
        console.log('[QURAN SCREEN] Swipe left detected - going to previous page');
        prevPage();
      }
    }
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      onGestureEvent(event);
    }
  };
  
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('[QURAN SCREEN] Component mounted, initial page:', initialPage);
    
    // Reset animation values to default
    slideAnim.setValue(0);
    fadeAnim.setValue(1);

    // Update streak when component mounts
    dispatch(updateStreak());
    
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
    
    // Only set loading if we're not in a transition (direct page change)
    if (!isTransitioning) {
      if (preloadedPages.has(currentPage)) {
        console.log('[QURAN SCREEN] Using preloaded page, instant display');
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
    
    setImageError(false);
    dispatch(updateStreak());
    
    // Save current page as last read
    dispatch(saveLastReadPage({
      type: 'page',
      id: currentPage,
      name: `Page ${currentPage}`,
      pageNumber: currentPage,
      lastReadAt: new Date().toISOString()
    }));
    
    // Preload adjacent pages for smooth navigation
    preloadAdjacentPages(currentPage);
  }, [currentPage]);

  // Generate SearchTruth.com image URL
  const getPageImageUrl = (pageNumber) => {
    // SearchTruth.com pattern: page 1 = 000010, page 2 = 000011, etc.
    const imageNumber = String(pageNumber + 9).padStart(6, '0');
    return `https://www.searchtruth.com/quran/images/images7/quran_tajwid_${imageNumber}.jpg`;
  };

  // Preload pages for instant navigation
  const preloadPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || preloadedPages.has(pageNumber)) {
      return; // Skip if invalid or already preloaded
    }

    console.log('[QURAN SCREEN] Preloading page:', pageNumber);
    const imageUrl = getPageImageUrl(pageNumber);
    
    // Use React Native's Image.prefetch for caching
    Image.prefetch(imageUrl)
      .then(() => {
        console.log('[QURAN SCREEN] Successfully preloaded page:', pageNumber);
        setPreloadedPages(prev => new Set([...prev, pageNumber]));
      })
      .catch((error) => {
        console.warn('[QURAN SCREEN] Failed to preload page:', pageNumber, error);
      });
  };

  // Preload adjacent pages (2 before + 2 after current page)
  const preloadAdjacentPages = (centerPage) => {
    const pagesToPreload = [];
    
    // Add 2 pages before and after
    for (let i = -2; i <= 2; i++) {
      const pageNum = centerPage + i;
      if (pageNum >= 1 && pageNum <= totalPages) {
        pagesToPreload.push(pageNum);
      }
    }
    
    // Preload pages that aren't already cached
    pagesToPreload.forEach(pageNum => {
      if (!preloadedPages.has(pageNum)) {
        // Add small delay between preloads to avoid overwhelming the server
        setTimeout(() => preloadPage(pageNum), Math.abs(pageNum - centerPage) * 200);
      }
    });
  };

  const goToPage = (page) => {
    console.log('[QURAN SCREEN] goToPage called with page:', page);
    if (page >= 1 && page <= totalPages && !isTransitioning) {
      console.log('[QURAN SCREEN] Navigating to page:', page);
      
      // Determine animation direction
      const isNext = page > currentPage;
      animatePageTransition(page, isNext);
    } else {
      console.log('[QURAN SCREEN] Invalid page number or transition in progress:', page, 'Total pages:', totalPages);
    }
  };

  const animatePageTransition = (newPage, isNext) => {
    setIsTransitioning(true);
    
    // Use InteractionManager to ensure smooth animation performance
    InteractionManager.runAfterInteractions(() => {
      // Correct slide direction: swipe right = page comes from left (negative), swipe left = page comes from right (positive)
      const slideDirection = isNext ? -width : width;
      
      // Smooth fade out current page
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200, // Longer fade out for more visible effect
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // Instantly change page and position
        setCurrentPage(newPage);
        slideAnim.setValue(slideDirection * 0.3); // Start further for more dramatic entrance
        fadeAnim.setValue(0); // Start completely transparent
        
        // Smooth fade in and slide animation
        Animated.parallel([
          // Spring slide to center - very smooth and natural
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 80, // Slightly lower tension for smoother feel
            friction: 12, // Higher friction for controlled motion
            useNativeDriver: true,
          }),
          // Smooth fade in with easing
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300, // Longer fade in for smooth appearance
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsTransitioning(false);
        });
      });
    });
  };

  const nextPage = () => {
    if (isTransitioning) return; // Prevent multiple animations
    console.log('[QURAN SCREEN] Next page button pressed, current page:', currentPage);
    goToPage(currentPage + 1);
  };
  
  const prevPage = () => {
    if (isTransitioning) return; // Prevent multiple animations
    console.log('[QURAN SCREEN] Previous page button pressed, current page:', currentPage);
    goToPage(currentPage - 1);
  };

  const handleImageLoad = () => {
    console.log('[QURAN SCREEN] Image loaded successfully for page:', currentPage);
    setLoading(false);
    // Mark page as preloaded for future instant navigation
    setPreloadedPages(prev => new Set([...prev, currentPage]));
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

  const handleBackPress = () => {
    console.log('[QURAN SCREEN] Back button pressed, navigating to Juz List');
    navigation.navigate('Quran', { 
      screen: 'QuranTabs', 
      params: { screen: 'JuzList' } 
    });
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-amber-50 dark:bg-gray-900`}>
      <StatusBar backgroundColor="#FFFBEB" barStyle="dark-content" />
      
      {/* Header */}
      <View style={tw`px-4 py-3 bg-amber-50 dark:bg-gray-900 border-b border-amber-200 dark:border-gray-700`}>
        <View style={tw`flex-row items-center justify-between`}>
          {/* Back Button with Text */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Quran', { screen: 'QuranTabs', params: { screen: 'JuzList' } })}
            style={tw`flex-row items-center py-2`}
            accessibilityLabel="Go Back to Juz List"
          >
            <Ionicons name="arrow-back" size={24} color="#92400e" />
            <Text style={tw`text-lg font-semibold text-amber-900 dark:text-amber-100 ml-2`}>
              Back
            </Text>
          </TouchableOpacity>
          
          {/* Page Title and Navigation */}
          <TouchableOpacity
            onPress={handleModalOpen}
            style={tw`flex-row items-center`}
          >
            <Text style={tw`text-lg font-bold text-amber-900 dark:text-amber-100`}>
              Page {currentPage}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#92400e" style={tw`ml-1`} />
          </TouchableOpacity>
          
          {/* Page Counter and Search */}
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

      {/* Mushaf Page Image with Page Turn Animation and Swipe Gestures */}
      <PanGestureHandler 
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        minDist={30}
      >
        <Animated.View 
          style={[
            tw`flex-1 justify-center items-center`,
            {
              transform: [
                { translateX: slideAnim }
              ],
              opacity: fadeAnim,
            }
          ]}
        >
        {loading && !isTransitioning && (
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
              width: width,
              height: height * 0.80, // Increased height to 85% for fuller coverage
              resizeMode: 'contain',
              backgroundColor: '#FFFBEB',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
       
      </Animated.View>
      </PanGestureHandler>

      {currentPage > 1 && !isTransitioning && (
        <TouchableOpacity
          onPress={nextPage}
          style={[
            tw`absolute top-0 left-0 w-16 justify-center items-center bg-transparent`,
            { height: height * 0.85, marginTop: 80 } // Match image height and header offset
          ]}
          activeOpacity={0.1}
        >
          <View style={tw`bg-black/20 rounded-full p-3`}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </View>
        </TouchableOpacity>
      )}

      {/* Right Side Button (Next Page) */}
      {currentPage < totalPages && !isTransitioning && (
        <TouchableOpacity
          onPress={prevPage}
          style={[
            tw`absolute top-0 right-0 w-16 justify-center items-center bg-transparent`,
            { height: height * 0.85, marginTop: 80 } // Match image height and header offset
          ]}
          activeOpacity={0.1}
        >
          <View style={tw`bg-black/20 rounded-full p-3`}>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </View>
        </TouchableOpacity>
      )}

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
