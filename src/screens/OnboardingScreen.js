import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '../services/analyticsService';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const onboardingSlides = [
    {
      id: 1,
      title: "Read the Holy Qur'an",
      subtitle: 'Beautiful Mushaf Pages',
      description:
        'Read from authentic Mushaf pages with smooth navigation. Your progress is automatically saved.',
      icon: 'book-outline',
      gradient: ['#059669', '#10B981', '#34D399'],
      features: [
        { icon: 'bookmark-outline', text: 'Auto-save reading progress' },
        { icon: 'sync-outline', text: 'Seamless page transitions' },
        { icon: 'eye-outline', text: 'High-quality Mushaf images' },
      ],
    },
    {
      id: 2,
      title: 'AI-Powered Tafseer',
      subtitle: 'Understand Every Verse',
      description:
        'Get detailed explanations of any page in your preferred language with our advanced AI Tafseer.',
      icon: 'bulb-outline',
      gradient: ['#8B5CF6', '#A855F7', '#C084FC'],
      features: [
        { icon: 'language-outline', text: '18+ languages supported' },
        { icon: 'sparkles-outline', text: 'Instant AI explanations' },
        { icon: 'school-outline', text: 'Educational & authentic' },
      ],
    },
    {
      id: 3,
      title: 'Track Your Journey',
      subtitle: 'Build Reading Habits',
      description:
        'Monitor your daily reading streaks and see your spiritual progress over time.',
      icon: 'trending-up-outline',
      gradient: ['#EF4444', '#F87171', '#FCA5A5'],
      features: [
        { icon: 'calendar-outline', text: 'Daily reading streaks' },
        { icon: 'stats-chart-outline', text: 'Progress analytics' },
        { icon: 'trophy-outline', text: 'Achievement milestones' },
      ],
    },
    {
      id: 4,
      title: "Learn Qur'an",
      subtitle: '7-Day Free Trial',
      description:
        "Join our comprehensive Qur'an learning program with expert guidance and structured lessons.",
      icon: 'school-outline',
      gradient: ['#F59E0B', '#FBBF24', '#FCD34D'],
      features: [
        { icon: 'time-outline', text: '7 days completely free' },
        { icon: 'people-outline', text: 'Expert instructors' },
        { icon: 'library-outline', text: 'Structured curriculum' },
      ],
    },
  ];

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      scrollViewRef.current?.scrollTo({ x: prevSlide * width, animated: true });
    }
  };

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      if (name.trim()) {
        await AsyncStorage.setItem('user_name', name.trim());
        analytics.trackUserAction('onboarding_completed', {
          has_name: true,
          name_length: name.trim().length,
        });
      } else {
        analytics.trackUserAction('onboarding_completed', {
          has_name: false,
        });
      }

      // Mark onboarding as completed
      await AsyncStorage.setItem('onboarding_completed', 'true');

      setTimeout(() => {
        setIsLoading(false);
        onComplete();
      }, 800);
    } catch (error) {
      console.log('Error saving onboarding data:', error);
      setIsLoading(false);
      onComplete();
    }
  };

  const isLastSlide = currentSlide === onboardingSlides.length - 1;
  const currentSlideData = onboardingSlides[currentSlide];

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <LinearGradient colors={currentSlideData.gradient} style={tw`flex-1`}>
        {/* Header with Skip Button */}
        <View style={tw`flex-row justify-between items-center px-6 py-4`}>
          <View style={tw`w-12`} />
          <View style={tw`flex-row gap-2`}>
            {onboardingSlides.map((_, index) => (
              <View
                key={index}
                style={tw`w-2 h-2 rounded-full ${
                  index === currentSlide ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={handleGetStarted}
            style={tw`px-4 py-2 rounded-full bg-white/20`}
          >
            <Text style={tw`text-white font-medium`}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={tw`flex-1`}
        >
          {onboardingSlides.map((slide, index) => (
            <View key={slide.id} style={[tw`flex-1 px-6`, { width }]}>
              {/* Icon and Title Section */}
              <View style={tw`items-center mt-8 mb-12`}>
                <View
                  style={tw`w-32 h-32 rounded-full bg-white/20 items-center justify-center mb-8`}
                >
                  <View
                    style={tw`w-24 h-24 rounded-full bg-white items-center justify-center`}
                  >
                    <Ionicons
                      name={slide.icon}
                      size={48}
                      color={slide.gradient[0]}
                    />
                  </View>
                </View>

                <Text
                  style={tw`text-3xl font-bold text-white text-center mb-2`}
                >
                  {slide.title}
                </Text>
                <Text style={tw`text-xl text-white/80 text-center mb-4`}>
                  {slide.subtitle}
                </Text>
                <Text
                  style={tw`text-base text-white/90 text-center leading-6 px-4`}
                >
                  {slide.description}
                </Text>
              </View>

              {/* Features List */}
              <View style={tw`bg-white/10 rounded-2xl p-6 mb-8`}>
                <Text
                  style={tw`text-lg font-semibold text-white mb-4 text-center`}
                >
                  Key Features
                </Text>
                {slide.features.map((feature, featureIndex) => (
                  <View
                    key={featureIndex}
                    style={tw`flex-row items-center mb-3`}
                  >
                    <View
                      style={tw`w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4`}
                    >
                      <Ionicons name={feature.icon} size={20} color="white" />
                    </View>
                    <Text style={tw`text-white/90 text-base flex-1`}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Name Input Section (only on last slide) */}
              {isLastSlide && (
                <View style={tw`bg-white/10 rounded-2xl p-6 mb-8`}>
                  <Text
                    style={tw`text-lg font-semibold text-white mb-3 text-center`}
                  >
                    What should we call you?
                  </Text>
                  <Text style={tw`text-white/80 text-center mb-4`}>
                    Personalize your experience (optional)
                  </Text>

                  <View style={tw`relative`}>
                    <TextInput
                      style={tw`bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white text-base`}
                      placeholder="Enter your name"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoCorrect={false}
                      maxLength={50}
                    />
                    {name.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setName('')}
                        style={tw`absolute right-3 top-3`}
                      >
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="rgba(255,255,255,0.6)"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={tw`px-6 pb-8`}>
          <View style={tw`flex-row justify-between items-center`}>
            {/* Previous Button */}
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentSlide === 0}
              style={tw`flex-row items-center px-6 py-3 rounded-full bg-white/20 ${
                currentSlide === 0 ? 'opacity-50' : ''
              }`}
            >
              <Ionicons name="chevron-back" size={20} color="white" />
              <Text style={tw`text-white font-medium ml-2`}>Back</Text>
            </TouchableOpacity>

            {/* Next/Get Started Button */}
            <TouchableOpacity
              onPress={isLastSlide ? handleGetStarted : handleNext}
              disabled={isLoading}
              style={tw`flex-row items-center px-8 py-4 rounded-full bg-white ${
                isLoading ? 'opacity-70' : ''
              }`}
            >
              {isLoading ? (
                <View style={tw`mr-2`}>
                  <Ionicons
                    name="hourglass"
                    size={20}
                    color={currentSlideData.gradient[0]}
                  />
                </View>
              ) : isLastSlide ? (
                <View style={tw`mr-2`}>
                  <Ionicons
                    name="rocket"
                    size={20}
                    color={currentSlideData.gradient[0]}
                  />
                </View>
              ) : (
                <View style={tw`mr-2`}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentSlideData.gradient[0]}
                  />
                </View>
              )}
              <Text
                style={[
                  tw`font-semibold text-base`,
                  { color: currentSlideData.gradient[0] },
                ]}
              >
                {isLastSlide ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
