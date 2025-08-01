import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import tw from 'twrnc';

const { width, height } = Dimensions.get('window');

export default function LearnQuranScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(0);
  const phoneNumber = '8217003676';
  const customMessage =
    'Hi! I am interested in learning Quran. Could you please share more details about the course?';

  const openWhatsApp = () => {
    const url = `whatsapp://send?phone=+91${phoneNumber}&text=${encodeURIComponent(customMessage)}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to web WhatsApp
          const webUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(customMessage)}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch(err => {
        console.error('Error opening WhatsApp:', err);
        Alert.alert(
          'WhatsApp Not Available',
          'Please install WhatsApp or contact us directly at: +91 ' +
            phoneNumber,
          [{ text: 'OK' }]
        );
      });
  };

  const features = [
    {
      icon: 'book-open-variant',
      title: 'Perfect Tajweed',
      description: 'Master the art of beautiful Quranic recitation',
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
    },
    {
      icon: 'account-voice',
      title: 'Arabic Mastery',
      description: 'Learn authentic Arabic pronunciation',
      color: '#3B82F6',
      gradient: ['#3B82F6', '#1D4ED8'],
    },
    {
      icon: 'music-note',
      title: 'Melodious Recitation',
      description: 'Develop your unique recitation style',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#7C3AED'],
    },
    {
      icon: 'lightbulb-on',
      title: 'Deep Understanding',
      description: 'Understand meanings and spiritual context',
      color: '#EF4444',
      gradient: ['#EF4444', '#DC2626'],
    },
    {
      icon: 'heart',
      title: 'Spiritual Growth',
      description: 'Strengthen your connection with Allah',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#D97706'],
    },
    {
      icon: 'trophy',
      title: 'Achievement',
      description: 'Earn recognition for your progress',
      color: '#06B6D4',
      gradient: ['#06B6D4', '#0891B2'],
    },
  ];

  const testimonials = [
    {
      name: 'Aisha Rahman',
      text: 'My recitation transformed completely! The teachers are incredibly patient and knowledgeable.',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1494790108755-2616c96c48e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      course: 'Tajweed Mastery',
    },
    {
      name: 'Muhammad Ali',
      text: 'Best investment I made for my spiritual journey. Highly recommend to everyone!',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      course: 'Complete Quran Course',
    },
    {
      name: 'Fatima Khan',
      text: 'The 7-day trial convinced me. Now I can recite with confidence and beauty!',
      rating: 5,
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      course: 'Arabic Fundamentals',
    },
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      {/* Floating Header with Blur Effect */}
      <BlurView
        intensity={95}
        tint="light"
        style={tw`absolute top-0 left-0 right-0 z-50`}
      >
        <SafeAreaView>
          <View style={tw`px-6 py-4 flex-row items-center`}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={tw`mr-4 p-2 rounded-full bg-white/20 backdrop-blur-sm`}
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={tw`text-xl font-bold text-gray-900 flex-1`}>
              Learn Quran - For Everyone
            </Text>
            <TouchableOpacity style={tw`p-2 rounded-full bg-white/20`}>
              <Ionicons name="heart-outline" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>

      <ScrollView
        style={tw`flex-1 pt-20`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-8`}
      >
        {/* Hero Section with Parallax Effect */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          }}
          style={tw`mx-6 mt-6 rounded-3xl overflow-hidden`}
          imageStyle={tw`opacity-30`}
        >
          <LinearGradient
            colors={[
              'rgba(16, 185, 129, 0.9)',
              'rgba(5, 150, 105, 0.95)',
              'rgba(4, 120, 87, 1)',
            ]}
            style={tw`p-8`}
          >
            <Animatable.View animation="fadeInUp" delay={200}>
              <View style={tw`items-center mb-6`}>
                <Animatable.View
                  animation="pulse"
                  iterationCount="infinite"
                  style={tw`w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-6 shadow-2xl`}
                >
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={48}
                    color="white"
                  />
                </Animatable.View>
                <Text
                  style={tw`text-3xl font-bold text-white text-center mb-3`}
                >
                  Transform Your
                  <Text style={tw`text-yellow-300`}> Quran Journey</Text>
                </Text>
                <Text
                  style={tw`text-white/90 text-center text-lg leading-7 max-w-sm`}
                >
                  Master the art of beautiful recitation with world-class
                  teachers and personalized guidance
                </Text>
              </View>

              {/* Floating Stats */}
              <View style={tw`flex-row justify-between mt-6`}>
                {[
                  { number: '1k+', label: 'Students' },
                  { number: '50+', label: 'Teachers' },
                  { number: '4.9★', label: 'Rating' },
                ].map((stat, index) => (
                  <Animatable.View
                    key={stat.label}
                    animation="fadeInUp"
                    delay={400 + index * 100}
                    style={tw`bg-white/15 backdrop-blur-sm rounded-2xl p-4 flex-1 mx-1 items-center`}
                  >
                    <Text style={tw`text-2xl font-bold text-white`}>
                      {stat.number}
                    </Text>
                    <Text style={tw`text-white/80 text-sm`}>{stat.label}</Text>
                  </Animatable.View>
                ))}
              </View>
            </Animatable.View>
          </LinearGradient>
        </ImageBackground>

        {/* Free Trial Banner with Animation */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <TouchableOpacity onPress={openWhatsApp} activeOpacity={0.9}>
            <View style={tw`mx-6 mt-6 rounded-3xl overflow-hidden shadow-2xl`}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={tw`p-6`}
              >
                <View style={tw`flex-row items-center`}>
                  <Animatable.View
                    animation="rotate"
                    iterationCount="infinite"
                    duration={3000}
                    style={tw`w-16 h-16 bg-white/20 rounded-full items-center justify-center mr-4`}
                  >
                    <MaterialCommunityIcons
                      name="gift"
                      size={32}
                      color="white"
                    />
                  </Animatable.View>
                  <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center mb-2`}>
                      <Text style={tw`text-xl font-bold text-white mr-2`}>
                        FREE Trial
                      </Text>
                      <View style={tw`bg-yellow-400 px-3 py-1 rounded-full`}>
                        <Text style={tw`text-xs font-bold text-gray-900`}>
                          7 DAYS
                        </Text>
                      </View>
                    </View>
                    <Text style={tw`text-white/90 text-base font-medium`}>
                      Experience premium quality at zero cost!
                    </Text>
                  </View>
                  <Animatable.View
                    animation="pulse"
                    iterationCount="infinite"
                    duration={1500}
                  >
                    <MaterialCommunityIcons
                      name="arrow-right-circle"
                      size={32}
                      color="white"
                    />
                  </Animatable.View>
                </View>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </Animatable.View>

        {/* Interactive Features Grid */}
        <View style={tw`mx-6 mt-8`}>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-6`}>
            What You'll Master
          </Text>
          <View style={tw`flex-row flex-wrap -mx-2`}>
            {features.map((feature, index) => (
              <Animatable.View
                key={feature.title}
                animation="fadeInUp"
                delay={800 + index * 100}
                style={tw`w-1/2 px-2 mb-4`}
              >
                <TouchableOpacity
                  style={tw`bg-white rounded-3xl p-4 border border-gray-100 h-44`}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={feature.gradient}
                    style={tw`w-12 h-12 rounded-xl items-center justify-center mb-3`}
                  >
                    <MaterialCommunityIcons
                      name={feature.icon}
                      size={24}
                      color="white"
                    />
                  </LinearGradient>
                  <Text
                    style={tw`text-base font-bold text-gray-900 mb-2 leading-tight`}
                    numberOfLines={2}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={tw`text-xs text-gray-600 leading-4`}
                    numberOfLines={3}
                  >
                    {feature.description}
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </View>

        {/* Why Choose Us with Icons */}
        <View style={tw`mx-6 mt-12`}>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-6`}>
            Why We're Different
          </Text>
          <View style={tw`bg-white rounded-3xl p-6 border border-gray-100`}>
            {[
              {
                icon: 'account-star',
                text: 'World-Class Expert Teachers',
                color: '#10B981',
                desc: 'Learn from certified Qaris with years of experience',
              },
              {
                icon: 'clock-fast',
                text: 'Flexible Learning Schedule',
                color: '#3B82F6',
                desc: 'Choose times that work perfectly for you',
              },
              {
                icon: 'video-account',
                text: 'Personal One-on-One Sessions',
                color: '#8B5CF6',
                desc: 'Get individual attention and customized feedback',
              },
              {
                icon: 'trophy-award',
                text: 'Achievement Recognition',
                color: '#EF4444',
                desc: 'Earn certificates and track your progress',
              },
              {
                icon: 'heart-pulse',
                text: 'Spiritual Growth Focus',
                color: '#F59E0B',
                desc: 'Connect deeply with the Quran and your faith',
              },
            ].map((item, index) => (
              <Animatable.View
                key={item.text}
                animation="fadeInRight"
                delay={1000 + index * 150}
              >
                <View
                  style={tw`flex-row items-start mb-6 ${index < 4 ? 'border-b border-gray-100 pb-6' : ''}`}
                >
                  <LinearGradient
                    colors={[item.color, item.color + '80']}
                    style={tw`w-12 h-12 rounded-xl items-center justify-center mr-4`}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color="white"
                    />
                  </LinearGradient>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-base font-bold text-gray-900 mb-1`}>
                      {item.text}
                    </Text>
                    <Text style={tw`text-sm text-gray-600 leading-5`}>
                      {item.desc}
                    </Text>
                  </View>
                  <Animatable.View
                    animation="pulse"
                    iterationCount="infinite"
                    duration={2000}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10B981"
                    />
                  </Animatable.View>
                </View>
              </Animatable.View>
            ))}
          </View>
        </View>

        {/* Modern Contact Section */}
        <View style={tw`mx-6 mt-12`}>
          <View style={tw`text-center mb-8`}>
            <Text style={tw`text-3xl font-bold text-gray-900 mb-3`}>
              Ready to Transform?
            </Text>
            <Text style={tw`text-gray-600 text-lg leading-7`}>
              Join thousands learning beautiful Quran recitation
            </Text>
          </View>

          {/* Main CTA Card */}
          <View style={tw`bg-gradient-to-br rounded-3xl overflow-hidden mb-6`}>
            <LinearGradient
              colors={['#10B981', '#059669', '#047857']}
              style={tw`p-8`}
            >
              <View style={tw`items-center`}>
                <View style={tw`bg-white/20 rounded-full p-4 mb-6`}>
                  <MaterialCommunityIcons
                    name="whatsapp"
                    size={32}
                    color="white"
                  />
                </View>

                <Text
                  style={tw`text-2xl font-bold text-white text-center mb-2`}
                >
                  Start Your Journey Today
                </Text>
                <Text
                  style={tw`text-white/90 text-center mb-6 text-base leading-6`}
                >
                  Connect instantly with our expert teachers on WhatsApp
                </Text>

                <TouchableOpacity
                  onPress={openWhatsApp}
                  style={tw`bg-white rounded-2xl px-8 py-4 mb-4`}
                  activeOpacity={0.9}
                >
                  <View style={tw`flex-row items-center`}>
                    <FontAwesome5
                      name="whatsapp"
                      size={24}
                      color="#25D366"
                      style={tw`mr-3`}
                    />
                    <Text style={tw`text-gray-900 font-bold text-lg`}>
                      Contact Us Now
                    </Text>
                    <Animatable.View
                      animation="bounceIn"
                      iterationCount="infinite"
                      duration={2000}
                      style={tw`ml-3`}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#10B981"
                      />
                    </Animatable.View>
                  </View>
                </TouchableOpacity>
                <Text style={tw`text-white/90 text-sm text-center`}>
                  Or call us at:{' '}
                  <Text style={tw`text-white font-bold`}>
                    +91 {phoneNumber}
                  </Text>
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Info Cards */}
          <View style={tw`flex-row gap-3 mb-20`}>
            {[
              {
                icon: 'clock-time-four',
                text: '7-Day Free Trial',
                color: '#3B82F6',
              },
              { icon: 'shield-check', text: '100% Secure', color: '#10B981' },
              {
                icon: 'account-heart',
                text: '1000+ Students',
                color: '#EF4444',
              },
            ].map((item, index) => (
              <Animatable.View
                key={item.text}
                animation="fadeInUp"
                delay={200 * index}
                style={tw`flex-1 bg-white rounded-2xl p-4 border border-gray-100 items-center`}
              >
                <LinearGradient
                  colors={[item.color, item.color + '80']}
                  style={tw`w-10 h-10 rounded-full items-center justify-center mb-2`}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color="white"
                  />
                </LinearGradient>
                <Text
                  style={tw`text-xs font-semibold text-gray-700 text-center`}
                >
                  {item.text}
                </Text>
              </Animatable.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
