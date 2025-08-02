import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IOSLoader } from '../components/IOSLoader';

const DAILY_TARGET_STORAGE_KEY = 'daily_target_data';

const SectionHeader = ({ title }) => (
  <View style={tw`px-4 py-3 bg-gray-100`}>
    <Text style={tw`text-sm font-medium text-gray-500 uppercase tracking-wide`}>
      {title}
    </Text>
  </View>
);

const StatCard = ({ title, value, subtitle, icon, color = "#007AFF" }) => (
  <View style={tw`bg-white px-4 py-4 border-b border-gray-200`}>
    <View style={tw`flex-row items-center`}>
      <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-sm text-gray-500 font-medium uppercase tracking-wide mb-1`}>
          {title}
        </Text>
        <Text style={tw`text-2xl font-light text-black mb-1`}>
          {value}
        </Text>
        {subtitle && (
          <Text style={tw`text-sm text-gray-500`}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  </View>
);

const ProgressBar = ({ progress, total, color = "#007AFF" }) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0;
  return (
    <View style={tw`flex-1`}>
      <View style={tw`h-2 bg-gray-200 rounded-full overflow-hidden`}>
        <View 
          style={[
            tw`h-full rounded-full`,
            { backgroundColor: color, width: `${Math.min(percentage, 100)}%` }
          ]} 
        />
      </View>
      <Text style={tw`text-xs text-gray-500 mt-1 text-center`}>
        {percentage.toFixed(0)}%
      </Text>
    </View>
  );
};

const ActionButton = ({ icon, title, subtitle, onPress, color = "#007AFF" }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-white px-4 py-4 border-b border-gray-200`}
    activeOpacity={0.3}
  >
    <View style={tw`flex-row items-center`}>
      <View style={[tw`w-12 h-12 rounded-xl items-center justify-center mr-4`, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-lg font-medium text-black mb-1`}>
          {title}
        </Text>
        {subtitle && (
          <Text style={tw`text-base text-gray-500`}>
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </View>
  </TouchableOpacity>
);

export default function HifzScreen({ navigation }) {
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

  const renderStartingOption = (isFresh, title, description, icon) => (
    <TouchableOpacity
      onPress={() => setIsStartingFresh(isFresh)}
      style={tw`bg-white px-4 py-4 border-b border-gray-200`}
      activeOpacity={0.3}
    >
      <View style={tw`flex-row items-center`}>
        <View style={[
          tw`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center`,
          { borderColor: isStartingFresh === isFresh ? '#007AFF' : '#C7C7CC' }
        ]}>
          {isStartingFresh === isFresh && (
            <View style={[tw`w-3 h-3 rounded-full`, { backgroundColor: '#007AFF' }]} />
          )}
        </View>
        <Ionicons 
          name={icon} 
          size={20} 
          color={isStartingFresh === isFresh ? '#007AFF' : '#8E8E93'} 
          style={tw`mr-3`} 
        />
        <View style={tw`flex-1`}>
          <Text style={tw`text-lg font-medium text-black mb-1`}>
            {title}
          </Text>
          <Text style={tw`text-sm text-gray-500`}>
            {description}
          </Text>
        </View>
        {isStartingFresh === isFresh && (
          <Ionicons name="checkmark" size={20} color="#007AFF" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
        <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />
        <IOSLoader 
          title="Loading Journey"
          subtitle="Please wait while we load your Hifz progress"
          overlay={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
      <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />
      
      {/* iOS-Style Navigation Header */}
      <View style={tw`bg-gray-100 border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between px-4 py-3`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`flex-row items-center py-1`}
            activeOpacity={0.3}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
            <Text style={tw`text-lg text-blue-500 ml-1 font-normal`}>Back</Text>
          </TouchableOpacity>

          <Text style={tw`text-lg font-semibold text-black`}>
            Daily Quran
          </Text>

          {targetData && (
            <TouchableOpacity
              onPress={() => {
                setDailyTarget(targetData.dailyTarget.toString());
                setShowEditModal(true);
              }}
              style={tw`p-1`}
              activeOpacity={0.3}
            >
              <Ionicons name="ellipsis-horizontal-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
          {!targetData && <View style={tw`w-6`} />}
        </View>
      </View>

      <ScrollView
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-8`}
      >
        {!targetData ? (
          // iOS-Style Setup Flow
          <View>
            {/* Hero Section */}
            <View style={tw`mt-6`}>
              <SectionHeader title="Set Up Your Journey" />
              <View style={tw`bg-white px-4 py-6`}>
                <View style={tw`items-center mb-6`}>
                  <View style={tw`w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-4`}>
                    <Ionicons name="book" size={40} color="#007AFF" />
                  </View>
                  <Text style={tw`text-xl font-bold text-black text-center mb-2`}>
                    Daily Quran Reading
                  </Text>
                  <Text style={tw`text-base text-gray-500 text-center leading-6`}>
                    Build a consistent reading habit with personalized daily goals
                  </Text>
                </View>
              </View>
            </View>

            {/* Starting Point Selection */}
            <View style={tw`mt-8`}>
              <SectionHeader title="Starting Point" />
              <View style={tw`bg-white`}>
                {renderStartingOption(
                  true, 
                  'Fresh Start', 
                  'Beginning from page 1',
                  'play-circle'
                )}
                {renderStartingOption(
                  false, 
                  'Continue Reading', 
                  'I have already made progress',
                  'bookmark'
                )}
              </View>
            </View>

            {/* Pages Already Read */}
            {isStartingFresh === false && (
              <View style={tw`mt-8`}>
                <SectionHeader title="Current Progress" />
                <View style={tw`bg-white px-4 py-4`}>
                  <Text style={tw`text-base font-medium text-black mb-3`}>
                    Pages Completed (0-603)
                  </Text>
                  <View style={tw`bg-gray-50 rounded-xl border border-gray-200`}>
                    <TextInput
                      style={tw`px-4 py-3 text-lg text-black`}
                      placeholder="Enter pages completed"
                      placeholderTextColor="#8E8E93"
                      value={pagesAlreadyRead}
                      onChangeText={setPagesAlreadyRead}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Daily Target */}
            {isStartingFresh !== null && (
              <View style={tw`mt-8`}>
                <SectionHeader title="Daily Goal" />
                <View style={tw`bg-white px-4 py-4`}>
                  <Text style={tw`text-base font-medium text-black mb-3`}>
                    Pages Per Day
                  </Text>
                  <View style={tw`bg-gray-50 rounded-xl border border-gray-200`}>
                    <TextInput
                      style={tw`px-4 py-3 text-lg text-black`}
                      placeholder="Enter daily target"
                      placeholderTextColor="#8E8E93"
                      value={dailyTarget}
                      onChangeText={setDailyTarget}
                      keyboardType="numeric"
                    />
                  </View>
                  <Text style={tw`text-sm text-gray-500 mt-2`}>
                    Recommended: 1-5 pages daily
                  </Text>
                </View>
              </View>
            )}

            {/* Completion Preview */}
            {dailyTarget && isStartingFresh !== null && (
              <View style={tw`mt-8`}>
                <SectionHeader title="Completion Forecast" />
                <View style={tw`bg-white px-4 py-4`}>
                  {(() => {
                    const alreadyRead = isStartingFresh ? 0 : parseInt(pagesAlreadyRead) || 0;
                    const target = parseInt(dailyTarget) || 0;
                    if (target > 0) {
                      const completion = calculateCompletionInfo(target, alreadyRead);
                      return (
                        <View>
                          <View style={tw`flex-row items-center mb-3`}>
                            <View style={tw`w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3`}>
                              <Ionicons name="calendar" size={20} color="#34C759" />
                            </View>
                            <View style={tw`flex-1`}>
                              <Text style={tw`text-lg font-semibold text-black`}>
                                {completion.completionDate}
                              </Text>
                              <Text style={tw`text-sm text-gray-500`}>
                                Expected completion date
                              </Text>
                            </View>
                          </View>
                          <View style={tw`bg-gray-50 rounded-xl p-4`}>
                            <View style={tw`flex-row justify-between mb-2`}>
                              <Text style={tw`text-sm text-gray-500`}>Days needed</Text>
                              <Text style={tw`text-sm font-medium text-black`}>{completion.daysNeeded}</Text>
                            </View>
                            <View style={tw`flex-row justify-between`}>
                              <Text style={tw`text-sm text-gray-500`}>Pages remaining</Text>
                              <Text style={tw`text-sm font-medium text-black`}>{completion.remainingPages}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    }
                    return null;
                  })()}
                </View>
              </View>
            )}

            {/* Start Button */}
            <View style={tw`mt-8 px-4 pb-6`}>
              <TouchableOpacity
                onPress={handleSetupSubmit}
                disabled={!(dailyTarget && isStartingFresh !== null && (isStartingFresh || pagesAlreadyRead))}
                style={[
                  tw`rounded-xl py-4 items-center`,
                  dailyTarget && isStartingFresh !== null && (isStartingFresh || pagesAlreadyRead)
                    ? { backgroundColor: '#007AFF' }
                    : { backgroundColor: '#C7C7CC' }
                ]}
                activeOpacity={0.8}
              >
                <Text style={[
                  tw`text-lg font-semibold`,
                  dailyTarget && isStartingFresh !== null && (isStartingFresh || pagesAlreadyRead)
                    ? tw`text-white`
                    : tw`text-gray-500`
                ]}>
                  Begin Journey
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // iOS-Style Dashboard
          <View>
            {/* Welcome Section */}
            <View style={tw`mt-6`}>
              <SectionHeader title="Your Progress" />
              <View style={tw`bg-white px-4 py-6`}>
                <View style={tw`items-center mb-6`}>
                  <Text style={tw`text-3xl font-light text-black mb-2`}>
                    Keep up the great work
                  </Text>
                  <Text style={tw`text-base text-gray-500 text-center`}>
                    May Allah bless your reading journey
                  </Text>
                </View>
              </View>
            </View>

            

            {/* Statistics */}
            <View style={tw`mt-8`}>
              <SectionHeader title="Statistics" />
              <View style={tw`bg-white`}>
                <StatCard
                  title="Current Streak"
                  value={getStreakInfo().current}
                  subtitle="days"
                  icon="flame"
                  color="#FF8C00"
                />
                <StatCard
                  title="Best Streak"
                  value={getStreakInfo().best}
                  subtitle="days"
                  icon="trophy"
                  color="#FFD700"
                />
                <StatCard
                  title="Total Pages"
                  value={targetData.totalCompleted}
                  subtitle="completed"
                  icon="book"
                  color="#34C759"
                />
              </View>
            </View>

            {/* Journey Overview */}
            <View style={tw`mt-8`}>
              <SectionHeader title="Journey Overview" />
              <View style={tw`bg-white px-4 py-4`}>
                {(() => {
                  const completion = calculateCompletionInfo(targetData.dailyTarget, targetData.totalCompleted);
                  const progressPercent = (targetData.totalCompleted / 604) * 100;

                  return (
                    <View>
                      <View style={tw`mb-6`}>
                        <View style={tw`flex-row justify-between items-center mb-3`}>
                          <Text style={tw`text-lg font-semibold text-black`}>
                            Overall Progress
                          </Text>
                          <Text style={tw`text-sm text-gray-500`}>
                            {progressPercent.toFixed(1)}%
                          </Text>
                        </View>
                        <View style={tw`h-3 bg-gray-200 rounded-full overflow-hidden`}>
                          <View 
                            style={[
                              tw`h-full rounded-full`,
                              { backgroundColor: '#34C759', width: `${progressPercent}%` }
                            ]} 
                          />
                        </View>
                      </View>

                      <View style={tw`bg-gray-50 rounded-xl p-4`}>
                        <View style={tw`flex-row justify-between items-center mb-3`}>
                          <Text style={tw`text-sm text-gray-500`}>Pages remaining</Text>
                          <Text style={tw`text-sm font-medium text-black`}>{completion.remainingPages}</Text>
                        </View>
                        <View style={tw`flex-row justify-between items-center mb-3`}>
                          <Text style={tw`text-sm text-gray-500`}>Days remaining</Text>
                          <Text style={tw`text-sm font-medium text-black`}>{completion.daysNeeded}</Text>
                        </View>
                        <View style={tw`flex-row justify-between items-center`}>
                          <Text style={tw`text-sm text-gray-500`}>Expected completion</Text>
                          <Text style={tw`text-sm font-medium text-black`}>{completion.completionDate}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </View>
            </View>

            {/* Actions */}
            <View style={tw`mt-8`}>
              <SectionHeader title="Actions" />
              <View style={tw`bg-white`}>
                <ActionButton
                  icon="add-circle"
                  title="Add Today's Progress"
                  subtitle="Log pages read today"
                  onPress={() => setShowTodayModal(true)}
                  color="#007AFF"
                />
                <ActionButton
                  icon="settings"
                  title="Edit Daily Goal"
                  subtitle="Change your target pages"
                  onPress={() => {
                    setDailyTarget(targetData.dailyTarget.toString());
                    setShowEditModal(true);
                  }}
                  color="#8E8E93"
                />
              </View>
            </View>

            {/* Reset Journey */}
            <View style={tw`mt-8 mb-6`}>
              <SectionHeader title="Journey Settings" />
              <View style={tw`bg-white`}>
                <TouchableOpacity
                  onPress={deleteTargetData}
                  style={tw`px-4 py-4`}
                  activeOpacity={0.3}
                >
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3`}>
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                    </View>
                    <Text style={tw`text-lg font-medium text-red-500`}>
                      Reset Journey
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* iOS-Style Add Progress Modal */}
      <Modal
        visible={showTodayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
          <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />
          
          {/* Modal Header */}
          <View style={tw`bg-gray-100 border-b border-gray-200`}>
            <View style={tw`flex-row items-center justify-between px-4 py-3`}>
              <TouchableOpacity
                onPress={() => {
                  setShowTodayModal(false);
                  setTodayProgress('');
                }}
                style={tw`py-1`}
                activeOpacity={0.3}
              >
                <Text style={tw`text-lg text-blue-500`}>Cancel</Text>
              </TouchableOpacity>

              <Text style={tw`text-lg font-semibold text-black`}>
                Add Progress
              </Text>

              <TouchableOpacity
                onPress={handleTodaySubmit}
                disabled={!todayProgress}
                style={tw`py-1`}
                activeOpacity={0.3}
              >
                <Text style={[
                  tw`text-lg font-semibold`,
                  todayProgress ? tw`text-blue-500` : tw`text-gray-400`
                ]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`px-4 py-6`}>
            <View style={tw`items-center mb-8`}>
              <View style={tw`w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4`}>
                <Ionicons name="add" size={32} color="#007AFF" />
              </View>
              <Text style={tw`text-2xl font-bold text-black text-center mb-2`}>
                Today's Reading
              </Text>
              <Text style={tw`text-base text-gray-500 text-center`}>
                How many pages did you complete today?
              </Text>
            </View>

            <View style={tw`bg-white rounded-xl`}>
              <View style={tw`px-4 py-4`}>
                <Text style={tw`text-base font-medium text-black mb-3`}>
                  Pages Completed
                </Text>
                <View style={tw`bg-gray-50 rounded-xl border border-gray-200`}>
                  <TextInput
                    style={tw`px-4 py-3 text-xl text-black text-center`}
                    placeholder="0"
                    placeholderTextColor="#8E8E93"
                    value={todayProgress}
                    onChangeText={setTodayProgress}
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>
                <Text style={tw`text-sm text-gray-500 mt-2 text-center`}>
                  Enter the number of pages you read today
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* iOS-Style Edit Goal Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
          <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />
          
          {/* Modal Header */}
          <View style={tw`bg-gray-100 border-b border-gray-200`}>
            <View style={tw`flex-row items-center justify-between px-4 py-3`}>
              <TouchableOpacity
                onPress={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                style={tw`py-1`}
                activeOpacity={0.3}
              >
                <Text style={tw`text-lg text-blue-500`}>Cancel</Text>
              </TouchableOpacity>

              <Text style={tw`text-lg font-semibold text-black`}>
                Edit Goal
              </Text>

              <TouchableOpacity
                onPress={handleEditSubmit}
                disabled={!dailyTarget}
                style={tw`py-1`}
                activeOpacity={0.3}
              >
                <Text style={[
                  tw`text-lg font-semibold`,
                  dailyTarget ? tw`text-blue-500` : tw`text-gray-400`
                ]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={tw`flex-1`} contentContainerStyle={tw`px-4 py-6`}>
            <View style={tw`items-center mb-8`}>
              <View style={tw`w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4`}>
                <Ionicons name="target" size={32} color="#007AFF" />
              </View>
              <Text style={tw`text-2xl font-bold text-black text-center mb-2`}>
                Daily Goal
              </Text>
              <Text style={tw`text-base text-gray-500 text-center`}>
                How many pages would you like to read daily?
              </Text>
            </View>

            <View style={tw`bg-white rounded-xl`}>
              <View style={tw`px-4 py-4`}>
                <Text style={tw`text-base font-medium text-black mb-3`}>
                  Pages Per Day
                </Text>
                <View style={tw`bg-gray-50 rounded-xl border border-gray-200`}>
                  <TextInput
                    style={tw`px-4 py-3 text-xl text-black text-center`}
                    placeholder="5"
                    placeholderTextColor="#8E8E93"
                    value={dailyTarget}
                    onChangeText={setDailyTarget}
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>
                <Text style={tw`text-sm text-gray-500 mt-2 text-center`}>
                  Recommended: 1-5 pages daily for consistency
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
