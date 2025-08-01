import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import { getMushafStyle, saveMushafStyle, getMushafImageUrl } from '../services/mushafService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function MushafStyleScreen() {
      const insets = useSafeAreaInsets();
  
  const navigation = useNavigation();
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Load saved mushaf style preference
  useEffect(() => {
    loadMushafPreference();
  }, []);

  const loadMushafPreference = async () => {
    try {
      const style = await getMushafStyle();
      setSelectedStyle(style);
    } catch (error) {
      console.error('Error loading mushaf preference:', error);
      setSelectedStyle(9); // Default to style 9
    } finally {
      setLoading(false);
    }
  };

  const saveMushafPreference = async (styleNumber) => {
    try {
      console.log('[MUSHAF STYLE SCREEN] Saving mushaf preference:', styleNumber);
      const success = await saveMushafStyle(styleNumber);
      console.log('[MUSHAF STYLE SCREEN] Save result:', success);
      
      if (success) {
        Alert.alert(
          '✅ Style Selected',
          `Mushaf style ${styleNumber} saved successfully!`,
          [{ 
            text: 'OK',
            onPress: () => {
              // Navigate to Home immediately after user presses OK
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          }]
        );
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('[MUSHAF STYLE SCREEN] Error saving mushaf preference:', error);
      Alert.alert(
        'Error',
        'Failed to save your preference. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleStyleSelect = (styleNumber) => {
    console.log('[MUSHAF STYLE SCREEN] Style selected:', styleNumber);
    setSelectedStyle(styleNumber);
    saveMushafPreference(styleNumber);
  };

  const getPreviewImageUrl = (styleNumber) => {
    return getMushafImageUrl(22, styleNumber); // Use page 22 for preview
  };

  const handleImageLoadStart = (styleNumber) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [styleNumber]: true
    }));
  };

  const handleImageLoadEnd = (styleNumber) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [styleNumber]: false
    }));
  };

  const handleImageError = (styleNumber) => {
    console.warn(`Failed to load image for style ${styleNumber}`);
    setImageLoadingStates(prev => ({
      ...prev,
      [styleNumber]: false
    }));
  };

  const getStyleName = (styleNumber) => {
    const styleNames = {
      1: 'Classic Style',
      2: 'Modern Style',
      3: 'Traditional Style',
      4: 'Elegant Style',
      5: 'Simple Style',
      6: 'Bold Style',
      7: 'Clean Style',
      8: 'Refined Style',
      9: 'Standard Style',
      10: 'Premium Style',
      11: 'Deluxe Style',
    };
    return styleNames[styleNumber] || `Style ${styleNumber}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`} edges={['bottom', 'left', 'right']}>
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={tw`text-gray-600 mt-4`}>Loading Mushaf Styles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1 bg-gray-50`]}>
      {/* Header */}
      <View style={tw`bg-white px-6 py-4 border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`flex-row items-center`}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text style={tw`text-lg font-semibold text-gray-900 ml-2`}>
              Back
            </Text>
          </TouchableOpacity>

          <View style={tw`items-center`}>
            <Text style={tw`text-xl font-bold text-gray-900`}>
              Mushaf Styles
            </Text>
            <Text style={tw`text-sm text-gray-600`}>
              Choose your preferred style
            </Text>
          </View>

          <View style={tw`w-16`} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-6`}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View
          style={tw`bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200`}
        >
          <View style={tw`flex-row items-start`}>
            <View
              style={tw`w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3`}
            >
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-blue-900 font-semibold text-base mb-2`}>
                Select Your Mushaf Style
              </Text>
              <Text style={tw`text-blue-800 text-sm leading-5`}>
                Choose from different Mushaf styles below. Each style has a
                unique layout and design. Your selection will be applied to all
                Quran reading sessions.
              </Text>
            </View>
          </View>
        </View>

        {/* Current Selection */}
        {selectedStyle && (
          <View
            style={tw`bg-emerald-50 rounded-2xl p-4 mb-6 border border-emerald-200`}
          >
            <View style={tw`flex-row items-center`}>
              <View
                style={tw`w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3`}
              >
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-emerald-900 font-semibold text-base`}>
                  Currently Selected
                </Text>
                <Text style={tw`text-emerald-800 text-sm`}>
                  {getStyleName(selectedStyle)} (Style {selectedStyle})
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Mushaf Styles Grid */}
        <View style={tw`gap-6`}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(styleNumber => (
            <View
              key={styleNumber}
              style={[
                tw`bg-white rounded-2xl p-4 border-2`,
                selectedStyle === styleNumber
                  ? tw`border-emerald-500 bg-emerald-50`
                  : tw`border-gray-200`,
              ]}
            >
              {/* Style Header */}
              <View style={tw`flex-row items-center justify-between mb-4`}>
                <View style={tw`flex-row items-center`}>
                  <View
                    style={[
                      tw`w-8 h-8 rounded-full items-center justify-center mr-3`,
                      selectedStyle === styleNumber
                        ? tw`bg-emerald-500`
                        : tw`bg-gray-200`,
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-sm font-bold`,
                        selectedStyle === styleNumber
                          ? tw`text-white`
                          : tw`text-gray-600`,
                      ]}
                    >
                      {styleNumber}
                    </Text>
                  </View>
                  <View>
                    <Text style={tw`text-lg font-bold text-gray-900`}>
                      {getStyleName(styleNumber)}
                    </Text>
                    <Text style={tw`text-sm text-gray-600`}>
                      Style {styleNumber}
                    </Text>
                  </View>
                </View>

                {selectedStyle === styleNumber && (
                  <View style={tw`bg-emerald-100 rounded-full px-3 py-1`}>
                    <Text style={tw`text-emerald-700 text-xs font-semibold`}>
                      Selected
                    </Text>
                  </View>
                )}
              </View>

              {/* Preview Image */}
              <View style={tw`relative mb-4`}>
                <View
                  style={[
                    tw`rounded-xl overflow-hidden border border-gray-200`,
                    { height: width * 0.8 }, // Maintain aspect ratio
                  ]}
                >
                  {imageLoadingStates[styleNumber] && (
                    <View
                      style={tw`absolute inset-0 bg-gray-100 items-center justify-center z-10`}
                    >
                      <ActivityIndicator size="large" color="#8B5CF6" />
                      <Text style={tw`text-gray-600 mt-2 text-sm`}>
                        Loading preview...
                      </Text>
                    </View>
                  )}

                  <Image
                    source={{ uri: getPreviewImageUrl(styleNumber) }}
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f9fafb',
                    }}
                    resizeMode="contain"
                    onLoadStart={() => handleImageLoadStart(styleNumber)}
                    onLoadEnd={() => handleImageLoadEnd(styleNumber)}
                    onError={() => handleImageError(styleNumber)}
                  />
                </View>
              </View>

              {/* Select Button */}
              <TouchableOpacity
                onPress={() => handleStyleSelect(styleNumber)}
                disabled={selectedStyle === styleNumber}
                activeOpacity={0.8}
              >
                {selectedStyle === styleNumber ? (
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={tw`py-3 rounded-xl items-center justify-center flex-row`}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="white"
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-white font-bold text-base`}>
                      Selected
                    </Text>
                  </LinearGradient>
                ) : (
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={tw`py-3 rounded-xl items-center justify-center flex-row`}
                  >
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color="white"
                      style={tw`mr-2`}
                    />
                    <Text style={tw`text-white font-bold text-base`}>
                      Select This Mushaf
                    </Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bottom Info */}
        <View style={tw`bg-gray-100 rounded-2xl p-4 mt-6 mb-12`}>
          <View style={tw`flex-row items-start`}>
            <Ionicons
              name="bulb-outline"
              size={20}
              color="#6B7280"
              style={tw`mr-2 mt-0.5`}
            />
            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-800 font-semibold text-sm mb-1`}>
                Tip
              </Text>
              <Text style={tw`text-gray-700 text-sm leading-5`}>
                Try different styles to find the one that's most comfortable for
                your reading experience. You can change this anytime from your
                profile settings.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
