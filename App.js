import "react-native-url-polyfill/auto"

import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { useColorScheme, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import tw from 'twrnc';
import store from './src/store';
import MainNavigator from './src/navigation/MainNavigator';
import { QuranLogo } from './src/components/QuranLogo';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import analytics from './src/services/analyticsService';

export default function App() {
  const scheme = useColorScheme();

  useEffect(() => {
    // Initialize analytics when app starts
    analytics.startNewSession();

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
