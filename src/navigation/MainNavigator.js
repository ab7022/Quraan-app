import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import QuranPageScreen from '../screens/QuranPageScreen';
import SurahsScreen from '../screens/SurahsScreen';
import SurahDetailScreen from '../screens/SurahDetailScreen';
import JuzScreen from '../screens/JuzScreen';
import JuzDetailScreen from '../screens/JuzDetailScreen';
import StreakScreen from '../screens/StreakScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const TopTab = createMaterialTopTabNavigator();

// Top Tab Navigator for Quran section (Surah and Juz)
function QuranTopTabs() {
  const scheme = useColorScheme();
  
  return (
    <TopTab.Navigator
      initialRouteName="SurahsList"
      screenOptions={{
        tabBarActiveTintColor: '#92400e',
        tabBarInactiveTintColor: scheme === 'dark' ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: scheme === 'dark' ? '#1F2937' : '#FFFBEB',
          borderBottomWidth: 1,
          borderBottomColor: scheme === 'dark' ? '#374151' : '#E5E7EB',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 18,
          textTransform: 'none',
          letterSpacing: 0.5,
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#92400e',
          height: 4,
          borderRadius: 2,
        },
        tabBarContentContainerStyle: {
          paddingHorizontal: 20,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <TopTab.Screen 
        name="SurahsList" 
        component={SurahsScreen}
        options={{
          tabBarLabel: 'Surah',
        }}
      />
      <TopTab.Screen 
        name="JuzList" 
        component={JuzScreen}
        options={{
          tabBarLabel: 'Juz',
        }}
      />
    </TopTab.Navigator>
  );
}

// Main Stack Navigator for Quran section
function QuranNavigator() {
  const scheme = useColorScheme();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: scheme === 'dark' ? '#1F2937' : '#FFFBEB' }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="QuranTabs" component={QuranTopTabs} />
        <Stack.Screen name="SurahDetail" component={SurahDetailScreen} />
        <Stack.Screen name="JuzDetail" component={JuzDetailScreen} />
        <Stack.Screen name="QuranPage" component={QuranPageScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

const tabIcons = {
  Home: 'home',
  Quran: 'book-outline',
  Streak: 'flame',
};

export default function MainNavigator() {
  const scheme = useColorScheme();
  
  const handleTabPress = (tabName) => {
    console.log(`[TAB LOG] Tab pressed: ${tabName} at ${new Date().toLocaleTimeString()}`);
  };

  const handleTabFocus = (tabName) => {
    console.log(`[TAB LOG] Tab focused: ${tabName} at ${new Date().toLocaleTimeString()}`);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} size={size} color={color} accessibilityLabel={route.name + ' tab icon'} />
        ),
        tabBarActiveTintColor: '#92400e',
        tabBarInactiveTintColor: scheme === 'dark' ? '#ccc' : '#888',
        tabBarStyle: {
          backgroundColor: scheme === 'dark' ? '#18181b' : '#FFFBEB',
          borderTopWidth: 0.5,
          borderTopColor: scheme === 'dark' ? '#222' : '#F3E8FF',
        },
        tabBarLabelStyle: {
          fontWeight: '600',
        },
      })}
      screenListeners={({ route, navigation }) => ({
        tabPress: () => handleTabPress(route.name),
        focus: () => handleTabFocus(route.name),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        listeners={({ navigation, route }) => ({
          tabPress: () => console.log('[TAB] Home tab pressed'),
          focus: () => console.log('[TAB] Home tab focused'),
        })}
      />
      <Tab.Screen 
        name="Quran" 
        component={QuranNavigator}
        listeners={({ navigation, route }) => ({
          tabPress: () => console.log('[TAB] Quran tab pressed'),
          focus: () => console.log('[TAB] Quran tab focused'),
        })}
      />
      <Tab.Screen 
        name="Streak" 
        component={StreakScreen}
        listeners={({ navigation, route }) => ({
          tabPress: () => console.log('[TAB] Streak tab pressed'),
          focus: () => console.log('[TAB] Streak tab focused'),
        })}
      />
    </Tab.Navigator>
  );
}
