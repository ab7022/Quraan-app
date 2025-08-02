import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import QuranPageScreen from '../screens/QuranPageScreen';
import SurahsScreen from '../screens/SurahsScreen';
import SurahDetailScreen from '../screens/SurahDetailScreen';
import JuzScreen from '../screens/JuzScreen';
import JuzDetailScreen from '../screens/JuzDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MushafStyleScreen from '../screens/MushafStyleScreen';
import AskDoubtScreen from '../screens/AskDoubtScreen';
import HifzScreen from '../screens/HifzScreen';
import LearnQuranScreen from '../screens/LearnQuranScreen';
import StreakScreen from '../screens/StreakScreen';
import analytics from '../services/analyticsService';

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
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#F2F2F7',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 12,
          paddingBottom: 4,
          paddingHorizontal: 20,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 16,
          textTransform: 'none',
          letterSpacing: -0.2,
          marginBottom: 4,
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#007AFF',
          height: 2,
          borderRadius: 1,
          marginHorizontal: 20,
        },
        tabBarIndicatorContainerStyle: {
          marginLeft: 20,
          marginRight: 20,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          marginHorizontal: 16,
          borderRadius: 8,
        },
        tabBarPressColor: '#007AFF20',
        tabBarPressOpacity: 0.3,
      }}
    >
      <TopTab.Screen
        name="SurahsList"
        component={SurahsScreen}
        options={{
          tabBarLabel: 'Surahs',
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

// Home Stack Navigator for Home section
function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F2F2F7' },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Hifz" component={HifzScreen} />
      <Stack.Screen name="LearnQuran" component={LearnQuranScreen} />
      <Stack.Screen name="Streak" component={StreakScreen} />
    </Stack.Navigator>
  );
}

// Main Stack Navigator for Quran section
function QuranNavigator() {
  const scheme = useColorScheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F2F2F7',
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="QuranTabs" component={QuranTopTabs} />
        <Stack.Screen name="SurahDetail" component={SurahDetailScreen} />
        <Stack.Screen name="JuzDetail" component={JuzDetailScreen} />
        <Stack.Screen name="QuranPage" component={QuranPageScreen} />
        <Stack.Screen name="MushafStyle" component={MushafStyleScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

// Function to determine if tab bar should be visible
function getTabBarDisplay(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';

  // Hide tab bar on QuranPage screen
  if (routeName === 'QuranPage') {
    return 'none';
  }

  // Hide tab bar on Hifz screen
  if (routeName === 'Hifz') {
    return 'none';
  }

  // Hide tab bar on LearnQuran screen
  if (routeName === 'LearnQuran') {
    return 'none';
  }
    if (routeName === 'AskDoubtMain') {
      return 'none';
    }

  return 'flex'; // Show tab bar on all other screens
}

// Settings Stack Navigator for Settings section
function SettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F2F2F7' },
      }}
    >
      <Stack.Screen name="SettingsMain" component={ProfileScreen} />
      <Stack.Screen name="MushafStyle" component={MushafStyleScreen} />
    </Stack.Navigator>
  );
}

// AskDoubt Stack Navigator for AskDoubt section
function AskDoubtNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F2F2F7' },
      }}
    >
      <Stack.Screen name="AskDoubtMain" component={AskDoubtScreen} />
    </Stack.Navigator>
  );
}

const tabIcons = {
  Home: {
    focused: 'home',
    unfocused: 'home-outline'
  },
  Quran: {
    focused: 'book',
    unfocused: 'book-outline'
  },
  AskDoubt: {
    focused: 'help-circle',
    unfocused: 'help-circle-outline'
  },
  Settings: {
    focused: 'settings',
    unfocused: 'settings-outline'
  },
};

export default function MainNavigator() {
  const scheme = useColorScheme();

  const handleTabPress = tabName => {
    console.log(
      `[TAB LOG] Tab pressed: ${tabName} at ${new Date().toLocaleTimeString()}`
    );

    // Track tab navigation
    analytics.trackNavigationEvent('BottomTab', tabName, 'tab_press');
    analytics.trackUserAction('tab_navigation', {
      tab_name: tabName,
      timestamp: new Date().toISOString(),
    });
  };

  const handleTabFocus = tabName => {
    console.log(
      `[TAB LOG] Tab focused: ${tabName} at ${new Date().toLocaleTimeString()}`
    );

    // Track tab focus (when actually navigated to)
    analytics.trackScreenView(tabName, {
      navigation_type: 'tab_focus',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = focused 
            ? tabIcons[route.name]?.focused 
            : tabIcons[route.name]?.unfocused;
          
          return (
            <Ionicons
              name={iconName}
              size={focused ? 26 : 24}
              color={color}
              style={{
                marginTop: 2,
              }}
            />
          );
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          display:
            route.name === 'Quran' || route.name === 'Home'
              ? getTabBarDisplay(route)
              : 'flex',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(248, 248, 248, 0.94)',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(60, 60, 67, 0.12)',
          height: 83,
          paddingBottom: 20,
          paddingTop: 8,
          paddingHorizontal: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffset: {
            width: 0,
            height: -0.5,
          },
          shadowOpacity: 0.1,
          shadowRadius: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 10,
          marginTop: -2,
          letterSpacing: 0,
        },
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 2,
        },
      })}
      screenListeners={({ route, navigation }) => ({
        tabPress: () => handleTabPress(route.name),
        focus: () => handleTabFocus(route.name),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          headerShown: false,
        }}
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
        name="AskDoubt"
        component={AskDoubtNavigator}
        options={{
          tabBarLabel: 'Ask Doubt',
        }}
        listeners={({ navigation, route }) => ({
          tabPress: () => console.log('[TAB] Ask Doubt tab pressed'),
          focus: () => console.log('[TAB] Ask Doubt tab focused'),
        })}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        listeners={({ navigation, route }) => ({
          tabPress: () => console.log('[TAB] Settings tab pressed'),
          focus: () => console.log('[TAB] Settings tab focused'),
        })}
      />
    </Tab.Navigator>
  );
}
