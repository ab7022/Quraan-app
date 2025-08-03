import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import analytics from '../services/analyticsService';
import { AlertManager } from '../components/AppleStyleAlert';

const SectionHeader = ({ title }) => (
  <View style={tw`px-4 py-3 bg-gray-100`}>
    <Text style={tw`text-sm font-medium text-gray-500 uppercase tracking-wide`}>
      {title}
    </Text>
  </View>
);

const FeatureItem = ({ icon, title, description, onPress, showChevron = true }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-white px-4 py-4 border-b border-gray-200`}
    activeOpacity={0.3}
  >
    <View style={tw`flex-row items-center`}>
      <View style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}>
        <Ionicons name={icon} size={20} color="#007AFF" />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-base font-medium text-black mb-1`}>
          {title}
        </Text>
        <Text style={tw`text-sm text-gray-500 leading-5`}>
          {description}
        </Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />}
    </View>
  </TouchableOpacity>
);

const StatItem = ({ number, label, color = "#007AFF" }) => (
  <View style={tw`flex-1 items-center`}>
    <Text style={[tw`text-2xl font-bold mb-1`, { color }]}>
      {number}
    </Text>
    <Text style={tw`text-sm text-gray-500 text-center`}>
      {label}
    </Text>
  </View>
);

const ContactButton = ({ icon, title, subtitle, onPress, color = "#007AFF" }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-white px-4 py-4 border-b border-gray-200`}
    activeOpacity={0.3}
  >
    <View style={tw`flex-row items-center`}>
      <View style={[tw`w-12 h-12 rounded-xl items-center justify-center mr-4`, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={tw`flex-1`}>
        <Text style={tw`text-lg font-medium text-black mb-1`}>
          {title}
        </Text>
        <Text style={tw`text-base text-gray-500`}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </View>
  </TouchableOpacity>
);

export default function LearnQuranScreen({ navigation }) {
  const phoneNumber = '8217003676';
  const customMessage = 'Hi! I am interested in learning Quran. Could you please share more details about the course?';

  const openWhatsApp = () => {
    const url = `whatsapp://send?phone=+91${phoneNumber}&text=${encodeURIComponent(customMessage)}`;
    
    analytics.trackUserAction('contact_whatsapp', {
      source: 'learn_quran_screen',
      timestamp: new Date().toISOString(),
    });

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          const webUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(customMessage)}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch(err => {
        console.error('Error opening WhatsApp:', err);
        AlertManager.alert(
          'WhatsApp Not Available',
          'Please install WhatsApp or contact us directly at: +91 ' + phoneNumber
        );
      });
  };

  const makePhoneCall = () => {
    const url = `tel:+91${phoneNumber}`;
    
    analytics.trackUserAction('contact_phone', {
      source: 'learn_quran_screen',
      timestamp: new Date().toISOString(),
    });

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          AlertManager.alert('Phone Not Available', 'Unable to make phone calls on this device');
        }
      })
      .catch(err => {
        console.error('Error making phone call:', err);
        AlertManager.alert('Error', 'Unable to make phone call');
      });
  };

  const handleBackPress = () => {
    navigation.goBack?.();
  };

  const features = [
    {
      icon: 'book',
      title: 'Perfect Tajweed',
      description: 'Master the art of beautiful Quranic recitation with expert guidance',
    },
    {
      icon: 'mic',
      title: 'Arabic Pronunciation',
      description: 'Learn authentic Arabic pronunciation from certified teachers',
    },
    {
      icon: 'musical-notes',
      title: 'Melodious Recitation',
      description: 'Develop your unique recitation style with personalized feedback',
    },
    {
      icon: 'bulb',
      title: 'Deep Understanding',
      description: 'Understand meanings and spiritual context of Quranic verses',
    },
    {
      icon: 'heart',
      title: 'Spiritual Growth',
      description: 'Strengthen your connection with Allah through guided learning',
    },
    {
      icon: 'trophy',
      title: 'Achievement Tracking',
      description: 'Earn recognition and certificates for your progress',
    },
  ];

  const benefits = [
    {
      icon: 'people',
      title: 'Expert Teachers',
      description: 'Learn from certified Qaris with years of experience',
    },
    {
      icon: 'time',
      title: 'Flexible Schedule',
      description: 'Choose learning times that work perfectly for you',
    },
    {
      icon: 'videocam',
      title: 'One-on-One Sessions',
      description: 'Get individual attention and customized feedback',
    },
    {
      icon: 'shield-checkmark',
      title: 'Proven Method',
      description: 'Time-tested teaching methodology for effective learning',
    },
  ];

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
      <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />
      
      {/* iOS-Style Navigation Header */}
      <View style={tw`bg-gray-100 border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between px-4 py-3`}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={tw`flex-row items-center py-1`}
            activeOpacity={0.3}
          >
            <Ionicons name="chevron-back" size={24} color="#007AFF" />
            <Text style={tw`text-lg text-blue-500 ml-1 font-normal`}>Back</Text>
          </TouchableOpacity>

          <Text style={tw`text-lg font-semibold text-black`}>
            Learn Quran
          </Text>

          <View style={tw`w-16`} />
        </View>
      </View>

      <ScrollView 
        style={tw`flex-1`} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-6`}
      >
        {/* Hero Section */}
        <View style={tw`mt-6`}>
          <SectionHeader title="Transform Your Journey" />
          <View style={tw`bg-white px-4 py-6`}>
            <View style={tw`items-center mb-6`}>
              <View style={tw`w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4`}>
                <Ionicons name="book" size={40} color="#34C759" />
              </View>
              <Text style={tw`text-xl font-bold text-black text-center mb-2`}>
                Master Beautiful Recitation
              </Text>
              <Text style={tw`text-base text-gray-500 text-center leading-6`}>
                Learn authentic Quran recitation with world-class teachers and personalized guidance
              </Text>
            </View>
            
            {/* Stats */}
            <View style={tw`flex-row border-t border-gray-200 pt-4`}>
              <StatItem number="1000+" label="Students" color="#007AFF" />
              <StatItem number="50+" label="Teachers" color="#34C759" />
              <StatItem number="4.9★" label="Rating" color="#FF8C00" />
            </View>
          </View>
        </View>

        {/* Free Trial Banner */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Special Offer" />
          <TouchableOpacity
            onPress={openWhatsApp}
            style={tw`bg-white px-4 py-4 border-b border-gray-200`}
            activeOpacity={0.3}
          >
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-12 h-12 rounded-xl bg-purple-100 items-center justify-center mr-4`}>
                <Ionicons name="gift" size={24} color="#8B5CF6" />
              </View>
              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <Text style={tw`text-lg font-bold text-black mr-2`}>
                    7-Day Free Trial
                  </Text>
                  <View style={tw`bg-orange-100 px-2 py-1 rounded-md`}>
                    <Text style={tw`text-xs font-bold text-orange-600`}>
                      LIMITED
                    </Text>
                  </View>
                </View>
                <Text style={tw`text-base text-gray-500`}>
                  Experience premium quality at zero cost
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>

        {/* What You'll Learn */}
        <View style={tw`mt-8`}>
          <SectionHeader title="What You'll Learn" />
          <View style={tw`bg-white`}>
            {features.map((feature, index) => (
              <FeatureItem
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                onPress={() => {}}
                showChevron={false}
              />
            ))}
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Why Choose Us" />
          <View style={tw`bg-white`}>
            {benefits.map((benefit, index) => (
              <FeatureItem
                key={benefit.title}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
                onPress={() => {}}
                showChevron={false}
              />
            ))}
          </View>
        </View>

        {/* Contact Methods */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Get Started Today" />
          <View style={tw`bg-white`}>
            <ContactButton
              icon="logo-whatsapp"
              title="WhatsApp"
              subtitle="Quick response via messaging"
              onPress={openWhatsApp}
              color="#25D366"
            />
            <ContactButton
              icon="call"
              title="Phone Call"
              subtitle={`+91 ${phoneNumber}`}
              onPress={makePhoneCall}
              color="#007AFF"
            />
          </View>
        </View>

        {/* Course Information */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Course Details" />
          <View style={tw`bg-white`}>
            <View style={tw`px-4 py-4 border-b border-gray-200`}>
              <View style={tw`flex-row items-start`}>
                <View style={tw`w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-3 mt-0.5`}>
                  <Ionicons name="checkmark" size={14} color="#34C759" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-black mb-1`}>
                    Personalized Learning Path
                  </Text>
                  <Text style={tw`text-sm text-gray-500 leading-5`}>
                    Customized curriculum based on your current level and goals
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={tw`px-4 py-4 border-b border-gray-200`}>
              <View style={tw`flex-row items-start`}>
                <View style={tw`w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-3 mt-0.5`}>
                  <Ionicons name="time" size={14} color="#007AFF" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-black mb-1`}>
                    Flexible Timing
                  </Text>
                  <Text style={tw`text-sm text-gray-500 leading-5`}>
                    Schedule classes at your convenience, 7 days a week
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={tw`px-4 py-4`}>
              <View style={tw`flex-row items-start`}>
                <View style={tw`w-6 h-6 rounded-full bg-purple-100 items-center justify-center mr-3 mt-0.5`}>
                  <Ionicons name="ribbon" size={14} color="#8B5CF6" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-black mb-1`}>
                    Certification
                  </Text>
                  <Text style={tw`text-sm text-gray-500 leading-5`}>
                    Receive recognized certificates upon course completion
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Ready to Start?" />
          <View style={tw`bg-white px-4 py-6`}>
            <Text style={tw`text-lg font-bold text-black text-center mb-2`}>
              Begin Your Quran Journey Today
            </Text>
            <Text style={tw`text-base text-gray-500 text-center mb-6 leading-6`}>
              Join thousands of students who transformed their recitation with our expert guidance
            </Text>
            
            <TouchableOpacity
              onPress={openWhatsApp}
              style={tw`bg-green-500 rounded-xl py-4 px-6 mb-3`}
              activeOpacity={0.8}
            >
              <View style={tw`flex-row items-center justify-center`}>
                <Ionicons name="logo-whatsapp" size={20} color="white" />
                <Text style={tw`text-white font-bold text-lg ml-2`}>
                  Start Free Trial
                </Text>
              </View>
            </TouchableOpacity>
            
            <Text style={tw`text-sm text-gray-500 text-center`}>
              No credit card required • 7-day free access
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
         