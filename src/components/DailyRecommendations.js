import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

// Surah name to number mapping
const SURAH_NAME_TO_NUMBER = {
  "Al-Ikhlas": 112,
  "Al-Falaq": 113,
  "An-Naas": 114,
  "Ayat al-Kursi": 2, // Part of Al-Baqarah (verse 255, around page 40)
  "Al-Baqarah 285–286": 2,
  "Yaseen": 36,
  "Al-Hashr 59:21–24": 59,
  "Al-Waqi'ah": 56,
  "Al-Mulk": 67,
  "Al-Kafirun": 109
};

// Special page mappings for specific verses
const SPECIAL_VERSE_PAGES = {
  "Ayat al-Kursi": 40, // Al-Baqarah verse 255
  "Al-Baqarah 285–286": 48, // Last verses of Al-Baqarah
  "Al-Hashr 59:21–24": 548 // Last verses of Al-Hashr
};

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

const DAILY_SCHEDULE = {
  "fajr": {
    "time": "04:30 - 06:30",
    "title": "Fajr & Morning",
    "surahs": [
      {"name": "Al-Ikhlas", "arabic": "سُورَةُ الْإِخْلَاصِ", "count": 3},
      {"name": "Al-Falaq", "arabic": "سُورَةُ الْفَلَقِ", "count": 3},
      {"name": "An-Naas", "arabic": "سُورَةُ النَّاسِ", "count": 3},
      {"name": "Ayat al-Kursi", "arabic": "آيَةُ الْكُرْسِيِّ", "count": 1},
      {"name": "Al-Baqarah 285–286", "arabic": "سُورَةُ الْبَقَرَةِ ٢٨٥-٢٨٦", "count": 1}
    ],
    "adhkar": [
      {
        "text": "Bismillahilladhi la yadurru ma'a ismihi shay'un fil ardi wa la fis sama'i wa Huwas Samee'ul 'Aleem",
        "arabic": "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        "english": "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the Hearing, the Knowing",
        "count": 3
      },
      {
        "text": "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa Huwa 'ala kulli shay'in Qadeer",
        "arabic": "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        "english": "There is no deity except Allah, alone without partner, to Him belongs the dominion and praise, and He is over all things competent",
        "count": 100
      },
      {
        "text": "SubhanAllahi wa bihamdihi",
        "arabic": "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
        "english": "Glory is to Allah and praise is to Him",
        "count": 100
      }
    ],
    "duas": [
      {
        "text": "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilayka an-nushur",
        "arabic": "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
        "english": "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection"
      }
    ]
  },
  "morning_extra": {
    "time": "06:30 - 08:00",
    "title": "Morning Extra",
    "surahs": [
      {"name": "Yaseen", "arabic": "سُورَةُ يس", "count": 1}
    ],
    "adhkar": [],
    "duas": []
  },
  "dhuhr": {
    "time": "12:30 - 14:00",
    "title": "Dhuhr",
    "surahs": [],
    "adhkar": [
      {
        "text": "Ayat al-Kursi",
        "arabic": "آيَةُ الْكُرْسِيِّ",
        "english": "The Throne Verse",
        "count": 1
      },
      {
        "text": "Post-salah Tasbeeh (33x SubhanAllah, 33x Alhamdulillah, 34x Allahu Akbar)",
        "arabic": "سُبْحَانَ اللهِ (٣٣) الْحَمْدُ للهِ (٣٣) اللهُ أَكْبَرُ (٣٤)",
        "english": "Glory to Allah (33x), Praise to Allah (33x), Allah is Greatest (34x)",
        "count": 1
      }
    ],
    "duas": []
  },
  "asr": {
    "time": "16:30 - 18:00",
    "title": "Asr & Evening",
    "surahs": [
      {"name": "Al-Ikhlas", "arabic": "سُورَةُ الْإِخْلَاصِ", "count": 3},
      {"name": "Al-Falaq", "arabic": "سُورَةُ الْفَلَقِ", "count": 3},
      {"name": "An-Naas", "arabic": "سُورَةُ النَّاسِ", "count": 3},
      {"name": "Ayat al-Kursi", "arabic": "آيَةُ الْكُرْسِيِّ", "count": 1},
      {"name": "Al-Hashr 59:21–24", "arabic": "سُورَةُ الْحَشْرِ ٢١-٢٤", "count": 1}
    ],
    "adhkar": [
      {
        "text": "Bismillahilladhi la yadurru ma'a ismihi shay'un fil ardi wa la fis sama'i wa Huwas Samee'ul 'Aleem",
        "arabic": "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        "english": "In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the Hearing, the Knowing",
        "count": 3
      },
      {
        "text": "Hasbiyallahu la ilaha illa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul 'Arshil 'Azeem",
        "arabic": "حَسْبِيَ اللهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        "english": "Allah is sufficient for me; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne",
        "count": 7
      },
      {
        "text": "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa Huwa 'ala kulli shay'in Qadeer",
        "arabic": "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        "english": "There is no deity except Allah, alone without partner, to Him belongs the dominion and praise, and He is over all things competent",
        "count": 100
      }
    ],
    "duas": [
      {
        "text": "Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilayka al-maseer",
        "arabic": "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
        "english": "O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return"
      }
    ]
  },
  "maghrib_isha": {
    "time": "18:30 - 21:30",
    "title": "Maghrib & Isha",
    "surahs": [
      {"name": "Al-Waqi'ah", "arabic": "سُورَةُ الْوَاقِعَةِ", "count": 1}
    ],
    "adhkar": [
      {
        "text": "Ayat al-Kursi",
        "arabic": "آيَةُ الْكُرْسِيِّ",
        "english": "The Throne Verse",
        "count": 1
      }
    ],
    "duas": []
  },
  "before_sleep": {
    "time": "21:30 - 23:59",
    "title": "Before Sleep",
    "surahs": [
      {"name": "Al-Mulk", "arabic": "سُورَةُ الْمُلْكِ", "count": 1},
      {"name": "Al-Kafirun", "arabic": "سُورَةُ الْكَافِرُونَ", "count": 1},
      {"name": "Ayat al-Kursi", "arabic": "آيَةُ الْكُرْسِيِّ", "count": 1},
      {"name": "Al-Baqarah 285–286", "arabic": "سُورَةُ الْبَقَرَةِ ٢٨٥-٢٨٦", "count": 1},
      {"name": "Al-Ikhlas", "arabic": "سُورَةُ الْإِخْلَاصِ", "count": 3},
      {"name": "Al-Falaq", "arabic": "سُورَةُ الْفَلَقِ", "count": 3},
      {"name": "An-Naas", "arabic": "سُورَةُ النَّاسِ", "count": 3}
    ],
    "adhkar": [
      {
        "text": "Tasbeeh Fatima (33x SubhanAllah, 33x Alhamdulillah, 34x Allahu Akbar)",
        "arabic": "سُبْحَانَ اللهِ (٣٣) الْحَمْدُ للهِ (٣٣) اللهُ أَكْبَرُ (٣٤)",
        "english": "Glory to Allah (33x), Praise to Allah (33x), Allah is Greatest (34x)",
        "count": 1
      }
    ],
    "duas": [
      {
        "text": "Bismika Allahumma amutu wa ahya",
        "arabic": "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        "english": "In Your name, O Allah, I die and I live"
      },
      {
        "text": "Allahumma inni as'aluka al-'afwa wal-'afiyah fil-deeni wa'd-dunya wal-akhirah",
        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدِّينِ وَالدُّنْيَا وَالْآخِرَةِ",
        "english": "O Allah, I ask You for forgiveness and well-being in this world and the next"
      }
    ]
  }
};

function getCurrentTimeSlot() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 100 + currentMinute;

  // Convert time ranges to numbers for comparison
  if (currentTime >= 430 && currentTime <= 630) return 'fajr';
  if (currentTime >= 630 && currentTime <= 800) return 'morning_extra';
  if (currentTime >= 1230 && currentTime <= 1400) return 'dhuhr';
  if (currentTime >= 1630 && currentTime <= 1800) return 'asr';
  if (currentTime >= 1830 && currentTime <= 2130) return 'maghrib_isha';
  if (currentTime >= 2130 || currentTime <= 359) return 'before_sleep';
  
  // Default fallback based on time of day
  if (currentTime >= 400 && currentTime < 1200) return 'fajr';
  if (currentTime >= 1200 && currentTime < 1600) return 'dhuhr';
  if (currentTime >= 1600 && currentTime < 1900) return 'asr';
  if (currentTime >= 1900) return 'before_sleep';
  
  return 'fajr';
}

export default function DailyRecommendations({ navigation }) {
  const [currentSlot, setCurrentSlot] = useState(getCurrentTimeSlot());
  const [expandedSections, setExpandedSections] = useState({});
  const [smartRecommendationExpanded, setSmartRecommendationExpanded] = useState(true); // Default expanded

  useEffect(() => {
    // Update current slot every minute
    const interval = setInterval(() => {
      setCurrentSlot(getCurrentTimeSlot());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSurahPress = (surah) => {
    let pageNumber;
    
    // Check if it's a special verse with specific page
    if (SPECIAL_VERSE_PAGES[surah.name]) {
      pageNumber = SPECIAL_VERSE_PAGES[surah.name];
    } else {
      // Use regular surah starting page
      const surahNumber = SURAH_NAME_TO_NUMBER[surah.name];
      pageNumber = surahToPageMapping[surahNumber] || 1;
    }
    
    if (navigation) {
      console.log(`[DAILY RECOMMENDATIONS] Navigating to ${surah.name} at page ${pageNumber}`);
      navigation.navigate('Quran', {
        screen: 'QuranPage',
        params: { initialPage: pageNumber }
      });
    }
  };

  const currentRecommendation = DAILY_SCHEDULE[currentSlot];

  const renderSurahItem = (surah) => (
    <TouchableOpacity
      key={surah.name}
      style={tw`mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 shadow-sm`}
      onPress={() => handleSurahPress(surah)}
      activeOpacity={0.7}
    >
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <Text style={tw`text-sm font-semibold text-green-800 dark:text-green-200`}>
          {surah.name}
        </Text>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-xs text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800 px-2 py-1 rounded mr-2`}>
            {surah.count}x
          </Text>
          <View style={tw`bg-green-100 dark:bg-green-800 p-1 rounded-full`}>
            <Ionicons name="book-outline" size={14} color="#16a34a" />
          </View>
        </View>
      </View>
      <Text style={[tw`text-right text-lg text-green-900 dark:text-green-100 mb-1`, {fontFamily: 'System', fontSize: 18, lineHeight: 28}]}>
        {surah.arabic}
      </Text>
      <Text style={tw`text-xs text-green-600 dark:text-green-400 text-center mt-2 opacity-75`}>
        Tap to read in Quran
      </Text>
    </TouchableOpacity>
  );

  const renderAdhkarItem = (adhkar) => (
    <View key={adhkar.text.slice(0, 20)} style={tw`mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg`}>
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <Text style={tw`text-xs text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded`}>
          {adhkar.count}x
        </Text>
      </View>
      <Text style={[tw`text-right text-lg text-blue-900 dark:text-blue-100 mb-3 leading-8`, {fontFamily: 'System', fontSize: 18}]}>
        {adhkar.arabic}
      </Text>
      <Text style={tw`text-sm text-blue-700 dark:text-blue-300 mb-2 leading-6`}>
        {adhkar.text}
      </Text>
      {adhkar.english && (
        <Text style={tw`text-xs text-blue-600 dark:text-blue-400 italic leading-5`}>
          {adhkar.english}
        </Text>
      )}
    </View>
  );

  const renderDuaItem = (dua) => (
    <View key={dua.text.slice(0, 20)} style={tw`mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg`}>
      <Text style={[tw`text-right text-lg text-purple-900 dark:text-purple-100 mb-3 leading-8`, {fontFamily: 'System', fontSize: 18}]}>
        {dua.arabic}
      </Text>
      <Text style={tw`text-sm text-purple-700 dark:text-purple-300 mb-2 leading-6`}>
        {dua.text}
      </Text>
      <Text style={tw`text-xs text-purple-600 dark:text-purple-400 italic leading-5`}>
        {dua.english}
      </Text>
    </View>
  );

  return (
    <View style={tw`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm`}>
      <View style={tw`flex-row items-center mb-4`}>
        <View style={tw`w-3 h-3 bg-amber-500 rounded-full mr-3`} />
        <View style={tw`flex-1`}>
          <Text style={tw`text-lg font-bold text-gray-900 dark:text-gray-100`}>
            {currentRecommendation.title}
          </Text>
          <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>
            {currentRecommendation.time}
          </Text>
        </View>
        <Ionicons name="time" size={20} color="#92400e" />
      </View>

      {/* Smart Recommendation Header - Controls all content */}
      <View style={tw`mb-4`}>
        <TouchableOpacity
          onPress={() => setSmartRecommendationExpanded(!smartRecommendationExpanded)}
          style={tw`flex-row items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700`}
        >
          <View style={tw`flex-row items-center flex-1`}>
            <Ionicons name="bulb" size={20} color="#6366f1" style={tw`mr-3`} />
            <Text style={tw`text-base font-bold text-indigo-800 dark:text-indigo-200`}>
              Smart Recommendation
            </Text>
          </View>
          <Ionicons
            name={smartRecommendationExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6366f1"
          />
        </TouchableOpacity>
      </View>

      {/* All Content - controlled by Smart Recommendation */}
      {smartRecommendationExpanded && (
        <ScrollView style={tw`max-h-96`} showsVerticalScrollIndicator={false}>
          {/* Surahs Section */}
          {currentRecommendation.surahs.length > 0 && (
            <View style={tw`mb-4`}>
              <TouchableOpacity
                onPress={() => toggleSection('surahs')}
                style={tw`flex-row items-center justify-between mb-3`}
              >
                <Text style={tw`text-base font-semibold text-gray-800 dark:text-gray-200`}>
                  📖 Recommended Surahs ({currentRecommendation.surahs.length})
                </Text>
                <Ionicons
                  name={expandedSections.surahs ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
              {expandedSections.surahs && (
                <View>
                  {currentRecommendation.surahs.map(renderSurahItem)}
                </View>
              )}
            </View>
          )}

          {/* Adhkar Section */}
          {currentRecommendation.adhkar.length > 0 && (
            <View style={tw`mb-4`}>
              <TouchableOpacity
                onPress={() => toggleSection('adhkar')}
                style={tw`flex-row items-center justify-between mb-3`}
              >
                <Text style={tw`text-base font-semibold text-gray-800 dark:text-gray-200`}>
                  📿 Dhikr & Adhkar ({currentRecommendation.adhkar.length})
                </Text>
                <Ionicons
                  name={expandedSections.adhkar ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
              {expandedSections.adhkar && (
                <View>
                  {currentRecommendation.adhkar.map(renderAdhkarItem)}
                </View>
              )}
            </View>
          )}

          {/* Duas Section */}
          {currentRecommendation.duas.length > 0 && (
            <View style={tw`mb-4`}>
              <TouchableOpacity
                onPress={() => toggleSection('duas')}
                style={tw`flex-row items-center justify-between mb-3`}
              >
                <Text style={tw`text-base font-semibold text-gray-800 dark:text-gray-200`}>
                  🤲 Du'as ({currentRecommendation.duas.length})
                </Text>
                <Ionicons
                  name={expandedSections.duas ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
              {expandedSections.duas && (
                <View>
                  {currentRecommendation.duas.map(renderDuaItem)}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      <View style={tw`mt-4 pt-3 border-t border-gray-200 dark:border-gray-600`}>
        <Text style={tw`text-xs text-gray-500 dark:text-gray-400 text-center`}>
          Recommendations update automatically based on time
        </Text>
      </View>
    </View>
  );
}
