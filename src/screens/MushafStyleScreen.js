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
import { getMushafStyle, saveMushafStyle, getMushafImageUrl } from '../services/mushafService';
import analytics from '../services/analyticsService';

const { width } = Dimensions.get('window');

const SectionHeader = ({ title }) => (
  <View style={tw`px-4 py-2 bg-gray-100`}>
    <Text style={tw`text-sm text-gray-500 uppercase font-normal tracking-wide`}>
      {title}
    </Text>
  </View>
);

const StyleItem = ({
  styleNumber,
  isSelected,
  onPress,
  styleName,
  isLoading,
  onImageLoadStart,
  onImageLoadEnd,
  onImageError,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      tw`bg-white px-4 py-4 border-b border-gray-200`,
      isSelected && tw`bg-blue-50`
    ]}
    activeOpacity={0.3}
  >
    <View style={tw`flex-row items-center`}>
      {/* Style Preview Thumbnail */}
      <View style={tw`w-16 h-20 rounded-lg overflow-hidden bg-gray-100 mr-4 border border-gray-200`}>
        {isLoading && (
          <View style={tw`absolute inset-0 bg-gray-100 items-center justify-center z-10`}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
        <Image
          source={{ uri: getMushafImageUrl(22, styleNumber) }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onLoadStart={onImageLoadStart}
          onLoadEnd={onImageLoadEnd}
          onError={onImageError}
        />
      </View>

      {/* Style Info */}
      <View style={tw`flex-1`}>
        <Text style={tw`text-base font-medium text-black mb-1`}>
          {styleName}
        </Text>
        <Text style={tw`text-sm text-gray-500`}>
          Style {styleNumber}
        </Text>
        {isSelected && (
          <Text style={tw`text-sm text-blue-500 mt-1 font-medium`}>
            Currently Selected
          </Text>
        )}
      </View>

      {/* Selection Indicator */}
      {isSelected ? (
        <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
      )}
    </View>
  </TouchableOpacity>
);

export default function MushafStyleScreen() {
  const navigation = useNavigation();
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  // Load saved mushaf style preference
  useEffect(() => {
    console.log('[MUSHAF STYLE SCREEN] Component mounted');
    analytics.trackScreenView('MushafStyleScreen', {
      current_style: selectedStyle,
    });
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
        analytics.trackUserAction('mushaf_style_changed', {
          old_style: selectedStyle,
          new_style: styleNumber,
        });
        
        Alert.alert(
          'Style Updated',
          `${getStyleName(styleNumber)} has been selected as your Mushaf style.`,
          [{ 
            text: 'OK',
            onPress: () => {
              navigation.goBack();
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
    if (selectedStyle === styleNumber) return; // Already selected
    
    console.log('[MUSHAF STYLE SCREEN] Style selected:', styleNumber);
    setSelectedStyle(styleNumber);
    saveMushafPreference(styleNumber);
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
      1: 'Classic',
      2: 'Modern',
      3: 'Traditional',
      4: 'Elegant',
      5: 'Simple',
      6: 'Bold',
      7: 'Clean',
      8: 'Refined',
      9: 'Standard',
      10: 'Premium',
      11: 'Deluxe',
    };
    return styleNames[styleNumber] || `Style ${styleNumber}`;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-100`}>
        <StatusBar backgroundColor="#f3f4f6" barStyle="dark-content" />
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={tw`text-gray-600 mt-4 text-base`}>Loading Mushaf Styles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {/* iOS-Style Header */}
      <View style={tw`bg-gray-100 px-4 py-2`}>
        <View style={tw`flex-row items-center justify-between`}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={tw`py-2`}
            accessibilityLabel="Go back"
          >
            <View style={tw`flex-row items-center`}>
              <Ionicons name="chevron-back" size={28} color="#007AFF" />
              <Text style={tw`text-lg text-blue-500 ml-1`}>Settings</Text>
            </View>
          </TouchableOpacity>

          <Text style={tw`text-lg font-semibold text-black`}>
            Mushaf Style
          </Text>

          <View style={tw`w-20`} />
        </View>
      </View>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Current Selection Section */}
        {selectedStyle && (
          <>
            <View style={tw`mt-6`}>
              <SectionHeader title="Current Selection" />
              <View style={tw`bg-white border-t border-gray-200`}>
                <View style={tw`px-4 py-4 border-b border-gray-200`}>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`w-16 h-20 rounded-lg overflow-hidden bg-gray-100 mr-4 border border-gray-200`}>
                      <Image
                        source={{ uri: getMushafImageUrl(22, selectedStyle) }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-lg font-medium text-black mb-1`}>
                        {getStyleName(selectedStyle)}
                      </Text>
                      <Text style={tw`text-base text-gray-500 mb-2`}>
                        Style {selectedStyle}
                      </Text>
                      <View style={tw`flex-row items-center`}>
                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                        <Text style={tw`text-sm text-green-600 ml-1 font-medium`}>
                          Currently Active
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Available Styles Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Available Styles" />
          <View style={tw`bg-white border-t border-gray-200`}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((styleNumber, index) => (
              <StyleItem
                key={styleNumber}
                styleNumber={styleNumber}
                styleName={getStyleName(styleNumber)}
                isSelected={selectedStyle === styleNumber}
                isLoading={imageLoadingStates[styleNumber]}
                onPress={() => handleStyleSelect(styleNumber)}
                onImageLoadStart={() => handleImageLoadStart(styleNumber)}
                onImageLoadEnd={() => handleImageLoadEnd(styleNumber)}
                onImageError={() => handleImageError(styleNumber)}
              />
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="About Mushaf Styles" />
          <View style={tw`bg-white border-t border-gray-200`}>
            <View style={tw`px-4 py-4`}>
              <Text style={tw`text-base text-black mb-3 font-medium`}>
                Choose Your Reading Experience
              </Text>
              <Text style={tw`text-sm text-gray-600 leading-relaxed`}>
                Each Mushaf style provides a unique layout and design for your Quran reading experience. The style you select will be applied to all your reading sessions. You can change this setting anytime.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={tw`h-20`} />
      </ScrollView>
    </SafeAreaView>
  );
}
