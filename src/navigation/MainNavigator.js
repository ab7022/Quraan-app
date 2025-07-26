import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
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

// Function to determine if tab bar should be visible
function getTabBarDisplay(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  
  // Hide tab bar on QuranPage screen
  if (routeName === 'QuranPage') {
    return 'none';
  }
  
  return 'flex'; // Show tab bar on all other screens
}

const tabIcons = {
  Home: 'home',
  Quran: 'book-outline',
  Explore: 'compass-outline',
  Leaderboard: 'trophy-outline',
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
        tabBarIcon: ({ color, size, focused }) => (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 42,
            borderRadius: 22,
            backgroundColor: focused ? 'rgba(8, 145, 178, 0.15)' : 'transparent',
            borderWidth: focused ? 1 : 0,
            borderColor: focused ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
            // Enhanced glassmorphism for focused icons
            ...(focused && {
              shadowColor: '#0891B2',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
              // Inner glow effect
              backgroundColor: 'rgba(8, 145, 178, 0.1)',
              backdropFilter: 'blur(10px)',
            }),
          }}>
            <Ionicons 
              name={tabIcons[route.name]} 
              size={focused ? 26 : 24} 
              color={color} 
              accessibilityLabel={route.name + ' tab icon'}
            />
          </View>
        ),
        tabBarActiveTintColor: '#0891B2',
        tabBarInactiveTintColor: '#6B7280', // Slightly darker for better contrast
        tabBarStyle: {
          display: route.name === 'Quran' ? getTabBarDisplay(route) : 'flex',
          position: 'absolute',
          bottom: 0, // Stick to bottom, no floating
          left: 0,
          right: 0,
          backgroundColor: 'transparent',
          borderRadius: 0, // No border radius for full bottom coverage
          borderWidth: 0,
          height: 85,
          paddingBottom: 25, // More padding for safe area
          paddingTop: 15,
          paddingHorizontal: 20,
          shadowColor: 'rgba(0, 0, 0, 0.25)', // Keep strong shadow for depth
          shadowOffset: {
            width: 0,
            height: -8, // Upward shadow for stuck-to-bottom effect
          },
          shadowOpacity: 0.3,
          shadowRadius: 25, // Large blur for glassmorphism
          elevation: 15,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100} // Maximum blur intensity for glassmorphism
            tint="light"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.1)', // Low opacity for true glass effect
              backdropFilter: 'blur(40px)', // Strong blur
              borderRadius: 0, // No border radius to match container
              // Remove top border for cleaner look
              borderTopWidth: 0,
              // Inner highlight for glass effect
              shadowColor: 'rgba(255, 255, 255, 0.5)',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 2,
            }}
          />
        ),
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 12,
          marginTop: 2,
          letterSpacing: 0.5,
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
