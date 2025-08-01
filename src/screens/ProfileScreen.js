import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Linking,
  Platform,
  Modal,
  Share,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadStreak, getLast7DaysStreak } from '../store/streakSlice';
import analytics from '../services/analyticsService';

const SettingsItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightContent = null,
  iconColor = "#007AFF",
  iconBg = null,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200`}
    activeOpacity={0.3}
  >
    <View style={tw`flex-row items-center flex-1`}>
      {icon && (
        <View
          style={[
            tw`w-7 h-7 rounded-lg items-center justify-center mr-3`,
            { backgroundColor: iconBg || iconColor }
          ]}
        >
          <Ionicons 
            name={icon} 
            size={18} 
            color={iconBg ? "white" : iconColor} 
          />
        </View>
      )}
      <View style={tw`flex-1`}>
        <Text style={tw`text-base text-black font-normal`}>
          {title}
        </Text>
        {subtitle && (
          <Text style={tw`text-sm text-gray-500 mt-0.5`}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    {rightContent ||
      (showArrow && (
        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
      ))}
  </TouchableOpacity>
);

const SectionHeader = ({ title }) => (
  <View style={tw`px-4 py-2 bg-gray-50`}>
    <Text style={tw`text-sm text-gray-500 uppercase font-normal tracking-wide`}>
      {title}
    </Text>
  </View>
);

export default function SettingsScreen({ navigation }) {
  const { streak, totalDaysRead, longestStreak, lastReadPage, readingHistory } =
    useSelector(s => s.streak);
  const dispatch = useDispatch();

  const [userName, setUserName] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [settings, setSettings] = useState({
    explanationLanguage: null, // null means not set yet
    nightMode: false,
  });

  // Get last 7 days reading data using the same function as HomeScreen
  const last7DaysData = getLast7DaysStreak(readingHistory);

  // Helper function to format time
  const formatTime = date => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  useEffect(() => {
    console.log('[SETTINGS SCREEN] Component mounted');
    analytics.trackScreenView('SettingsScreen', {
      current_streak: streak,
      total_days_read: totalDaysRead,
    });

    dispatch(loadStreak());
    loadSettings();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const savedName = await AsyncStorage.getItem('user_name');
      if (savedName) {
        setUserName(savedName);
      }
    } catch (error) {
      console.log('Error loading user name:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('quran_app_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async newSettings => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(
        'quran_app_settings',
        JSON.stringify(updatedSettings)
      );
      analytics.trackUserAction('settings_changed', {
        setting: Object.keys(newSettings)[0],
      });
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const handleExplanationLanguageChange = () => {
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
      { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
      { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
      { code: 'ms', name: 'Malay', flag: '🇲🇾' },
      { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    ];

    const buttons = languages.map(lang => ({
      text: `${lang.flag} ${lang.name}`,
      onPress: () => saveSettings({ explanationLanguage: lang }),
    }));

    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Select Explanation Language',
      'Choose your preferred language for Quran explanations and tafseer',
      buttons
    );
  };

  const handleRateApp = async () => {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.quranapp.mobile';
    
    try {
      const supported = await Linking.canOpenURL(playStoreUrl);
      if (supported) {
        await Linking.openURL(playStoreUrl);
        analytics.trackUserAction('app_rated', {
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        });
      } else {
        Alert.alert(
          'Rate Our App',
          'Please visit the Google Play Store to rate our app:\n\nhttps://play.google.com/store/apps/details?id=com.quranapp.mobile',
          [
            {
              text: 'Copy Link',
              onPress: () => {
                Alert.alert('Link Copied', 'Play Store link copied to your memory!');
              },
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      console.log('Error opening Play Store:', error);
      Alert.alert(
        'Rate Our App',
        'Thank you for wanting to rate our app! Please visit:\n\nhttps://play.google.com/store/apps/details?id=com.quranapp.mobile'
      );
    }
  };

  const handleShareApp = async () => {
    try {
      const shareMessage = `🕌 Check out this amazing Quran App! 📖

A beautiful way to read and learn the Holy Quran with:
✨ Daily reading streaks
📚 Complete Surahs and Juz
🎯 Personal reading goals
📱 Beautiful reading experience

Download now and start your spiritual journey!

📲 Google Play Store:
https://play.google.com/store/apps/details?id=com.quranapp.mobile

🌟 #QuranApp #IslamicApp #Quran`;

      const result = await Share.share(
        {
          message: shareMessage,
          title: "Qur'an App - Your Spiritual Companion",
          url: 'https://play.google.com/store/apps/details?id=com.quranapp.mobile',
        },
        {
          dialogTitle: "Share Qur'an App with others",
          subject: 'Amazing Quran App - Start Your Spiritual Journey',
          tintColor: '#059669',
        }
      );

      // Track sharing analytics
      if (result.action === Share.sharedAction) {
        analytics.trackUserAction('app_shared', {
          method: result.activityType || 'unknown',
          platform: Platform.OS,
        });

        if (Platform.OS === 'android' || result.activityType) {
          console.log(
            'App shared successfully via:',
            result.activityType || 'native share'
          );
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share sheet dismissed');
      }
    } catch (error) {
      console.log('Error sharing app:', error);
      // Fallback to simple alert if share fails
      Alert.alert(
        'Share Quran App',
        `Share this beautiful Quran app with your friends and family!

Quran App - A beautiful way to read and learn the Holy Quran.

📲 Download from Google Play Store:
https://play.google.com/store/apps/details?id=com.quranapp.mobile`,
        [
          {
            text: 'Copy Link',
            onPress: () => {
              Alert.alert(
                'Link Copied',
                'Play Store link copied! You can paste it in any app.'
              );
            },
          },
          { text: 'OK' },
        ]
      );
    }
  };

  const handleEditName = () => {
    setTempName(userName);
    setShowNameModal(true);
  };

  const handleSaveName = async () => {
    if (tempName && tempName.trim()) {
      try {
        await AsyncStorage.setItem('user_name', tempName.trim());
        setUserName(tempName.trim());
        analytics.trackUserAction('name_updated', {
          name_length: tempName.trim().length,
        });
      } catch (error) {
        console.log('Error saving name:', error);
      }
    } else {
      // If empty, remove the name
      try {
        await AsyncStorage.removeItem('user_name');
        setUserName('');
        analytics.trackUserAction('name_removed');
      } catch (error) {
        console.log('Error removing name:', error);
      }
    }
    setShowNameModal(false);
    setTempName('');
  };

  const handleCancelNameEdit = () => {
    setShowNameModal(false);
    setTempName('');
  };

  const handleWhatsAppSupport = async () => {
    setShowSupportModal(false);
    const phoneNumber = '8217003676';
    const message = `Hi! I need help with the Quran App. ${userName ? `My name is ${userName}.` : ''}`;
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
        analytics.trackUserAction('support_contact', { method: 'whatsapp' });
      } else {
        Alert.alert(
          'WhatsApp Not Found',
          'WhatsApp is not installed on your device. Please install WhatsApp or contact us via email.',
          [
            { text: 'OK' },
            { text: 'Contact via Email', onPress: handleEmailSupport },
          ]
        );
      }
    } catch (error) {
      console.log('Error opening WhatsApp:', error);
      Alert.alert(
        'Error',
        'Unable to open WhatsApp. Please try again or contact us via email.'
      );
    }
  };

  const handleEmailSupport = async () => {
    setShowSupportModal(false);
    const email = 'bayees1@gmail.com';
    const subject = 'Quran App Support Request';
    const body = `Hi,\n\nI need help with the Quran App.\n\n${userName ? `Name: ${userName}\n` : ''}Device: ${Platform.OS}\nApp Version: 1.0.0\n\nIssue Description:\n[Please describe your issue here]\n\nThank you!`;
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
        analytics.trackUserAction('support_contact', { method: 'email' });
      } else {
        Alert.alert(
          'Email Not Available',
          `Please send an email to: ${email}\n\nOr contact us via WhatsApp: +91 8217003676`,
          [
            {
              text: 'Copy Email',
              onPress: () => {
                // In a real app, you'd copy to clipboard here
                Alert.alert('Email Address', email);
              },
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      console.log('Error opening email:', error);
      Alert.alert('Error', 'Unable to open email app. Please try again.');
    }
  };

  const handleHelpAndSupport = () => {
    setShowSupportModal(true);
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      '⚠️ Delete All Data',
      'This will permanently delete:\n\n• Your reading progress and streaks\n• All stored settings and preferences\n• User name and personal data\n• Reading history and statistics\n\nThis action cannot be undone. Are you sure you want to continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '🚨 Final Warning',
              'This is your final chance to cancel. All your data will be permanently deleted and cannot be recovered.',
              [
                {
                  text: 'Keep My Data',
                  style: 'cancel',
                },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: performDataDeletion,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const performDataDeletion = async () => {
    try {
      // Show loading state
      Alert.alert(
        'Deleting Data...',
        'Please wait while we delete all your data.',
        [],
        { cancelable: false }
      );

      // Get ALL keys from AsyncStorage first
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys found:', allKeys);

      // Define the exact keys that need to be deleted based on actual app usage
      const keysToDelete = [
        // Current actual keys found in the app
        'daily_target_data',
        'islamic_chat_history',
        'mushaf_style',
        'onboarding_completed',
        'quran_app_settings',
        'quran_last_page',
        'quran_reading_history',
        'quran_streak',
        'rate_limit_ask',
        'tafseer_language',
        
        // Additional common keys that might exist
        'user_name',
        'continue_reading',
        'last_read_page',
        'reading_streak',
        'reading_history',
        'hifz_progress',
        'explanation_language',
        'night_mode',
        'bookmarks',
        'favorites',
        'notes',
        'highlights',
        'settings',
        'app_preferences',
      ];
      
      // Filter to only include keys that actually exist
      const existingKeysToDelete = keysToDelete.filter(key => allKeys.includes(key));
      
      console.log('Keys to be deleted:', existingKeysToDelete);
      console.log('Total keys to delete:', existingKeysToDelete.length);

      // Delete all identified keys
      if (existingKeysToDelete.length > 0) {
        await AsyncStorage.multiRemove(existingKeysToDelete);
        console.log('Successfully deleted keys:', existingKeysToDelete);
      }

      // Reset all local state variables
      setUserName('');
      setSettings({
        explanationLanguage: null,
        nightMode: false,
      });
      setTempName('');
      setShowNameModal(false);
      setShowStreakModal(false);
      setShowSupportModal(false);

      // Track the data deletion event
      analytics.trackUserAction('data_deleted', {
        timestamp: new Date().toISOString(),
        keys_deleted: existingKeysToDelete.length,
        total_keys_found: allKeys.length,
      });

      // Final verification
      const finalKeys = await AsyncStorage.getAllKeys();
      console.log('Remaining keys after deletion:', finalKeys);

      // Show success message
      Alert.alert(
        '✅ All Data Deleted Successfully',
        `Complete data wipe completed successfully!\n\n• Deleted ${existingKeysToDelete.length} data entries\n• Cleared all user preferences\n• Reset all progress and streaks\n• Removed all app data\n\nThe app will now restart with completely fresh settings.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to home and reload everything
              navigation.navigate('Home');
              // Reload streak data to reflect the reset
              dispatch(loadStreak());
            },
          },
        ]
      );

    } catch (error) {
      console.error('Error during data deletion:', error);
      Alert.alert(
        '❌ Deletion Failed',
        `There was an error deleting your data: ${error.message}\n\nPlease try again or contact support if the problem persists.\n\nError details: ${error.toString()}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleViewStreaks = () => {
    setShowStreakModal(true);
  };

  const handleBackPress = () => {
    navigation.goBack?.();
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {/* iOS-Style Header */}
      <View style={tw`bg-gray-100 px-4 py-2`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={tw`py-2`}
            accessibilityLabel="Go back"
          >
            <View style={tw`flex-row items-center`}>
              <Ionicons name="chevron-back" size={28} color="#007AFF" />
              <Text style={tw`text-lg text-blue-500 ml-1`}>Back</Text>
            </View>
          </TouchableOpacity>

          <Text style={tw`text-lg font-semibold text-black`}>
            Settings
          </Text>

          <View style={tw`w-16`} />
        </View>
      </View>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* User Section */}
        <View style={tw`mt-6`}>
          <TouchableOpacity 
            onPress={handleEditName} 
            style={tw`bg-white px-4 py-4 border-b border-gray-200`}
            activeOpacity={0.3}
          >
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-16 h-16 rounded-full bg-gray-300 items-center justify-center mr-4`}>
                <Ionicons name="person" size={32} color="#666" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xl font-medium text-black mb-1`}>
                  {userName || 'User'}
                </Text>
                <Text style={tw`text-base text-gray-500`}>
                  {lastReadPage ? `Last read: ${lastReadPage.name}` : 'Start your journey today'}
                </Text>
                <Text style={tw`text-sm text-blue-500 mt-1`}>
                  {userName ? 'Tap to edit' : 'Tap to set name'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Reading Progress Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Reading Progress" />
          <View style={tw`bg-white border-t border-gray-200`}>
            <SettingsItem
              icon="analytics"
              iconBg="#FF3B30"
              title="Statistics"
              subtitle={`${streak} day streak • ${totalDaysRead} total days`}
              onPress={handleViewStreaks}
            />
          </View>
        </View>

        {/* Reading Settings Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Reading Settings" />
          <View style={tw`bg-white border-t border-gray-200`}>
            <SettingsItem
              icon="book"
              iconBg="#007AFF"
              title="Mushaf Style"
              subtitle="Choose your preferred layout"
              onPress={() => navigation.navigate('MushafStyle')}
            />
          </View>
        </View>

        {/* Support & Feedback Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Support & Feedback" />
          <View style={tw`bg-white border-t border-gray-200`}>
            <SettingsItem
              icon="help-circle"
              iconBg="#34C759"
              title="Help & Support"
              subtitle="Get help via WhatsApp or Email"
              onPress={handleHelpAndSupport}
            />
            <SettingsItem
              icon="star"
              iconBg="#FF9500"
              title="Rate App"
              subtitle="Share feedback on Google Play Store"
              onPress={handleRateApp}
            />
            <SettingsItem
              icon="share"
              iconBg="#5856D6"
              title="Share App"
              subtitle="Tell others about this app"
              onPress={handleShareApp}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="About" />
          <View style={tw`bg-white border-t border-gray-200`}>
            <SettingsItem
              icon="information-circle"
              iconBg="#8E8E93"
              title="About"
              subtitle="Version 1.0.0"
              onPress={() =>
                Alert.alert(
                  'About',
                  'Quran App v1.0.0\nA beautiful way to read and learn the Quran.\n\nDeveloped by Abdul Bayees\nContact: bayees1@gmail.com'
                )
              }
            />
            <SettingsItem
              icon="trash"
              iconBg="#FF3B30"
              title="Delete All Data"
              subtitle="Permanently remove all stored data"
              onPress={handleDeleteAllData}
            />
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={tw`h-20`} />
      </ScrollView>

      {/* iOS-Style Name Edit Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelNameEdit}
      >
        <View style={tw`flex-1 bg-gray-100`}>
          {/* iOS Navigation Header */}
          <SafeAreaView style={tw`bg-gray-100`}>
            <View style={tw`px-4 py-2 border-b border-gray-200 bg-gray-100`}>
              <View style={tw`flex-row items-center justify-between`}>
                <TouchableOpacity onPress={handleCancelNameEdit} style={tw`py-2`}>
                  <Text style={tw`text-lg text-blue-500`}>Cancel</Text>
                </TouchableOpacity>
                
                <Text style={tw`text-lg font-semibold text-black`}>Edit Name</Text>
                
                <TouchableOpacity onPress={handleSaveName} style={tw`py-2`}>
                  <Text style={tw`text-lg text-blue-500 font-semibold`}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          <ScrollView style={tw`flex-1`}>
            {/* User Section */}
            <View style={tw`mt-6`}>
              <View style={tw`bg-white px-4 py-4 border-b border-gray-200`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-16 h-16 rounded-full bg-gray-300 items-center justify-center mr-4`}>
                    <Ionicons name="person" size={32} color="#666" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-sm text-gray-500 mb-1`}>NAME</Text>
                    <TextInput
                      style={tw`text-xl text-black font-medium`}
                      placeholder="Enter your name"
                      placeholderTextColor="#9ca3af"
                      value={tempName}
                      onChangeText={setTempName}
                      autoFocus={true}
                      maxLength={50}
                      selectionColor="#007AFF"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Info Section */}
            <View style={tw`mt-8`}>
              <SectionHeader title="About Names" />
              <View style={tw`bg-white border-t border-gray-200`}>
                <View style={tw`px-4 py-3`}>
                  <Text style={tw`text-base text-black mb-2`}>Your name will be used for:</Text>
                  <Text style={tw`text-sm text-gray-600 leading-relaxed`}>
                    • Personal greetings throughout the app{'\n'}
                    • Support messages and communications{'\n'}
                    • A more personalized reading experience
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* iOS-Style Reading Progress Modal */}
      <Modal
        visible={showStreakModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStreakModal(false)}
      >
        <View style={tw`flex-1 bg-gray-100`}>
          {/* iOS Navigation Header */}
          <SafeAreaView style={tw`bg-gray-100`}>
            <View style={tw`px-4 py-2 border-b border-gray-200 bg-gray-100`}>
              <View style={tw`flex-row items-center justify-between`}>
                <TouchableOpacity onPress={() => setShowStreakModal(false)} style={tw`py-2`}>
                  <Text style={tw`text-lg text-blue-500`}>Done</Text>
                </TouchableOpacity>
                
                <Text style={tw`text-lg font-semibold text-black`}>Statistics</Text>
                
                <View style={tw`w-16`} />
              </View>
            </View>
          </SafeAreaView>

          <ScrollView style={tw`flex-1`}>
            {/* Current Streak Section */}
            <View style={tw`mt-6`}>
              <View style={tw`bg-white px-4 py-6 border-b border-gray-200 items-center`}>
                <Text style={tw`text-6xl font-bold ${streak > 0 ? 'text-orange-500' : 'text-blue-500'} mb-2`}>
                  {streak}
                </Text>
                <Text style={tw`text-xl font-medium text-black mb-1`}>
                  Day Streak {streak > 0 ? '🔥' : '📖'}
                </Text>
                <Text style={tw`text-base text-gray-500 text-center`}>
                  {streak > 0 
                    ? 'Keep up the amazing work!'
                    : 'Start reading today to begin your streak'
                  }
                </Text>
              </View>
            </View>

            {/* Stats Section */}
            <View style={tw`mt-8`}>
              <SectionHeader title="Reading Statistics" />
              <View style={tw`bg-white border-t border-gray-200`}>
                <View style={tw`px-4 py-3 border-b border-gray-200`}>
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text style={tw`text-base text-black`}>Total Days Read</Text>
                    <Text style={tw`text-base text-gray-500 font-medium`}>{totalDaysRead}</Text>
                  </View>
                </View>
                <View style={tw`px-4 py-3 border-b border-gray-200`}>
                  <View style={tw`flex-row justify-between items-center`}>
                    <Text style={tw`text-base text-black`}>Best Streak</Text>
                    <Text style={tw`text-base text-gray-500 font-medium`}>{longestStreak} days</Text>
                  </View>
                </View>
                {lastReadPage && (
                  <View style={tw`px-4 py-3`}>
                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={tw`text-base text-black`}>Last Read</Text>
                      <Text style={tw`text-base text-gray-500 font-medium`}>{lastReadPage.name}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Weekly Activity Section */}
            <View style={tw`mt-8`}>
              <SectionHeader title="This Week" />
              <View style={tw`bg-white border-t border-gray-200 px-4 py-6`}>
                <View style={tw`flex-row justify-between items-end h-16 mb-4`}>
                  {last7DaysData.map((day, index) => (
                    <View key={index} style={tw`items-center flex-1`}>
                      <View
                        style={[
                          tw`w-8 rounded-lg mb-3`,
                          day.hasRead
                            ? [tw`bg-green-500`, { height: 40 }]
                            : day.isToday
                              ? [tw`bg-blue-400`, { height: 24 }]
                              : [tw`bg-gray-300`, { height: 12 }],
                        ]}
                      />
                      <Text style={tw`text-sm text-gray-600 font-medium`}>
                        {day.dayName.slice(0, 3)}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <View style={tw`flex-row justify-center items-center mt-4 space-x-6`}>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-3 h-3 bg-green-500 rounded-full mr-2`} />
                    <Text style={tw`text-sm text-gray-600`}>Completed</Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-3 h-3 bg-blue-400 rounded-full mr-2`} />
                    <Text style={tw`text-sm text-gray-600`}>Today</Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-3 h-3 bg-gray-300 rounded-full mr-2`} />
                    <Text style={tw`text-sm text-gray-600`}>Missed</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* iOS-Style Support Modal */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={tw`flex-1 bg-gray-100`}>
          {/* iOS Navigation Header */}
          <SafeAreaView style={tw`bg-gray-100`}>
            <View style={tw`px-4 py-2 border-b border-gray-200 bg-gray-100`}>
              <View style={tw`flex-row items-center justify-between`}>
                <TouchableOpacity onPress={() => setShowSupportModal(false)} style={tw`py-2`}>
                  <Text style={tw`text-lg text-blue-500`}>Done</Text>
                </TouchableOpacity>
                
                <Text style={tw`text-lg font-semibold text-black`}>Help & Support</Text>
                
                <View style={tw`w-16`} />
              </View>
            </View>
          </SafeAreaView>

          <ScrollView style={tw`flex-1`}>
            {/* Contact Methods Section */}
            <View style={tw`mt-6`}>
              <SectionHeader title="Get Help" />
              <View style={tw`bg-white border-t border-gray-200`}>
                <TouchableOpacity
                  onPress={handleWhatsAppSupport}
                  style={tw`px-4 py-3 border-b border-gray-200 flex-row items-center`}
                  activeOpacity={0.3}
                >
                  <View style={[
                    tw`w-7 h-7 rounded-lg items-center justify-center mr-3`,
                    { backgroundColor: '#25D366' }
                  ]}>
                    <Ionicons name="logo-whatsapp" size={18} color="white" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-base text-black`}>WhatsApp Support</Text>
                    <Text style={tw`text-sm text-gray-500 mt-0.5`}>
                      Quick responses • Usually within minutes
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleEmailSupport}
                  style={tw`px-4 py-3 flex-row items-center`}
                  activeOpacity={0.3}
                >
                  <View style={[
                    tw`w-7 h-7 rounded-lg items-center justify-center mr-3`,
                    { backgroundColor: '#007AFF' }
                  ]}>
                    <Ionicons name="mail" size={18} color="white" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-base text-black`}>Email Support</Text>
                    <Text style={tw`text-sm text-gray-500 mt-0.5`}>
                      Detailed help • Response within 24 hours
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Contact Info Section */}
            <View style={tw`mt-8`}>
              <SectionHeader title="Contact Information" />
              <View style={tw`bg-white border-t border-gray-200`}>
                <View style={tw`px-4 py-3 border-b border-gray-200`}>
                  <Text style={tw`text-base text-black mb-1`}>WhatsApp</Text>
                  <Text style={tw`text-sm text-gray-500`}>+91 8217003676</Text>
                </View>
                <View style={tw`px-4 py-3`}>
                  <Text style={tw`text-base text-black mb-1`}>Email</Text>
                  <Text style={tw`text-sm text-gray-500`}>bayees1@gmail.com</Text>
                </View>
              </View>
            </View>

            {/* About Support Section */}
            <View style={tw`mt-8`}>
              <SectionHeader title="Support Hours" />
              <View style={tw`bg-white border-t border-gray-200`}>
                <View style={tw`px-4 py-3`}>
                  <Text style={tw`text-base text-black mb-2`}>We're here to help</Text>
                  <Text style={tw`text-sm text-gray-600 leading-relaxed`}>
                    Our support team is dedicated to making your Quran reading experience better. We typically respond to WhatsApp messages within minutes and emails within 24 hours.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
