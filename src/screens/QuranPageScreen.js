import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar, Image, ActivityIndicator, SafeAreaView, Animated, Easing, InteractionManager, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import tw from 'twrnc';
import PageNavigationModal from '../components/PageNavigationModal';
import { useDispatch } from 'react-redux';
import { updateStreak, saveLastReadPage } from '../store/streakSlice';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '../services/analyticsService';
import rateLimitService from '../services/rateLimitService';
import RateLimitStatus from '../components/RateLimitStatus';

const { width, height } = Dimensions.get('window');

export default function QuranPageScreen({ route }) {
  console.log('[QURAN SCREEN] Component rendering, route params:', route?.params);
  
  const navigation = useNavigation();
  const { initialPage } = route?.params || {};
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
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
        
        // Track swipe navigation
        analytics.trackUserAction('page_navigation', {
          direction: 'next',
          from_page: currentPage,
          to_page: currentPage + 1,
          method: 'swipe_right'
        });
        
        nextPage();
      } else if (translationX < 0 && velocityX <= 0) {
        // Swipe left - go to previous page
        console.log('[QURAN SCREEN] Swipe left detected - going to previous page');
        
        // Track swipe navigation
        analytics.trackUserAction('page_navigation', {
          direction: 'previous',
          from_page: currentPage,
          to_page: currentPage - 1,
          method: 'swipe_left'
        });
        
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

  // Language options - Most spoken languages in the world
  const languageOptions = [
    { code: 'english', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'arabic', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'urdu', name: 'Urdu', flag: '🇵🇰', nativeName: 'اردو' },
    { code: 'spanish', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'french', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'chinese', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
    { code: 'hindi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
    { code: 'portuguese', name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
    { code: 'russian', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'japanese', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'german', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'korean', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'turkish', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
    { code: 'italian', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
    { code: 'bengali', name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
    { code: 'persian', name: 'Persian', flag: '🇮🇷', nativeName: 'فارسی' },
    { code: 'malay', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
    { code: 'indonesian', name: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
  ];

  // Load saved language preference
  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('tafseer_language');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
        console.log('[QURAN SCREEN] Loaded saved language:', savedLanguage);
      }
    } catch (error) {
      console.error('[QURAN SCREEN] Error loading language preference:', error);
    }
  };

  const saveLanguagePreference = async (languageCode) => {
    try {
      await AsyncStorage.setItem('tafseer_language', languageCode);
      console.log('[QURAN SCREEN] Saved language preference:', languageCode);
    } catch (error) {
      console.error('[QURAN SCREEN] Error saving language preference:', error);
    }
  };

  const checkLanguageSelection = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('tafseer_language');
      if (!savedLanguage) {
        // First time user - show language selection
        setShowLanguageModal(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error('[QURAN SCREEN] Error checking language selection:', error);
      return true; // Continue with default if error
    }
  };

  const handleLanguageSelect = async (languageCode) => {
    try {
      console.log('[QURAN SCREEN] Language selected:', languageCode);
      
      // Track language selection
      const isFirstTime = selectedLanguage === 'english'; // Assuming default is English
      analytics.trackLanguageSelection(languageCode, isFirstTime);
      
      setSelectedLanguage(languageCode);
      await saveLanguagePreference(languageCode);
      setShowLanguageModal(false);
      
      console.log('[QURAN SCREEN] Language state updated to:', languageCode);
      
      // Now proceed with AI explanation, passing the language code directly
      await proceedWithAIExplanation(languageCode);
    } catch (error) {
      console.error('Error saving language preference:', error);
      Alert.alert('Error', 'Failed to save language preference. Please try again.');
    }
  };

  useEffect(() => {
    console.log('[QURAN SCREEN] Component mounted, initial page:', initialPage);
    
    // Track screen view
    analytics.trackScreenView('QuranPageScreen', {
      initial_page: initialPage,
      total_pages: 604,
    });
    
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
    
    // Track Quran page reading
    analytics.trackQuranReading(currentPage);
    
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
    InteractionManager.runAfterInteractions(() => {
      const slideDirection = isNext ? -width : width;
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 80, // much faster fade out
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(newPage);
        slideAnim.setValue(slideDirection * 0.3);
        fadeAnim.setValue(0);
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 120, // snappier
            friction: 18, // snappier
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 120, // much faster fade in
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
    
    // Track navigation
    analytics.trackUserAction('page_navigation', {
      direction: 'next',
      from_page: currentPage,
      to_page: currentPage + 1,
      method: 'button'
    });
    
    goToPage(currentPage + 1);
  };
  
  const prevPage = () => {
    if (isTransitioning) return; // Prevent multiple animations
    console.log('[QURAN SCREEN] Previous page button pressed, current page:', currentPage);
    
    // Track navigation
    analytics.trackUserAction('page_navigation', {
      direction: 'previous',
      from_page: currentPage,
      to_page: currentPage - 1,
      method: 'button'
    });
    
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

  // AI Tafseer functions
  const handleAIExplanation = async () => {
    // Check if user has selected language before
    const hasLanguage = await checkLanguageSelection();
    if (!hasLanguage) {
      // Language modal will show, and will call proceedWithAIExplanation after selection
      return;
    }
    
    // User has language preference, proceed directly
    proceedWithAIExplanation();
  };

  const proceedWithAIExplanation = async (languageCodeOverride = null) => {
    // Check rate limit before proceeding
    try {
      const rateLimitResult = await rateLimitService.checkRateLimit('quran/tafseer');
      
      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitService.getTimeUntilReset(rateLimitResult.resetTime);
        Alert.alert(
          'Rate Limit Exceeded',
          `You've reached the maximum number of AI Tafseer requests (${rateLimitResult.maxRequests}) for this hour. Please try again in ${resetTime}.`,
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Continue with request if rate limit check fails
    }

    setShowAIModal(true);
    setAiLoading(true);
    setAiResponse('');

    try {
      // Get the current page image URL
      const pageImageUrl = getPageImageUrl(currentPage);
      
      // Use the override language if provided, otherwise use the current state
      const currentLanguageCode = languageCodeOverride || selectedLanguage;
      
      // Get selected language name for the prompt
      const languageInfo = languageOptions.find(lang => lang.code === currentLanguageCode);
      const languageName = languageInfo ? languageInfo.name : 'English';
      
      // Track AI Tafseer request
      const startTime = Date.now();
      analytics.trackAITafseer(currentPage, currentLanguageCode);
      
      // Debug logging
      console.log('[QURAN SCREEN] Using language code:', currentLanguageCode);
      console.log('[QURAN SCREEN] Language override:', languageCodeOverride);
      console.log('[QURAN SCREEN] Selected language state:', selectedLanguage);
      console.log('[QURAN SCREEN] Language info found:', languageInfo);
      console.log('[QURAN SCREEN] Language name:', languageName);
      
      // Call your backend API with language preference
      const response = await fetch("https://api.devlop.app/quran/tafseer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageNumber: currentPage,
          pageImageUrl: pageImageUrl,
          mushafType: "standard_604_pages",
          linesPerPage: 15,
          language: currentLanguageCode,
          languageName: languageName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.tafseer) {
        // Record successful request for rate limiting
        await rateLimitService.recordRequest('quran/tafseer');
        
        setAiResponse(data.tafseer);
      } else {
        throw new Error(data.error || 'Failed to get tafseer');
      }
      
      setAiLoading(false);
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      setAiLoading(false);
      
      // Show user-friendly error message
      Alert.alert(
        'Connection Error', 
        'Unable to get explanation. Please check your internet connection and try again.',
        [
          { text: 'Close', onPress: () => setShowAIModal(false) },
          { text: 'Retry', onPress: proceedWithAIExplanation }
        ]
      );
    }
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
              height: height * 0.90, // Increased height to 85% for fuller coverage
              resizeMode: 'contain',
              backgroundColor: '#FFFBEB',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
       
      </Animated.View>
      </PanGestureHandler>




      {/* Compact Explain Button with Next/Prev */}
      <View style={tw`absolute bottom-6 left-0 right-0 flex-row items-center justify-center px-6`}>
        {/* Previous Page Button */}
        <TouchableOpacity
          onPress={currentPage < totalPages ? nextPage : undefined}
          disabled={currentPage >= totalPages}
          style={tw`bg-amber-200 rounded-full p-3 mr-3 ${currentPage >= totalPages ? 'opacity-40' : ''}`}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#92400e" />
        </TouchableOpacity>

        {/* Explain Button */}
        <TouchableOpacity
          onPress={handleAIExplanation}
          style={tw`rounded-full shadow-lg flex-1 mx-1`}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
            style={tw`py-3 px-6 rounded-full items-center justify-center flex-row`}
          >
            <Ionicons name="sparkles" size={16} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white font-semibold text-base`}>Explain</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Next Page Button */}
        <TouchableOpacity
          onPress={currentPage > 1 ? prevPage : undefined}
          disabled={currentPage <= 1}
          style={tw`bg-amber-200 rounded-full p-3 ml-3 ${currentPage <= 1 ? 'opacity-40' : ''}`}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={22} color="#92400e" />
        </TouchableOpacity>
      </View>

      {/* AI Explanation Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAIModal(false)}
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          {/* Modal Header */}
          <View style={tw`bg-white border-b border-gray-200 px-6 py-4`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center`}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={tw`w-10 h-10 rounded-full items-center justify-center mr-3`}
                >
                  <Ionicons name="sparkles" size={20} color="white" />
                </LinearGradient>
                <View>
                  <Text style={tw`text-xl font-bold text-gray-900`}>AI Tafseer</Text>
                  <Text style={tw`text-sm text-gray-600`}>Page {currentPage} Explanation</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowAIModal(false)}
                style={tw`w-8 h-8 rounded-full items-center justify-center bg-gray-100`}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal Content */}
          <ScrollView style={tw`flex-1 px-6 py-4`} showsVerticalScrollIndicator={false}>
            {aiLoading ? (
              <View style={tw`flex-1 items-center justify-center py-20`}>
                <View style={tw`bg-purple-50 rounded-full p-6 mb-6`}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
                <Text style={tw`text-lg font-semibold text-gray-800 mb-2`}>
                  Generating Explanation...
                </Text>
                <Text style={tw`text-gray-600 text-center`}>
                  AI is analyzing the verses and preparing a detailed Tafseer for you
                </Text>
                <View style={tw`flex-row items-center mt-4`}>
                  <Ionicons name="time-outline" size={16} color="#8B5CF6" />
                  <Text style={tw`text-purple-600 text-sm ml-1`}>This may take a few moments</Text>
                </View>
              </View>
            ) : aiResponse ? (
              <View>
                {/* Response Content with Markdown */}
                <Markdown
                  style={{
                    body: { fontSize: 16, lineHeight: 24, color: '#1f2937' },
                    heading1: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 12, marginTop: 8 },
                    heading2: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 10, marginTop: 12 },
                    heading3: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 10 },
                    paragraph: { marginBottom: 12, lineHeight: 22 },
                    strong: { fontWeight: 'bold', color: '#111827' },
                    em: { fontStyle: 'italic' },
                    list_item: { marginBottom: 6 },
                    bullet_list: { marginBottom: 12 },
                    ordered_list: { marginBottom: 12 },
                    code_inline: { 
                      backgroundColor: '#f3f4f6', 
                      paddingHorizontal: 4, 
                      paddingVertical: 2, 
                      borderRadius: 4,
                      fontSize: 14
                    },
                    blockquote: {
                      backgroundColor: '#f9fafb',
                      borderLeftWidth: 4,
                      borderLeftColor: '#8B5CF6',
                      paddingLeft: 16,
                      paddingVertical: 12,
                      marginVertical: 8,
                      fontStyle: 'italic'
                    },
                    hr: {
                      backgroundColor: '#e5e7eb',
                      height: 1,
                      marginVertical: 16
                    }
                  }}
                >
                  {aiResponse}
                </Markdown>
                
                {/* Disclaimer */}
                <View style={tw`bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6`}>
                  <View style={tw`flex-row items-start`}>
                    <Ionicons name="information-circle" size={20} color="#F59E0B" style={tw`mr-2 mt-0.5`} />
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-amber-800 font-semibold text-sm mb-1`}>
                        Important Note
                      </Text>
                      <Text style={tw`text-amber-700 text-sm leading-5`}>
                        This AI-generated explanation is for educational purposes. For authoritative 
                        interpretation, please consult qualified Islamic scholars and authentic Tafseer books.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={tw`flex-row gap-3 mt-6 mb-4`}>
                  <TouchableOpacity
                    onPress={handleAIExplanation}
                    style={tw`flex-1 bg-purple-600 py-3 rounded-xl`}
                  >
                    <Text style={tw`text-white font-semibold text-center`}>
                      Regenerate
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowAIModal(false)}
                    style={tw`flex-1 bg-gray-200 py-3 rounded-xl`}
                  >
                    <Text style={tw`text-gray-800 font-semibold text-center`}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={tw`flex-1 items-center justify-center py-20`}>
                <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                <Text style={tw`text-lg font-semibold text-gray-800 mt-4 mb-2`}>
                  Failed to Load
                </Text>
                <Text style={tw`text-gray-600 text-center mb-6`}>
                  Unable to generate explanation. Please try again.
                </Text>
                <TouchableOpacity
                  onPress={handleAIExplanation}
                  style={tw`bg-purple-600 px-6 py-3 rounded-xl`}
                >
                  <Text style={tw`text-white font-semibold`}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {}} // Prevent closing without selection
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          {/* Language Modal Header */}
          <View style={tw`bg-white border-b border-gray-200 px-6 py-4`}>
            <View style={tw`flex-row items-center justify-center`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-10 h-10 rounded-full items-center justify-center mr-3 bg-purple-100`}>
                  <Ionicons name="language" size={20} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={tw`text-xl font-bold text-gray-900`}>Choose Language</Text>
                  <Text style={tw`text-sm text-gray-600`}>Select your preferred language for Tafseer</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Language Options */}
          <ScrollView style={tw`flex-1 px-6 py-4`} showsVerticalScrollIndicator={false}>
            <Text style={tw`text-gray-700 text-center mb-6 leading-6`}>
              Please select your preferred language for AI Tafseer explanations. This will be saved for future use.
            </Text>
            
            <View style={tw`gap-3`}>
              {languageOptions.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleLanguageSelect(language.code)}
                  style={tw`flex-row items-center p-4 border border-gray-200 rounded-xl bg-gray-50 active:bg-gray-100`}
                  activeOpacity={0.7}
                >
                  <Text style={tw`text-2xl mr-4`}>{language.flag}</Text>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-lg font-semibold text-gray-900`}>
                      {language.name}
                    </Text>
                    <Text style={tw`text-sm text-gray-600`}>
                      {language.nativeName}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={tw`bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6 mb-4`}>
              <View style={tw`flex-row items-start`}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" style={tw`mr-2 mt-0.5`} />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-blue-800 font-semibold text-sm mb-1`}>
                    Language Preference
                  </Text>
                  <Text style={tw`text-blue-700 text-sm leading-5`}>
                    You can change this language anytime in settings. The AI will provide Tafseer explanations in your selected language.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
      
      {/* Rate Limit Status Component for debugging */}
      <RateLimitStatus />
    </SafeAreaView>
  );
}
