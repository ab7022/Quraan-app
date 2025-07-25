import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, isToday, parseISO } from 'date-fns';

const initialState = {
  streak: 0,
  lastRead: null,
};

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    setStreak: (state, action) => {
      state.streak = action.payload.streak;
      state.lastRead = action.payload.lastRead;
    },
    incrementStreak: (state, action) => {
      state.streak = action.payload.streak;
      state.lastRead = action.payload.lastRead;
    },
    resetStreak: (state) => {
      state.streak = 1;
      state.lastRead = new Date().toISOString();
    },
  },
});

export const { setStreak, incrementStreak, resetStreak } = streakSlice.actions;

export const loadStreak = () => async (dispatch) => {
  try {
    const data = await AsyncStorage.getItem('quran_streak');
    if (data) {
      const { streak, lastRead } = JSON.parse(data);
      // Check if lastRead is yesterday or today
      const lastDate = parseISO(lastRead);
      if (isToday(lastDate)) {
        dispatch(setStreak({ streak, lastRead }));
      } else {
        const days = differenceInDays(new Date(), lastDate);
        if (days === 1) {
          dispatch(setStreak({ streak, lastRead }));
        } else {
          dispatch(resetStreak());
        }
      }
    } else {
      dispatch(resetStreak());
    }
  } catch (e) {
    dispatch(resetStreak());
  }
};

export const updateStreak = () => async (dispatch, getState) => {
  try {
    const { streak, lastRead } = getState().streak;
    const now = new Date();
    let nextStreak = streak;
    let update = false;
    if (!lastRead) {
      nextStreak = 1;
      update = true;
    } else {
      const lastDate = parseISO(lastRead);
      if (!isToday(lastDate)) {
        const days = differenceInDays(now, lastDate);
        if (days === 1) {
          nextStreak = streak + 1;
          update = true;
        } else {
          nextStreak = 1;
          update = true;
        }
      }
    }
    if (update) {
      await AsyncStorage.setItem(
        'quran_streak',
        JSON.stringify({ streak: nextStreak, lastRead: now.toISOString() })
      );
      dispatch(incrementStreak({ streak: nextStreak, lastRead: now.toISOString() }));
    }
  } catch (e) {
    dispatch(resetStreak());
  }
};

export default streakSlice.reducer;
