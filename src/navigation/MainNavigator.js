import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import QuranPageScreen from '../screens/QuranPageScreen';
import SurahsScreen from '../screens/SurahsScreen';
import SurahDetailScreen from '../screens/SurahDetailScreen';
import JuzScreen from '../screens/JuzScreen';
import JuzDetailScreen from '../screens/JuzDetailScreen';
import StreakScreen from '../screens/StreakScreen';
import { useColorScheme } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator for Surahs
function SurahsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SurahsList" component={SurahsScreen} />
      <Stack.Screen name="SurahDetail" component={SurahDetailScreen} />
      <Stack.Screen name="QuranPage" component={QuranPageScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator for Juz
function JuzStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JuzList" component={JuzScreen} />
      <Stack.Screen name="JuzDetail" component={JuzDetailScreen} />
      <Stack.Screen name="QuranPage" component={QuranPageScreen} />
    </Stack.Navigator>
  );
}

const tabIcons = {
  Home: 'home',
  Quran: 'book-outline',
  Surahs: 'list-outline',
  Juz: 'albums-outline',
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
        tabBarActiveTintColor: '#4F8A10',
        tabBarInactiveTintColor: scheme === 'dark' ? '#ccc' : '#888',
        tabBarStyle: {
          backgroundColor: scheme === 'dark' ? '#18181b' : '#fff',
          borderTopWidth: 0.5,
          borderTopColor: scheme === 'dark' ? '#222' : '#eee',
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
        component={QuranPageScreen}
        listeners={({ navigation, route }) => ({
          tabPress: () => console.log('[TAB] Quran tab pressed'),
          focus: () => console.log('[TAB] Quran tab focused'),
        })}
      />
      <Tab.Screen 
        name="Surahs" 
        component={SurahsStack}
        listeners={({ navigation, route }) => ({
          tabPress: () => console.log('[TAB] Surahs tab pressed'),
          focus: () => console.log('[TAB] Surahs tab focused'),
        })}
      />
      <Tab.Screen 
        name="Juz" 
        component={JuzStack}
        listeners={({ navigation, route }) => ({
          tabPress: () => console.log('[TAB] Juz tab pressed'),
          focus: () => console.log('[TAB] Juz tab focused'),
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
