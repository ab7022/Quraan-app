import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
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
    "duas": [
      {
        "text": "Rabbana atina fi'd-dunya hasanatan wa fi'l-akhirati hasanatan wa qina 'adhab an-nar",
        "arabic": "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        "english": "Our Lord, give us good in this world and good in the next world, and save us from the punishment of the Fire"
      },
      {
        "text": "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatika",
        "arabic": "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        "english": "O Allah, help me to remember You, to thank You, and to worship You perfectly"
      }
    ]
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
      },
      {
        "text": "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduka wa ana 'ala 'ahdika wa wa'dika mastata'tu",
        "arabic": "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
        "english": "O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant, and I am upon Your covenant and promise as much as I am able"
      },
      {
        "text": "Allahumma inni as'aluka min khairi hadha al-yawmi wa khairi ma ba'dahu, wa a'udhu bika min sharri hadha al-yawmi wa sharri ma ba'dahu",
        "arabic": "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ خَيْرِ هَذَا الْيَوْمِ وَخَيْرِ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ",
        "english": "O Allah, I ask You for the good of this day and the good of what comes after it, and I seek refuge in You from the evil of this day and the evil of what comes after it"
      },
      {
        "text": "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari",
        "arabic": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي",
        "english": "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight"
      },
      {
        "text": "Radheetu billahi rabban, wa bil Islami deenan, wa bi Muhammadin rasulan",
        "arabic": "رَضِيتُ بِاللهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ رَسُولًا",
        "english": "I am pleased with Allah as my Lord, Islam as my religion, and Muhammad as my messenger"
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
      },
      {
        "text": "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari",
        "arabic": "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي",
        "english": "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight"
      },
      {
        "text": "Allahumma anta khalaqta nafsi wa anta tawaffaha, laka mamatuha wa mahyaha",
        "arabic": "اللَّهُمَّ أَنْتَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا",
        "english": "O Allah, You created my soul and You take it in death, unto You belongs its death and its life"
      },
      {
        "text": "Astaghfirullaha rabbiya'l-ladhi la ilaha illa huwa'l-hayya'l-qayyuma wa atubu ilayh",
        "arabic": "أَسْتَغْفِرُ اللهَ رَبِّيَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
        "english": "I seek forgiveness from Allah, my Lord, besides whom there is no deity, the Ever-Living, the Self-Sustaining, and I repent to Him"
      }
    ]
  }
};

const getTimeBasedRecommendations = () => {
  const hour = new Date().getHours();
  const currentDay = new Date().getDay(); // 0-6, where 0 is Sunday
  
  if (hour >= 4 && hour < 12) { // Morning (Fajr - Dhuhr)
    return {
      title: 'Morning Blessings',
      gradient: ['#fef3c7', '#fde68a'],
      iconColor: '#d97706',
      items: [
        { 
          type: 'surah', 
          name: 'Surah Yaseen', 
          description: 'Heart of the Quran', 
          icon: 'book-open-page-variant',
          pageNumber: 440 // Direct page number for Yaseen
        },
        { 
          type: 'dhikr', 
          name: 'Morning Adhkar', 
          description: '🌅 Start your day with remembrance', 
          icon: 'sun',
          content: DAILY_SCHEDULE.fajr.adhkar 
        },
        { 
          type: 'dua', 
          name: 'Morning Duas', 
          description: 'Prophetic morning supplications', 
          icon: 'hands-pray',
          content: DAILY_SCHEDULE.fajr.duas 
        }
      ]
    };
  } else if (hour >= 12 && hour < 16) { // Afternoon
    return {
      title: 'Afternoon Reflection',
      gradient: ['#e0f2fe', '#bae6fd'],
      iconColor: '#0284c7',
      items: [
        { 
          type: 'surah', 
          name: 'Surah Rahman', 
          description: 'Discover Divine mercy', 
          icon: 'book-open-page-variant',
          pageNumber: 531 // Direct page number for Rahman
        },
        { 
          type: 'dhikr', 
          name: 'Tasbeeh', 
          description: '💫 Remember Allah in prosperity', 
          icon: 'counter',
          content: DAILY_SCHEDULE.dhuhr.adhkar
        },
        { 
          type: 'dua', 
          name: 'Dhuhr Prayers', 
          description: 'Midday remembrance', 
          icon: 'hands-pray',
          content: DAILY_SCHEDULE.dhuhr.duas
        }
      ]
    };
  } else if (hour >= 16 && hour < 19) { // Evening
    return {
      title: 'Evening Light',
      gradient: ['#ede9fe', '#ddd6fe'],
      iconColor: '#7c3aed',
      items: [
        { 
          type: 'surah', 
          name: currentDay === 5 ? 'Surah Kahf' : 'Surah Mulk',
          description: currentDay === 5 ? 'Friday special: Surah Kahf' : 'The Sovereignty',
          icon: 'book-open-page-variant',
          pageNumber: currentDay === 5 ? 293 : 562 // Direct page numbers for Kahf (18) and Mulk (67)
        },
        { 
          type: 'dhikr', 
          name: 'Evening Adhkar', 
          description: '🌅 Protection & peace', 
          icon: 'weather-sunset',
          content: DAILY_SCHEDULE.asr.adhkar
        },
        { 
          type: 'dua', 
          name: 'Evening Duas', 
          description: 'End your day with barakah', 
          icon: 'hands-pray',
          content: DAILY_SCHEDULE.asr.duas
        }
      ]
    };
  } else { // Night
    return {
      title: 'Night Blessings',
      gradient: ['#e0e7ff', '#c7d2fe'],
      iconColor: '#4f46e5',
      items: [
        {
          type: 'surah',
          name: 'The Three Quls',
          description: 'Protection before sleep',
          icon: 'book-open-page-variant',
          surahs: [
            { name: 'Al-Ikhlas', arabic: 'سُورَةُ الْإِخْلَاصِ', pageNumber: 604, count: 3 },
            { name: 'Al-Falaq', arabic: 'سُورَةُ الْفَلَقِ', pageNumber: 604, count: 3 },
            { name: 'An-Naas', arabic: 'سُورَةُ النَّاسِ', pageNumber: 604, count: 3 }
          ],
          pageNumber: 604
        },
        { 
          type: 'dhikr', 
          name: 'Tasbeeh Fatima', 
          description: '🌙 The blessed dhikr', 
          icon: 'star-crescent',
          content: DAILY_SCHEDULE.before_sleep.adhkar
        },
        { 
          type: 'dua', 
          name: 'Before Sleep', 
          description: 'Peaceful rest & protection', 
          icon: 'hands-pray',
          content: DAILY_SCHEDULE.before_sleep.duas
        }
      ]
    };
  }
};

export default function DailyRecommendations({ navigation }) {
  const [recommendations, setRecommendations] = useState(getTimeBasedRecommendations());
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (cardIndex) => {
    if (expandedCard === cardIndex) {
      setExpandedCard(null); // Close if already open
    } else {
      setExpandedCard(cardIndex); // Open new card and close others
    }
  };

  // Update recommendations every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRecommendations(getTimeBasedRecommendations());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const navigateToQuranPage = (pageNumber) => {
    const page = parseInt(pageNumber, 10);
    console.log('Navigating to page:', page);
    navigation.navigate('Quran', {
      screen: 'QuranPage',
      params: {
        initialPage: page
      }
    });
  };

  const handlePress = (item) => {
    if (item.type === 'surah') {
      navigateToQuranPage(item.pageNumber);
    }
  };

  return (
    <View>
      <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>Smart Recommendations</Text>
      <View style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100`}>
        <View style={tw`flex-row items-center mb-4`}>
          <View style={tw`w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3`}>
            <MaterialCommunityIcons 
              name="clock-time-four" 
              size={20} 
              color={recommendations.iconColor} 
            />
          </View>
          <Text style={tw`text-base font-semibold text-gray-900`}>
            {recommendations.title}
          </Text>
        </View>

        <View style={tw`gap-2 mb-20`}>
          {recommendations.items.map((item, originalIndex) => {
            // Skip rendering items with empty content but preserve index
            if ((item.type === 'dua' || item.type === 'dhikr') && (!item.content || item.content.length === 0)) {
              return null;
            }
            
            return (
            <Animatable.View
              key={item.name}
              animation="fadeIn"
              delay={originalIndex * 100}
              style={tw`mb-3`}
            >
              <TouchableOpacity
                onPress={() => {
                  if (item.type === 'surah' && !item.content) {
                    handlePress(item);
                  } else if (item.type === 'dhikr' || item.type === 'dua') {
                    toggleCard(originalIndex);
                  }
                }}
                style={tw`p-3 bg-gray-50 rounded-xl ${expandedCard === originalIndex ? 'bg-blue-50' : ''}`}
                activeOpacity={0.7}
              >
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-8 h-8 bg-white rounded-full items-center justify-center mr-3 shadow-sm`}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={16}
                      color={recommendations.iconColor}
                    />
                  </View>
                  <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center justify-between`}>
                      <Text style={tw`text-sm font-semibold text-gray-900 mb-1`}>
                        {item.name}
                      </Text>
                      {/* Count badge for dhikr/dua */}
                      {(item.type === 'dhikr' || item.type === 'dua') && item.content && item.content.length > 0 && (
                        <View style={tw`bg-purple-100 px-2 py-1 rounded-full`}>
                          <Text style={tw`text-xs font-bold text-purple-700`}>
                            {item.content.length}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={tw`text-xs text-gray-500`}>
                      {item.description}
                    </Text>
                    {/* Tap hint for expandable cards */}
                    {(item.type === 'dhikr' || item.type === 'dua') && item.content && item.content.length > 0 && expandedCard !== originalIndex && (
                      <Text style={tw`text-xs text-blue-600 mt-1 font-medium`}>
                        Tap to view all {item.content.length} {item.type === 'dhikr' ? 'adhkar' : 'duas'}
                      </Text>
                    )}
                  </View>
                  
                  {/* Expand/Collapse indicator for dhikr/dua */}
                  {(item.type === 'dhikr' || item.type === 'dua') && item.content && item.content.length > 0 && (
                    <Ionicons
                      name={expandedCard === originalIndex ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#9CA3AF"
                    />
                  )}
                  
                  {/* Navigation indicator for surahs */}
                  {item.type === 'surah' && !item.content && (
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color="#9CA3AF"
                    />
                  )}
                </View>

                {/* Expandable content for dhikr/dua */}
                {(item.type === 'dhikr' || item.type === 'dua') && item.content && item.content.length > 0 && expandedCard === originalIndex && (
                  <Animatable.View
                    animation="slideInDown"
                    duration={300}
                    style={tw`mt-3 bg-white rounded-lg p-3 border border-gray-200`}
                  >
                    <ScrollView 
                      style={tw`max-h-60`} 
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {item.content.map((contentItem, idx) => (
                        <View key={idx} style={tw`mb-4 pb-3 ${idx < item.content.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          {/* Arabic Text */}
                          {contentItem.arabic && (
                            <Text style={tw`text-lg text-right text-gray-800 mb-2 leading-8`} dir="rtl">
                              {contentItem.arabic}
                            </Text>
                          )}
                          
                          {/* Transliteration */}
                          <Text style={tw`text-sm font-medium text-gray-700 mb-1 italic`}>
                            {contentItem.text}
                          </Text>
                          
                          {/* English Translation */}
                          {contentItem.english && (
                            <Text style={tw`text-sm text-gray-600 mb-2`}>
                              {contentItem.english}
                            </Text>
                          )}
                          
                          {/* Recitation Count */}
                          {contentItem.count && (
                            <View style={tw`bg-purple-100 px-2 py-1 rounded-lg self-start`}>
                              <Text style={tw`text-xs text-purple-700 font-semibold`}>
                                Recite {contentItem.count}x
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                  </Animatable.View>
                )}

                {/* Display surah content (if any) */}
                {item.surahs && (
                  <View style={tw`mt-2`}>
                    {item.surahs.slice(0, 2).map((surah, idx) => (
                      <TouchableOpacity 
                        key={surah.name}
                        onPress={() => navigateToQuranPage(surah.pageNumber)}
                        style={tw`flex-row items-center mt-1`}
                      >
                        <Text style={tw`text-xs font-medium text-gray-700`}>
                          {surah.name} {surah.count && `(${surah.count}x)`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            </Animatable.View>
            );
          })}
        </View>
      </View>
    </View>
  );
         

}
