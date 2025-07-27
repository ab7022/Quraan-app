import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { useSelector } from 'react-redux';
import analytics from '../services/analyticsService';

// Mapping of Surah number to starting page in Mushaf
const surahToPageMapping = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518,
  51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542, 59: 545, 60: 549,
  61: 551, 62: 553, 63: 554, 64: 556, 65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568,
  71: 570, 72: 572, 73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585,
  81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594,
  91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602, 109: 603, 110: 603,
  111: 603, 112: 604, 113: 604, 114: 604
};

// Surah names in Arabic and English
const surahNames = {
  1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa', 5: 'Al-Maidah', 6: 'Al-Anam',
  7: 'Al-Araf', 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus', 11: 'Hud', 12: 'Yusuf',
  13: 'Ar-Rad', 14: 'Ibrahim', 15: 'Al-Hijr', 16: 'An-Nahl', 17: 'Al-Isra', 18: 'Al-Kahf',
  19: 'Maryam', 20: 'Ta-Ha', 21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Muminun', 24: 'An-Nur',
  25: 'Al-Furqan', 26: 'Ash-Shuara', 27: 'An-Naml', 28: 'Al-Qasas', 29: 'Al-Ankabut', 30: 'Ar-Rum',
  31: 'Luqman', 32: 'As-Sajdah', 33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir', 36: 'Ya-Sin',
  37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir', 41: 'Fussilat', 42: 'Ash-Shura',
  43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jathiyah', 46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath',
  49: 'Al-Hujurat', 50: 'Qaf', 51: 'Adh-Dhariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar',
  55: 'Ar-Rahman', 56: 'Al-Waqiah', 57: 'Al-Hadid', 58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahanah',
  61: 'As-Saff', 62: 'Al-Jumuah', 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq', 66: 'At-Tahrim',
  67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqah', 70: 'Al-Maarij', 71: 'Nuh', 72: 'Al-Jinn',
  73: 'Al-Muzzammil', 74: 'Al-Muddaththir', 75: 'Al-Qiyamah', 76: 'Al-Insan', 77: 'Al-Mursalat', 78: 'An-Naba',
  79: 'An-Naziat', 80: 'Abasa', 81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq',
  85: 'Al-Buruj', 86: 'At-Tariq', 87: 'Al-Ala', 88: 'Al-Ghashiyah', 89: 'Al-Fajr', 90: 'Al-Balad',
  91: 'Ash-Shams', 92: 'Al-Layl', 93: 'Ad-Duha', 94: 'Ash-Sharh', 95: 'At-Tin', 96: 'Al-Alaq',
  97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: 'Al-Adiyat', 101: 'Al-Qariah', 102: 'At-Takathur',
  103: 'Al-Asr', 104: 'Al-Humazah', 105: 'Al-Fil', 106: 'Quraysh', 107: 'Al-Maun', 108: 'Al-Kawthar',
  109: 'Al-Kafirun', 110: 'An-Nasr', 111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas'
};

// Juz to page mapping
const juzToPageMapping = {
  1: 1, 2: 22, 3: 42, 4: 62, 5: 82, 6: 102, 7: 122, 8: 142, 9: 162, 10: 182,
  11: 202, 12: 222, 13: 242, 14: 262, 15: 282, 16: 302, 17: 322, 18: 342, 19: 362, 20: 382,
  21: 402, 22: 422, 23: 442, 24: 462, 25: 482, 26: 502, 27: 522, 28: 542, 29: 562, 30: 582
};

// Function to find which Surah a page belongs to
const getSurahForPage = (pageNumber) => {
  let currentSurah = 1;
  for (let surah = 1; surah <= 114; surah++) {
    if (surahToPageMapping[surah] <= pageNumber) {
      currentSurah = surah;
    } else {
      break;
    }
  }
  return {
    number: currentSurah,
    name: surahNames[currentSurah]
  };
};

// Function to find which Juz a page belongs to
const getJuzForPage = (pageNumber) => {
  let currentJuz = 1;
  for (let juz = 1; juz <= 30; juz++) {
    if (juzToPageMapping[juz] <= pageNumber) {
      currentJuz = juz;
    } else {
      break;
    }
  }
  return currentJuz;
};

const ContinueReading = ({ navigation }) => {
  const lastReadPage = useSelector(s => s.streak.lastReadPage);

  const handleContinueReading = () => {
    Alert.alert(
      'Continue Reading',
      `Do you want to continue reading ${lastReadPage.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => navigateToLastPage(),
        },
      ]
    );
  };

  const handleStartFresh = () => {
    Alert.alert(
      'Start Reading',
      'Where would you like to start your Quran journey?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'From Beginning',
          onPress: () => {
            // Track start fresh action
            analytics.trackUserAction('start_fresh', {
              starting_point: 'beginning',
              page: 1
            });
            
            analytics.trackNavigationEvent('StartFresh', 'QuranPageScreen', 'start_beginning');
            
            navigation.navigate('Quran', {
              screen: 'QuranPage',
              params: { initialPage: 1 }
            });
          },
        },
        {
          text: 'Browse Surahs',
          onPress: () => {
            // Track start fresh action
            analytics.trackUserAction('start_fresh', {
              starting_point: 'surahs_list'
            });
            
            analytics.trackNavigationEvent('StartFresh', 'SurahsScreen', 'browse_surahs');
            
            navigation.navigate('Quran', { 
              screen: 'QuranTabs', 
              params: { screen: 'SurahsList' } 
            });
          },
        },
      ]
    );
  };

  const navigateToLastPage = () => {
    // Track continue reading action
    analytics.trackUserAction('continue_reading', {
      last_read_type: lastReadPage.type,
      last_read_id: lastReadPage.id,
      last_read_page: lastReadPage.pageNumber,
      last_read_name: lastReadPage.name,
    });

    switch (lastReadPage.type) {
      case 'surah':
        // Navigate to the starting page of the surah
        const pageNumber = surahToPageMapping[lastReadPage.id] || 1;
        console.log('[CONTINUE READING] Navigating to Surah page:', pageNumber);
        
        analytics.trackNavigationEvent('ContinueReading', 'QuranPageScreen', 'continue_surah');
        
        navigation.navigate('Quran', {
          screen: 'QuranPage',
          params: { initialPage: pageNumber }
        });
        break;
      case 'juz':
        // For juz, navigate to the Juz tab first
        console.log('[CONTINUE READING] Navigating to Juz tab');
        
        analytics.trackNavigationEvent('ContinueReading', 'JuzScreen', 'continue_juz');
        
        navigation.navigate('Quran', { screen: 'QuranTabs', params: { screen: 'JuzList' } });
        break;
      case 'page':
        console.log('[CONTINUE READING] Navigating to specific page:', lastReadPage.pageNumber);
        
        analytics.trackNavigationEvent('ContinueReading', 'QuranPageScreen', 'continue_page');
        
        navigation.navigate('Quran', {
          screen: 'QuranPage',
          params: { initialPage: lastReadPage.pageNumber || 1 }
        });
        break;
      default:
        console.log('Unknown page type:', lastReadPage.type);
    }
  };

  const getTypeLabel = () => {
    switch (lastReadPage.type) {
      case 'surah':
        return 'Surah';
      case 'juz':
        return 'Juz';
      case 'page':
        return 'Page';
      default:
        return 'Reading';
    }
  };

  // Check if we have valid reading data
  const hasValidReadingData = lastReadPage && lastReadPage.name && lastReadPage.type;

  return (
    <View>
      <Text style={tw`text-xl font-bold text-gray-900 mb-4`}>
        {hasValidReadingData ? 'Continue Reading' : 'Start Your Journey'}
      </Text>
      
      {hasValidReadingData ? (
        // Show Continue Reading Card
        <TouchableOpacity
          onPress={handleContinueReading}
          style={tw`rounded-2xl shadow-lg overflow-hidden`}
          accessibilityLabel={`Continue reading ${lastReadPage.name}`}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#10B981', '#059669', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`p-4`}
          >
            <View style={tw`flex-row items-center justify-between`}>
              {/* Left Content */}
              <View style={tw`flex-1 mr-3`}>
                <View style={tw`flex-row items-center mb-2`}>
                  <View style={tw`w-8 h-8 bg-white/20 rounded-xl items-center justify-center mr-3`}>
                    <Ionicons name="book" size={16} color="white" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-bold text-base`} numberOfLines={1}>
                      {lastReadPage.name}
                    </Text>
                    <Text style={tw`text-white/80 text-xs`}>
                      {getTypeLabel()}
                    </Text>
                  </View>
                </View>
                
                {lastReadPage.pageNumber && (
                  <View style={tw`flex-row items-center flex-wrap`}>
                    <View style={tw`bg-white/15 rounded-lg px-2 py-1 mr-2 mb-1`}>
                      <Text style={tw`text-white text-xs font-medium`}>
                        Page {lastReadPage.pageNumber}
                      </Text>
                    </View>
                    {(() => {
                      const surahInfo = getSurahForPage(lastReadPage.pageNumber);
                      const juzNumber = getJuzForPage(lastReadPage.pageNumber);
                      return (
                        <>
                          <View style={tw`bg-white/15 rounded-lg px-2 py-1 mr-2 mb-1`}>
                            <Text style={tw`text-white text-xs font-medium`} numberOfLines={1}>
                              {surahInfo.name}
                            </Text>
                          </View>
                          <View style={tw`bg-white/15 rounded-lg px-2 py-1 mb-1`}>
                            <Text style={tw`text-white text-xs font-medium`}>
                              Juz {juzNumber}
                            </Text>
                          </View>
                        </>
                      );
                    })()}
                  </View>
                )}
              </View>
              
              {/* Right Action */}
              <View style={tw`w-12 h-12 bg-white/20 rounded-2xl items-center justify-center`}>
                <Ionicons name="play" size={18} color="white" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        // Show Start Fresh Card
        <TouchableOpacity
          onPress={handleStartFresh}
          style={tw`rounded-2xl shadow-lg overflow-hidden`}
          accessibilityLabel="Start reading the Quran"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`p-4`}
          >
            <View style={tw`flex-row items-center justify-between`}>
              {/* Left Content */}
              <View style={tw`flex-1 mr-3`}>
                <View style={tw`flex-row items-center mb-2`}>
                  <View style={tw`w-8 h-8 bg-white/20 rounded-xl items-center justify-center mr-3`}>
                    <Ionicons name="book-outline" size={16} color="white" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-bold text-base`}>
                      Start Reading Quran
                    </Text>
                    <Text style={tw`text-white/80 text-xs`}>
                      Begin your spiritual journey
                    </Text>
                  </View>
                </View>
                
                <View style={tw`flex-row items-center flex-wrap`}>
                  <View style={tw`bg-white/15 rounded-lg px-2 py-1 mr-2 mb-1`}>
                    <Text style={tw`text-white text-xs font-medium`}>
                      ✨ Fresh Start
                    </Text>
                  </View>
                
                  <View style={tw`bg-white/15 rounded-lg px-2 py-1 mb-1`}>
                    <Text style={tw`text-white text-xs font-medium`}>
                      🌙 Blessed Journey
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Right Action */}
              <View style={tw`w-12 h-12 bg-white/20 rounded-2xl items-center justify-center`}>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ContinueReading;
