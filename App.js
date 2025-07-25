import "react-native-url-polyfill/auto"

import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import tw from 'twrnc';
import store from './src/store';
import MainNavigator from './src/navigation/MainNavigator';
import { QuranLogo } from './src/components/QuranLogo';

export default function App() {
  const scheme = useColorScheme();
  return (
    <Provider store={store}>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <MainNavigator />
      </NavigationContainer>
    </Provider>
  );
}
