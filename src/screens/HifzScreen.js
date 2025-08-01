import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const DAILY_TARGET_STORAGE_KEY = 'daily_target_data';

export default function HifzScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [targetData, setTargetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTodayModal, setShowTodayModal] = useState(false);

  // Setup form state
  const [dailyTarget, setDailyTarget] = useState('');
  const [todayProgress, setTodayProgress] = useState('');
  const [isStartingFresh, setIsStartingFresh] = useState(null); // true/false/null
  const [pagesAlreadyRead, setPagesAlreadyRead] = useState('');

  useEffect(() => {
    loadTargetData();
  }, []);

  const loadTargetData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(DAILY_TARGET_STORAGE_KEY);
      if (savedData) {
        setTargetData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading daily target data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTargetData = async data => {
    try {
      await AsyncStorage.setItem(
        DAILY_TARGET_STORAGE_KEY,
        JSON.stringify(data)
      );
      setTargetData(data);
    } catch (error) {
      console.error('Error saving target data:', error);
      Alert.alert(
        'Error', 
        'Failed to save data. Please try again.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
    }
  };

  const handleSetupSubmit = () => {
    if (isStartingFresh === null) {
      Alert.alert(
        'Missing Information',
        'Please select if you are starting fresh or have already read some pages.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
      return;
    }

    if (!dailyTarget) {
      Alert.alert(
        'Missing Information',
        'Please enter your daily pages target.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
      return;
    }

    const target = parseInt(dailyTarget) || 0;
    if (target <= 0) {
      Alert.alert(
        'Invalid Input', 
        'Daily target must be greater than 0.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
      return;
    }

    let alreadyRead = 0;
    if (!isStartingFresh) {
      if (!pagesAlreadyRead) {
        Alert.alert(
          'Missing Information',
          'Please enter how many pages you have already read.',
          [{ text: 'OK', style: 'default' }],
          { userInterfaceStyle: 'light' }
        );
        return;
      }
      alreadyRead = parseInt(pagesAlreadyRead) || 0;
      if (alreadyRead < 0 || alreadyRead >= 604) {
        Alert.alert(
          'Invalid Input',
          'Pages already read must be between 0 and 603.',
          [{ text: 'OK', style: 'default' }],
          { userInterfaceStyle: 'light' }
        );
        return;
      }
    }

    const newTargetData = {
      targetType: 'pages',
      dailyTarget: target,
      purpose: 'reading',
      dailyProgress: {},
      totalCompleted: alreadyRead,
      isStartingFresh,
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    saveTargetData(newTargetData);
    resetForm();
  };

  const handleTodaySubmit = () => {
    if (!todayProgress) {
      Alert.alert(
        'Missing Information', 
        "Please enter today's progress.",
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
      return;
    }

    const progress = parseInt(todayProgress) || 0;
    if (progress < 0) {
      Alert.alert(
        'Invalid Input', 
        'Progress cannot be negative.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const updatedData = {
      ...targetData,
      totalCompleted: targetData.totalCompleted + progress,
      dailyProgress: {
        ...targetData.dailyProgress,
        [today]: (targetData.dailyProgress[today] || 0) + progress,
      },
      lastUpdated: new Date().toISOString(),
    };

    saveTargetData(updatedData);
    setShowTodayModal(false);
    setTodayProgress('');
  };

  const handleEditSubmit = () => {
    if (!dailyTarget) {
      Alert.alert(
        'Missing Information',
        'Please enter your daily pages target.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
      return;
    }

    const target = parseInt(dailyTarget) || 0;
    if (target <= 0) {
      Alert.alert(
        'Invalid Input', 
        'Daily target must be greater than 0.',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }        
      );
      return;
    }

    const updatedData = {
      ...targetData,
      targetType: 'pages',
      dailyTarget: target,
      purpose: 'reading',
      lastUpdated: new Date().toISOString(),
    };

    saveTargetData(updatedData);
    setShowEditModal(false);
    resetForm();
  };

  const resetForm = () => {
    setDailyTarget('');
    setTodayProgress('');
    setIsStartingFresh(null);
    setPagesAlreadyRead('');
  };

  const deleteTargetData = () => {
    Alert.alert(
      'Reset Journey',
      'Are you sure you want to delete all your progress data? This action cannot be undone.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(DAILY_TARGET_STORAGE_KEY);
              setTargetData(null);
            } catch (error) {
              console.error('Error deleting target data:', error);
            }
          },
        },
      ],
      { 
        cancelable: true,
        userInterfaceStyle: 'light' // Force light mode for iOS
      }
    );
  };

  const getTodayProgress = () => {
    if (!targetData) return { completed: 0, percentage: 0 };
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = targetData.dailyProgress[today] || 0;
    const percentage = Math.min(
      (todayProgress / targetData.dailyTarget) * 100,
      100
    );
    return { completed: todayProgress, percentage };
  };

  const getStreakInfo = () => {
    if (!targetData) return { current: 0, best: 0 };

    const dates = Object.keys(targetData.dailyProgress).sort().reverse();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from today backwards)
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (targetData.dailyProgress[dateStr] >= targetData.dailyTarget) {
        if (i === 0 || currentStreak > 0) currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    for (const date of dates) {
      if (targetData.dailyProgress[date] >= targetData.dailyTarget) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { current: currentStreak, best: bestStreak };
  };

  
  const calculateCompletionInfo = (dailyTarget, alreadyRead = 0) => {
    const totalPages = 604;
    const remainingPages = totalPages - alreadyRead;
    const daysNeeded = Math.ceil(remainingPages / dailyTarget);

    const today = new Date();
    const completionDate = new Date(today);
    completionDate.setDate(today.getDate() + daysNeeded);

    return {
      daysNeeded,
      completionDate: completionDate.toLocaleDateString('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      remainingPages,
    };
  };

  const renderStartingOption = (isFresh, title, description) => (
    <TouchableOpacity
      onPress={() => setIsStartingFresh(isFresh)}
      style={[
        tw`p-4 rounded-xl border-2 mb-3`,
        isStartingFresh === isFresh
          ? tw`border-blue-500 bg-blue-50`
          : tw`border-gray-200`,
      ]}
    >
      <View style={tw`flex-row items-center mb-1`}>
        <Ionicons
          name={isFresh ? 'play-circle' : 'bookmark'}
          size={24}
          color={isStartingFresh === isFresh ? '#3B82F6' : '#6B7280'}
          style={tw`mr-3`}
        />
        <Text
          style={tw`text-lg font-semibold ${isStartingFresh === isFresh ? 'text-blue-600' : 'text-gray-700'}`}
        >
          {title}
        </Text>
      </View>
      <Text style={tw`text-sm text-gray-500 ml-9`}>{description}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[tw`flex-1`, { backgroundColor: '#f8fafc' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <SafeAreaView style={tw`flex-1 justify-center items-center`}>
          <View style={tw`items-center`}>
            <View style={[
              tw`w-20 h-20 rounded-full mb-6`,
              { backgroundColor: '#e2e8f0' }
            ]} />
            <Text style={tw`text-gray-600 text-lg font-light`}>Loading your journey...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1 bg-gray-50`, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f8fafc"
        translucent
      />
      {/* Top Status Header */}
      <LinearGradient
        colors={['#007AFF', '#0051D5', '#003d82']}
        style={tw`px-6 py-4`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center flex-1`}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[
                tw`w-10 h-10 rounded-full items-center justify-center mr-4`,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>

            <View style={tw`flex-1`}>
              <Text style={tw`text-white text-xl font-bold`}>
                📖 Daily Quran Journey
              </Text>
              <Text style={tw`text-blue-100 text-sm`}>
                {targetData
                  ? 'May Allah bless your progress'
                  : 'Begin your blessed journey'}
              </Text>
            </View>
          </View>

          {targetData && (
            <TouchableOpacity
              onPress={() => {
                setDailyTarget(targetData.dailyTarget.toString());
                setShowEditModal(true);
              }}
              style={[
                tw`w-10 h-10 rounded-full items-center justify-center`,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-8`}
      >
        {!targetData ? (
          // Apple-style Setup Flow - Light Mode
          <View style={tw`px-6`}>
            {/* Hero Section */}
            <View style={tw`items-center mb-12 mt-8`}>
              <View
                style={[
                  tw`w-24 h-24 rounded-3xl items-center justify-center mb-8`,
                  { backgroundColor: '#007AFF' },
                ]}
              >
                <Ionicons name="book-outline" size={40} color="#ffffff" />
              </View>

              <Text
                style={tw`text-gray-900 text-4xl font-bold text-center mb-4`}
              >
                Daily Quran
              </Text>
              <Text
                style={tw`text-gray-600 text-lg text-center leading-7 px-4`}
              >
                Build a consistent reading habit with personalized daily goals
              </Text>
            </View>

            {/* Setup Card */}
            <View
              style={[
                tw`rounded-3xl p-8 mb-6 shadow-lg`,
                { backgroundColor: '#ffffff' },
              ]}
            >
              {/* Progress Indicator */}
              <View style={tw`flex-row mb-8`}>
                <View
                  style={[
                    tw`h-1 flex-1 rounded-full mr-2`,
                    {
                      backgroundColor:
                        isStartingFresh !== null ? '#007AFF' : '#e2e8f0',
                    },
                  ]}
                />
                <View
                  style={[
                    tw`h-1 flex-1 rounded-full mr-2`,
                    {
                      backgroundColor:
                        dailyTarget && isStartingFresh !== null
                          ? '#007AFF'
                          : '#e2e8f0',
                    },
                  ]}
                />
                <View
                  style={[
                    tw`h-1 flex-1 rounded-full`,
                    {
                      backgroundColor:
                        dailyTarget &&
                        isStartingFresh !== null &&
                        (isStartingFresh || pagesAlreadyRead)
                          ? '#007AFF'
                          : '#e2e8f0',
                    },
                  ]}
                />
              </View>

              {/* Starting Point */}
              <View style={tw`mb-8`}>
                <Text style={tw`text-gray-900 text-xl font-semibold mb-6`}>
                  Starting point
                </Text>

                <TouchableOpacity
                  onPress={() => setIsStartingFresh(true)}
                  style={[
                    tw`rounded-2xl p-5 mb-4 border`,
                    isStartingFresh === true
                      ? { backgroundColor: '#eff6ff', borderColor: '#007AFF' }
                      : {
                          backgroundColor: '#f8fafc',
                          borderColor: '#e2e8f0',
                        },
                  ]}
                >
                  <View style={tw`flex-row items-center`}>
                    <View
                      style={[
                        tw`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center`,
                        {
                          borderColor:
                            isStartingFresh === true ? '#007AFF' : '#94a3b8',
                        },
                      ]}
                    >
                      {isStartingFresh === true && (
                        <View
                          style={[
                            tw`w-3 h-3 rounded-full`,
                            { backgroundColor: '#007AFF' },
                          ]}
                        />
                      )}
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-gray-900 text-lg font-medium mb-1`}>
                        Fresh start
                      </Text>
                      <Text style={tw`text-gray-500 text-sm`}>
                        Beginning from page 1
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsStartingFresh(false)}
                  style={[
                    tw`rounded-2xl p-5 border`,
                    isStartingFresh === false
                      ? { backgroundColor: '#eff6ff', borderColor: '#007AFF' }
                      : {
                          backgroundColor: '#f8fafc',
                          borderColor: '#e2e8f0',
                        },
                  ]}
                >
                  <View style={tw`flex-row items-center`}>
                    <View
                      style={[
                        tw`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center`,
                        {
                          borderColor:
                            isStartingFresh === false ? '#007AFF' : '#94a3b8',
                        },
                      ]}
                    >
                      {isStartingFresh === false && (
                        <View
                          style={[
                            tw`w-3 h-3 rounded-full`,
                            { backgroundColor: '#007AFF' },
                          ]}
                        />
                      )}
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-gray-900 text-lg font-medium mb-1`}>
                        Continue reading
                      </Text>
                      <Text style={tw`text-gray-500 text-sm`}>
                        I've already made progress
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Pages Already Read */}
              {isStartingFresh === false && (
                <View style={tw`mb-8`}>
                  <Text style={tw`text-gray-900 text-xl font-semibold mb-4`}>
                    Current progress
                  </Text>
                  <View
                    style={[
                      tw`rounded-2xl border`,
                      { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
                    ]}
                  >
                    <TextInput
                      style={tw`px-5 py-4 text-gray-900 text-lg`}
                      placeholder="Pages completed (0-603)"
                      placeholderTextColor="#94a3b8"
                      value={pagesAlreadyRead}
                      onChangeText={setPagesAlreadyRead}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {/* Daily Target */}
              {isStartingFresh !== null && (
                <View style={tw`mb-8`}>
                  <Text style={tw`text-gray-900 text-xl font-semibold mb-4`}>
                    Daily goal
                  </Text>
                  <View
                    style={[
                      tw`rounded-2xl border`,
                      { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
                    ]}
                  >
                    <TextInput
                      style={tw`px-5 py-4 text-gray-900 text-lg`}
                      placeholder="Pages per day"
                      placeholderTextColor="#94a3b8"
                      value={dailyTarget}
                      onChangeText={setDailyTarget}
                      keyboardType="numeric"
                    />
                  </View>
                  <Text style={tw`text-gray-500 text-sm mt-2 ml-1`}>
                    Recommended: 1-5 pages daily
                  </Text>
                </View>
              )}

              {/* Completion Preview */}
              {dailyTarget && isStartingFresh !== null && (
                <View
                  style={[
                    tw`rounded-2xl p-5 mb-8`,
                    { backgroundColor: '#eff6ff' },
                  ]}
                >
                  {(() => {
                    const alreadyRead = isStartingFresh
                      ? 0
                      : parseInt(pagesAlreadyRead) || 0;
                    const target = parseInt(dailyTarget) || 0;
                    if (target > 0) {
                      const completion = calculateCompletionInfo(
                        target,
                        alreadyRead
                      );
                      return (
                        <View>
                          <Text
                            style={tw`text-blue-600 text-sm font-medium mb-2`}
                          >
                            COMPLETION FORECAST
                          </Text>
                          <Text
                            style={tw`text-gray-900 text-lg font-semibold mb-1`}
                          >
                            {completion.completionDate}
                          </Text>
                          <Text style={tw`text-blue-500 text-sm`}>
                            {completion.daysNeeded} days •{' '}
                            {completion.remainingPages} pages remaining
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })()}
                </View>
              )}

              {/* Start Button */}
              <TouchableOpacity
                onPress={handleSetupSubmit}
                disabled={
                  !(
                    dailyTarget &&
                    isStartingFresh !== null &&
                    (isStartingFresh || pagesAlreadyRead)
                  )
                }
                style={[
                  tw`rounded-2xl py-4 items-center`,
                  dailyTarget &&
                  isStartingFresh !== null &&
                  (isStartingFresh || pagesAlreadyRead)
                    ? { backgroundColor: '#007AFF' }
                    : { backgroundColor: '#e2e8f0' },
                ]}
              >
                <Text
                  style={[
                    tw`text-lg font-semibold`,
                    dailyTarget &&
                    isStartingFresh !== null &&
                    (isStartingFresh || pagesAlreadyRead)
                      ? tw`text-white`
                      : tw`text-gray-400`,
                  ]}
                >
                  Begin Journey
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Apple-style Dashboard - Light Mode
          <View style={tw`px-6`}>
            {/* Main Title */}
            <View style={tw`mb-8 mt-4`}>
              <Text style={tw`text-gray-900 text-3xl font-bold mb-2`}>
                Daily Quran
              </Text>
              <Text style={tw`text-gray-600 text-lg`}>
                Keep up the great work
              </Text>
            </View>

            {/* Today's Progress - Large Card */}
            <View
              style={[
                tw`rounded-3xl p-8 mb-6 shadow-lg`,
                { backgroundColor: '#ffffff' },
              ]}
            >
              <View style={tw`flex-row items-center justify-between mb-6`}>
                <Text style={tw`text-gray-900 text-xl font-semibold`}>
                  Today
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTodayModal(true)}
                  style={[
                    tw`px-4 py-2 rounded-full`,
                    { backgroundColor: '#007AFF' },
                  ]}
                >
                  <Text style={tw`text-white font-medium`}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Progress Circle */}
              <View style={tw`items-center mb-8`}>
                <View style={tw`items-center justify-center mb-4`}>
                  <Text style={tw`text-gray-900 text-5xl font-light mb-2`}>
                    {getTodayProgress().completed}
                  </Text>
                  <Text style={tw`text-gray-500 text-lg`}>
                    of {targetData.dailyTarget} pages
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={tw`w-full`}>
                  <View
                    style={[
                      tw`h-2 rounded-full`,
                      { backgroundColor: '#e2e8f0' },
                    ]}
                  >
                    <View
                      style={[
                        tw`h-2 rounded-full`,
                        {
                          backgroundColor: '#007AFF',
                          width: `${Math.min(getTodayProgress().percentage, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={tw`text-gray-500 text-sm text-center mt-2`}>
                    {getTodayProgress().percentage.toFixed(0)}% complete
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={tw`flex-row mb-6`}>
              <View
                style={[
                  tw`flex-1 rounded-2xl p-6 mr-3 shadow-sm`,
                  { backgroundColor: '#ffffff' },
                ]}
              >
                <Text style={tw`text-gray-500 text-sm font-medium mb-2`}>
                  CURRENT STREAK
                </Text>
                <Text style={tw`text-gray-900 text-3xl font-light mb-1`}>
                  {getStreakInfo().current}
                </Text>
                <Text style={tw`text-gray-500 text-sm`}>days</Text>
              </View>

              <View
                style={[
                  tw`flex-1 rounded-2xl p-6 shadow-sm`,
                  { backgroundColor: '#ffffff' },
                ]}
              >
                <Text style={tw`text-gray-500 text-sm font-medium mb-2`}>
                  TOTAL PAGES
                </Text>
                <Text style={tw`text-gray-900 text-3xl font-light mb-1`}>
                  {targetData.totalCompleted}
                </Text>
                <Text style={tw`text-gray-500 text-sm`}>completed</Text>
              </View>
            </View>

            {/* Journey Overview */}
            <View
              style={[
                tw`rounded-2xl p-6 mb-6 shadow-sm`,
                { backgroundColor: '#ffffff' },
              ]}
            >
              <Text style={tw`text-gray-900 text-lg font-semibold mb-4`}>
                Journey Overview
              </Text>

              {(() => {
                const completion = calculateCompletionInfo(
                  targetData.dailyTarget,
                  targetData.totalCompleted
                );
                const progressPercent = (targetData.totalCompleted / 604) * 100;

                return (
                  <View>
                    <View style={tw`mb-4`}>
                      <View
                        style={tw`flex-row justify-between items-center mb-2`}
                      >
                        <Text style={tw`text-gray-500 text-sm`}>Progress</Text>
                        <Text style={tw`text-gray-500 text-sm`}>
                          {progressPercent.toFixed(1)}%
                        </Text>
                      </View>
                      <View
                        style={[
                          tw`h-2 rounded-full`,
                          { backgroundColor: '#e2e8f0' },
                        ]}
                      >
                        <View
                          style={[
                            tw`h-2 rounded-full`,
                            {
                              backgroundColor: '#34C759',
                              width: `${progressPercent}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={tw`space-y-3`}>
                      <View style={tw`flex-row justify-between`}>
                        <Text style={tw`text-gray-500`}>Pages remaining</Text>
                        <Text style={tw`text-gray-900 font-medium`}>
                          {completion.remainingPages}
                        </Text>
                      </View>

                      <View style={tw`flex-row justify-between`}>
                        <Text style={tw`text-gray-500`}>
                          Expected completion
                        </Text>
                        <Text style={tw`text-gray-900 font-medium`}>
                          {completion.completionDate}
                        </Text>
                      </View>

                      <View style={tw`flex-row justify-between`}>
                        <Text style={tw`text-gray-500`}>Best streak</Text>
                        <Text style={tw`text-gray-900 font-medium`}>
                          {getStreakInfo().best} days
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })()}
            </View>

            {/* Settings */}
            <TouchableOpacity
              onPress={deleteTargetData}
              style={[
                tw`rounded-2xl p-4 items-center`,
                { backgroundColor: '#fef2f2' },
              ]}
            >
              <Text style={tw`text-red-500 font-medium`}>Reset Journey</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Progress Modal - Apple Style Light Mode */}
      <Modal
        visible={showTodayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[tw`flex-1`, { backgroundColor: '#f8fafc' }]}>
          <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
          <SafeAreaView style={tw`flex-1`}>
            <View style={tw`px-6 py-4 border-b border-gray-200`}>
              <View style={tw`flex-row items-center justify-between`}>
                <TouchableOpacity
                  onPress={() => setShowTodayModal(false)}
                  style={tw`p-2`}
                >
                  <Text style={tw`text-blue-500 text-lg`}>Cancel</Text>
                </TouchableOpacity>

                <Text style={tw`text-gray-900 text-lg font-semibold`}>
                  Add Progress
                </Text>

                <TouchableOpacity
                  onPress={handleTodaySubmit}
                  disabled={!todayProgress}
                  style={tw`p-2`}
                >
                  <Text
                    style={[
                      tw`text-lg font-semibold`,
                      todayProgress ? tw`text-blue-500` : tw`text-gray-400`,
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={tw`flex-1 px-6 py-8`}>
              <Text style={tw`text-gray-900 text-2xl font-bold mb-2`}>
                Today's Reading
              </Text>
              <Text style={tw`text-gray-500 text-lg mb-8`}>
                How many pages did you complete?
              </Text>

              <View
                style={[
                  tw`rounded-2xl border`,
                  { backgroundColor: '#ffffff', borderColor: '#e2e8f0' },
                ]}
              >
                <TextInput
                  style={tw`px-5 py-4 text-gray-900 text-xl text-center`}
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  value={todayProgress}
                  onChangeText={setTodayProgress}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <Text style={tw`text-gray-500 text-sm text-center mt-3`}>
                Pages completed today
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Edit Modal - Apple Style Light Mode */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[tw`flex-1`, { backgroundColor: '#f8fafc' }]}>
          <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
          <SafeAreaView style={tw`flex-1`}>
            <View style={tw`px-6 py-4 border-b border-gray-200`}>
              <View style={tw`flex-row items-center justify-between`}>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={tw`p-2`}
                >
                  <Text style={tw`text-blue-500 text-lg`}>Cancel</Text>
                </TouchableOpacity>

                <Text style={tw`text-gray-900 text-lg font-semibold`}>
                  Edit Goal
                </Text>

                <TouchableOpacity
                  onPress={handleEditSubmit}
                  disabled={!dailyTarget}
                  style={tw`p-2`}
                >
                  <Text
                    style={[
                      tw`text-lg font-semibold`,
                      dailyTarget ? tw`text-blue-500` : tw`text-gray-400`,
                    ]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={tw`flex-1 px-6 py-8`}>
              <Text style={tw`text-gray-900 text-2xl font-bold mb-2`}>
                Daily Goal
              </Text>
              <Text style={tw`text-gray-500 text-lg mb-8`}>
                How many pages would you like to read daily?
              </Text>

              <View
                style={[
                  tw`rounded-2xl border`,
                  { backgroundColor: '#ffffff', borderColor: '#e2e8f0' },
                ]}
              >
                <TextInput
                  style={tw`px-5 py-4 text-gray-900 text-xl text-center`}
                  placeholder="5"
                  placeholderTextColor="#94a3b8"
                  value={dailyTarget}
                  onChangeText={setDailyTarget}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <Text style={tw`text-gray-500 text-sm text-center mt-3`}>
                Pages per day
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
