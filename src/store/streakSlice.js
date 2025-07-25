import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, isToday, parseISO } from 'date-fns';
import * as Contacts from 'expo-contacts';

const initialState = {
  streak: 0,
  lastRead: null,
  contacts: [],
  contactsLoaded: false,
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
    resetStreak: (state) => {
      state.streak = 1;
      state.lastRead = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];
      state.readingHistory = { ...state.readingHistory, [today]: true };
    },
    setContacts: (state, action) => {
      state.contacts = action.payload;
      state.contactsLoaded = true;
    },
    updateContactStreak: (state, action) => {
      const { contactId, streak, lastRead, totalDays, isActive } = action.payload;
      const contactIndex = state.contacts.findIndex(c => c.id === contactId);
      if (contactIndex !== -1) {
        state.contacts[contactIndex] = {
          ...state.contacts[contactIndex],
          streak,
          lastRead,
          totalDays,
          isActive
        };
      }
    },
    setLastReadPage: (state, action) => {
      state.lastReadPage = action.payload;
    },
  },
});

export const { setStreak, incrementStreak, resetStreak, setContacts, updateContactStreak, setLastReadPage } = streakSlice.actions;

export const loadStreak = () => async (dispatch) => {
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
      lastReadPage = JSON.parse(lastPageData);
    }
    
    if (historyData) {
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
    } else {
      // Generate some sample reading history for demo
      const today = new Date();
      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // More realistic reading pattern:
        // - Higher chance of reading in recent days
        // - Weekend patterns (slightly different)
        // - Simulate streak patterns
        let readChance = 0.7; // Base 70% chance
        
        if (i < 7) readChance = 0.85; // Recent week - higher consistency
        else if (i < 30) readChance = 0.75; // Last month - good consistency
        else readChance = 0.6; // Older data - lower consistency
        
        // Weekend adjustment (Saturday = 6, Sunday = 0)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          readChance += 0.1; // Slightly higher on weekends
        }
        
        if (Math.random() < readChance) {
          readingHistory[dateStr] = true;
          totalDaysRead++;
        }
      }
      await AsyncStorage.setItem('quran_reading_history', JSON.stringify(readingHistory));
    }
    
    if (data) {
      const { streak, lastRead } = JSON.parse(data);
      // Check if lastRead is yesterday or today
      const lastDate = parseISO(lastRead);
      if (isToday(lastDate)) {
        dispatch(setStreak({ 
          streak, 
          lastRead, 
          readingHistory, 
          totalDaysRead, 
          longestStreak,
          lastReadPage
        }));
      } else {
        const days = differenceInDays(new Date(), lastDate);
        if (days === 1) {
          dispatch(setStreak({ 
            streak, 
            lastRead, 
            readingHistory, 
            totalDaysRead, 
            longestStreak,
            lastReadPage
          }));
        } else {
          dispatch(resetStreak());
          // Keep last read page even if streak resets
          if (lastReadPage) {
            dispatch(setLastReadPage(lastReadPage));
          }
        }
      }
    } else {
      dispatch(resetStreak());
      // If no streak data but we have last read page, keep it
      if (lastReadPage) {
        dispatch(setLastReadPage(lastReadPage));
      } else {
        // Set demo last read page for demonstration
        const demoLastPage = {
          type: 'surah',
          id: 18,
          name: 'Al-Kahf',
          lastReadAt: new Date().toISOString()
        };
        await AsyncStorage.setItem('quran_last_page', JSON.stringify(demoLastPage));
        dispatch(setLastReadPage(demoLastPage));
      }
    }
  } catch (e) {
    dispatch(resetStreak());
  }
};

export const updateStreak = () => async (dispatch, getState) => {
  try {
    const { streak, lastRead, readingHistory } = getState().streak;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
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
      // Update reading history
      const updatedHistory = { ...readingHistory, [todayStr]: true };
      const totalDaysRead = Object.values(updatedHistory).filter(Boolean).length;
      
      await AsyncStorage.setItem(
        'quran_streak',
        JSON.stringify({ streak: nextStreak, lastRead: now.toISOString() })
      );
      await AsyncStorage.setItem(
        'quran_reading_history',
        JSON.stringify(updatedHistory)
      );
      
      dispatch(incrementStreak({ 
        streak: nextStreak, 
        lastRead: now.toISOString(),
        readingHistory: updatedHistory,
        totalDaysRead
      }));
    }
  } catch (e) {
    dispatch(resetStreak());
  }
};

// Load contacts and generate realistic streak data
export const loadContacts = () => async (dispatch) => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });
      
      // Filter contacts that have names and phone numbers
      const validContacts = data
        .filter(contact => contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0)
        .slice(0, 15) // Limit to 15 contacts for better performance
        .map(contact => {
          // Generate realistic streak data
          const baseStreak = Math.floor(Math.random() * 30) + 1;
          const totalDays = baseStreak + Math.floor(Math.random() * 50);
          const isActive = Math.random() > 0.3; // 70% chance of being active
          const lastReadDays = isActive ? 0 : Math.floor(Math.random() * 3) + 1;
          const lastRead = new Date();
          lastRead.setDate(lastRead.getDate() - lastReadDays);
          
          return {
            id: contact.id,
            name: contact.name,
            phoneNumber: contact.phoneNumbers[0]?.number || '',
            streak: baseStreak,
            totalDays,
            isActive,
            lastRead: lastRead.toISOString(),
          };
        });
      
      // Save contacts to AsyncStorage
      await AsyncStorage.setItem('quran_contacts', JSON.stringify(validContacts));
      dispatch(setContacts(validContacts));
    } else {
      // If permission denied, load demo contacts
      dispatch(loadDemoContacts());
    }
  } catch (error) {
    console.log('Error loading contacts:', error);
    // Load demo contacts as fallback
    dispatch(loadDemoContacts());
  }
};

// Load demo contacts if real contacts are not available
export const loadDemoContacts = () => async (dispatch) => {
  const demoContacts = [
    {
      id: 'demo1',
      name: 'Ahmed Hassan',
      phoneNumber: '+1234567890',
      streak: 25,
      totalDays: 45,
      isActive: true,
      lastRead: new Date().toISOString(),
    },
    {
      id: 'demo2',
      name: 'Fatima Ali',
      phoneNumber: '+1234567891',
      streak: 18,
      totalDays: 32,
      isActive: true,
      lastRead: new Date().toISOString(),
    },
    {
      id: 'demo3',
      name: 'Omar Khan',
      phoneNumber: '+1234567892',
      streak: 12,
      totalDays: 28,
      isActive: false,
      lastRead: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo4',
      name: 'Aisha Rahman',
      phoneNumber: '+1234567893',
      streak: 8,
      totalDays: 15,
      isActive: true,
      lastRead: new Date().toISOString(),
    },
    {
      id: 'demo5',
      name: 'Yusuf Ibrahim',
      phoneNumber: '+1234567894',
      streak: 6,
      totalDays: 12,
      isActive: true,
      lastRead: new Date().toISOString(),
    },
    {
      id: 'demo6',
      name: 'Mariam Abdel',
      phoneNumber: '+1234567895',
      streak: 15,
      totalDays: 22,
      isActive: false,
      lastRead: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo7',
      name: 'Hassan Malik',
      phoneNumber: '+1234567896',
      streak: 4,
      totalDays: 9,
      isActive: true,
      lastRead: new Date().toISOString(),
    },
    {
      id: 'demo8',
      name: 'Layla Nasser',
      phoneNumber: '+1234567897',
      streak: 22,
      totalDays: 38,
      isActive: true,
      lastRead: new Date().toISOString(),
    },
  ];
  
  await AsyncStorage.setItem('quran_contacts', JSON.stringify(demoContacts));
  dispatch(setContacts(demoContacts));
};

// Load saved contacts from storage
export const loadSavedContacts = () => async (dispatch) => {
  try {
    const savedContacts = await AsyncStorage.getItem('quran_contacts');
    if (savedContacts) {
      const contacts = JSON.parse(savedContacts);
      // Update activity status based on last read time
      const updatedContacts = contacts.map(contact => {
        const lastRead = parseISO(contact.lastRead);
        const daysSince = differenceInDays(new Date(), lastRead);
        return {
          ...contact,
          isActive: daysSince === 0,
        };
      });
      dispatch(setContacts(updatedContacts));
    } else {
      // No saved contacts, try to load from device
      dispatch(loadContacts());
    }
  } catch (error) {
    console.log('Error loading saved contacts:', error);
    dispatch(loadDemoContacts());
  }
};

// Get streak data for the last 30 days
export const getLast30DaysStreak = (readingHistory) => {
  const last30Days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
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
export const saveLastReadPage = (pageInfo) => async (dispatch) => {
  try {
    await AsyncStorage.setItem('quran_last_page', JSON.stringify(pageInfo));
    dispatch(setLastReadPage(pageInfo));
  } catch (error) {
    console.log('Error saving last read page:', error);
  }
};

export default streakSlice.reducer;
