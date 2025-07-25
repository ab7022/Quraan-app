import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useSelector } from 'react-redux';

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

const ContinueReading = ({ navigation }) => {
  const lastReadPage = useSelector(s => s.streak.lastReadPage);

  if (!lastReadPage) return null;

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

  const navigateToLastPage = () => {
    switch (lastReadPage.type) {
      case 'surah':
        // Navigate to the starting page of the surah
        const pageNumber = surahToPageMapping[lastReadPage.id] || 1;
        navigation.navigate('Quran', {
          initialPage: pageNumber
        });
        break;
      case 'juz':
        // For juz, navigate to the Juz tab first (would need juz to page mapping)
        navigation.navigate('Juz');
        break;
      case 'page':
        navigation.navigate('Quran', {
          initialPage: lastReadPage.pageNumber || 1
        });
        break;
      default:
        console.log('Unknown page type:', lastReadPage.type);
    }
  };

  const getIconName = () => {
    switch (lastReadPage.type) {
      case 'surah':
        return 'book-outline';
      case 'juz':
        return 'albums-outline';
      case 'page':
        return 'document-text-outline';
      default:
        return 'book-outline';
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

  return (
    <TouchableOpacity
      onPress={handleContinueReading}
      style={tw`bg-blue-100 dark:bg-blue-900 rounded-xl px-4 py-4 mb-4 shadow`}
      accessibilityLabel={`Continue reading ${lastReadPage.name}`}
      activeOpacity={0.88}
    >
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center flex-1`}>
          <View style={tw`w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-3`}>
            <Ionicons name={getIconName()} size={24} color="white" />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-sm font-medium text-blue-600 dark:text-blue-400 mb-1`}>
              Continue Reading
            </Text>
            <Text style={tw`text-base font-semibold text-blue-900 dark:text-blue-100`} numberOfLines={1}>
              {getTypeLabel()}: {lastReadPage.name}
            </Text>
            {lastReadPage.pageNumber && (
              <Text style={tw`text-sm text-blue-600 dark:text-blue-400 mt-1`}>
                Page {lastReadPage.pageNumber}
              </Text>
            )}
          </View>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#2563eb" 
        />
      </View>
    </TouchableOpacity>
  );
};

export default ContinueReading;
