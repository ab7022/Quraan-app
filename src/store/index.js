import { configureStore } from '@reduxjs/toolkit';
import streakReducer, { loadStreak } from './streakSlice';

const store = configureStore({
  reducer: {
    streak: streakReducer,
  },
});

// Load streak data when store is created
store.dispatch(loadStreak());

export default store;
