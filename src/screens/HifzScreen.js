import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const HIFZ_STORAGE_KEY = 'hifz_tracker_data';
const TOTAL_QURAN_PAGES = 604; // Total pages in the Quran

export default function HifzScreen({ navigation }) {
  const [hifzData, setHifzData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTodayModal, setShowTodayModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Setup form state
  const [memorizeChoice, setMemorizeChoice] = useState(''); // 'want', 'memorizing', 'completed'
  const [targetDate, setTargetDate] = useState(new Date());
  const [alreadyMemorized, setAlreadyMemorized] = useState('');
  const [todayPages, setTodayPages] = useState('');

  useEffect(() => {
    loadHifzData();
  }, []);

  const loadHifzData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(HIFZ_STORAGE_KEY);
      if (savedData) {
        setHifzData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading hifz data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHifzData = async (data) => {
    try {
      await AsyncStorage.setItem(HIFZ_STORAGE_KEY, JSON.stringify(data));
      setHifzData(data);
    } catch (error) {
      console.error('Error saving hifz data:', error);
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  const calculateDailyTarget = (totalPages, alreadyDone, targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const daysRemaining = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    const pagesRemaining = totalPages - alreadyDone;
    
    console.log('Daily Target Calculation:', {
      totalPages,
      alreadyDone, 
      pagesRemaining,
      daysRemaining,
      exactDaily: pagesRemaining / daysRemaining
    });
    
    if (daysRemaining <= 0) return { 
      dailyPages: pagesRemaining, 
      daysRemaining: 0,
      exactDaily: pagesRemaining
    };
    
    const exactDaily = pagesRemaining / daysRemaining;
    
    // Smart rounding: if less than 1, round to nearest 0.25
    let displayDaily;
    if (exactDaily < 1) {
      displayDaily = Math.ceil(exactDaily * 4) / 4; // Round to nearest 0.25
    } else {
      displayDaily = Math.ceil(exactDaily); // Round up to whole number
    }
    
    return {
      dailyPages: displayDaily,
      daysRemaining,
      exactDaily: exactDaily
    };
  };

  const handleSetupSubmit = () => {
    if (!memorizeChoice) {
      Alert.alert('Missing Information', 'Please select your memorization status.');
      return;
    }

    // For completed users, automatically set to 604 pages
    let pages;
    if (memorizeChoice === 'completed') {
      pages = TOTAL_QURAN_PAGES;
    } else {
      if (!alreadyMemorized) {
        Alert.alert('Missing Information', 'Please enter the number of pages you have memorized.');
        return;
      }
      pages = parseInt(alreadyMemorized) || 0;
      if (pages < 0 || pages > TOTAL_QURAN_PAGES) {
        Alert.alert('Invalid Input', `Pages must be between 0 and ${TOTAL_QURAN_PAGES}.`);
        return;
      }
    }

    const newHifzData = {
      choice: memorizeChoice,
      targetDate: memorizeChoice === 'completed' ? new Date().toISOString() : targetDate.toISOString(),
      totalPages: TOTAL_QURAN_PAGES,
      memorizedPages: pages,
      dailyProgress: {},
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    saveHifzData(newHifzData);
    setShowSetupModal(false);
    resetForm();
  };

  const handleTodaySubmit = () => {
    if (!todayPages) {
      Alert.alert('Missing Information', 'Please enter the number of pages.');
      return;
    }

    const pages = parseFloat(todayPages) || 0;
    if (pages < 0) {
      Alert.alert('Invalid Input', 'Pages cannot be negative.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const updatedData = {
      ...hifzData,
      memorizedPages: Math.min(hifzData.memorizedPages + pages, TOTAL_QURAN_PAGES),
      dailyProgress: {
        ...hifzData.dailyProgress,
        [today]: (hifzData.dailyProgress[today] || 0) + pages
      },
      lastUpdated: new Date().toISOString()
    };

    saveHifzData(updatedData);
    setShowTodayModal(false);
    setTodayPages('');
  };

  const handleEditSubmit = () => {
    if (!alreadyMemorized) {
      Alert.alert('Missing Information', 'Please enter the number of pages.');
      return;
    }

    const pages = parseInt(alreadyMemorized) || 0;
    if (pages < 0 || pages > TOTAL_QURAN_PAGES) {
      Alert.alert('Invalid Input', `Pages must be between 0 and ${TOTAL_QURAN_PAGES}.`);
      return;
    }

    const updatedData = {
      ...hifzData,
      choice: memorizeChoice,
      targetDate: targetDate.toISOString(),
      memorizedPages: pages,
      lastUpdated: new Date().toISOString()
    };

    saveHifzData(updatedData);
    setShowEditModal(false);
    resetForm();
  };

  const selectTargetDate = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || targetDate;
    setShowDatePicker(Platform.OS === 'ios');
    setTargetDate(currentDate);
  };

  const resetForm = () => {
    setMemorizeChoice('');
    setTargetDate(new Date());
    setAlreadyMemorized('');
    setTodayPages('');
  };

  const deleteHifzData = () => {
    Alert.alert(
      'Delete Hifz Data',
      'Are you sure you want to delete all memorization data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(HIFZ_STORAGE_KEY);
              setHifzData(null);
            } catch (error) {
              console.error('Error deleting hifz data:', error);
            }
          }
        }
      ]
    );
  };

  const getProgressPercentage = () => {
    if (!hifzData) return 0;
    return (hifzData.memorizedPages / hifzData.totalPages) * 100;
  };

  const getTodayProgress = () => {
    if (!hifzData) return 0;
    const today = new Date().toISOString().split('T')[0];
    return hifzData.dailyProgress[today] || 0;
  };

  const renderChoiceButton = (choice, label, icon) => (
    <TouchableOpacity
      onPress={() => setMemorizeChoice(choice)}
      style={[
        tw`flex-1 p-4 rounded-xl border-2 mx-1`,
        memorizeChoice === choice 
          ? tw`border-green-500 bg-green-50` 
          : tw`border-gray-300 bg-white`
      ]}
    >
      <View style={tw`items-center`}>
        <Ionicons 
          name={icon} 
          size={32} 
          color={memorizeChoice === choice ? '#10b981' : '#6b7280'} 
        />
        <Text style={[
          tw`text-sm font-medium mt-2 text-center`,
          memorizeChoice === choice ? tw`text-green-700` : tw`text-gray-700`
        ]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-amber-50`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <Ionicons name="book" size={48} color="#92400e" />
          <Text style={tw`text-lg text-amber-800 mt-4`}>Loading Hifz Tracker...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-amber-50`}>
      {/* Header */}
      <View style={tw`bg-white border-b border-amber-200 px-4 py-3`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`w-10 h-10 rounded-full items-center justify-center bg-amber-100 mr-3`}
          >
            <Ionicons name="arrow-back" size={20} color="#92400e" />
          </TouchableOpacity>
          <View style={tw`flex-1`}>
            <Text style={tw`text-xl font-bold text-amber-900`}>Hifz Tracker</Text>
            <Text style={tw`text-sm text-amber-600`}>Quran Memorization Progress</Text>
          </View>
          {hifzData && (
            <TouchableOpacity
              onPress={deleteHifzData}
              style={tw`w-10 h-10 rounded-full items-center justify-center bg-red-100`}
            >
              <Ionicons name="trash-outline" size={18} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}>
        {!hifzData ? (
          // No data - show setup button
          <View style={tw`flex-1 items-center justify-center py-20`}>
            <Ionicons name="book-outline" size={80} color="#92400e" />
            <Text style={tw`text-2xl font-bold text-amber-900 mt-4 text-center`}>
              Start Your Hifz Journey
            </Text>
            <Text style={tw`text-amber-700 text-center mt-2 px-4`}>
              Track your Quran memorization progress and stay motivated with daily targets
            </Text>
            <TouchableOpacity
              onPress={() => setShowSetupModal(true)}
              style={tw`mt-8 bg-amber-600 px-8 py-4 rounded-xl`}
            >
              <Text style={tw`text-white font-semibold text-lg`}>Setup Hifz Tracker</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Show tracker data
          <View>
            {/* Progress Overview */}
            <LinearGradient
              colors={['#10b981', '#059669', '#047857']}
              style={tw`rounded-2xl p-6 mb-6`}
            >
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <Text style={tw`text-white text-xl font-bold`}>
                  {hifzData.memorizedPages} / {hifzData.totalPages} Pages
                </Text>
                <Text style={tw`text-white text-lg font-semibold`}>
                  {getProgressPercentage().toFixed(1)}%
                </Text>
              </View>
              
              {/* Progress Bar */}
              <View style={tw`bg-white/20 rounded-full h-3 mb-4`}>
                <View 
                  style={[
                    tw`bg-white rounded-full h-3`,
                    { width: `${getProgressPercentage()}%` }
                  ]} 
                />
              </View>

              <Text style={tw`text-white/90 text-sm`}>
                Status: {hifzData.choice === 'want' ? 'Planning to Memorize' : 
                         hifzData.choice === 'memorizing' ? 'Currently Memorizing' : 'Completed'}
              </Text>
            </LinearGradient>

            {/* Congratulations for completed users */}
            {hifzData.choice === 'completed' && (
              <View style={tw`bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-6 mb-6`}>
                <LinearGradient
                  colors={['#34d399', '#10b981', '#059669']}
                  style={tw`rounded-2xl p-6`}
                >
                  <View style={tw`items-center`}>
                    <Ionicons name="trophy" size={64} color="white" />
                    <Text style={tw`text-2xl font-bold text-white mt-4 text-center`}>
                      Masha'Allah! 🎉
                    </Text>
                    <Text style={tw`text-white text-center mt-3 text-lg leading-7`}>
                      You have completed the entire Holy Quran memorization. 
                      May Allah reward you abundantly and accept your efforts.
                    </Text>
                    <View style={tw`bg-white/20 rounded-xl p-4 mt-4`}>
                      <Text style={tw`text-white text-center font-medium italic`}>
                        "And We have indeed made the Quran easy to understand and remember" 
                      </Text>
                      <Text style={tw`text-white/90 text-center text-sm mt-1`}>
                        - Quran 54:17
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Daily Target & Today's Progress */}
            {hifzData.choice !== 'completed' && (
              <View style={tw`bg-white rounded-2xl p-4 mb-4 border border-amber-200`}>
                <Text style={tw`text-lg font-bold text-amber-900 mb-3`}>Daily Progress</Text>
                
                {(() => {
                  const { dailyPages, daysRemaining } = calculateDailyTarget(
                    hifzData.totalPages, 
                    hifzData.memorizedPages, 
                    hifzData.targetDate
                  );
                  
                  return (
                    <View style={tw`flex-row justify-between mb-4`}>
                      <View style={tw`flex-1 bg-blue-50 rounded-xl p-3 mr-2`}>
                        <Text style={tw`text-blue-800 font-semibold text-lg`}>
                          {dailyPages} pages
                        </Text>
                        <Text style={tw`text-blue-600 text-sm`}>Daily Target</Text>
                      </View>
                      
                      <View style={tw`flex-1 bg-purple-50 rounded-xl p-3 ml-2`}>
                        <Text style={tw`text-purple-800 font-semibold text-lg`}>
                          {daysRemaining} days
                        </Text>
                        <Text style={tw`text-purple-600 text-sm`}>Remaining</Text>
                      </View>
                    </View>
                  );
                })()}

                <View style={tw`flex-row justify-between items-center`}>
                  <View>
                    <Text style={tw`text-amber-900 font-semibold`}>
                      Today: {getTodayProgress()} pages
                    </Text>
                    <Text style={tw`text-amber-600 text-sm`}>Memorized today</Text>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => setShowTodayModal(true)}
                    style={tw`bg-green-500 px-4 py-2 rounded-lg`}
                  >
                    <Text style={tw`text-white font-semibold`}>Add Today</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Target Date */}
            <View style={tw`bg-white rounded-2xl p-4 mb-4 border border-amber-200`}>
              <Text style={tw`text-lg font-bold text-amber-900 mb-2`}>Target Completion</Text>
              <Text style={tw`text-amber-700`}>
                {new Date(hifzData.targetDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                onPress={() => {
                  setMemorizeChoice(hifzData.choice);
                  setTargetDate(new Date(hifzData.targetDate));
                  setAlreadyMemorized(hifzData.memorizedPages.toString());
                  setShowEditModal(true);
                }}
                style={tw`flex-1 bg-amber-600 py-4 rounded-xl`}
              >
                <Text style={tw`text-white font-semibold text-center`}>Edit Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Setup Modal */}
      <Modal
        visible={showSetupModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          <View style={tw`flex-1 p-6`}>
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <Text style={tw`text-2xl font-bold text-amber-900`}>Setup Hifz Tracker</Text>
              <TouchableOpacity
                onPress={() => setShowSetupModal(false)}
                style={tw`w-8 h-8 rounded-full items-center justify-center bg-gray-100`}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Choice Selection */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>
                  What's your memorization status?
                </Text>
                <View style={tw`flex-row`}>
                  {renderChoiceButton('want', 'Want to\nMemorize', 'heart-outline')}
                  {renderChoiceButton('memorizing', 'Currently\nMemorizing', 'book-outline')}
                  {renderChoiceButton('completed', 'Already\nCompleted', 'checkmark-circle-outline')}
                </View>
              </View>

              {/* Pages Already Memorized */}
              {memorizeChoice !== 'completed' && (
                <View style={tw`mb-6`}>
                  <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>
                    How many pages have you already memorized?
                  </Text>
                  <TextInput
                    style={tw`border border-gray-300 rounded-xl p-4 text-base`}
                    placeholder="Enter number of pages (0-604)"
                    value={alreadyMemorized}
                    onChangeText={setAlreadyMemorized}
                    keyboardType="numeric"
                  />
                </View>
              )}

              {/* Target Date - only if not completed */}
              {memorizeChoice !== 'completed' && (
                <View style={tw`mb-6`}>
                  <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>
                    When do you want to complete memorization?
                  </Text>
                  
                  {/* Quick Preset Buttons */}
                  <View style={tw`flex-row flex-wrap gap-2 mb-3`}>
                    <TouchableOpacity
                      onPress={() => {
                        const newDate = new Date();
                        newDate.setMonth(newDate.getMonth() + 6);
                        setTargetDate(newDate);
                      }}
                      style={tw`bg-blue-100 px-3 py-2 rounded-lg`}
                    >
                      <Text style={tw`text-blue-800 text-sm font-medium`}>6 Months</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        const newDate = new Date();
                        newDate.setFullYear(newDate.getFullYear() + 1);
                        setTargetDate(newDate);
                      }}
                      style={tw`bg-purple-100 px-3 py-2 rounded-lg`}
                    >
                      <Text style={tw`text-purple-800 text-sm font-medium`}>1 Year</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        const newDate = new Date();
                        newDate.setFullYear(newDate.getFullYear() + 2);
                        setTargetDate(newDate);
                      }}
                      style={tw`bg-green-100 px-3 py-2 rounded-lg`}
                    >
                      <Text style={tw`text-green-800 text-sm font-medium`}>2 Years</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    onPress={selectTargetDate}
                    style={tw`border border-gray-300 rounded-xl p-4 flex-row items-center justify-between`}
                  >
                    <Text style={tw`text-base text-gray-700`}>
                      {targetDate.toLocaleDateString()}
                    </Text>
                    <Ionicons name="calendar-outline" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Beautiful message for completed users */}
              {memorizeChoice === 'completed' && (
                <View style={tw`bg-green-50 rounded-xl p-6 mb-6 border border-green-200`}>
                  <View style={tw`items-center`}>
                    <Ionicons name="trophy" size={48} color="#059669" />
                    <Text style={tw`text-xl font-bold text-green-800 mt-3 text-center`}>
                      Masha'Allah! 🎉
                    </Text>
                    <Text style={tw`text-green-700 text-center mt-2 leading-6`}>
                      May Allah accept your efforts and grant you the highest ranks in Jannah. 
                      Your dedication to memorizing the Holy Quran is truly inspiring.
                    </Text>
                    <Text style={tw`text-green-600 text-center mt-3 font-medium`}>
                      "And We have indeed made the Quran easy to understand and remember" - Quran 54:17
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSetupSubmit}
                style={tw`bg-amber-600 py-4 rounded-xl mt-4`}
              >
                <Text style={tw`text-white font-semibold text-lg text-center`}>
                  Start Tracking
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
          <View style={tw`flex-1 p-6`}>
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <Text style={tw`text-2xl font-bold text-amber-900`}>Edit Details</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={tw`w-8 h-8 rounded-full items-center justify-center bg-gray-100`}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Choice Selection */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>
                  Update memorization status
                </Text>
                <View style={tw`flex-row`}>
                  {renderChoiceButton('want', 'Want to\nMemorize', 'heart-outline')}
                  {renderChoiceButton('memorizing', 'Currently\nMemorizing', 'book-outline')}
                  {renderChoiceButton('completed', 'Already\nCompleted', 'checkmark-circle-outline')}
                </View>
              </View>

              {/* Pages Already Memorized */}
              <View style={tw`mb-6`}>
                <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>
                  Total pages memorized
                </Text>
                <TextInput
                  style={tw`border border-gray-300 rounded-xl p-4 text-base`}
                  placeholder="Enter number of pages (0-604)"
                  value={alreadyMemorized}
                  onChangeText={setAlreadyMemorized}
                  keyboardType="numeric"
                />
              </View>

              {/* Target Date */}
              {memorizeChoice !== 'completed' && (
                <View style={tw`mb-6`}>
                  <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>
                    Target completion date
                  </Text>
                  
                  {/* Quick Preset Buttons */}
                  <View style={tw`flex-row flex-wrap gap-2 mb-3`}>
                    <TouchableOpacity
                      onPress={() => {
                        const newDate = new Date();
                        newDate.setMonth(newDate.getMonth() + 6);
                        setTargetDate(newDate);
                      }}
                      style={tw`bg-blue-100 px-3 py-2 rounded-lg`}
                    >
                      <Text style={tw`text-blue-800 text-sm font-medium`}>6 Months</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        const newDate = new Date();
                        newDate.setFullYear(newDate.getFullYear() + 1);
                        setTargetDate(newDate);
                      }}
                      style={tw`bg-purple-100 px-3 py-2 rounded-lg`}
                    >
                      <Text style={tw`text-purple-800 text-sm font-medium`}>1 Year</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => {
                        const newDate = new Date();
                        newDate.setFullYear(newDate.getFullYear() + 2);
                        setTargetDate(newDate);
                      }}
                      style={tw`bg-green-100 px-3 py-2 rounded-lg`}
                    >
                      <Text style={tw`text-green-800 text-sm font-medium`}>2 Years</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity
                    onPress={selectTargetDate}
                    style={tw`border border-gray-300 rounded-xl p-4 flex-row items-center justify-between`}
                  >
                    <Text style={tw`text-base text-gray-700`}>
                      {targetDate.toLocaleDateString()}
                    </Text>
                    <Ionicons name="calendar-outline" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={handleEditSubmit}
                style={tw`bg-amber-600 py-4 rounded-xl mt-4`}
              >
                <Text style={tw`text-white font-semibold text-lg text-center`}>
                  Update Details
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Today's Progress Modal */}
      <Modal
        visible={showTodayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          <View style={tw`flex-1 p-6`}>
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <Text style={tw`text-2xl font-bold text-amber-900`}>Today's Progress</Text>
              <TouchableOpacity
                onPress={() => setShowTodayModal(false)}
                style={tw`w-8 h-8 rounded-full items-center justify-center bg-gray-100`}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>
                How many pages did you memorize today?
              </Text>
              <TextInput
                style={tw`border border-gray-300 rounded-xl p-4 text-base`}
                placeholder="Enter pages (can be decimal like 0.5)"
                value={todayPages}
                onChangeText={setTodayPages}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              onPress={handleTodaySubmit}
              style={tw`bg-green-500 py-4 rounded-xl`}
            >
              <Text style={tw`text-white font-semibold text-lg text-center`}>
                Add Progress
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={targetDate}
          mode="date"
          is24Hour={true}
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
}
