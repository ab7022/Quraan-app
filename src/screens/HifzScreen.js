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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  const handleSetupSubmit = () => {
    if (isStartingFresh === null) {
      Alert.alert(
        'Missing Information',
        'Please select if you are starting fresh or have already read some pages.'
      );
      return;
    }

    if (!dailyTarget) {
      Alert.alert(
        'Missing Information',
        'Please enter your daily pages target.'
      );
      return;
    }

    const target = parseInt(dailyTarget) || 0;
    if (target <= 0) {
      Alert.alert('Invalid Input', 'Daily target must be greater than 0.');
      return;
    }

    let alreadyRead = 0;
    if (!isStartingFresh) {
      if (!pagesAlreadyRead) {
        Alert.alert(
          'Missing Information',
          'Please enter how many pages you have already read.'
        );
        return;
      }
      alreadyRead = parseInt(pagesAlreadyRead) || 0;
      if (alreadyRead < 0 || alreadyRead >= 604) {
        Alert.alert(
          'Invalid Input',
          'Pages already read must be between 0 and 603.'
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
      Alert.alert('Missing Information', "Please enter today's progress.");
      return;
    }

    const progress = parseInt(todayProgress) || 0;
    if (progress < 0) {
      Alert.alert('Invalid Input', 'Progress cannot be negative.');
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
        'Please enter your daily pages target.'
      );
      return;
    }

    const target = parseInt(dailyTarget) || 0;
    if (target <= 0) {
      Alert.alert('Invalid Input', 'Daily target must be greater than 0.');
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
      'Delete Target Data',
      'Are you sure you want to delete all target data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
      ]
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

  const getRecentActivity = () => {
    if (!targetData) return [];

    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const progress = targetData.dailyProgress[dateStr] || 0;
      const isComplete = progress >= targetData.dailyTarget;

      last7Days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        progress,
        isComplete,
        isToday: i === 0,
      });
    }

    return last7Days;
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
      <View style={[tw`flex-1 bg-white`, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent
        />
        <View style={tw`flex-1 justify-center items-center`}>
          <View style={tw`w-16 h-16 bg-gray-200 rounded-full mb-4`} />
          <Text style={tw`text-gray-500`}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[tw`flex-1 bg-gray-50`, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f9fafb"
        translucent
      />
      {/* Header */}
      <LinearGradient
        colors={['#0369A1', '#0284C7', '#0EA5E9']}
        style={tw`px-4 py-4 border-b border-blue-200`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center flex-1`}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={tw`mr-3 p-2 bg-white/20 rounded-full`}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xl font-bold text-white`}>
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
              style={tw`p-2 bg-white/20 rounded-full ml-2`}
            >
              <Ionicons name="settings-outline" size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {!targetData ? (
          // Direct Setup View - No Modal
          <LinearGradient
            colors={['#F0F9FF', '#E0F2FE', '#BAE6FD']}
            style={tw`flex-1`}
          >
            <View style={tw`p-6`}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={tw`rounded-3xl p-8 mb-6 shadow-lg`}
              >
                <View style={tw`items-center mb-8`}>
                  <LinearGradient
                    colors={['#3B82F6', '#1D4ED8', '#1E40AF']}
                    style={tw`w-24 h-24 rounded-full items-center justify-center mb-6`}
                  >
                    <Ionicons name="book" size={40} color="white" />
                  </LinearGradient>
                  <Text
                    style={tw`text-3xl font-bold text-gray-900 mb-3 text-center`}
                  >
                    🌟 Start Your Sacred Journey
                  </Text>
                  <Text style={tw`text-gray-600 text-center text-lg leading-6`}>
                    Set your daily Quran reading goal and witness the beautiful
                    transformation in your spiritual life
                  </Text>
                </View>

                {/* Starting Point Selection */}
                <View style={tw`mb-6`}>
                  <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>
                    Are you starting fresh?
                  </Text>

                  {renderStartingOption(
                    true,
                    'Starting Fresh',
                    "I'm beginning my Quran reading journey from page 1"
                  )}
                  {renderStartingOption(
                    false,
                    'Already Started',
                    "I've already read some pages of the Quran"
                  )}
                </View>

                {/* Pages Already Read Input */}
                {isStartingFresh === false && (
                  <View style={tw`mb-6`}>
                    <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>
                      Pages Already Read
                    </Text>
                    <TextInput
                      style={tw`border border-gray-300 rounded-xl px-4 py-3 text-lg text-center`}
                      placeholder="How many pages have you read?"
                      value={pagesAlreadyRead}
                      onChangeText={setPagesAlreadyRead}
                      keyboardType="numeric"
                    />
                    <Text style={tw`text-sm text-gray-500 text-center mt-2`}>
                      Total Quran has 604 pages
                    </Text>
                  </View>
                )}

                {/* Daily Target Input */}
                {isStartingFresh !== null && (
                  <View style={tw`mb-6`}>
                    <Text style={tw`text-lg font-semibold text-gray-900 mb-3`}>
                      Daily Target (Pages)
                    </Text>
                    <TextInput
                      style={tw`border border-gray-300 rounded-xl px-4 py-4 text-lg text-center`}
                      placeholder="Enter number of pages"
                      value={dailyTarget}
                      onChangeText={setDailyTarget}
                      keyboardType="numeric"
                    />
                    <Text style={tw`text-sm text-gray-500 text-center mt-2`}>
                      Recommended: 1-5 pages per day
                    </Text>
                  </View>
                )}

                {/* Completion Prediction */}
                {dailyTarget && isStartingFresh !== null && (
                  <View
                    style={tw`bg-green-50 border border-green-200 rounded-xl p-4 mb-6`}
                  >
                    <View style={tw`flex-row items-center mb-2`}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#059669"
                        style={tw`mr-2`}
                      />
                      <Text style={tw`text-green-800 font-semibold`}>
                        Completion Prediction
                      </Text>
                    </View>
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
                            <Text style={tw`text-green-700 text-sm`}>
                              📖 You'll complete the Quran on{'\n'}
                              <Text style={tw`font-bold`}>
                                {completion.completionDate}
                              </Text>
                            </Text>
                            <Text style={tw`text-green-600 text-xs mt-1`}>
                              ({completion.daysNeeded} days •{' '}
                              {completion.remainingPages} pages remaining)
                            </Text>
                          </View>
                        );
                      }
                      return null;
                    })()}
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleSetupSubmit}
                  style={[
                    tw`rounded-xl py-4 px-6`,
                    dailyTarget &&
                    isStartingFresh !== null &&
                    (isStartingFresh || pagesAlreadyRead)
                      ? tw`bg-blue-500`
                      : tw`bg-gray-300`,
                  ]}
                  disabled={
                    !(
                      dailyTarget &&
                      isStartingFresh !== null &&
                      (isStartingFresh || pagesAlreadyRead)
                    )
                  }
                >
                  <LinearGradient
                    colors={
                      dailyTarget &&
                      isStartingFresh !== null &&
                      (isStartingFresh || pagesAlreadyRead)
                        ? ['#3B82F6', '#1D4ED8']
                        : ['#D1D5DB', '#9CA3AF']
                    }
                    style={tw`rounded-2xl py-4 px-6 items-center`}
                  >
                    <Text style={tw`text-white font-bold text-center text-xl`}>
                      🚀 Begin Your Journey
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </LinearGradient>
        ) : (
          // Dashboard View
          <View style={tw`p-6`}>
            {/* Today's Progress Card */}
            <View style={tw`bg-white rounded-2xl p-6 mb-6`}>
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-xl font-bold text-gray-900`}>
                  Today's Progress
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTodayModal(true)}
                  style={tw`bg-blue-500 rounded-full px-4 py-2`}
                >
                  <Text style={tw`text-white font-semibold text-sm`}>
                    Add Progress
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={tw`mb-4`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={tw`text-gray-600`}>
                    {getTodayProgress().completed} / {targetData.dailyTarget}{' '}
                    pages
                  </Text>
                  <Text style={tw`font-semibold text-gray-900`}>
                    {getTodayProgress().percentage.toFixed(0)}%
                  </Text>
                </View>
                <View style={tw`bg-gray-200 rounded-full h-3`}>
                  <View
                    style={[
                      tw`bg-blue-500 rounded-full h-3`,
                      { width: `${getTodayProgress().percentage}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={tw`flex-row justify-between`}>
                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-2xl font-bold text-blue-500`}>
                    {getStreakInfo().current}
                  </Text>
                  <Text style={tw`text-sm text-gray-500`}>Current Streak</Text>
                </View>
                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-2xl font-bold text-green-500`}>
                    {getStreakInfo().best}
                  </Text>
                  <Text style={tw`text-sm text-gray-500`}>Best Streak</Text>
                </View>
                <View style={tw`items-center flex-1`}>
                  <Text style={tw`text-2xl font-bold text-purple-500`}>
                    {targetData.totalCompleted}
                  </Text>
                  <Text style={tw`text-sm text-gray-500`}>Total Pages</Text>
                </View>
              </View>
            </View>

            {/* Last 7 Days */}
            <View style={tw`bg-white rounded-2xl p-6 mb-6`}>
              <Text style={tw`text-lg font-bold text-gray-900 mb-4`}>
                Last 7 Days
              </Text>
              <View style={tw`flex-row justify-between`}>
                {getRecentActivity().map((day, index) => (
                  <View key={day.date} style={tw`items-center flex-1`}>
                    <Text style={tw`text-xs text-gray-500 mb-2`}>
                      {day.dayName}
                    </Text>
                    <View
                      style={[
                        tw`w-8 h-8 rounded-full items-center justify-center`,
                        day.isComplete
                          ? tw`bg-green-500`
                          : day.isToday
                            ? tw`bg-blue-100 border-2 border-blue-500`
                            : tw`bg-gray-200`,
                      ]}
                    >
                      {day.isComplete ? (
                        <Ionicons name="checkmark" size={16} color="white" />
                      ) : day.isToday ? (
                        <View style={tw`w-2 h-2 bg-blue-500 rounded-full`} />
                      ) : null}
                    </View>
                    <Text style={tw`text-xs text-gray-500 mt-1`}>
                      {day.progress}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Target Info */}
            <View style={tw`bg-white rounded-2xl p-6 mb-6`}>
              <Text style={tw`text-lg font-bold text-gray-900 mb-4`}>
                Your Target
              </Text>
              <View style={tw`space-y-3`}>
                <View style={tw`flex-row justify-between`}>
                  <Text style={tw`text-gray-600`}>Daily Goal</Text>
                  <Text style={tw`font-semibold`}>
                    {targetData.dailyTarget} pages
                  </Text>
                </View>

                {/* Completion Prediction */}
                {(() => {
                  const completion = calculateCompletionInfo(
                    targetData.dailyTarget,
                    targetData.totalCompleted
                  );
                  return (
                    <>
                      <View style={tw`flex-row justify-between`}>
                        <Text style={tw`text-gray-600`}>Pages Remaining</Text>
                        <Text style={tw`font-semibold`}>
                          {completion.remainingPages} pages
                        </Text>
                      </View>
                      <View style={tw`flex-row justify-between`}>
                        <Text style={tw`text-gray-600`}>Days to Complete</Text>
                        <Text style={tw`font-semibold`}>
                          {completion.daysNeeded} days
                        </Text>
                      </View>
                      <View
                        style={tw`bg-green-50 border border-green-200 rounded-xl p-3 mt-2`}
                      >
                        <View style={tw`flex-row items-center mb-1`}>
                          <Ionicons
                            name="calendar"
                            size={16}
                            color="#059669"
                            style={tw`mr-2`}
                          />
                          <Text
                            style={tw`text-green-800 font-semibold text-sm`}
                          >
                            Completion Date
                          </Text>
                        </View>
                        <Text style={tw`text-green-700 font-bold`}>
                          {completion.completionDate}
                        </Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={deleteTargetData}
              style={tw`bg-red-50 border border-red-200 rounded-xl p-4 mb-6`}
            >
              <View style={tw`flex-row items-center justify-center`}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color="#DC2626"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-red-600 font-semibold`}>
                  Delete All Data
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Progress Modal */}
      <Modal
        visible={showTodayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#ffffff"
            translucent
          />
          <View
            style={tw`flex-row items-center justify-between p-6 border-b border-gray-100`}
          >
            <Text style={tw`text-xl font-bold text-gray-900`}>
              Add Today's Progress
            </Text>
            <TouchableOpacity
              onPress={() => setShowTodayModal(false)}
              style={tw`p-2`}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={tw`flex-1 p-6`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-4`}>
              How many pages did you complete today?
            </Text>
            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-3 text-lg mb-6`}
              placeholder="Number of pages"
              value={todayProgress}
              onChangeText={setTodayProgress}
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={handleTodaySubmit}
              style={[
                tw`rounded-xl py-4 px-6`,
                todayProgress ? tw`bg-blue-500` : tw`bg-gray-300`,
              ]}
              disabled={!todayProgress}
            >
              <Text style={tw`text-white font-semibold text-center text-lg`}>
                Add Progress
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#ffffff"
            translucent
          />
          <View
            style={tw`flex-row items-center justify-between p-6 border-b border-gray-100`}
          >
            <Text style={tw`text-xl font-bold text-gray-900`}>
              Edit Daily Target
            </Text>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              style={tw`p-2`}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={tw`flex-1 p-6`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-4`}>
              Daily Pages Target
            </Text>
            <TextInput
              style={tw`border border-gray-300 rounded-xl px-4 py-3 text-lg mb-6`}
              placeholder="How many pages per day?"
              value={dailyTarget}
              onChangeText={setDailyTarget}
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={handleEditSubmit}
              style={[
                tw`rounded-xl py-4 px-6`,
                dailyTarget ? tw`bg-blue-500` : tw`bg-gray-300`,
              ]}
              disabled={!dailyTarget}
            >
              <Text style={tw`text-white font-semibold text-center text-lg`}>
                Update Target
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
