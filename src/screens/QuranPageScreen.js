import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Animated,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import tw from 'twrnc';
import PageNavigationModal from '../components/PageNavigationModal';
import { IOSLoader, IOSProgressLoader, IOSErrorView } from '../components/IOSLoader';
import { useDispatch } from 'react-redux';
import { updateStreak, saveLastReadPage } from '../store/streakSlice';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '../services/analyticsService';
import rateLimitService from '../services/rateLimitService';
import RateLimitStatus from '../components/RateLimitStatus';
import { getMushafStyle, getMushafImageUrl } from '../services/mushafService';
import { AlertManager } from '../components/AppleStyleAlert';

const { width, height } = Dimensions.get('window');

export default function QuranPageScreen({ route }) {
  console.log(
    '[QURAN SCREEN] Component rendering, route params:',
    route?.params
  );

  const navigation = useNavigation();
  const dispatch = useDispatch();
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
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false); // Apple-style back confirmation

  // Animation references
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Swipe gesture handling
  const onGestureEvent = event => {
    const { translationX, velocityX } = event.nativeEvent;
    const minSwipeDistance = width * 0.2;
    const minVelocity = 300;

    if (Math.abs(translationX) > minSwipeDistance || Math.abs(velocityX) > minVelocity) {
      if (translationX > 0 && velocityX >= 0) {
        analytics.trackUserAction('page_navigation', {
          direction: 'next',
          from_page: currentPage,
          to_page: currentPage + 1,
          method: 'swipe_right',
        });
        nextPage();
      } else if (translationX < 0 && velocityX <= 0) {
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
      AlertManager.alert(
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

    // Handle hardware back button and gesture navigation
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('[QURAN SCREEN] Hardware back button pressed');
      handleBackPress();
      return true; // Prevent default back behavior
    });

    // Add beforeRemove listener to intercept navigation away from screen
    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e) => {
      // If we're already showing the modal, allow navigation
      if (showBackConfirmModal) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      console.log('[QURAN SCREEN] Navigation intercepted, showing confirmation');
      handleBackPress();
    });

    return () => {
      console.log('[QURAN SCREEN] Component unmounting');
      unsubscribe();
      backHandler.remove();
      unsubscribeBeforeRemove();
    };
  }, [showBackConfirmModal]);

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
        
        // Clear preloaded pages cache since URLs have changed
        console.log('[QURAN SCREEN] Clearing preloaded pages cache due to style change');
        setPreloadedPages(new Set());
        
        // Preload adjacent pages with new style after a short delay
        setTimeout(() => {
          console.log('[QURAN SCREEN] Starting preload with new mushaf style');
          preloadAdjacentPages(currentPage);
        }, 500);
        
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
    if (page >= 1 && page <= totalPages && !isTransitioning) {
      console.log('[QURAN SCREEN] Navigating to page:', page);
      setIsTransitioning(true);
      setCurrentPage(page);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const nextPage = () => {
    if (isTransitioning) return;
    analytics.trackUserAction('page_navigation', {
      direction: 'next',
      from_page: currentPage,
      to_page: currentPage + 1,
      method: 'button',
    });
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    if (isTransitioning) return;
    analytics.trackUserAction('page_navigation', {
      direction: 'previous',
      from_page: currentPage,
      to_page: currentPage - 1,
      method: 'button',
    });
    goToPage(currentPage - 1);
  };

  const handleImageLoad = () => {
    console.log('[QURAN SCREEN] Image loaded successfully for page:', currentPage);
    setLoading(false);
    setPreloadedPages(prev => new Set([...prev, currentPage]));
  };

  const handleImageError = () => {
    console.error('[QURAN SCREEN] Image failed to load for page:', currentPage);
    setLoading(false);
    setImageError(true);
  };

  const handleBackPress = () => {
    console.log('[QURAN SCREEN] Back button pressed, showing confirmation');
    setShowBackConfirmModal(true);
  };

  const handleModalClose = () => {
    console.log('[QURAN SCREEN] Navigation modal closed');
    setShowNavModal(false);
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
        AlertManager.alert(
          'Rate Limit Exceeded',
          `You've reached the maximum number of AI Tafseer requests (${rateLimitResult.maxRequests}) for this hour. Please try again in ${resetTime}.`
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
        { step: 1, text: 'Analyzing Quranic text...', delay: 2000 },
        { step: 2, text: 'Processing Arabic semantics...', delay: 2000 },
        { step: 3, text: 'Consulting classical commentaries...', delay: 2000 },
        { step: 4, text: 'Extracting linguistic insights...', delay: 2000 },
        {
          step: 5,
          text: 'Generating comprehensive explanation...',
          delay: 2000,
        },
        { step: 6, text: 'Finalizing Tafseer...', delay: 2000 },
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
      AlertManager.alert(
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
    <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['left', 'right']}>
      <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />

      {/* iOS-Style Navigation Header */}
      <View
        style={[
          tw`bg-white border-b`,
          {
            borderBottomColor: 'rgba(60, 60, 67, 0.12)',
            borderBottomWidth: 0.5,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowOffset: { width: 0, height: 0.5 },
            shadowOpacity: 1,
            shadowRadius: 0,
          },
        ]}
      >
        <View
          style={tw`flex-row items-center justify-between px-4 py-3 min-h-[44px]`}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBackPress}
            style={tw`flex-row items-center py-1 -ml-1`}
            activeOpacity={0.4}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color="#007AFF" />
            <Text
              style={[
                tw`text-blue-500 ml-1`,
                { fontSize: 17, fontWeight: '400', letterSpacing: -0.4 },
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>

          {/* Center Title */}
          <TouchableOpacity
            onPress={() => setShowNavModal(true)}
            style={tw`flex-row items-center justify-center flex-1 mx-4`}
            activeOpacity={0.4}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <View style={tw`flex-row items-center`}>
              <Text
                style={[
                  tw`text-black text-center`,
                  { fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
                ]}
              >
                Page {currentPage}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color="#8E8E93"
                style={tw`ml-1`}
              />
            </View>
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('MushafStyle')}
            style={tw`flex-row items-center py-1 -mr-1`}
            activeOpacity={0.4}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="book-outline" size={20} color="#007AFF" style={tw`mr-1`} />
            <Text
              style={[
                tw`text-blue-500`,
                { fontSize: 17, fontWeight: '400', letterSpacing: -0.4 },
              ]}
            >
              Style
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mushaf Page Display */}
      <View style={tw`flex-1 bg-white`}>
        <PanGestureHandler
          onHandlerStateChange={onHandlerStateChange}
          minDist={30}
        >
          <View style={tw`flex-1 justify-center items-center`}>
            {loading && !isTransitioning && (
              <IOSLoader
                title="Loading Page"
                subtitle="Please wait while we load the Quran page"
                overlay={true}
              />
            )}

            {imageError ? (
              <IOSErrorView
                title="Unable to Load Page"
                subtitle="Please check your internet connection and try again."
                onRetry={() => {
                  setImageError(false);
                  setLoading(true);
                }}
              />
            ) : (
              <Image
                source={{ uri: getPageImageUrl(currentPage) }}
                style={{
                  width: width,
                  height: height * 0.76,
                }}
                resizeMode="stretch"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </View>
        </PanGestureHandler>
      </View>

      {/* iOS-Style Bottom Controls */}
      <View style={tw`bg-white border-t border-gray-200 px-4 py-3`}>
        <View style={tw`flex-row items-center justify-between`}>
          {/* Next Button (moved to left) */}
          <TouchableOpacity
            onPress={nextPage}
            disabled={currentPage >= totalPages}
            style={[
              tw`flex-row items-center px-4 py-3 rounded-xl `,
              currentPage >= totalPages ? tw`opacity-50` : tw`bg-gray-50`,
            ]}
            activeOpacity={0.3}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentPage >= totalPages ? '#8E8E93' : '#007AFF'}
            />
            <Text
              style={[
                tw`ml-1 font-medium`,
                { color: currentPage >= totalPages ? '#8E8E93' : '#007AFF' },
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>

          {/* Tafseer Button */}
          <TouchableOpacity
            onPress={handleAIExplanation}
            style={tw`bg-blue-500 px-6 py-3 rounded-xl flex-row items-center`}
            activeOpacity={0.8}
          >
            <Ionicons name="book" size={18} color="white" style={tw`mr-2`} />
            <Text style={tw`text-white font-semibold`}>Tafseer</Text>
          </TouchableOpacity>

          {/* Previous Button (moved to right) */}
          <TouchableOpacity
            onPress={prevPage}
            disabled={currentPage <= 1}
            style={[
              tw`flex-row items-center px-4 py-3 rounded-xl`,
              currentPage <= 1 ? tw`opacity-50` : tw`bg-gray-50`,
            ]}
            activeOpacity={0.3}
          >
            <Text
              style={[
                tw`mr-1 font-medium`,
                { color: currentPage <= 1 ? '#8E8E93' : '#007AFF' },
              ]}
            >
              Prev
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentPage <= 1 ? '#8E8E93' : '#007AFF'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* iOS-Style AI Explanation Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAIModal(false)}
      >
        <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
          <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />

          {/* Modal Header */}
          <View style={tw`bg-gray-100 border-b border-gray-200`}>
            <View style={tw`flex-row items-center justify-between px-4 py-3`}>
              <TouchableOpacity
                onPress={() => setShowAIModal(false)}
                style={tw`py-1`}
                activeOpacity={0.3}
              >
                <Text style={tw`text-lg text-blue-500`}>Done</Text>
              </TouchableOpacity>

              <Text style={tw`text-lg font-semibold text-black`}>
                AI Tafseer
              </Text>

              <View style={tw`w-12`} />
            </View>
          </View>

          <ScrollView
            style={tw`flex-1`}
            contentContainerStyle={tw`px-4 py-6`}
            showsVerticalScrollIndicator={false}
          >
            {aiLoading ? (
              <IOSProgressLoader
                title={
                  analysisComplete ? 'Analysis Complete!' : 'Analyzing Page...'
                }
                subtitle={
                  analysisComplete
                    ? 'Preparing your Tafseer explanation'
                    : 'AI is processing the Quranic text and generating insights'
                }
                steps={[
                  'Analyzing Arabic text...',
                  'Processing meanings...',
                  'Consulting sources...',
                  'Generating explanation...',
                  'Finalizing Tafseer...',
                ]}
                currentStep={analysisStep}
                overlay={false}
              />
            ) : aiResponse ? (
              <View style={tw`bg-white rounded-xl p-6 shadow-sm`}>
                <View style={tw`flex-row items-center mb-4`}>
                  <View
                    style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}
                  >
                    <Ionicons name="sparkles" size={20} color="#007AFF" />
                  </View>
                  <Text style={tw`text-lg font-semibold text-black`}>
                    Page {currentPage} Explanation
                  </Text>
                </View>

                <Markdown
                  style={{
                    body: { fontSize: 16, lineHeight: 24, color: '#1f2937' },
                    heading1: {
                      fontSize: 22,
                      fontWeight: 'bold',
                      color: '#111827',
                      marginBottom: 12,
                    },
                    heading2: {
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: 10,
                    },
                    heading3: {
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: 8,
                    },
                    paragraph: { marginBottom: 12, lineHeight: 22 },
                    strong: { fontWeight: 'bold', color: '#111827' },
                    blockquote: {
                      backgroundColor: '#f9fafb',
                      borderLeftWidth: 4,
                      borderLeftColor: '#007AFF',
                      paddingLeft: 16,
                      paddingVertical: 12,
                      marginVertical: 8,
                      fontStyle: 'italic',
                    },
                  }}
                >
                  {aiResponse}
                </Markdown>

                {/* Disclaimer */}
                <View style={tw`bg-gray-50 rounded-xl p-4 mt-6`}>
                  <View style={tw`flex-row items-start`}>
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#8E8E93"
                      style={tw`mr-2 mt-0.5`}
                    />
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-gray-600 font-medium text-sm mb-1`}>
                        Important Note
                      </Text>
                      <Text style={tw`text-gray-500 text-sm leading-5`}>
                        This AI-generated explanation is for educational
                        purposes. Please consult qualified Islamic scholars for
                        authoritative interpretation.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={tw`flex-row gap-3 mt-6`}>
                  <TouchableOpacity
                    onPress={handleAIExplanation}
                    style={tw`flex-1 bg-blue-500 py-3 rounded-xl`}
                    activeOpacity={0.8}
                  >
                    <Text style={tw`text-white font-semibold text-center`}>
                      Regenerate
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowAIModal(false)}
                    style={tw`flex-1 bg-gray-200 py-3 rounded-xl`}
                    activeOpacity={0.8}
                  >
                    <Text style={tw`text-black font-semibold text-center`}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <IOSErrorView
                title="Failed to Load"
                subtitle="Unable to generate explanation. Please check your connection and try again."
                onRetry={handleAIExplanation}
              />
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

      {/* Apple-Style Back Confirmation Modal */}
      <Modal
        visible={showBackConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBackConfirmModal(false)}
      >
        <View style={[
          tw`flex-1 justify-center items-center px-4`,
          { backgroundColor: 'rgba(0, 0, 0, 0.4)' }
        ]}>
          {/* Simple Modal Card */}
          <View style={[
            tw`w-full max-w-sm mx-4 bg-white rounded-2xl overflow-hidden`,
            {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }
          ]}>
            {/* Modal Header */}
            <View style={tw`px-6 pt-6 pb-4`}>
              <Text style={[
                tw`text-center text-black mb-2`,
                { 
                  fontSize: 17, 
                  fontWeight: '600', 
                  letterSpacing: -0.4,
                }
              ]}>
                🌟 Amazing Progress! 
              </Text>
              <Text style={[
                tw`text-center leading-5 text-gray-600`,
                { 
                  fontSize: 13, 
                  letterSpacing: -0.2,
                }
              ]}>
                MashAllah! You're building such a beautiful habit. How about blessing yourself with just one more page? 📖✨
              </Text>
            </View>

            {/* Modal Buttons */}
            <View style={tw`border-t border-gray-200`}>
              <TouchableOpacity
                onPress={() => {
                  console.log('[QURAN SCREEN] User chose to read one more page');
                  analytics.trackUserAction('encouraged_reading', {
                    from_page: currentPage,
                    to_page: currentPage + 1,
                  });
                  setShowBackConfirmModal(false);
                  nextPage();
                }}
                style={tw`py-4 border-b border-gray-200`}
                activeOpacity={0.4}
              >
                <Text style={[
                  tw`text-center`,
                  { 
                    fontSize: 17, 
                    fontWeight: '600', 
                    letterSpacing: -0.4,
                    color: '#007AFF',
                  }
                ]}>
                  Yes! Read 1 More Page 🤲
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  console.log('[QURAN SCREEN] User confirmed back navigation');
                  setShowBackConfirmModal(false);
                  // Use reset to properly navigate back and allow the navigation
                  navigation.dispatch(
                    navigation.getState().index > 0 
                      ? navigation.goBack() 
                      : navigation.navigate('Quran', {
                          screen: 'QuranTabs',
                          params: { screen: 'JuzList' },
                        })
                  );
                }}
                style={tw`py-4`}
                activeOpacity={0.4}
              >
                <Text style={[
                  tw`text-center`,
                  { 
                    fontSize: 17, 
                    fontWeight: '400', 
                    letterSpacing: -0.4,
                    color: '#007AFF',
                  }
                ]}>
                  Maybe Later 😊
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
