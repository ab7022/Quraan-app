import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import tw from 'twrnc';

// صفحات السور في المصحف
const SURAH_PAGES = {
  18: 293, // الكهف
  36: 440, // يس
  55: 531, // الرحمن
  67: 562, // الملك
  112: 604, // الإخلاص
  113: 604, // الفلق
  114: 604, // الناس
};

// الآيات الخاصة
const SPECIAL_VERSES = {
  'آيَةُ الْكُرْسِيِّ': 40, // البقرة آية 255
  'خواتيم البقرة': 48, // البقرة 285-286
};

// الجدول اليومي للأذكار والأدعية - عربي فقط
const DAILY_SCHEDULE = {
  fajr: {
    title: 'الفجر والصباح',
    adhkar: [
      {
        text: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        count: 3,
      },
      {
        text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        count: 100,
      },
      {
        text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
        count: 100,
      },
    ],
    duas: [
      {
        text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
      },
      {
        text: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
      },
      {
        text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',
      },
    ],
  },

  dhuhr: {
    title: 'الظهر',
    adhkar: [
      {
        text: 'سُبْحَانَ اللهِ',
        count: 33,
      },
      {
        text: 'الْحَمْدُ للهِ',
        count: 33,
      },
      {
        text: 'اللهُ أَكْبَرُ',
        count: 34,
      },
    ],
    duas: [
      {
        text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      },
      {
        text: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
      },
    ],
  },

  asr: {
    title: 'العصر والمساء',
    adhkar: [
      {
        text: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        count: 3,
      },
      {
        text: 'حَسْبِيَ اللهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
        count: 7,
      },
      {
        text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        count: 100,
      },
    ],
    duas: [
      {
        text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
      },
      {
        text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ خَيْرِ هَذَا الْيَوْمِ وَخَيْرِ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ',
      },
      {
        text: 'رَضِيتُ بِاللهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ رَسُولًا',
      },
    ],
  },

  isha: {
    title: 'العشاء وقبل النوم',
    adhkar: [
      {
        text: 'سُبْحَانَ اللهِ وَالْحَمْدُ للهِ وَاللهُ أَكْبَرُ',
        count: 100,
      },
      {
        text: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
        count: 3,
      },
    ],
    duas: [
      {
        text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
      },
      {
        text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدِّينِ وَالدُّنْيَا وَالْآخِرَةِ',
      },
      {
        text: 'اللَّهُمَّ أَنْتَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا',
      },
    ],
  },
};

// وظيفة الحصول على التوصيات حسب الوقت
const getTimeBasedRecommendations = () => {
  const hour = new Date().getHours();
  const currentDay = new Date().getDay(); // 0-6, where 0 is Sunday

  if (hour >= 4 && hour < 12) {
    // الصباح (الفجر - الظهر)
    return {
      title: 'Morning Blessings',
      iconColor: '#d97706',
      items: [
        {
          type: 'surah',
          name: 'Surah Yaseen',
          description: 'Heart of the Quran',
          icon: 'book-open-page-variant',
          pageNumber: SURAH_PAGES[36], // يس
        },
        {
          type: 'dhikr',
          name: 'Morning Adhkar',
          description: 'Start your day with remembrance',
          icon: 'sun',
          content: DAILY_SCHEDULE.fajr.adhkar,
        },
        {
          type: 'dua',
          name: 'Morning Duas',
          description: 'Prophetic morning supplications',
          icon: 'hands-pray',
          content: DAILY_SCHEDULE.fajr.duas,
        },
      ],
    };
  } else if (hour >= 12 && hour < 16) {
    // الظهيرة
    return {
      title: 'Afternoon Reflection',
      iconColor: '#0284c7',
      items: [
        {
          type: 'surah',
          name: 'Surah Rahman',
          description: 'Discover Divine mercy',
          icon: 'book-open-page-variant',
          pageNumber: SURAH_PAGES[55], // الرحمن
        },
        {
          type: 'dhikr',
          name: 'Tasbeeh',
          description: 'Remember Allah in prosperity',
          icon: 'counter',
          content: DAILY_SCHEDULE.dhuhr.adhkar,
        },
        {
          type: 'dua',
          name: 'Dhuhr Prayers',
          description: 'Midday remembrance',
          icon: 'hands-pray',
          content: DAILY_SCHEDULE.dhuhr.duas,
        },
      ],
    };
  } else if (hour >= 16 && hour < 19) {
    // المساء
    return {
      title: 'Evening Light',
      iconColor: '#7c3aed',
      items: [
        {
          type: 'surah',
          name: currentDay === 5 ? 'Surah Kahf' : 'Surah Mulk',
          description:
            currentDay === 5 ? 'Friday special: Surah Kahf' : 'The Sovereignty',
          icon: 'book-open-page-variant',
          pageNumber: currentDay === 5 ? SURAH_PAGES[18] : SURAH_PAGES[67],
        },
        {
          type: 'dhikr',
          name: 'Evening Adhkar',
          description: 'Protection & peace',
          icon: 'weather-sunset',
          content: DAILY_SCHEDULE.asr.adhkar,
        },
        {
          type: 'dua',
          name: 'Evening Duas',
          description: 'End your day with barakah',
          icon: 'hands-pray',
          content: DAILY_SCHEDULE.asr.duas,
        },
      ],
    };
  } else {
    // الليل
    return {
      title: 'Night Blessings',
      iconColor: '#4f46e5',
      items: [
        {
          type: 'surah',
          name: 'The Three Quls',
          description: 'Protection before sleep',
          icon: 'book-open-page-variant',
          pageNumber: SURAH_PAGES[112], // الإخلاص والفلق والناس
        },
        {
          type: 'dhikr',
          name: 'Tasbeeh Fatima',
          description: 'The blessed dhikr',
          icon: 'star-crescent',
          content: DAILY_SCHEDULE.isha.adhkar,
        },
        {
          type: 'dua',
          name: 'Before Sleep',
          description: 'Peaceful rest & protection',
          icon: 'hands-pray',
          content: DAILY_SCHEDULE.isha.duas,
        },
      ],
    };
  }
};

export default function DailyRecommendations({ navigation }) {
  const [recommendations, setRecommendations] = useState(
    getTimeBasedRecommendations()
  );
  const [expandedCard, setExpandedCard] = useState([]); // track expanded cards

  // Track completed items
  const [completed, setCompleted] = useState([]);

  // Update recommendations every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRecommendations(getTimeBasedRecommendations());
      setExpandedCard([]);
      setCompleted([]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const navigateToQuranPage = pageNumber => {
    const page = parseInt(pageNumber, 10);
    navigation.navigate('Quran', {
      screen: 'QuranPage',
      params: { initialPage: page },
    });
  };

  // Toggle expand/collapse and mark as completed
  const toggleCard = cardIndex => {
    setExpandedCard(prev => {
      if (prev.includes(cardIndex)) {
        return prev.filter(i => i !== cardIndex);
      } else {
        // Mark as completed when expanded
        if (!completed.includes(cardIndex))
          setCompleted(c => [...c, cardIndex]);
        return [...prev, cardIndex];
      }
    });
  };

  // Progress calculation
  const total = recommendations.items.length;
  const done = completed.length;
  const allDone = done === total;

  // Gradient backgrounds for accomplishment
  const gradients = [
    ['#fef3c7', '#fde68a'],
    ['#e0f2fe', '#bae6fd'],
    ['#ede9fe', '#ddd6fe'],
    ['#e0e7ff', '#c7d2fe'],
  ];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <Animatable.View animation="fadeInUp" duration={600}>
      <View style={[
        tw`rounded-3xl overflow-hidden mb-4 mx-0`,
        {
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 1,
        }
      ]}>
        {/* Apple-Style Header */}
        <View style={[
          tw`px-5 py-4`,
          {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundColor: recommendations.iconColor || '#007AFF',
          }
        ]}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View style={[
                tw`w-10 h-10 rounded-2xl items-center justify-center mr-3`,
                { backgroundColor: 'rgba(255,255,255,0.2)' }
              ]}>
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={22}
                  color="white"
                />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[
                  tw`text-white font-bold mb-1`,
                  { fontSize: 18, letterSpacing: -0.3 }
                ]}>
                  {recommendations.title}
                </Text>
                <Text style={[
                  tw`text-white opacity-90 font-medium`,
                  { fontSize: 13 }
                ]}>
                  Smart recommendations for you
                </Text>
              </View>
            </View>
            
            {/* Progress Circle */}
            <View style={tw`items-center`}>
              <View style={[
                tw`w-12 h-12 rounded-full items-center justify-center`,
                { backgroundColor: 'rgba(255,255,255,0.2)' }
              ]}>
                <Text style={[
                  tw`text-white font-bold`,
                  { fontSize: 14 }
                ]}>
                  {done}/{total}
                </Text>
              </View>
              {allDone && (
                <Animatable.View 
                  animation="bounceIn" 
                  style={tw`absolute -top-1 -right-1`}
                >
                  <View style={[
                    tw`w-6 h-6 rounded-full items-center justify-center`,
                    { backgroundColor: '#34c759' }
                  ]}>
                    <Feather name="check" size={14} color="white" />
                  </View>
                </Animatable.View>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          <View style={tw`mt-3`}>
            <View style={[
              tw`h-1 rounded-full overflow-hidden`,
              { backgroundColor: 'rgba(255,255,255,0.3)' }
            ]}>
              <Animatable.View
                animation="slideInLeft"
                duration={800}
                style={[
                  tw`h-full rounded-full`,
                  {
                    width: `${(done / total) * 100}%`,
                    backgroundColor: allDone ? '#34c759' : 'rgba(255,255,255,0.9)',
                  }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Success Message */}
        {allDone && (
          <Animatable.View
            animation="fadeInDown"
            style={[
              tw`px-5 py-3 items-center`,
              { backgroundColor: '#f0fdf4' }
            ]}
          >
            <Text style={[
              tw`text-green-700 font-semibold text-center`,
              { fontSize: 15, letterSpacing: -0.2 }
            ]}>
              🎉 All completed! Great job today
            </Text>
          </Animatable.View>
        )}
        {/* Apple-Style Items */}
        <View style={tw`px-5 py-4 bg-white`}>
          {recommendations.items.map((item, originalIndex) => {
            if (
              (item.type === 'dua' || item.type === 'dhikr') &&
              (!item.content || item.content.length === 0)
            ) {
              return null;
            }
            const isExpanded = expandedCard.includes(originalIndex);
            const isDone = completed.includes(originalIndex);
            
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
                      navigateToQuranPage(item.pageNumber);
                    } else if (item.type === 'dhikr' || item.type === 'dua') {
                      toggleCard(originalIndex);
                    }
                  }}
                  style={[
                    tw`rounded-2xl overflow-hidden`,
                    {
                      backgroundColor: isExpanded ? '#f8fafc' : 'white',
                      borderWidth: 1,
                      borderColor: isExpanded ? '#e2e8f0' : '#f1f5f9',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={tw`p-4`}>
                    <View style={tw`flex-row items-center`}>
                      {/* Apple-Style Icon */}
                      <View style={[
                        tw`w-11 h-11 rounded-2xl items-center justify-center mr-4`,
                        {
                          backgroundColor: item.type === 'surah' ? '#007AFF' : 
                                         item.type === 'dhikr' ? '#34c759' : '#ff9500'
                        }
                      ]}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={20}
                          color="white"
                        />
                      </View>

                      {/* Content */}
                      <View style={tw`flex-1`}>
                        <View style={tw`flex-row items-center justify-between mb-1`}>
                          <Text style={[
                            tw`text-gray-900 font-semibold`,
                            { fontSize: 16, letterSpacing: -0.2 }
                          ]}>
                            {item.name}
                          </Text>
                          
                          {/* Status Indicators */}
                          <View style={tw`flex-row items-center`}>
                            {(item.type === 'dhikr' || item.type === 'dua') &&
                              item.content &&
                              item.content.length > 0 && (
                                <View style={[
                                  tw`px-2 py-1 rounded-lg mr-2`,
                                  { backgroundColor: '#f0f9ff' }
                                ]}>
                                  <Text style={[
                                    tw`font-semibold`,
                                    { fontSize: 12, color: '#0284c7' }
                                  ]}>
                                    {item.content.length}
                                  </Text>
                                </View>
                              )}
                            
                            {isDone && (
                              <View style={[
                                tw`w-6 h-6 rounded-full items-center justify-center mr-2`,
                                { backgroundColor: '#22c55e' }
                              ]}>
                                <Feather name="check" size={12} color="white" />
                              </View>
                            )}
                          </View>
                        </View>
                        
                        <Text style={[
                          tw`text-gray-500 font-medium mb-2`,
                          { fontSize: 13 }
                        ]}>
                          {item.description}
                        </Text>

                        {/* Action Hint */}
                        {!isExpanded && (item.type === 'dhikr' || item.type === 'dua') &&
                          item.content && item.content.length > 0 && (
                            <Text style={[
                              tw`text-blue-600 font-medium`,
                              { fontSize: 12 }
                            ]}>
                              Tap to view {item.type === 'dhikr' ? 'adhkar' : 'duas'}
                            </Text>
                          )}
                      </View>

                      {/* Chevron */}
                      <View style={tw`ml-2`}>
                        {(item.type === 'dhikr' || item.type === 'dua') &&
                          item.content && item.content.length > 0 ? (
                            <Ionicons
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color="#c7c7cc"
                            />
                          ) : (
                            <Ionicons
                              name="chevron-forward"
                              size={18}
                              color="#c7c7cc"
                            />
                          )}
                      </View>
                    </View>

                    {/* Expanded Content */}
                    {(item.type === 'dhikr' || item.type === 'dua') &&
                      item.content &&
                      item.content.length > 0 &&
                      isExpanded && (
                        <Animatable.View
                          animation="slideInDown"
                          duration={300}
                          style={[
                            tw`mt-4 rounded-2xl p-4`,
                            { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb' }
                          ]}
                        >
                          <ScrollView
                            style={tw`max-h-64`}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                          >
                            {item.content.map((contentItem, idx) => (
                              <View
                                key={idx}
                                style={[
                                  tw`mb-4`,
                                  idx < item.content.length - 1 && {
                                    paddingBottom: 16,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#f3f4f6'
                                  }
                                ]}
                              >
                                <Text
                                  style={[
                                    tw`text-gray-800 text-right mb-3 leading-7`,
                                    { fontSize: 16, fontFamily: 'System' }
                                  ]}
                                  dir="rtl"
                                >
                                  {contentItem.text}
                                </Text>
                                {contentItem.count && (
                                  <View style={[
                                    tw`px-3 py-1 rounded-xl self-start`,
                                    { backgroundColor: '#fef3c7' }
                                  ]}>
                                    <Text style={[
                                      tw`font-semibold`,
                                      { fontSize: 12, color: '#d97706' }
                                    ]}>
                                      {contentItem.count}×
                                    </Text>
                                  </View>
                                )}
                              </View>
                            ))}
                          </ScrollView>
                        </Animatable.View>
                      )}
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            );
          })}
        </View>
      </View>
    </Animatable.View>
  );
}
