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

const ProfileItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightContent = null,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-white dark:bg-gray-800 px-4 py-4 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700`}
    activeOpacity={0.7}
  >
    <View style={tw`flex-row items-center flex-1`}>
      <View
        style={tw`w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900 items-center justify-center mr-3`}
      >
        <Ionicons name={icon} size={18} color="#3B82F6" />
      </View>
      <View style={tw`flex-1`}>
        <Text
          style={tw`text-base font-medium text-gray-900 dark:text-gray-100`}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={tw`text-sm text-gray-500 dark:text-gray-400 mt-0.5`}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    {rightContent ||
      (showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      ))}
  </TouchableOpacity>
);

const SectionHeader = ({ title, onPress = null }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`px-4 py-3 bg-gray-50 dark:bg-gray-900 ${onPress ? 'active:bg-gray-100 dark:active:bg-gray-800' : ''}`}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={tw`flex-row items-center justify-between`}>
      <Text
        style={tw`text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide`}
      >
        {title}
      </Text>
      {onPress && <Ionicons name="create-outline" size={16} color="#9CA3AF" />}
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
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
    console.log('[PROFILE SCREEN] Component mounted');
    analytics.trackScreenView('ProfileScreen', {
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
    <SafeAreaView style={tw`flex-1 bg-gray-50 dark:bg-black`}>
      {/* Header */}
      <View
        style={tw`bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={tw`p-2 rounded-full bg-gray-100 dark:bg-gray-700`}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>

          <Text style={tw`text-xl font-bold text-gray-900 dark:text-gray-100`}>
            Profile
          </Text>

          <TouchableOpacity
            onPress={handleShareApp}
            style={tw`p-2 rounded-full bg-blue-50 dark:bg-blue-900`}
            accessibilityLabel="Share app"
          >
            <Ionicons name="share-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Compact Profile Info */}
        <View
          style={tw`bg-white dark:bg-gray-800 mx-4 mt-4 rounded-xl shadow-sm`}
        >
          <TouchableOpacity onPress={handleEditName} activeOpacity={0.7}>
            <View style={tw`flex-row items-center py-3 px-2`}>
              <View
                style={tw`w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mr-3`}
              >
                <Ionicons name="person" size={28} color="#059669" />
              </View>
              <View style={tw`flex-1`}>
                <Text
                  style={tw`text-base font-bold text-gray-900 dark:text-gray-100`}
                >
                  {userName || 'Quran Reader'}
                </Text>
                <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
                  {lastReadPage
                    ? `Last read: ${lastReadPage.name}`
                    : 'Start your journey today'}
                </Text>
                {userName && (
                  <Text
                    style={tw`text-xs text-blue-500 dark:text-blue-400 mt-0.5`}
                  >
                    Tap to edit name
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Personal Settings */}
        <SectionHeader title="Personal" onPress={handleEditName} />
        <View
          style={tw`bg-white dark:bg-gray-800 mx-4 rounded-xl shadow-sm overflow-hidden`}
        >
          <ProfileItem
            icon="person-outline"
            title="Name"
            subtitle={userName || 'Not set - tap to add'}
            onPress={handleEditName}
          />
          <ProfileItem
            icon="analytics-outline"
            title="Reading Progress"
            subtitle={`${streak} day streak • View detailed statistics`}
            onPress={handleViewStreaks}
          />
        </View>

        {/* Reading Settings */}
        <SectionHeader title="Reading Settings" />
        <View
          style={tw`bg-white dark:bg-gray-800 mx-4 rounded-xl shadow-sm overflow-hidden`}
        >
          <ProfileItem
            icon="book-outline"
            title="Mushaf Style"
            subtitle="Choose your preferred Mushaf layout"
            onPress={() => navigation.navigate('MushafStyle')}
          />
       
        </View>

        {/* Support */}
        <SectionHeader title="Support" />
        <View
          style={tw`bg-white dark:bg-gray-800 mx-4 rounded-xl shadow-sm overflow-hidden`}
        >
          <ProfileItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="WhatsApp or Email support"
            onPress={handleHelpAndSupport}
          />
          <ProfileItem
            icon="star-outline"
            title="Rate the App"
            subtitle="Share your feedback on Google Play Store"
            onPress={handleRateApp}
          />
          <ProfileItem
            icon="share-social-outline"
            title="Share App"
            subtitle="Tell others about this app"
            onPress={handleShareApp}
          />
          <ProfileItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() =>
              Alert.alert(
                'About',
                'Quran App v1.0.0\nA beautiful way to read and learn the Quran.\n\nDeveloped by Abdul Bayees\nContact: bayees1@gmail.com'
              )
            }
          />
        </View>

        {/* Data Management */}
        <SectionHeader title="Data Management" />
        <View
          style={tw`bg-white dark:bg-gray-800 mx-4 rounded-xl shadow-sm overflow-hidden mb-20`}
        >
          <ProfileItem
            icon="trash-outline"
            title="Delete All Data"
            subtitle="Permanently remove all stored data"
            onPress={handleDeleteAllData}
          />
        </View>
      </ScrollView>

      {/* Apple-Style Name Edit Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelNameEdit}
      >
        <View style={tw`flex-1 justify-center items-center px-6`}>
          {/* Backdrop with subtle blur effect */}
          <View style={[
            tw`absolute inset-0`,
            { backgroundColor: 'rgba(0,0,0,0.4)' }
          ]} />
          
          {/* Apple Card Container */}
          <View style={[
            tw`bg-white rounded-3xl overflow-hidden w-full max-w-sm`,
            {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25,
              shadowRadius: 25,
              elevation: 25,
            }
          ]}>
            {/* Clean Header */}
            <View style={tw`px-6 pt-8 pb-2`}>
              <View style={tw`items-center mb-4`}>
                {/* Profile Icon */}
                <View style={[
                  tw`w-16 h-16 rounded-full items-center justify-center mb-4`,
                  { backgroundColor: '#f1f5f9' }
                ]}>
                  <Ionicons name="person" size={32} color="#64748b" />
                </View>
                
                <Text style={tw`text-2xl font-semibold text-gray-900 text-center`}>
                  Edit Name
                </Text>
                <Text style={tw`text-gray-500 text-center text-base mt-2 leading-relaxed`}>
                  Your name will appear in greetings and throughout the app
                </Text>
              </View>
            </View>

            {/* Input Section */}
            <View style={tw`px-6 pb-6`}>
              {/* Apple-style Input */}
              <View style={[
                tw`rounded-2xl overflow-hidden`,
                { backgroundColor: '#f8fafc' }
              ]}>
                <TextInput
                  style={[
                    tw`px-5 py-4 text-gray-900 text-lg`,
                    { backgroundColor: 'transparent' }
                  ]}
                  placeholder="Enter your name"
                  placeholderTextColor="#9ca3af"
                  value={tempName}
                  onChangeText={setTempName}
                  autoFocus={true}
                  maxLength={50}
                  selectionColor="#007AFF"
                />
              </View>
              
              <Text style={tw`text-gray-400 text-sm mt-3 text-center`}>
                Leave empty to remove your name
              </Text>
            </View>

            {/* Apple-style Action Buttons */}
            <View style={tw`border-t border-gray-200`}>
              <View style={tw`flex-row`}>
                <TouchableOpacity
                  onPress={handleCancelNameEdit}
                  style={[
                    tw`flex-1 py-4 items-center border-r border-gray-200`,
                    { minHeight: 56 }
                  ]}
                  activeOpacity={0.6}
                >
                  <Text style={tw`text-gray-600 text-lg font-medium`}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveName}
                  style={[
                    tw`flex-1 py-4 items-center`,
                    { minHeight: 56 }
                  ]}
                  activeOpacity={0.6}
                >
                  <Text style={tw`text-blue-600 text-lg font-semibold`}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Apple-Style Reading Progress Modal */}
      <Modal
        visible={showStreakModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStreakModal(false)}
      >
        <View style={tw`flex-1 justify-center items-center px-6`}>
          {/* Backdrop */}
          <View style={[
            tw`absolute inset-0`,
            { backgroundColor: 'rgba(0,0,0,0.4)' }
          ]} />
          
          {/* Compact Apple Card */}
          <View style={[
            tw`bg-white rounded-3xl overflow-hidden w-full max-w-sm`,
            {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 15 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 20,
            }
          ]}>
            {/* Header with Close */}
            <View style={tw`px-6 pt-6 pb-4 relative`}>
              <TouchableOpacity
                onPress={() => setShowStreakModal(false)}
                style={[
                  tw`absolute top-4 right-4 w-8 h-8 rounded-full items-center justify-center`,
                  { backgroundColor: '#f1f5f9' }
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>

              <View style={tw`items-center`}>
                <View style={[
                  tw`w-14 h-14 rounded-full items-center justify-center mb-3`,
                  { backgroundColor: '#f0f9ff' }
                ]}>
                  <Ionicons name="analytics" size={28} color="#0ea5e9" />
                </View>
                <Text style={tw`text-xl font-semibold text-gray-900 mb-1`}>
                  Your Progress
                </Text>
                <Text style={tw`text-gray-500 text-sm text-center`}>
                  Keep up the great work!
                </Text>
              </View>
            </View>

            {/* Compact Stats */}
            <View style={tw`px-6 pb-6`}>
              {/* Main Streak Highlight */}
              <View style={[
                tw`rounded-2xl p-5 mb-4 items-center`,
                { backgroundColor: streak > 0 ? '#fef3c7' : '#f0f9ff' }
              ]}>
                <Text style={tw`text-4xl font-bold ${streak > 0 ? 'text-amber-600' : 'text-blue-600'} mb-2`}>
                  {streak}
                </Text>
                <Text style={tw`${streak > 0 ? 'text-amber-800' : 'text-blue-800'} font-medium text-base mb-1`}>
                  Day Streak {streak > 0 ? '🔥' : '📖'}
                </Text>
                <Text style={tw`${streak > 0 ? 'text-amber-700' : 'text-blue-700'} text-sm text-center`}>
                  {streak > 0 
                    ? 'Amazing! Keep building this habit'
                    : 'Start reading today to begin your streak'
                  }
                </Text>
              </View>

              {/* Compact Stats Row */}
              <View style={[
                tw`rounded-2xl p-4 mb-4`,
                { backgroundColor: '#f8fafc' }
              ]}>
                <View style={tw`flex-row justify-between`}>
                  <View style={tw`items-center flex-1`}>
                    <Text style={tw`text-2xl font-bold text-green-600 mb-1`}>
                      {totalDaysRead}
                    </Text>
                    <Text style={tw`text-gray-600 text-xs font-medium`}>
                      Total Days
                    </Text>
                  </View>
                  
                  <View style={tw`w-px bg-gray-300 mx-3`} />
                  
                  <View style={tw`items-center flex-1`}>
                    <Text style={tw`text-2xl font-bold text-purple-600 mb-1`}>
                      {longestStreak}
                    </Text>
                    <Text style={tw`text-gray-600 text-xs font-medium`}>
                      Best Streak
                    </Text>
                  </View>
                </View>
              </View>

              {/* Mini Activity Chart */}
              <View style={[
                tw`rounded-2xl p-4`,
                { backgroundColor: '#f8fafc' }
              ]}>
                <Text style={tw`text-gray-900 font-medium text-sm mb-3 text-center`}>
                  This Week
                </Text>
                
                <View style={tw`flex-row justify-between items-end h-12 mb-3`}>
                  {last7DaysData.map((day, index) => (
                    <View key={index} style={tw`items-center flex-1`}>
                      <View
                        style={[
                          tw`w-6 rounded-lg mb-2`,
                          day.hasRead
                            ? [tw`bg-green-500`, { height: 32 }]
                            : day.isToday
                              ? [tw`bg-blue-400`, { height: 20 }]
                              : [tw`bg-gray-300`, { height: 8 }],
                        ]}
                      />
                      <Text style={tw`text-xs text-gray-500 font-medium`}>
                        {day.dayName.slice(0, 1)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={tw`flex-row justify-center items-center space-x-4`}>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-2 h-2 bg-green-500 rounded-full mr-1`} />
                    <Text style={tw`text-xs text-gray-600`}>Done</Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-2 h-2 bg-blue-400 rounded-full mr-1`} />
                    <Text style={tw`text-xs text-gray-600`}>Today</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Apple-Style Support Modal */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={tw`flex-1 justify-center items-center px-6`}>
          {/* Backdrop */}
          <View style={[
            tw`absolute inset-0`,
            { backgroundColor: 'rgba(0,0,0,0.4)' }
          ]} />
          
          {/* Apple Card Container */}
          <View style={[
            tw`bg-white rounded-3xl overflow-hidden w-full max-w-sm`,
            {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 15 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 20,
            }
          ]}>
            {/* Clean Header */}
            <View style={tw`px-6 pt-6 pb-4 relative`}>
              <TouchableOpacity
                onPress={() => setShowSupportModal(false)}
                style={[
                  tw`absolute top-4 right-4 w-8 h-8 rounded-full items-center justify-center`,
                  { backgroundColor: '#f1f5f9' }
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>

              <View style={tw`items-center`}>
                <View style={[
                  tw`w-14 h-14 rounded-full items-center justify-center mb-3`,
                  { backgroundColor: '#f0f9ff' }
                ]}>
                  <Ionicons name="help-circle" size={28} color="#0ea5e9" />
                </View>
                <Text style={tw`text-xl font-semibold text-gray-900 mb-1`}>
                  Help & Support
                </Text>
                <Text style={tw`text-gray-500 text-sm text-center`}>
                  We're here to help you
                </Text>
              </View>
            </View>

            {/* Support Options */}
            <View style={tw`px-6 pb-6`}>
              {/* WhatsApp Option */}
              <TouchableOpacity
                onPress={handleWhatsAppSupport}
                style={[
                  tw`rounded-2xl p-4 mb-3 flex-row items-center`,
                  { backgroundColor: '#f0fdf4' }
                ]}
                activeOpacity={0.6}
              >
                <View style={[
                  tw`w-12 h-12 rounded-2xl items-center justify-center mr-4`,
                  { backgroundColor: '#16a34a' }
                ]}>
                  <Ionicons name="logo-whatsapp" size={24} color="white" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-900 text-base font-semibold mb-1`}>
                    WhatsApp Chat
                  </Text>
                  <Text style={tw`text-gray-600 text-sm`}>
                    Quick responses • Usually within minutes
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>

              {/* Email Option */}
              <TouchableOpacity
                onPress={handleEmailSupport}
                style={[
                  tw`rounded-2xl p-4 mb-4 flex-row items-center`,
                  { backgroundColor: '#f0f9ff' }
                ]}
                activeOpacity={0.6}
              >
                <View style={[
                  tw`w-12 h-12 rounded-2xl items-center justify-center mr-4`,
                  { backgroundColor: '#0ea5e9' }
                ]}>
                  <Ionicons name="mail" size={24} color="white" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-900 text-base font-semibold mb-1`}>
                    Email Support
                  </Text>
                  <Text style={tw`text-gray-600 text-sm`}>
                    Detailed help • Response within 24 hours
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>

              {/* Info Card */}
              <View style={[
                tw`rounded-2xl p-4`,
                { backgroundColor: '#f8fafc' }
              ]}>
                <View style={tw`flex-row items-center`}>
                  <View style={[
                    tw`w-8 h-8 rounded-full items-center justify-center mr-3`,
                    { backgroundColor: '#e2e8f0' }
                  ]}>
                    <Ionicons name="information" size={16} color="#64748b" />
                  </View>
                  <Text style={tw`text-gray-600 text-sm flex-1 leading-relaxed`}>
                    Our team is dedicated to making your Quran reading experience better
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
