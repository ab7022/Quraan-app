import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '../services/analyticsService';

export default function OnboardingScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      if (name.trim()) {
        await AsyncStorage.setItem('user_name', name.trim());
        analytics.trackUserAction('onboarding_completed', { 
          has_name: true,
          name_length: name.trim().length 
        });
      } else {
        analytics.trackUserAction('onboarding_completed', { 
          has_name: false 
        });
      }
      
      // Mark onboarding as completed
      await AsyncStorage.setItem('onboarding_completed', 'true');
      
      setTimeout(() => {
        setIsLoading(false);
        onComplete();
      }, 500);
      
    } catch (error) {
      console.log('Error saving onboarding data:', error);
      setIsLoading(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Setup',
      'You can always add your name later in the Profile section.',
      [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Skip', onPress: handleContinue }
      ]
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-gray-900`}>
      <KeyboardAvoidingView 
        style={tw`flex-1`} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={tw`flex-1 px-6 justify-center`}>
          {/* Header */}
          <View style={tw`items-center mb-12`}>
            <View style={tw`w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mb-6`}>
              <Ionicons name="book" size={48} color="#059669" />
            </View>
            <Text style={tw`text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-3`}>
              Welcome to Qur'an App
            </Text>
            <Text style={tw`text-lg text-gray-600 dark:text-gray-400 text-center leading-relaxed`}>
              Your personal companion for reading and learning the Holy Qur'an
            </Text>
          </View>

          {/* Name Input Section */}
          <View style={tw`mb-12`}>
            <Text style={tw`text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3`}>
              What should we call you?
            </Text>
            <Text style={tw`text-base text-gray-600 dark:text-gray-400 mb-6`}>
              Enter your name to personalize your experience (optional)
            </Text>
            
            <View style={tw`relative`}>
              <TextInput
                style={tw`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-lg text-gray-900 dark:text-gray-100`}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={50}
              />
              {name.length > 0 && (
                <TouchableOpacity
                  onPress={() => setName('')}
                  style={tw`absolute right-3 top-4`}
                >
                  <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`gap-4`}>
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isLoading}
              style={tw`bg-green-600 rounded-xl py-4 px-6 ${isLoading ? 'opacity-70' : ''}`}
              activeOpacity={0.8}
            >
              <View style={tw`flex-row items-center justify-center`}>
                {isLoading ? (
                  <View style={tw`mr-2`}>
                    <Ionicons name="hourglass" size={20} color="white" />
                  </View>
                ) : (
                  <View style={tw`mr-2`}>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </View>
                )}
                <Text style={tw`text-white text-lg font-semibold`}>
                  {name.trim() ? 'Continue' : 'Continue without name'}
                </Text>
              </View>
            </TouchableOpacity>

            {name.trim().length > 0 && (
              <TouchableOpacity
                onPress={handleSkip}
                style={tw`bg-gray-100 dark:bg-gray-800 rounded-xl py-4 px-6`}
                activeOpacity={0.7}
              >
                <View style={tw`flex-row items-center justify-center`}>
                  <Ionicons name="arrow-forward" size={20} color="#6B7280" style={tw`mr-2`} />
                  <Text style={tw`text-gray-700 dark:text-gray-300 text-lg font-medium`}>
                    Skip for now
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={tw`mt-12 items-center`}>
            <Text style={tw`text-sm text-gray-500 dark:text-gray-500 text-center`}>
              You can always change your name later in Profile settings
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
