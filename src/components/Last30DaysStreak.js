import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useSelector } from 'react-redux';
import { getLast30DaysStreak } from '../store/streakSlice';

const Last30DaysStreak = () => {
  const { readingHistory, totalDaysRead, longestStreak } = useSelector(s => s.streak);
  
  const last30Days = getLast30DaysStreak(readingHistory);
  const last30DaysReadCount = last30Days.filter(day => day.hasRead).length;
  const readingPercentage = Math.round((last30DaysReadCount / 30) * 100);

  const getStreakColor = (hasRead, isToday) => {
    if (isToday && hasRead) return 'bg-green-500 border-green-600';
    if (isToday && !hasRead) return 'bg-gray-300 dark:bg-gray-600 border-green-500 border-2';
    if (hasRead) return 'bg-green-400';
    return 'bg-gray-200 dark:bg-gray-700 border-red-400 border-2'; // Added red border for missed days
  };

  const getTextColor = (hasRead, isToday) => {
    if (hasRead || isToday) return 'text-white';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <View style={tw`bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm`}>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-lg font-bold text-gray-800 dark:text-gray-200`}>
          Last 30 Days 📅
        </Text>
        <View style={tw`flex-row items-center`}>
          <Ionicons name="flame" size={16} color="#059669" />
          <Text style={tw`text-sm font-medium text-green-600 dark:text-green-400 ml-1`}>
            {readingPercentage}%
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={tw`flex-row justify-between mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-3`}>
        <View style={tw`items-center`}>
          <Text style={tw`text-2xl font-bold text-green-600 dark:text-green-400`}>
            {last30DaysReadCount}
          </Text>
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
            Days Read
          </Text>
        </View>
        <View style={tw`items-center`}>
          <Text style={tw`text-2xl font-bold text-blue-600 dark:text-blue-400`}>
            {totalDaysRead}
          </Text>
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
            Total Days
          </Text>
        </View>
        <View style={tw`items-center`}>
          <Text style={tw`text-2xl font-bold text-purple-600 dark:text-purple-400`}>
            {longestStreak}
          </Text>
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
            Best Streak
          </Text>
        </View>
      </View>

      {/* Calendar Grid - 4 rows layout */}
      <View style={tw`mb-4`}>
        {/* Row 1: Days 1-8 */}
        <View style={tw`flex-row justify-between mb-2`}>
          {last30Days.slice(0, 8).map((day, index) => (
            <View key={day.date} style={tw`items-center flex-1`}>
              <Text style={tw`text-xs text-gray-500 dark:text-gray-400 mb-1`}>
                {day.dayName}
              </Text>
              <View
                style={tw`w-7 h-7 rounded-full ${getStreakColor(day.hasRead, day.isToday)} 
                  items-center justify-center mb-1 shadow-sm`}
              >
                {day.hasRead ? (
                  <Ionicons name="checkmark" size={12} color="white" />
                ) : day.isToday ? (
                  <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
                ) : null}
              </View>
              <Text style={tw`text-xs ${getTextColor(day.hasRead, day.isToday)} font-medium`}>
                {day.dayNumber}
              </Text>
            </View>
          ))}
        </View>

        {/* Row 2: Days 9-16 */}
        <View style={tw`flex-row justify-between mb-2`}>
          {last30Days.slice(8, 16).map((day, index) => (
            <View key={day.date} style={tw`items-center flex-1`}>
              <View
                style={tw`w-7 h-7 rounded-full ${getStreakColor(day.hasRead, day.isToday)} 
                  items-center justify-center mb-1 shadow-sm`}
              >
                {day.hasRead ? (
                  <Ionicons name="checkmark" size={12} color="white" />
                ) : day.isToday ? (
                  <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
                ) : null}
              </View>
              <Text style={tw`text-xs ${getTextColor(day.hasRead, day.isToday)} font-medium`}>
                {day.dayNumber}
              </Text>
            </View>
          ))}
        </View>

        {/* Row 3: Days 17-24 */}
        <View style={tw`flex-row justify-between mb-2`}>
          {last30Days.slice(16, 24).map((day, index) => (
            <View key={day.date} style={tw`items-center flex-1`}>
              <View
                style={tw`w-7 h-7 rounded-full ${getStreakColor(day.hasRead, day.isToday)} 
                  items-center justify-center mb-1 shadow-sm`}
              >
                {day.hasRead ? (
                  <Ionicons name="checkmark" size={12} color="white" />
                ) : day.isToday ? (
                  <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
                ) : null}
              </View>
              <Text style={tw`text-xs ${getTextColor(day.hasRead, day.isToday)} font-medium`}>
                {day.dayNumber}
              </Text>
            </View>
          ))}
        </View>

        {/* Row 4: Days 25-30 */}
        <View style={tw`flex-row justify-center mb-2`}>
          {last30Days.slice(24, 30).map((day, index) => (
            <View key={day.date} style={tw`items-center mx-2`}>
              <View
                style={tw`w-7 h-7 rounded-full ${getStreakColor(day.hasRead, day.isToday)} 
                  items-center justify-center mb-1 shadow-sm`}
              >
                {day.hasRead ? (
                  <Ionicons name="checkmark" size={12} color="white" />
                ) : day.isToday ? (
                  <View style={tw`w-2 h-2 bg-green-500 rounded-full`} />
                ) : null}
              </View>
              <Text style={tw`text-xs ${getTextColor(day.hasRead, day.isToday)} font-medium`}>
                {day.dayNumber}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={tw`flex-row justify-center items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700`}>
        <View style={tw`flex-row items-center mr-4`}>
          <View style={tw`w-3 h-3 bg-green-400 rounded-full mr-1`} />
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>Read</Text>
        </View>
        <View style={tw`flex-row items-center mr-4`}>
          <View style={tw`w-3 h-3 bg-gray-200 dark:bg-gray-700 border-2 border-red-400 rounded-full mr-1`} />
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>Missed</Text>
        </View>
        <View style={tw`flex-row items-center`}>
          <View style={tw`w-3 h-3 bg-gray-300 dark:bg-gray-600 border-2 border-green-500 rounded-full mr-1`} />
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>Today</Text>
        </View>
      </View>
    </View>
  );
};

export default Last30DaysStreak;
