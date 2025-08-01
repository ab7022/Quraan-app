import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Easing,
  InteractionManager,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
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
import { getMushafStyle, getMushafImageUrl } from '../services/mushafService';

const { width, height } = Dimensions.get('window');

export default function QuranPageScreen({ route }) {
  console.log(
    '[QURAN SCREEN] Component rendering, route params:',
    route?.params
  );

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
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [totalPages] = useState(604); // Standard Mushaf has 604 pages
  const [preloadedPages, setPreloadedPages] = useState(new Set()); // Track preloaded pages
  const [isTransitioning, setIsTransitioning] = useState(false); // Prevent multiple transitions
  const [mushafStyle, setMushafStyle] = useState(9); // Default to style 9

  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Swipe gesture handling
  const onGestureEvent = event => {
    const { translationX, velocityX } = event.nativeEvent;

    // More sensitive swipe detection
    const minSwipeDistance = width * 0.2; // Reduced to 20% for easier swiping
    const minVelocity = 300; // Reduced threshold for faster response

    if (
      Math.abs(translationX) > minSwipeDistance ||
      Math.abs(velocityX) > minVelocity
    ) {
      if (translationX > 0 && velocityX >= 0) {
        // Swipe right - go to next page
        console.log('[QURAN SCREEN] Swipe right detected - going to next page');

        // Track swipe navigation
        analytics.trackUserAction('page_navigation', {
          direction: 'next',
          from_page: currentPage,
          to_page: currentPage + 1,
          method: 'swipe_right',
        });

        nextPage();
      } else if (translationX < 0 && velocityX <= 0) {
        // Swipe left - go to previous page
        console.log(
          '[QURAN SCREEN] Swipe left detected - going to previous page'
        );

        // Track swipe navigation
        analytics.trackUserAction('page_navigation', {
          direction: 'previous',
          from_page: currentPage,
          to_page: currentPage - 1,
          method: 'swipe_left',
        });

        prevPage();
      }
    }
  };

  const onHandlerStateChange = event => {
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
    {
      code: 'portuguese',
      name: 'Portuguese',
      flag: '🇧🇷',
      nativeName: 'Português',
    },
    { code: 'russian', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
    { code: 'japanese', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
    { code: 'german', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
    { code: 'korean', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
    { code: 'turkish', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
    { code: 'italian', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
    { code: 'bengali', name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
    { code: 'persian', name: 'Persian', flag: '🇮🇷', nativeName: 'فارسی' },
    { code: 'malay', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
    {
      code: 'indonesian',
      name: 'Indonesian',
      flag: '🇮🇩',
      nativeName: 'Bahasa Indonesia',
    },
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

  const saveLanguagePreference = async languageCode => {
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

  const handleLanguageSelect = async languageCode => {
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
      Alert.alert(
        'Error',
        'Failed to save language preference. Please try again.'
      );
    }
  };

  useEffect(() => {
    console.log('[QURAN SCREEN] Component mounted, initial page:', initialPage);

    // Track screen view
    analytics.trackScreenView('QuranPageScreen', {
      initial_page: initialPage,
      total_pages: 604,
    });

    // Load mushaf style preference
    loadMushafStyle();

    // Reset animation values to default
    slideAnim.setValue(0);
    fadeAnim.setValue(1);

    // Update streak when component mounts
    dispatch(updateStreak());

    // Add focus listener to reload mushaf style when returning to screen
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[QURAN SCREEN] Screen focused, reloading mushaf style');
      loadMushafStyle();
    });

    return () => {
      console.log('[QURAN SCREEN] Component unmounting');
      unsubscribe();
    };
  }, []);

  const loadMushafStyle = async () => {
    try {
      console.log('[QURAN SCREEN] Loading mushaf style...');
      const style = await getMushafStyle();
      console.log('[QURAN SCREEN] Loaded mushaf style:', style);
      
      // Check if style has changed
      if (style !== mushafStyle) {
        console.log('[QURAN SCREEN] Mushaf style changed from', mushafStyle, 'to', style);
        setMushafStyle(style);
        
        // Force image reload by triggering loading state
        setLoading(true);
        setImageError(false);
        
        console.log('[QURAN SCREEN] mushafStyle state set to:', style);
      }
    } catch (error) {
      console.error('[QURAN SCREEN] Error loading mushaf style:', error);
      setMushafStyle(9); // Default to style 9
    }
  };

  useEffect(() => {
    if (initialPage && initialPage !== currentPage) {
      console.log(
        '[QURAN SCREEN] Updating current page from',
        currentPage,
        'to',
        initialPage
      );
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
    dispatch(
      saveLastReadPage({
        type: 'page',
        id: currentPage,
        name: `Page ${currentPage}`,
        pageNumber: currentPage,
        lastReadAt: new Date().toISOString(),
      })
    );

    // Preload adjacent pages for smooth navigation
    preloadAdjacentPages(currentPage);
  }, [currentPage]);

  // Generate SearchTruth.com image URL using preferred style
  const getPageImageUrl = pageNumber => {
    const url = getMushafImageUrl(pageNumber, mushafStyle);
    console.log('[QURAN SCREEN] Generated URL for page', pageNumber, 'style', mushafStyle, ':', url);
    return url;
  };

  // Preload pages for instant navigation
  const preloadPage = pageNumber => {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      preloadedPages.has(pageNumber)
    ) {
      return; // Skip if invalid or already preloaded
    }

    console.log('[QURAN SCREEN] Preloading page:', pageNumber);
    const imageUrl = getPageImageUrl(pageNumber);
    console.log('[QURAN SCREEN] Preload URL:', imageUrl);

    // Use React Native's Image.prefetch for caching
    Image.prefetch(imageUrl)
      .then(() => {
        console.log('[QURAN SCREEN] Successfully preloaded page:', pageNumber);
        setPreloadedPages(prev => new Set([...prev, pageNumber]));
      })
      .catch(error => {
        console.warn(
          '[QURAN SCREEN] Failed to preload page:',
          pageNumber,
          'Error:',
          error
        );
        // Still mark as preloaded to avoid infinite retry
        setPreloadedPages(prev => new Set([...prev, pageNumber]));
      });
  };

  // Preload adjacent pages (2 before + 2 after current page)
  const preloadAdjacentPages = centerPage => {
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
        setTimeout(
          () => preloadPage(pageNum),
          Math.abs(pageNum - centerPage) * 200
        );
      }
    });
  };

  const goToPage = page => {
    console.log('[QURAN SCREEN] goToPage called with page:', page);
    console.log('[QURAN SCREEN] Current state - currentPage:', currentPage, 'isTransitioning:', isTransitioning);
    
    if (page >= 1 && page <= totalPages && !isTransitioning) {
      console.log('[QURAN SCREEN] Navigating to page:', page);

      // Determine animation direction
      const isNext = page > currentPage;
      animatePageTransition(page, isNext);
    } else {
      console.log(
        '[QURAN SCREEN] Invalid page number or transition in progress:',
        'page:', page,
        'totalPages:', totalPages,
        'isTransitioning:', isTransitioning
      );
    }
  };

  const animatePageTransition = (newPage, isNext) => {
    console.log('[QURAN SCREEN] Starting page transition from', currentPage, 'to', newPage);
    setIsTransitioning(true);
    
    // Safety timeout to reset isTransitioning in case animation fails
    const safetyTimeout = setTimeout(() => {
      console.log('[QURAN SCREEN] Safety timeout - resetting isTransitioning');
      setIsTransitioning(false);
    }, 2000);
    
    // Simplified version - just change the page immediately for testing
    console.log('[QURAN SCREEN] About to set currentPage to:', newPage);
    setCurrentPage(newPage);
    console.log('[QURAN SCREEN] currentPage set, clearing timeout');
    clearTimeout(safetyTimeout);
    setIsTransitioning(false);
    
    // TODO: Re-enable animations once basic navigation works
    /*
    InteractionManager.runAfterInteractions(() => {
      const slideDirection = isNext ? -width : width;
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 80, // much faster fade out
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        console.log('[QURAN SCREEN] Setting currentPage to:', newPage);
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
          console.log('[QURAN SCREEN] Page transition completed');
          clearTimeout(safetyTimeout);
          setIsTransitioning(false);
        });
      });
    });
    */
  };

  const nextPage = () => {
    console.log('[QURAN SCREEN] nextPage() called, isTransitioning:', isTransitioning);
    if (isTransitioning) {
      console.log('[QURAN SCREEN] Blocking nextPage - transition in progress');
      return; // Prevent multiple animations
    }
    console.log(
      '[QURAN SCREEN] Next page function executing, current page:',
      currentPage
    );

    // Track navigation
    analytics.trackUserAction('page_navigation', {
      direction: 'next',
      from_page: currentPage,
      to_page: currentPage + 1,
      method: 'button',
    });

    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    console.log('[QURAN SCREEN] prevPage() called, isTransitioning:', isTransitioning);
    if (isTransitioning) {
      console.log('[QURAN SCREEN] Blocking prevPage - transition in progress');
      return; // Prevent multiple animations
    }
    console.log(
      '[QURAN SCREEN] Previous page function executing, current page:',
      currentPage
    );

    // Track navigation
    analytics.trackUserAction('page_navigation', {
      direction: 'previous',
      from_page: currentPage,
      to_page: currentPage - 1,
      method: 'button',
    });

    goToPage(currentPage - 1);
  };

  const handleImageLoad = () => {
    console.log(
      '[QURAN SCREEN] Image loaded successfully for page:',
      currentPage
    );
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
      params: { screen: 'JuzList' },
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
      const rateLimitResult =
        await rateLimitService.checkRateLimit('quran/tafseer');

      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitService.getTimeUntilReset(
          rateLimitResult.resetTime
        );
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
    setAnalysisStep(0);
    setAnalysisComplete(false);

    // Create a ref to track if API response is ready
    let apiResponseReady = false;
    let apiResponseData = null;

    // Start the step-by-step animation simulation
    const simulateAnalysis = () => {
      const steps = [
        { step: 1, text: 'Analyzing Quranic text...', delay: 1200 },
        { step: 2, text: 'Processing Arabic semantics...', delay: 1200 },
        { step: 3, text: 'Consulting classical commentaries...', delay: 1200 },
        { step: 4, text: 'Extracting linguistic insights...', delay: 1200 },
        { step: 5, text: 'Generating comprehensive explanation...', delay: 1200 },
        { step: 6, text: 'Finalizing Tafseer...', delay: 1200 },
      ];

      let currentStepIndex = 0;
      let simulationTimeouts = [];
      
      const runNextStep = () => {
        // If API response is ready, immediately stop simulation and show response
        if (apiResponseReady) {
          // Clear all pending timeouts
          simulationTimeouts.forEach(timeout => clearTimeout(timeout));
          setAnalysisComplete(true);
          setTimeout(() => {
            setAiResponse(apiResponseData);
            setAiLoading(false);
          }, 500);
          return;
        }

        if (currentStepIndex < steps.length) {
          setAnalysisStep(currentStepIndex + 1);
          currentStepIndex++;
          
          const timeout = setTimeout(runNextStep, steps[currentStepIndex - 1]?.delay || 1000);
          simulationTimeouts.push(timeout);
        } else {
          // Animation complete - wait for API response if not ready yet
          if (!apiResponseReady) {
            const checkForResponse = () => {
              if (apiResponseReady) {
                setAnalysisComplete(true);
                setTimeout(() => {
                  setAiResponse(apiResponseData);
                  setAiLoading(false);
                }, 500);
              } else {
                setTimeout(checkForResponse, 500);
              }
            };
            checkForResponse();
          }
        }
      };

      // Start the animation
      const initialTimeout = setTimeout(runNextStep, 500);
      simulationTimeouts.push(initialTimeout);

      return simulationTimeouts;
    };

    // Start the simulation
    const timeouts = simulateAnalysis();

    try {
      // Get the current page image URL
      const pageImageUrl = getPageImageUrl(currentPage);

      // Use the override language if provided, otherwise use the current state
      const currentLanguageCode = languageCodeOverride || selectedLanguage;

      // Get selected language name for the prompt
      const languageInfo = languageOptions.find(
        lang => lang.code === currentLanguageCode
      );
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
      const response = await fetch('https://api.devlop.app/quran/tafseer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageNumber: currentPage,
          pageImageUrl: pageImageUrl,
          mushafType: 'standard_604_pages',
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

        // Mark API response as ready
        apiResponseReady = true;
        apiResponseData = data.tafseer;
        
        console.log('[QURAN SCREEN] API response received, stopping simulation');
      } else {
        throw new Error(data.error || 'Failed to get tafseer');
      }
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      
      // Clear all timeouts and reset state
      timeouts.forEach(timeout => clearTimeout(timeout));
      setAiLoading(false);
      setAnalysisStep(0);
      setAnalysisComplete(false);

      // Show user-friendly error message
      Alert.alert(
        'Connection Error',
        'Unable to get explanation. Please check your internet connection and try again.',
        [
          { text: 'Close', onPress: () => setShowAIModal(false) },
          { text: 'Retry', onPress: proceedWithAIExplanation },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-amber-50 dark:bg-gray-900`}>
      <StatusBar backgroundColor="#FFFBEB" barStyle="dark-content" />

      {/* Header */}
      <View
        style={tw`px-4 py-3 bg-amber-50 dark:bg-gray-900 border-b border-amber-200 dark:border-gray-700`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          {/* Back Button with Text */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Quran', {
                screen: 'QuranTabs',
                params: { screen: 'JuzList' },
              })
            }
            style={tw`flex-row items-center py-2`}
            accessibilityLabel="Go Back to Juz List"
          >
            <Ionicons name="arrow-back" size={24} color="#92400e" />
            <Text
              style={tw`text-lg font-semibold text-amber-900 dark:text-amber-100 ml-2`}
            >
              Back
            </Text>
          </TouchableOpacity>

          {/* Page Title and Navigation */}
          <TouchableOpacity
            onPress={handleModalOpen}
            style={tw`flex-row items-center`}
          >
            <Text
              style={tw`text-lg font-bold text-amber-900 dark:text-amber-100`}
            >
              Page {currentPage}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color="#92400e"
              style={tw`ml-1`}
            />
          </TouchableOpacity>

          {/* Mushaf Style Settings */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MushafStyle')}
            style={[
              tw`flex-row items-center px-3 py-2 rounded-2xl`,
              { backgroundColor: '#f0f9ff' }
            ]}
          >
            <Ionicons name="options" size={18} color="#0284c7" />
            <Text style={[
              tw`text-blue-600 font-medium ml-2`,
              { fontSize: 13 }
            ]}>
              Mushaf Style
            </Text>
          </TouchableOpacity>
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
              transform: [{ translateX: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {loading && !isTransitioning && (
            <View
              style={tw`absolute z-10 bg-white dark:bg-gray-800 rounded-lg p-4`}
            >
              <ActivityIndicator size="large" color="#92400e" />
              <Text
                style={tw`text-amber-800 dark:text-amber-200 mt-2 text-center`}
              >
                Loading page...
              </Text>
            </View>
          )}

          {imageError ? (
            <View
              style={tw`bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-800`}
            >
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color="#EF4444"
                style={tw`mb-4 self-center`}
              />
              <Text
                style={tw`text-center text-gray-500 dark:text-gray-400 text-lg mb-2`}
              >
                صفحہ لوڈ نہیں ہو سکا
              </Text>
              <Text
                style={tw`text-center text-gray-400 dark:text-gray-500 text-sm mb-4`}
              >
                Unable to load Mushaf page
              </Text>
              <TouchableOpacity
                onPress={() => {
                  console.log(
                    '[QURAN SCREEN] Retry button pressed for page:',
                    currentPage
                  );
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
                height: height * 0.73, // Use full screen height
                backgroundColor: '#FFFBEB',
              }}
              resizeMode="stretch" // This must be outside `style`
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </Animated.View>
      </PanGestureHandler>

      {/* Compact Explain Button with Next/Prev */}
      <View
        style={tw`absolute bottom-2 left-0 right-0 flex-row items-center justify-center px-6`}
      >
        {/* Previous Page Button */}
        <TouchableOpacity
          onPress={() => {
            console.log('[QURAN SCREEN] Previous button pressed, currentPage:', currentPage);
            if (currentPage > 1) {
              nextPage();
            } else {
              console.log('[QURAN SCREEN] Cannot go to previous page, already at page 1');
            }
          }}
          style={tw`bg-amber-200 rounded-full p-3 mr-3`}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#92400e" />
        </TouchableOpacity>

        {/* Explain Button */}
        <TouchableOpacity
          onPress={handleAIExplanation}
          style={tw`rounded-full shadow-lg flex-1 mx-1`}
          activeOpacity={0.5}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
            style={tw`py-3 px-6 rounded-full items-center justify-center flex-row`}
          >
            <Ionicons
              name="book-outline"
              size={18}
              color="white"
              style={tw`mr-2`}
            />
            <Text style={tw`text-white font-semibold text-base`}>Tafseer</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Next Page Button */}
        <TouchableOpacity
          onPress={() => {
            console.log('[QURAN SCREEN] Next button pressed, currentPage:', currentPage, 'totalPages:', totalPages);
            if (currentPage < totalPages) {
              prevPage();
            } else {
              console.log('[QURAN SCREEN] Cannot go to next page, already at last page');
            }
          }}
          style={tw`bg-amber-200 rounded-full p-3 ml-3`}
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
                  <Text style={tw`text-xl font-bold text-gray-900`}>
                    AI Tafseer
                  </Text>
                  <Text style={tw`text-sm text-gray-600`}>
                    Page {currentPage} Explanation
                  </Text>
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
          <ScrollView
            style={tw`flex-1 px-6 py-4`}
            showsVerticalScrollIndicator={false}
          >
            {aiLoading ? (
              <View style={tw`flex-1 items-center py-12`}>
                {/* Main Analysis Container */}
                <View style={[
                  tw`w-full max-w-sm rounded-3xl p-8 mb-8`,
                  {
                    backgroundColor: '#faf5ff', // Light purple background
                    shadowColor: '#8B5CF6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 8,
                  }
                ]}>
                  {/* Central AI Brain Animation */}
                  <View style={tw`items-center mb-8`}>
                    <View style={[
                      tw`w-20 h-20 rounded-full items-center justify-center mb-4`,
                      {
                        backgroundColor: analysisComplete ? '#22c55e' : '#8B5CF6',
                        transform: [{ scale: analysisComplete ? 1.1 : 1 }],
                      }
                    ]}>
                      {analysisComplete ? (
                        <Animatable.View animation="tada" iterationCount={1}>
                          <Ionicons name="checkmark-circle" size={40} color="white" />
                        </Animatable.View>
                      ) : (
                        <Animatable.View 
                          animation="rotate" 
                          iterationCount="infinite" 
                          duration={2000}
                        >
                          <Ionicons name="analytics" size={40} color="white" />
                        </Animatable.View>
                      )}
                    </View>
                    
                    <Text style={[
                      tw`font-bold text-center mb-2`,
                      { 
                        fontSize: 20, 
                        color: analysisComplete ? '#22c55e' : '#8B5CF6',
                        letterSpacing: -0.3 
                      }
                    ]}>
                      {analysisComplete ? 'Analysis Complete!' : 'AI Analyzing...'}
                    </Text>
                    
                    <Text style={tw`text-gray-600 text-center text-sm`}>
                      {analysisComplete 
                        ? 'Preparing your personalized Tafseer' 
                        : 'Deep learning models processing Quranic wisdom'
                      }
                    </Text>
                  </View>

                  {/* Progress Steps */}
                  <View style={tw`mt-4`}>
                    {[
                      { id: 1, text: 'Analyzing Quranic text...', icon: 'document-text' },
                      { id: 2, text: 'Processing Arabic semantics...', icon: 'language' },
                      { id: 3, text: 'Consulting classical commentaries...', icon: 'library' },
                      { id: 4, text: 'Extracting linguistic insights...', icon: 'search' },
                      { id: 5, text: 'Generating comprehensive explanation...', icon: 'create' },
                      { id: 6, text: 'Finalizing Tafseer...', icon: 'checkmark-done' },
                    ].map((item, index) => {
                      const isActive = analysisStep >= item.id;
                      const isCurrent = analysisStep === item.id;
                      const isCompleted = analysisStep > item.id || analysisComplete;
                      
                      return (
                        <View key={item.id} style={tw`mb-4`}>
                          <Animatable.View
                            animation={isCurrent ? "pulse" : isActive ? "fadeIn" : undefined}
                            duration={isCurrent ? 1000 : 600}
                            iterationCount={isCurrent ? "infinite" : 1}
                            style={tw`flex-row items-center`}
                          >
                            {/* Step Icon */}
                            <View style={[
                              tw`w-10 h-10 rounded-full items-center justify-center mr-4`,
                              {
                                backgroundColor: isCompleted ? '#22c55e' : 
                                               isCurrent ? '#8B5CF6' : 
                                               isActive ? '#c084fc' : '#e5e7eb',
                                borderWidth: 2,
                                borderColor: isCompleted ? '#16a34a' :
                                            isCurrent ? '#7c3aed' :
                                            isActive ? '#a855f7' : 'transparent',
                              }
                            ]}>
                              {isCompleted ? (
                                <Ionicons name="checkmark" size={16} color="white" />
                              ) : (
                                <Ionicons 
                                  name={item.icon} 
                                  size={16} 
                                  color={isActive ? "white" : "#9ca3af"} 
                                />
                              )}
                            </View>
                            
                            {/* Step Text */}
                            <Text style={[
                              tw`flex-1 font-medium`,
                              {
                                fontSize: 15,
                                color: isCompleted ? '#22c55e' :
                                       isCurrent ? '#8B5CF6' :
                                       isActive ? '#6b7280' : '#9ca3af',
                                fontWeight: isCurrent ? 'bold' : 'normal',
                              }
                            ]}>
                              {item.text}
                            </Text>
                            
                            {/* Loading dots for current step */}
                            {isCurrent && !analysisComplete && (
                              <Animatable.View 
                                animation="flash" 
                                iterationCount="infinite" 
                                duration={800}
                                style={tw`ml-2`}
                              >
                                <Text style={[tw`text-purple-600`, { fontSize: 16 }]}>
                                  ●●●
                                </Text>
                              </Animatable.View>
                            )}
                          </Animatable.View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Progress Bar */}
                  <View style={tw`mt-8`}>
                    <View style={tw`flex-row items-center justify-between mb-2`}>
                      <Text style={tw`text-sm font-medium text-gray-600`}>
                        Progress
                      </Text>
                      <Text style={tw`text-sm font-bold text-purple-600`}>
                        {analysisComplete ? '100%' : `${Math.round((analysisStep / 6) * 100)}%`}
                      </Text>
                    </View>
                    
                    <View style={[
                      tw`h-2 bg-gray-200 rounded-full overflow-hidden`,
                      { backgroundColor: '#f3f4f6' }
                    ]}>
                      <Animatable.View
                        animation="slideInLeft"
                        duration={600}
                        style={[
                          tw`h-full rounded-full`,
                          {
                            width: `${analysisComplete ? 100 : (analysisStep / 6) * 100}%`,
                            backgroundColor: analysisComplete ? '#22c55e' : '#8B5CF6',
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>

                {/* Encouraging Message */}
                {analysisComplete && (
                  <Animatable.View 
                    animation="bounceIn" 
                    delay={200}
                    style={[
                      tw`px-6 py-4 rounded-2xl mx-4`,
                      { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' }
                    ]}
                  >
                    <View style={tw`flex-row items-center justify-center`}>
                      <Ionicons name="sparkles" size={20} color="#22c55e" style={tw`mr-2`} />
                      <Text style={[
                        tw`text-green-700 font-semibold text-center`,
                        { fontSize: 16 }
                      ]}>
                        Ready! Preparing your Tafseer...
                      </Text>
                    </View>
                  </Animatable.View>
                )}
              </View>
            ) : aiResponse ? (
              <View>
                {/* Response Content with Markdown */}
                <Markdown
                  style={{
                    body: { fontSize: 16, lineHeight: 24, color: '#1f2937' },
                    heading1: {
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#111827',
                      marginBottom: 12,
                      marginTop: 8,
                    },
                    heading2: {
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: 10,
                      marginTop: 12,
                    },
                    heading3: {
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8,
                      marginTop: 10,
                    },
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
                      fontSize: 14,
                    },
                    blockquote: {
                      backgroundColor: '#f9fafb',
                      borderLeftWidth: 4,
                      borderLeftColor: '#8B5CF6',
                      paddingLeft: 16,
                      paddingVertical: 12,
                      marginVertical: 8,
                      fontStyle: 'italic',
                    },
                    hr: {
                      backgroundColor: '#e5e7eb',
                      height: 1,
                      marginVertical: 16,
                    },
                  }}
                >
                  {aiResponse}
                </Markdown>

                {/* Disclaimer */}
                <View
                  style={tw`bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6`}
                >
                  <View style={tw`flex-row items-start`}>
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#F59E0B"
                      style={tw`mr-2 mt-0.5`}
                    />
                    <View style={tw`flex-1`}>
                      <Text
                        style={tw`text-amber-800 font-semibold text-sm mb-1`}
                      >
                        Important Note
                      </Text>
                      <Text style={tw`text-amber-700 text-sm leading-5`}>
                        This AI-generated explanation is for educational
                        purposes. For authoritative interpretation, please
                        consult qualified Islamic scholars and authentic Tafseer
                        books.
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
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#EF4444"
                />
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
                <View
                  style={tw`w-10 h-10 rounded-full items-center justify-center mr-3 bg-purple-100`}
                >
                  <Ionicons name="language" size={20} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={tw`text-xl font-bold text-gray-900`}>
                    Choose Language
                  </Text>
                  <Text style={tw`text-sm text-gray-600`}>
                    Select your preferred language for Tafseer
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Language Options */}
          <ScrollView
            style={tw`flex-1 px-6 py-4`}
            showsVerticalScrollIndicator={false}
          >
            <Text style={tw`text-gray-700 text-center mb-6 leading-6`}>
              Please select your preferred language for AI Tafseer explanations.
              This will be saved for future use.
            </Text>

            <View style={tw`gap-3`}>
              {languageOptions.map(language => (
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

            <View
              style={tw`bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6 mb-4`}
            >
              <View style={tw`flex-row items-start`}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color="#3B82F6"
                  style={tw`mr-2 mt-0.5`}
                />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-blue-800 font-semibold text-sm mb-1`}>
                    Language Preference
                  </Text>
                  <Text style={tw`text-blue-700 text-sm leading-5`}>
                    You can change this language anytime in settings. The AI
                    will provide Tafseer explanations in your selected language.
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
        onPageSelect={page => {
          console.log('[QURAN SCREEN] Page selected from modal:', page);
          setCurrentPage(page);
        }}
      />

   
    </SafeAreaView>
  );
}
