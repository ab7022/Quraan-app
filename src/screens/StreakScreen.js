import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useSelector, useDispatch } from 'react-redux';
import { loadStreak, getLast7DaysStreak, getLast30DaysStreak } from '../store/streakSlice';
import analytics from '../services/analyticsService';

const SectionHeader = ({ title }) => (
  <View style={tw`px-4 py-3 bg-gray-100`}>
    <Text style={tw`text-sm font-medium text-gray-500 uppercase tracking-wide`}>
      {title}
    </Text>
  </View>
);

const StreakStatItem = ({ icon, title, value, subtitle, color = "#007AFF" }) => (
  <View style={tw`bg-white px-4 py-4 border-b border-gray-200`}>
    <View style={tw`flex-row items-center`}>
      <View style={[tw`w-10 h-10 rounded-full items-center justify-center mr-3`, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-base font-medium text-black mb-1`}>
          {title}
        </Text>
        <View style={tw`flex-row items-baseline`}>
          <Text style={tw`text-2xl font-bold text-black mr-2`}>
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
  </View>
);

const DayCircle = ({ day, isActive, isToday }) => (
  <View style={tw`items-center mx-1`}>
    <View
      style={[
        tw`w-10 h-10 rounded-full items-center justify-center mb-2`,
        isActive
          ? tw`bg-green-500`
          : isToday
            ? tw`border-2 border-green-500 bg-white`
            : tw`bg-gray-200`,
      ]}
    >
      {isActive ? (
        <Ionicons name="checkmark" size={18} color="white" />
      ) : (
        <Text style={[
          tw`text-sm font-medium`,
          isToday ? tw`text-green-500` : tw`text-gray-400`
        ]}>
          {day.dayNumber}
        </Text>
      )}
    </View>
    <Text style={[
      tw`text-xs font-medium`,
      isActive
        ? tw`text-green-500`
        : isToday
          ? tw`text-green-500`
          : tw`text-gray-400`
    ]}>
      {day.dayName}
    </Text>
  </View>
);

const CalendarGrid = ({ days }) => (
  <View style={tw`bg-white px-4 py-4`}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={tw`flex-row`}>
        {days.map((day, index) => (
          <DayCircle
            key={day.date}
            day={day}
            isActive={day.hasRead}
            isToday={day.isToday}
          />
        ))}
      </View>
    </ScrollView>
  </View>
);

export default function StreakScreen({ navigation }) {
  const { streak, readingHistory, totalDaysRead, longestStreak } = useSelector(s => s.streak);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('[STREAK SCREEN] Component mounted, current streak:', streak);

    // Track screen view with streak data
    analytics.trackScreenView('StreakScreen', {
      current_streak: streak,
      total_days_read: totalDaysRead,
      longest_streak: longestStreak,
    });

    dispatch(loadStreak());
  }, [dispatch]);

  const handleBackPress = () => {
    console.log('[STREAK SCREEN] Back button pressed');
    navigation.goBack?.();
  };

  const last7Days = getLast7DaysStreak(readingHistory);
  const last30Days = getLast30DaysStreak(readingHistory);

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
      <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />
      
      {/* iOS-Style Navigation Header */}
      <View style={tw`bg-gray-100 border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between px-4 py-3`}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={tw`flex-row items-center py-1`}
            activeOpacity={0.3}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
            <Text style={tw`text-lg text-blue-500 ml-1 font-normal`}>Back</Text>
          </TouchableOpacity>

          <Text style={tw`text-lg font-semibold text-black`}>
            Reading Streak
          </Text>

          <View style={tw`w-16`} />
        </View>
      </View>

      <ScrollView 
        style={tw`flex-1`} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-6`}
      >
        {/* Current Streak Section */}
        <View style={tw`mt-6`}>
          <SectionHeader title="Current Progress" />
          <View style={tw`bg-white`}>
            <View style={tw`px-4 py-6 items-center border-b border-gray-200`}>
              <View style={tw`w-24 h-24 rounded-full bg-orange-100 items-center justify-center mb-4`}>
                <Ionicons name="flame" size={48} color="#FF8C00" />
              </View>
              <Text style={tw`text-3xl font-bold text-black mb-2`}>
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </Text>
              <Text style={tw`text-base text-gray-500 text-center`}>
                Keep reading daily to maintain your streak
              </Text>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Statistics" />
          <View style={tw`bg-white`}>
            <StreakStatItem
              icon="calendar"
              title="Total Days Read"
              value={totalDaysRead}
              subtitle="days"
              color="#007AFF"
            />
            <StreakStatItem
              icon="trophy"
              title="Longest Streak"
              value={longestStreak}
              subtitle={longestStreak === 1 ? 'day' : 'days'}
              color="#FF8C00"
            />
            <StreakStatItem
              icon="trending-up"
              title="This Week"
              value={last7Days.filter(day => day.hasRead).length}
              subtitle="of 7 days"
              color="#34C759"
            />
          </View>
        </View>

        {/* Last 7 Days Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Last 7 Days" />
          <CalendarGrid days={last7Days} />
        </View>

        {/* Monthly Progress Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="This Month" />
          <View style={tw`bg-white px-4 py-4`}>
            <View style={tw`flex-row flex-wrap justify-center`}>
              {last30Days.map((day, index) => (
                <View
                  key={day.date}
                  style={[
                    tw`w-8 h-8 rounded-lg items-center justify-center m-1`,
                    day.hasRead
                      ? tw`bg-green-500`
                      : day.isToday
                        ? tw`border-2 border-green-500 bg-white`
                        : tw`bg-gray-100`,
                  ]}
                >
                  {day.hasRead ? (
                    <Ionicons name="checkmark" size={14} color="white" />
                  ) : (
                    <Text style={[
                      tw`text-xs font-medium`,
                      day.isToday ? tw`text-green-500` : tw`text-gray-400`
                    ]}>
                      {day.dayNumber}
                    </Text>
                  )}
                </View>
              ))}
            </View>
            <View style={tw`mt-4 pt-4 border-t border-gray-200`}>
              <Text style={tw`text-sm text-gray-500 text-center`}>
                {last30Days.filter(day => day.hasRead).length} of {last30Days.length} days completed this month
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={tw`mt-8 mb-20`}>
          <SectionHeader title="How Streaks Work" />
          <View style={tw`bg-white px-4 py-4`}>
            <View style={tw`flex-row items-start mb-3`}>
              <View style={tw`w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-3 mt-0.5`}>
                <Ionicons name="book" size={14} color="#34C759" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-black mb-1`}>
                  Daily Reading
                </Text>
                <Text style={tw`text-sm text-gray-500 leading-5`}>
                  Read any Surah or Juz to count for the day
                </Text>
              </View>
            </View>
            
            <View style={tw`flex-row items-start mb-3`}>
              <View style={tw`w-6 h-6 rounded-full bg-orange-100 items-center justify-center mr-3 mt-0.5`}>
                <Ionicons name="flame" size={14} color="#FF8C00" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-black mb-1`}>
                  Streak Building
                </Text>
                <Text style={tw`text-sm text-gray-500 leading-5`}>
                  Consecutive days of reading build your streak
                </Text>
              </View>
            </View>
            
            <View style={tw`flex-row items-start`}>
              <View style={tw`w-6 h-6 rounded-full bg-red-100 items-center justify-center mr-3 mt-0.5`}>
                <Ionicons name="refresh" size={14} color="#FF3B30" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-black mb-1`}>
                  Streak Reset
                </Text>
                <Text style={tw`text-sm text-gray-500 leading-5`}>
                  Missing a day resets your streak, but you can start again
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
