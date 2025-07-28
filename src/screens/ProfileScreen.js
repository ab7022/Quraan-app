import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch, Linking, Platform, Modal, Share, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadStreak, getLast7DaysStreak } from '../store/streakSlice';
import analytics from '../services/analyticsService';

const ProfileItem = ({ icon, title, subtitle, onPress, showArrow = true, rightContent = null }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-white dark:bg-gray-800 px-4 py-4 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700`}
    activeOpacity={0.7}
  >
    <View style={tw`flex-row items-center flex-1`}>
      <View style={tw`w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900 items-center justify-center mr-3`}>
        <Ionicons name={icon} size={18} color="#3B82F6" />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-base font-medium text-gray-900 dark:text-gray-100`}>{title}</Text>
        {subtitle && (
          <Text style={tw`text-sm text-gray-500 dark:text-gray-400 mt-0.5`}>{subtitle}</Text>
        )}
      </View>
    </View>
    {rightContent || (showArrow && (
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
      <Text style={tw`text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide`}>
        {title}
      </Text>
      {onPress && (
        <Ionicons name="create-outline" size={16} color="#9CA3AF" />
      )}
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { streak, totalDaysRead, longestStreak, lastReadPage, readingHistory } = useSelector(s => s.streak);
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
  const formatTime = (date) => {
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

  const saveSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('quran_app_settings', JSON.stringify(updatedSettings));
      analytics.trackUserAction('settings_changed', { setting: Object.keys(newSettings)[0] });
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
      onPress: () => saveSettings({ explanationLanguage: lang })
    }));

    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Select Explanation Language',
      'Choose your preferred language for Quran explanations and tafseer',
      buttons
    );
  };

  const handleShareApp = async () => {
    try {
      const shareMessage = `🕌 Check out this amazing Quran App! 📖\n\nA beautiful way to read and learn the Holy Quran with:\n✨ Daily reading streaks\n📚 Complete Surahs and Juz\n🎯 Personal reading goals\n� Beautiful reading experience\n\nDownload now and start your spiritual journey! 🌟\n\n#QuranApp #IslamicApp #Quran`;
      
      const result = await Share.share({
        message: shareMessage,
        title: "Qur'an App - Your Spiritual Companion",
        url: Platform.OS === 'ios' ? 'https://apps.apple.com/app/quran-app' : undefined,
      }, {
        dialogTitle: 'Share Qur\'an App with others',
        subject: 'Amazing Quran App - Start Your Spiritual Journey',
        tintColor: '#059669',
      });

      // Track sharing analytics
      if (result.action === Share.sharedAction) {
        analytics.trackUserAction('app_shared', { 
          method: result.activityType || 'unknown',
          platform: Platform.OS 
        });
        
        if (Platform.OS === 'android' || result.activityType) {
          console.log('App shared successfully via:', result.activityType || 'native share');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share sheet dismissed');
      }
    } catch (error) {
      console.log('Error sharing app:', error);
      // Fallback to simple alert if share fails
      Alert.alert(
        'Share Quran App',
        'Share this beautiful Quran app with your friends and family!\n\nQuran App - A beautiful way to read and learn the Holy Quran.',
        [
          { text: 'Copy Message', onPress: () => {
            // In a real app, you'd copy to clipboard here
            Alert.alert('Message', 'Share message copied! You can paste it in any app.');
          }},
          { text: 'OK' }
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
        analytics.trackUserAction('name_updated', { name_length: tempName.trim().length });
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
            { text: 'Contact via Email', onPress: handleEmailSupport }
          ]
        );
      }
    } catch (error) {
      console.log('Error opening WhatsApp:', error);
      Alert.alert('Error', 'Unable to open WhatsApp. Please try again or contact us via email.');
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
            { text: 'Copy Email', onPress: () => {
              // In a real app, you'd copy to clipboard here
              Alert.alert('Email Address', email);
            }},
            { text: 'OK' }
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

  const handleViewStreaks = () => {
    setShowStreakModal(true);
  };

  const handleBackPress = () => {
    navigation.goBack?.();
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50 dark:bg-black`}>
      {/* Header */}
      <View style={tw`bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={tw`p-2 rounded-full bg-gray-100 dark:bg-gray-700`}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <Text style={tw`text-xl font-bold text-gray-900 dark:text-gray-100`}>Profile</Text>
          
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
        <View style={tw`bg-white dark:bg-gray-800 mx-4 mt-4 rounded-xl shadow-sm`}>
          <TouchableOpacity onPress={handleEditName} activeOpacity={0.7}>
            <View style={tw`flex-row items-center py-3 px-2`}> 
              <View style={tw`w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mr-3`}>
                <Ionicons name="person" size={28} color="#059669" />
              </View>
              <View style={tw`flex-1`}> 
                <Text style={tw`text-base font-bold text-gray-900 dark:text-gray-100`}>
                  {userName || 'Quran Reader'}
                </Text>
                <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
                  {lastReadPage ? `Last read: ${lastReadPage.name}` : 'Start your journey today'}
                </Text>
                {userName && (
                  <Text style={tw`text-xs text-blue-500 dark:text-blue-400 mt-0.5`}>
                    Tap to edit name
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Personal Settings */}
        <SectionHeader title="Personal" onPress={handleEditName} />
        <View style={tw`bg-white dark:bg-gray-800 mx-4 rounded-xl shadow-sm overflow-hidden`}>
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
        <View style={tw`bg-white dark:bg-gray-800 mx-4 rounded-xl shadow-sm overflow-hidden`}>
          <ProfileItem
            icon="chatbubble-ellipses-outline"
            title="Explanation Language"
            subtitle={
              settings.explanationLanguage 
                ? `${settings.explanationLanguage.flag} ${settings.explanationLanguage.name}` 
                : 'Not set - tap to select'
            }
            onPress={handleExplanationLanguageChange}
          />
        </View>


        {/* Support */}
        <SectionHeader title="Support" />
        <View style={tw`bg-white dark:bg-gray-800 mx-4 rounded-xl shadow-sm overflow-hidden mb-20`}>
          <ProfileItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="WhatsApp or Email support"
            onPress={handleHelpAndSupport}
          />
          <ProfileItem
            icon="star-outline"
            title="Rate the App"
            subtitle="Share your feedback"
            onPress={() => Alert.alert('Thank You!', 'Your feedback helps us improve the app.')}
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
            onPress={() => Alert.alert(
              'About',
              'Quran App v1.0.0\nA beautiful way to read and learn the Quran.\n\nDeveloped by Abdul Bayees\nContact: bayees1@gmail.com'
            )}
          />
        </View>
      </ScrollView>

      {/* Name Edit Modal */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelNameEdit}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white dark:bg-gray-800 mx-8 rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full`}>
            {/* Header */}
            <View style={tw`bg-green-500 px-6 py-6`}>
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white text-xl font-bold`}>Edit Name</Text>
                  <Text style={tw`text-green-100 text-sm mt-1`}>Enter your preferred name</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCancelNameEdit}
                  style={tw`w-10 h-10 rounded-full bg-white bg-opacity-20 items-center justify-center ml-3`}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Section */}
            <View style={tw`p-6`}>
              <Text style={tw`text-gray-700 dark:text-gray-300 text-sm mb-3`}>
                Your name will appear in greetings and throughout the app
              </Text>
              
              <TextInput
                style={tw`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base`}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                value={tempName}
                onChangeText={setTempName}
                autoFocus={true}
                maxLength={50}
              />
              
              <Text style={tw`text-gray-400 text-xs mt-2`}>
                Leave empty to remove your name
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={tw`flex-row border-t border-gray-200 dark:border-gray-700`}>
              <TouchableOpacity
                onPress={handleCancelNameEdit}
                style={tw`flex-1 py-4 items-center border-r border-gray-200 dark:border-gray-700`}
                activeOpacity={0.7}
              >
                <Text style={tw`text-gray-600 dark:text-gray-400 text-base font-medium`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveName}
                style={tw`flex-1 py-4 items-center`}
                activeOpacity={0.7}
              >
                <Text style={tw`text-green-600 dark:text-green-400 text-base font-semibold`}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reading Progress Modal */}
      <Modal
        visible={showStreakModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStreakModal(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white dark:bg-gray-800 mx-4 rounded-3xl shadow-2xl overflow-hidden max-w-md w-full`}>
            {/* Header */}
            <View style={tw`bg-green-500 px-6 py-6`}>
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white text-xl font-bold`}>Reading Progress</Text>
                  <Text style={tw`text-green-100 text-sm mt-1`}>Your Quran reading journey</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowStreakModal(false)}
                  style={tw`w-10 h-10 rounded-full bg-white bg-opacity-20 items-center justify-center ml-3`}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <View style={tw`p-6`}>
              {/* Stats Grid */}
              <View style={tw`flex-row mb-6`}>
                <View style={tw`flex-1 items-center py-4 border-r border-gray-200 dark:border-gray-600`}>
                  <Text style={tw`text-3xl font-bold text-green-600 dark:text-green-400 mb-1`}>{streak}</Text>
                  <Text style={tw`text-xs text-gray-500 dark:text-gray-400 text-center`}>Current{'\n'}Streak</Text>
                </View>
                <View style={tw`flex-1 items-center py-4 border-r border-gray-200 dark:border-gray-600`}>
                  <Text style={tw`text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1`}>{totalDaysRead}</Text>
                  <Text style={tw`text-xs text-gray-500 dark:text-gray-400 text-center`}>Total{'\n'}Days</Text>
                </View>
                <View style={tw`flex-1 items-center py-4`}>
                  <Text style={tw`text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1`}>{longestStreak}</Text>
                  <Text style={tw`text-xs text-gray-500 dark:text-gray-400 text-center`}>Best{'\n'}Streak</Text>
                </View>
              </View>

              {/* 7-Day Graph */}
              <View style={tw`mb-4`}>
                <Text style={tw`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3`}>
                  Last 7 Days Activity
                </Text>
                
                <View style={tw`flex-row justify-between items-end h-20 mb-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-3`}>
                  {last7DaysData.map((day, index) => (
                    <View key={index} style={tw`items-center flex-1`}>
                      <View 
                        style={[
                          tw`w-7 rounded-t-lg mb-2`,
                          day.hasRead 
                            ? tw`bg-green-500 h-14` 
                            : day.isToday 
                              ? tw`bg-yellow-400 h-8` 
                              : tw`bg-gray-300 dark:bg-gray-600 h-4`
                        ]}
                      />
                      <Text style={tw`text-xs text-gray-600 dark:text-gray-400 font-medium`}>
                        {day.dayName}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <View style={tw`flex-row justify-center items-center gap-4`}>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-4 h-4 bg-green-500 rounded-full mr-2`} />
                    <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>Read</Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-4 h-4 bg-yellow-400 rounded-full mr-2`} />
                    <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>Today</Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full mr-2`} />
                    <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>Missed</Text>
                  </View>
                </View>
              </View>

              {/* Motivational Message */}
              <View style={tw`bg-blue-50 dark:bg-blue-900 rounded-xl p-4 mt-4`}>
                <Text style={tw`text-blue-800 dark:text-blue-200 text-sm text-center`}>
                  {streak > 0 
                    ? `🔥 Amazing! You're on a ${streak}-day reading streak. Keep it up!`
                    : "📖 Start your reading journey today and build a beautiful streak!"
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Beautiful Support Modal */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white dark:bg-gray-800 mx-8 rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full`}>
            {/* Header */}
            <View style={tw`bg-blue-500 px-6 py-6`}>
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-white text-xl font-bold`}>Help & Support</Text>
                  <Text style={tw`text-blue-100 text-sm mt-1`}>How can we help you today?</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowSupportModal(false)}
                  style={tw`w-10 h-10 rounded-full bg-white bg-opacity-20 items-center justify-center ml-3`}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Support Options */}
            <View style={tw`p-6`}>
              {/* WhatsApp Option */}
              <TouchableOpacity
                onPress={handleWhatsAppSupport}
                style={tw`bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-2xl p-5 mb-4 flex-row items-center`}
                activeOpacity={0.7}
              >
                <View style={tw`w-12 h-12 bg-green-500 rounded-2xl items-center justify-center mr-4`}>
                  <Ionicons name="logo-whatsapp" size={24} color="white" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1`}>
                    WhatsApp Support
                  </Text>
                  <Text style={tw`text-gray-600 dark:text-gray-400 text-sm`}>
                    Get instant help via WhatsApp chat
                  </Text>
                  <Text style={tw`text-green-600 dark:text-green-400 text-xs mt-1 font-medium`}>
                    Usually responds within minutes
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#10B981" />
              </TouchableOpacity>

              {/* Email Option */}
              <TouchableOpacity
                onPress={handleEmailSupport}
                style={tw`bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-5 flex-row items-center`}
                activeOpacity={0.7}
              >
                <View style={tw`w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center mr-4`}>
                  <Ionicons name="mail" size={24} color="white" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-900 dark:text-gray-100 text-lg font-semibold mb-1`}>
                    Email Support
                  </Text>
                  <Text style={tw`text-gray-600 dark:text-gray-400 text-sm`}>
                    Send us a detailed email inquiry
                  </Text>
                  <Text style={tw`text-blue-600 dark:text-blue-400 text-xs mt-1 font-medium`}>
                    We'll respond within 24 hours
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={tw`bg-gray-50 dark:bg-gray-900 px-6 py-4`}>
              <Text style={tw`text-center text-gray-500 dark:text-gray-400 text-xs`}>
                We're here to help make your Quran reading experience better
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
