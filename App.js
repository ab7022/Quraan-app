import "react-native-url-polyfill/auto"

import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { useColorScheme, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import store from './src/store';
import MainNavigator from './src/navigation/MainNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { QuranLogo } from './src/components/QuranLogo';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import analytics from './src/services/analyticsService';

export default function App() {
  const scheme = useColorScheme();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(null);

  useEffect(() => {
    // Initialize analytics when app starts
    analytics.startNewSession();
    
    // Check if onboarding is completed
    checkOnboardingStatus();

    // Track app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        analytics.startNewSession();
      } else if (nextAppState === 'background') {
        analytics.endSession();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      analytics.endSession();
    };
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      setIsOnboardingComplete(onboardingCompleted === 'true');
    } catch (error) {
      console.log('Error checking onboarding status:', error);
      setIsOnboardingComplete(false);
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

  // Show loading until we determine onboarding status
  if (isOnboardingComplete === null) {
    return null; // or a splash screen component
  }

  // Show onboarding if not completed
  if (!isOnboardingComplete) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <SafeAreaProvider>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} hidden={false} />
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          </SafeAreaProvider>
        </Provider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} hidden={false} />
            <MainNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
