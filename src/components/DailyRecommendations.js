import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import tw from "twrnc";

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
  "آيَةُ الْكُرْسِيِّ": 40, // البقرة آية 255
  "خواتيم البقرة": 48, // البقرة 285-286
};

// الجدول اليومي للأذكار والأدعية - عربي فقط
const DAILY_SCHEDULE = {
  fajr: {
    title: "الفجر والصباح",
    adhkar: [
      {
        text: "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        count: 3,
      },
      {
        text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 100,
      },
      {
        text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ",
        count: 100,
      },
    ],
    duas: [
      {
        text: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
      },
      {
        text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
      },
      {
        text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي",
      },
    ],
  },
  
  dhuhr: {
    title: "الظهر",
    adhkar: [
      {
        text: "سُبْحَانَ اللهِ",
        count: 33,
      },
      {
        text: "الْحَمْدُ للهِ",
        count: 33,
      },
      {
        text: "اللهُ أَكْبَرُ",
        count: 34,
      },
    ],
    duas: [
      {
        text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      },
      {
        text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      },
    ],
  },

  asr: {
    title: "العصر والمساء",
    adhkar: [
      {
        text: "بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        count: 3,
      },
      {
        text: "حَسْبِيَ اللهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        count: 7,
      },
      {
        text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        count: 100,
      },
    ],
    duas: [
      {
        text: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
      },
      {
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ خَيْرِ هَذَا الْيَوْمِ وَخَيْرِ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ",
      },
      {
        text: "رَضِيتُ بِاللهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ رَسُولًا",
      },
    ],
  },

  isha: {
    title: "العشاء وقبل النوم",
    adhkar: [
      {
        text: "سُبْحَانَ اللهِ وَالْحَمْدُ للهِ وَاللهُ أَكْبَرُ",
        count: 100,
      },
      {
        text: "أَسْتَغْفِرُ اللهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
        count: 3,
      },
    ],
    duas: [
      {
        text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
      },
      {
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدِّينِ وَالدُّنْيَا وَالْآخِرَةِ",
      },
      {
        text: "اللَّهُمَّ أَنْتَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا",
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
      title: "Morning Blessings",
      iconColor: "#d97706",
      items: [
        {
          type: "surah",
          name: "Surah Yaseen",
          description: "Heart of the Quran",
          icon: "book-open-page-variant",
          pageNumber: SURAH_PAGES[36], // يس
        },
        {
          type: "dhikr",
          name: "Morning Adhkar",
          description: "Start your day with remembrance",
          icon: "sun",
          content: DAILY_SCHEDULE.fajr.adhkar,
        },
        {
          type: "dua",
          name: "Morning Duas",
          description: "Prophetic morning supplications",
          icon: "hands-pray",
          content: DAILY_SCHEDULE.fajr.duas,
        },
      ],
    };
  } else if (hour >= 12 && hour < 16) {
    // الظهيرة
    return {
      title: "Afternoon Reflection",
      iconColor: "#0284c7",
      items: [
        {
          type: "surah",
          name: "Surah Rahman",
          description: "Discover Divine mercy",
          icon: "book-open-page-variant",
          pageNumber: SURAH_PAGES[55], // الرحمن
        },
        {
          type: "dhikr",
          name: "Tasbeeh",
          description: "Remember Allah in prosperity",
          icon: "counter",
          content: DAILY_SCHEDULE.dhuhr.adhkar,
        },
        {
          type: "dua",
          name: "Dhuhr Prayers",
          description: "Midday remembrance",
          icon: "hands-pray",
          content: DAILY_SCHEDULE.dhuhr.duas,
        },
      ],
    };
  } else if (hour >= 16 && hour < 19) {
    // المساء
    return {
      title: "Evening Light",
      iconColor: "#7c3aed",
      items: [
        {
          type: "surah",
          name: currentDay === 5 ? "Surah Kahf" : "Surah Mulk",
          description: currentDay === 5 ? "Friday special: Surah Kahf" : "The Sovereignty",
          icon: "book-open-page-variant",
          pageNumber: currentDay === 5 ? SURAH_PAGES[18] : SURAH_PAGES[67],
        },
        {
          type: "dhikr",
          name: "Evening Adhkar",
          description: "Protection & peace",
          icon: "weather-sunset",
          content: DAILY_SCHEDULE.asr.adhkar,
        },
        {
          type: "dua",
          name: "Evening Duas",
          description: "End your day with barakah",
          icon: "hands-pray",
          content: DAILY_SCHEDULE.asr.duas,
        },
      ],
    };
  } else {
    // الليل
    return {
      title: "Night Blessings",
      iconColor: "#4f46e5",
      items: [
        {
          type: "surah",
          name: "The Three Quls",
          description: "Protection before sleep",
          icon: "book-open-page-variant",
          pageNumber: SURAH_PAGES[112], // الإخلاص والفلق والناس
        },
        {
          type: "dhikr",
          name: "Tasbeeh Fatima",
          description: "The blessed dhikr",
          icon: "star-crescent",
          content: DAILY_SCHEDULE.isha.adhkar,
        },
        {
          type: "dua",
          name: "Before Sleep",
          description: "Peaceful rest & protection",
          icon: "hands-pray",
          content: DAILY_SCHEDULE.isha.duas,
        },
      ],
    };
  }
};

export default function DailyRecommendations({ navigation }) {
  const [recommendations, setRecommendations] = useState(getTimeBasedRecommendations());
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

  const navigateToQuranPage = (pageNumber) => {
    const page = parseInt(pageNumber, 10);
    navigation.navigate("Quran", {
      screen: "QuranPage",
      params: { initialPage: page },
    });
  };

  // Toggle expand/collapse and mark as completed
  const toggleCard = (cardIndex) => {
    setExpandedCard((prev) => {
      if (prev.includes(cardIndex)) {
        return prev.filter((i) => i !== cardIndex);
      } else {
        // Mark as completed when expanded
        if (!completed.includes(cardIndex)) setCompleted((c) => [...c, cardIndex]);
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
    ["#fef3c7", "#fde68a"],
    ["#e0f2fe", "#bae6fd"],
    ["#ede9fe", "#ddd6fe"],
    ["#e0e7ff", "#c7d2fe"],
  ];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <Animatable.View animation="fadeInUp" duration={700}>
      <View style={{
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: gradient[0],
      }}>
        <View style={{
          backgroundColor: gradient[1],
          padding: 18,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          flexDirection: "row",
          alignItems: "center",
        }}>
          <MaterialCommunityIcons name="trophy-award" size={28} color="#f59e42" style={{marginRight: 10}} />
          <Text style={tw`text-lg font-bold text-gray-900`}>Smart Recommendations</Text>
        </View>
        <View style={tw`px-4 pt-4 pb-2`}> 
          <View style={tw`flex-row items-center mb-2`}> 
            <MaterialCommunityIcons name="clock-time-four" size={20} color={recommendations.iconColor} />
            <Text style={tw`text-base font-semibold text-gray-900 ml-2`}>{recommendations.title}</Text>
          </View>
          {/* Progress bar */}
          <View style={tw`flex-row items-center mb-4`}> 
            <View style={tw`flex-1 h-2 bg-gray-200 rounded-full mr-2`}> 
              <View style={{width: `${(done/total)*100}%`, height: 8, backgroundColor: allDone ? '#22c55e' : '#a78bfa', borderRadius: 8}} />
            </View>
            <Text style={tw`text-xs font-bold ${allDone ? 'text-green-600' : 'text-purple-700'}`}>{done}/{total}</Text>
            {allDone && <Feather name="check-circle" size={18} color="#22c55e" style={{marginLeft: 6}} />}
          </View>
          {/* Congratulatory message */}
          {allDone && (
            <Animatable.Text animation="bounceIn" style={tw`text-center text-green-700 font-bold mb-2 text-base`}>
              🎉 Congratulations! You completed all for this time.
            </Animatable.Text>
          )}
          {recommendations.items.map((item, originalIndex) => {
            if ((item.type === "dua" || item.type === "dhikr") && (!item.content || item.content.length === 0)) {
              return null;
            }
            const isExpanded = expandedCard.includes(originalIndex);
            const isDone = completed.includes(originalIndex);
            return (
              <Animatable.View
                key={item.name}
                animation="fadeIn"
                delay={originalIndex * 100}
                style={[tw`mb-3`, isDone && {opacity: 0.7}]}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (item.type === "surah" && !item.content) {
                      navigateToQuranPage(item.pageNumber);
                    } else if (item.type === "dhikr" || item.type === "dua") {
                      toggleCard(originalIndex);
                    }
                  }}
                  style={tw`p-3 bg-gray-50 rounded-xl ${isExpanded ? "bg-blue-50" : ""}`}
                  activeOpacity={0.7}
                >
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-8 h-8 bg-white rounded-full items-center justify-center mr-3 shadow-sm`}>
                      <MaterialCommunityIcons name={item.icon} size={16} color={recommendations.iconColor} />
                    </View>
                    <View style={tw`flex-1`}> 
                      <View style={tw`flex-row items-center justify-between`}> 
                        <Text style={tw`text-sm font-semibold text-gray-900 mb-1`}>{item.name}</Text>
                        {/* Checkmark for completed */}
                        {isDone && <Feather name="check" size={16} color="#22c55e" style={{marginLeft: 4}} />}
                        {(item.type === "dhikr" || item.type === "dua") && item.content && item.content.length > 0 && (
                          <View style={tw`bg-purple-100 px-2 py-1 rounded-full ml-2`}>
                            <Text style={tw`text-xs font-bold text-purple-700`}>{item.content.length}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={tw`text-xs text-gray-500`}>{item.description}</Text>
                      {(item.type === "dhikr" || item.type === "dua") && item.content && item.content.length > 0 && !isExpanded && (
                        <Text style={tw`text-xs text-blue-600 mt-1 font-medium`}>
                          Tap to view all {item.content.length} {item.type === "dhikr" ? "adhkar" : "duas"}
                        </Text>
                      )}
                    </View>
                    {(item.type === "dhikr" || item.type === "dua") && item.content && item.content.length > 0 && (
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#9CA3AF" />
                    )}
                    {item.type === "surah" && !item.content && (
                      <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
                    )}
                  </View>
                  {(item.type === "dhikr" || item.type === "dua") && item.content && item.content.length > 0 && isExpanded && (
                    <Animatable.View animation="slideInDown" duration={300} style={tw`mt-3 bg-white rounded-lg p-3 border border-gray-200`}>
                      <ScrollView style={tw`max-h-60`} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                        {item.content.map((contentItem, idx) => (
                          <View key={idx} style={tw`mb-4 pb-3 ${idx < item.content.length - 1 ? "border-b border-gray-100" : ""}`}> 
                            <Text style={tw`text-lg text-right text-gray-800 mb-2 leading-8`} dir="rtl">{contentItem.text}</Text>
                            {contentItem.count && (
                              <View style={tw`bg-purple-100 px-2 py-1 rounded-lg self-start`}>
                                <Text style={tw`text-xs text-purple-700 font-semibold`}>({contentItem.count}×)</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </ScrollView>
                    </Animatable.View>
                  )}
                </TouchableOpacity>
              </Animatable.View>
            );
          })}
        </View>
      </View>
    </Animatable.View>
  );
}
