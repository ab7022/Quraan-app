import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import tw from 'twrnc';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { useSelector } from 'react-redux';

const StreakCalendar = () => {
  const {
    readingHistory = {},
    streak = 0,
    totalDaysRead = 0,
    longestStreak = 0,
  } = useSelector(s => s.streak);

  // Don't render if reading history is still loading
  if (!readingHistory || typeof readingHistory !== 'object') {
    return (
      <View
        style={tw`bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 items-center justify-center h-48`}
      >
        <Text style={tw`text-gray-500 dark:text-gray-400`}>
          Loading reading history...
        </Text>
      </View>
    );
  }

  // Generate grid for the past year (52 weeks)
  const generateCalendarGrid = () => {
    const weeks = [];
    const today = new Date();
    const startDate = startOfWeek(addDays(today, -364)); // Start from 52 weeks ago

    for (let week = 0; week < 52; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = addDays(startDate, week * 7 + day);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const hasRead = Boolean(readingHistory && readingHistory[dateStr]);
        const isCurrentDay = isToday(currentDate);
        const isFutureDate = currentDate > today;

        weekDays.push({
          date: currentDate,
          dateStr,
          hasRead,
          isCurrentDay,
          isFutureDate,
        });
      }
      weeks.push(weekDays);
    }

    return weeks;
  };

  const getSquareColor = day => {
    if (day.isFutureDate) {
      return 'bg-gray-100 dark:bg-gray-800'; // Future dates
    }
    if (day.isCurrentDay) {
      return day.hasRead
        ? 'bg-green-600 border-2 border-green-800'
        : 'bg-gray-300 dark:bg-gray-600 border-2 border-gray-500';
    }
    if (day.hasRead) {
      return 'bg-green-500 dark:bg-green-600'; // Read days
    }
    return 'bg-gray-200 dark:bg-gray-700'; // Missed days
  };

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  let weeks = [];
  try {
    weeks = generateCalendarGrid();
  } catch (error) {
    console.error('Error generating calendar grid:', error);
    weeks = [];
  }

  return (
    <View style={tw`bg-white dark:bg-gray-800 rounded-xl p-4 mb-4`}>
      <Text style={tw`text-lg font-bold text-gray-800 dark:text-gray-200 mb-3`}>
        Reading Activity
      </Text>

      {/* Month labels */}
      <View style={tw`flex-row justify-between mb-2 px-1`}>
        {months.map((month, index) => (
          <Text
            key={month}
            style={tw`text-xs text-gray-500 dark:text-gray-400`}
          >
            {index % 3 === 0 ? month : ''}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={tw`flex-row`}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={tw`mr-1`}>
              {week.map((day, dayIndex) => (
                <View
                  key={`${weekIndex}-${dayIndex}`}
                  style={[tw`w-3 h-3 rounded-sm mb-1 ${getSquareColor(day)}`]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={tw`flex-row items-center justify-between mt-3`}>
        <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>Less</Text>
        <View style={tw`flex-row items-center`}>
          <View
            style={tw`w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm mr-1`}
          />
          <View style={tw`w-3 h-3 bg-green-300 rounded-sm mr-1`} />
          <View style={tw`w-3 h-3 bg-green-500 rounded-sm mr-1`} />
          <View style={tw`w-3 h-3 bg-green-600 rounded-sm`} />
        </View>
        <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>More</Text>
      </View>

      {/* Stats */}
      <View
        style={tw`flex-row justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600`}
      >
        <View style={tw`items-center`}>
          <Text
            style={tw`text-lg font-bold text-green-600 dark:text-green-400`}
          >
            {streak}
          </Text>
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
            Current Streak
          </Text>
        </View>
        <View style={tw`items-center`}>
          <Text style={tw`text-lg font-bold text-blue-600 dark:text-blue-400`}>
            {Object.values(readingHistory).filter(Boolean).length}
          </Text>
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
            Total Days
          </Text>
        </View>
        <View style={tw`items-center`}>
          <Text
            style={tw`text-lg font-bold text-purple-600 dark:text-purple-400`}
          >
            {Math.round(
              (Object.values(readingHistory).filter(Boolean).length / 365) * 100
            )}
            %
          </Text>
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
            This Year
          </Text>
        </View>
      </View>
    </View>
  );
};

export default StreakCalendar;
