import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, isToday, parseISO } from 'date-fns';

const initialState = {
  streak: 0,
  lastRead: null,
  readingHistory: {},
  totalDaysRead: 0,
  longestStreak: 0,
  lastReadPage: null, // { type: 'surah'|'juz'|'page', id: number, name: string, pageNumber?: number }
};

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    setStreak: (state, action) => {
      state.streak = action.payload.streak;
      state.lastRead = action.payload.lastRead;
      if (action.payload.readingHistory) {
        state.readingHistory = action.payload.readingHistory;
      }
      if (action.payload.totalDaysRead !== undefined) {
        state.totalDaysRead = action.payload.totalDaysRead;
      }
      if (action.payload.longestStreak !== undefined) {
        state.longestStreak = action.payload.longestStreak;
      }
      if (action.payload.lastReadPage) {
        state.lastReadPage = action.payload.lastReadPage;
      }
    },
    incrementStreak: (state, action) => {
      state.streak = action.payload.streak;
      state.lastRead = action.payload.lastRead;
      if (action.payload.readingHistory) {
        state.readingHistory = action.payload.readingHistory;
      }
      if (action.payload.totalDaysRead !== undefined) {
        state.totalDaysRead = action.payload.totalDaysRead;
      }
      if (action.payload.longestStreak !== undefined) {
        state.longestStreak = action.payload.longestStreak;
      }
      if (action.payload.lastReadPage) {
        state.lastReadPage = action.payload.lastReadPage;
      }
    },
    resetStreak: state => {
      state.streak = 1;
      state.lastRead = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];
      state.readingHistory = { ...state.readingHistory, [today]: true };
    },
    setLastReadPage: (state, action) => {
      state.lastReadPage = action.payload;
    },
  },
});

export const { setStreak, incrementStreak, resetStreak, setLastReadPage } =
  streakSlice.actions;

export const loadStreak = () => async dispatch => {
  try {
    const data = await AsyncStorage.getItem('quran_streak');
    const historyData = await AsyncStorage.getItem('quran_reading_history');
    const lastPageData = await AsyncStorage.getItem('quran_last_page');

    let readingHistory = {};
    let totalDaysRead = 0;
    let longestStreak = 0;
    let lastReadPage = null;

    // Load last read page
    if (lastPageData) {
      console.log('Loaded last read page:', lastPageData);
      lastReadPage = JSON.parse(lastPageData);
    }

    if (historyData) {
      console.log('Loaded reading history:', historyData);
      console.log('data', data);
      readingHistory = JSON.parse(historyData);
      totalDaysRead = Object.values(readingHistory).filter(Boolean).length;

      // Calculate longest streak from history
      const sortedDates = Object.keys(readingHistory)
        .filter(date => readingHistory[date])
        .sort();

      let currentStreak = 0;
      let maxStreak = 0;
      let lastDate = null;

      for (const dateStr of sortedDates) {
        const currentDate = new Date(dateStr);
        if (lastDate && differenceInDays(currentDate, lastDate) === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        maxStreak = Math.max(maxStreak, currentStreak);
        lastDate = currentDate;
      }
      longestStreak = maxStreak;
    }

    // Use local timezone instead of UTC to fix timezone issues
    //increase day by 1
    const now = new Date();

    const todayStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0');

    let updatedHistory = { ...readingHistory };
    let currentStreak = 0;
    let shouldUpdate = false;

    if (data) {
      const { streak, lastRead } = JSON.parse(data);
      const lastDate = parseISO(lastRead);

      // Check if we have today in reading history but lastRead is outdated
      const hasToday = updatedHistory[todayStr];
      const lastReadIsToday = isToday(lastDate);

      if (lastReadIsToday) {
        // Already visited today, but let's recalculate streak from history to be safe

        // Recalculate current streak from reading history
        const sortedDates = Object.keys(updatedHistory)
          .filter(date => updatedHistory[date])
          .sort()
          .reverse(); // Start from most recent

        let recalculatedStreak = 0;
        const today = new Date();

        for (let i = 0; i < sortedDates.length; i++) {
          const checkDate = new Date(sortedDates[i] + 'T00:00:00');
          const daysDiff = Math.floor(
            (today - checkDate) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === i) {
            // Consecutive day
            recalculatedStreak++;
          } else {
            // Gap found, stop counting
            break;
          }
        }

        currentStreak = Math.max(recalculatedStreak, 1); // At least 1 if we have today
        updatedHistory[todayStr] = true;

        // Force update if the recalculated streak is different
        if (currentStreak !== streak) {
          console.log(
            '📊 Streak mismatch! Stored:',
            streak,
            'Calculated:',
            currentStreak
          );
          shouldUpdate = true;
        }
      } else if (hasToday && !lastReadIsToday) {
        // Special case: We have today's reading but lastRead is old

        // Calculate how many consecutive days we have
        const sortedDates = Object.keys(updatedHistory)
          .filter(date => updatedHistory[date])
          .sort();

        let consecutiveDays = 0;
        const today = new Date();

        // Count backwards from today
        for (let i = 0; i < 30; i++) {
          // Check last 10 days (reasonable streak limit)
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const checkDateStr =
            checkDate.getFullYear() +
            '-' +
            String(checkDate.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(checkDate.getDate()).padStart(2, '0');

          console.log(
            `Day ${i}: Checking ${checkDateStr} = ${
              updatedHistory[checkDateStr] ? 'READ' : 'NOT READ'
            }`
          );

          if (updatedHistory[checkDateStr]) {
            consecutiveDays++;
          } else {
            console.log(
              `📍 Streak breaks at day ${i}, found ${consecutiveDays} consecutive days`
            );
            break;
          }
        }

        console.log('📈 Found consecutive days:', consecutiveDays);
        currentStreak = consecutiveDays;
        shouldUpdate = true;
      } else {
        const days = differenceInDays(now, lastDate);

        // Also get yesterday in local timezone for comparison
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr =
          yesterday.getFullYear() +
          '-' +
          String(yesterday.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(yesterday.getDate()).padStart(2, '0');

        console.log(
          'Days difference:',
          days,
          'Last date:',
          lastRead,
          'Today:',
          now.toString()
        );
        console.log('Yesterday should be (local):', yesterdayStr);
        console.log(
          'Yesterday should be (UTC):',
          lastDate.toISOString().split('T')[0]
        );
        console.log('Today should be (local):', todayStr);

        if (days === 1) {
          // Yesterday was last visit - increment streak
          console.log('🎯 Consecutive day detected! Yesterday:', yesterdayStr);
          updatedHistory[yesterdayStr] = true; // Ensure yesterday is marked with local date
          currentStreak = streak + 1;
          console.log('📈 Incrementing streak:', streak, '→', currentStreak);
          shouldUpdate = true;
        } else if (days > 1) {
          // Streak broken - start new streak
          console.log('💔 Streak broken, gap of', days, 'days');
          currentStreak = 1;
          shouldUpdate = true;
        } else {
          // This shouldn't happen, but keep current streak as fallback
          console.log('⚠️ Unexpected case: days =', days);
          currentStreak = streak;
        }
        updatedHistory[todayStr] = true; // ALWAYS mark today as read (local date)
        console.log('✅ Marking today as read:', todayStr);
        shouldUpdate = true; // ALWAYS update when opening on new day
      }
    } else {
      // First time opening app
      currentStreak = 1;
      updatedHistory[todayStr] = true;
      shouldUpdate = true;
    }

    // Update longest streak
    const newLongestStreak = Math.max(longestStreak, currentStreak);
    const newTotalDaysRead =
      Object.values(updatedHistory).filter(Boolean).length;

    // Save updated data - always save when shouldUpdate is true
    if (shouldUpdate || !data) {
      console.log('💾 [SAVE] Updating storage...');
      console.log('Final streak to save:', currentStreak);
      console.log('Final history to save:', updatedHistory);
      console.log('Should update?', shouldUpdate, 'Has data?', !!data);
      console.log('-------------------------------------------------');
      await AsyncStorage.setItem(
        'quran_streak',
        JSON.stringify({ streak: currentStreak, lastRead: now.toISOString() })
      );
      await AsyncStorage.setItem(
        'quran_reading_history',
        JSON.stringify(updatedHistory)
      );
      console.log(
        'Saved streak:',
        currentStreak,
        'Last read:',
        now.toISOString()
      );
      console.log(
        'Saved history:',
        Object.keys(updatedHistory).filter(k => updatedHistory[k])
      );
    } else {
      console.log(
        '❌ [SAVE] Skipping save - shouldUpdate:',
        shouldUpdate,
        'data exists:',
        !!data
      );
    }

    dispatch(
      setStreak({
        streak: currentStreak,
        lastRead: shouldUpdate
          ? now.toISOString()
          : data
            ? JSON.parse(data).lastRead
            : now.toISOString(),
        readingHistory: updatedHistory,
        totalDaysRead: newTotalDaysRead,
        longestStreak: newLongestStreak,
        lastReadPage,
      })
    );
  } catch (e) {
    dispatch(resetStreak());
  }
};

export const updateStreak = () => async (dispatch, getState) => {
  try {
    // Since we now update streak on app open, this function can be simplified
    // or used for specific reading actions if needed
    const { streak, lastRead, readingHistory } = getState().streak;
    const now = new Date();

    // Use local timezone for today's date
    const todayStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0');

    console.log('Updating streak for today (local):', todayStr);
    // Just mark today as read and save
    const updatedHistory = { ...readingHistory, [todayStr]: true };
    const totalDaysRead = Object.values(updatedHistory).filter(Boolean).length;

    await AsyncStorage.setItem(
      'quran_reading_history',
      JSON.stringify(updatedHistory)
    );

    dispatch(
      incrementStreak({
        streak,
        lastRead,
        readingHistory: updatedHistory,
        totalDaysRead,
      })
    );
  } catch (e) {
    dispatch(resetStreak());
  }
};

// Get streak data for the last 7 days (including today)
export const getLast7DaysStreak = readingHistory => {
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Use local timezone for date string
    const dateStr =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const hasRead = Boolean(readingHistory && readingHistory[dateStr]);
    const isToday = i === 0;

    last7Days.push({
      date: dateStr,
      dayName,
      dayNumber,
      hasRead,
      isToday,
    });
  }

  return last7Days;
};

// Get streak data for the last 30 days
export const getLast30DaysStreak = readingHistory => {
  const last30Days = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Use local timezone for date string
    const dateStr =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const hasRead = Boolean(readingHistory && readingHistory[dateStr]);

    last30Days.push({
      date: dateStr,
      dayName,
      dayNumber,
      hasRead,
      isToday: i === 0,
    });
  }

  return last30Days;
};

// Save the last read page
export const saveLastReadPage = pageInfo => async dispatch => {
  try {
    await AsyncStorage.setItem('quran_last_page', JSON.stringify(pageInfo));
    dispatch(setLastReadPage(pageInfo));
  } catch (error) {
    console.log('Error saving last read page:', error);
  }
};

export default streakSlice.reducer;
