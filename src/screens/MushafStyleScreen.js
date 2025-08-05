import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { getMushafStyle, saveMushafStyle, getMushafImageUrl, getStyleName } from '../services/mushafService';
import analytics from '../services/analyticsService';
import { IOSLoader, IOSInlineLoader } from '../components/IOSLoader';
import { AlertManager } from '../components/AppleStyleAlert';

const { width } = Dimensions.get('window');

const SectionHeader = ({ title }) => (
  <View style={tw`px-4 py-2 bg-gray-100`}>
    <Text style={tw`text-sm text-gray-500 uppercase font-normal tracking-wide`}>
      {title}
    </Text>
  </View>
);

const StyleCard = ({
  styleNumber,
  isSelected,
  onPress,
  styleName,
  isLoading,
  onImageLoadStart,
  onImageLoadEnd,
  onImageError,
}) => {
  const cardWidth = (width - 48) / 2; // 48 = padding (16*2) + gap (16)
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        tw`bg-white rounded-xl overflow-hidden`,
        { width: cardWidth },
        // Apple-style shadow
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }
      ]}
      activeOpacity={0.95}
    >
      {/* Style Preview Image - Much Larger */}
      <View style={tw`relative`}>
        <View style={[tw`bg-gray-50 items-center justify-center`, { height: 180 }]}>
          {isLoading && (
            <View style={tw`absolute inset-0 bg-gray-50 items-center justify-center z-10`}>
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
        
        {/* Checkmark - Filled when selected, outline when not */}
        <View style={tw`absolute top-3 right-3`}>
          {isSelected ? (
            <Ionicons 
              name="checkmark-circle" 
              size={28} 
              color="#3c69e4ff" 
            />
          ) : (
            <Ionicons 
              name="checkmark-circle-outline" 
              size={28} 
              color="#38393bff" 
            />
          )}
        </View>
      </View>

      {/* Compact Card Content */}
      <View style={tw`px-3 py-2.5`}>
        <Text style={tw`text-sm font-semibold text-gray-900 text-center mb-0.5`} numberOfLines={1}>
          {styleName}
        </Text>
        <Text style={tw`text-xs text-gray-500 text-center`}>
          Style {styleNumber}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

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
      setSelectedStyle('hafizi'); // Default to hafizi style
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
        
        AlertManager.alert(
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
      AlertManager.alert(
        'Error',
        'Failed to save your preference. Please try again.'
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

  const handleHafiziSelect = async () => {
    try {
      setLoading(true);
      
      // Save the Hafizi mushaf style
      await saveMushafStyle('hafizi');
      
      // Update local state
      setSelectedStyle('hafizi');
      
      // Show success feedback
      AlertManager.alert(
        'Mushaf Updated',
        'Hafizi Mushaf has been selected successfully.',
        [
          {
            text: 'Continue Reading',
            onPress: () => {
              navigation.navigate('Quran', {
                screen: 'QuranPage',
                params: {
                  initialPage: 1,
                  mushafStyle: 'hafizi'
                }
              });
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error selecting Hafizi mushaf:', error);
      AlertManager.alert(
        'Error',
        'Failed to select Hafizi mushaf. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to chunk array into pairs
  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-100`}>
        <StatusBar backgroundColor="#f3f4f6" barStyle="dark-content" />
        <IOSLoader 
          title="Loading Styles"
          subtitle="Please wait while we load Mushaf styles"
          overlay={false}
        />
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
              <View style={tw`px-4 py-4 bg-white`}>
                <View style={[
                  tw`bg-white rounded-2xl overflow-hidden`,
                  {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 5,
                  }
                ]}>
                  {/* Style Preview Image */}
                  <View style={tw`relative`}>
                    <View style={[tw`bg-gray-50 items-center justify-center`, { height: 200 }]}>
                      <Image
                        source={{ 
                          uri: selectedStyle === 'hafizi' 
                            ? 'https://assets.devlop.app/page1_img1.png'
                            : getMushafImageUrl(22, selectedStyle)
                        }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </View>
                    
                    {/* Active Badge */}
                    <View style={tw`absolute top-4 right-4 bg-green-500 rounded-full px-3 py-1.5 flex-row items-center`}>
                      <Ionicons name="checkmark-circle" size={14} color="white" />
                      <Text style={tw`text-white text-xs font-medium ml-1`}>Active</Text>
                    </View>
                  </View>

                  {/* Compact Card Content */}
                  <View style={tw`px-4 py-4`}>
                    <Text style={tw`text-lg font-semibold text-gray-900 text-center mb-1`}>
                      {getStyleName(selectedStyle)}
                    </Text>
                    <Text style={tw`text-sm text-gray-500 text-center mb-3`}>
                      Style {selectedStyle}
                    </Text>
                    
                    <View style={tw`bg-green-50 rounded-xl p-3 flex-row items-center justify-center`}>
                      <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                      <Text style={tw`text-green-700 font-medium text-sm ml-2`}>
                        Currently Active
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Available Styles Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Special Formats" />
          <View style={tw`px-4 py-6 bg-white`}>
            {/* Hafizi Mushaf */}
            <TouchableOpacity
              onPress={() => handleHafiziSelect()}
              style={[
                tw`bg-white rounded-2xl p-4 mb-4 border-2`,
                selectedStyle === 'hafizi' ? tw`border-blue-500` : tw`border-gray-200`,
                {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }
              ]}
            >
              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg font-semibold text-gray-900 mb-1`}>
                    Hafizi Mushaf
                  </Text>
                  <Text style={tw`text-sm text-gray-600 mb-2`}>
                    IndoPak Mushaf • 612 pages • Clear typography
                  </Text>
                  <View style={tw`bg-green-100 rounded-lg px-3 py-1.5 self-start`}>
                    <Text style={tw`text-green-700 text-xs font-medium`}>
                      Image Format
                    </Text>
                  </View>
                  {selectedStyle === 'hafizi' && (
                    <View style={tw`bg-blue-50 rounded-lg px-3 py-1.5 mt-2 self-start`}>
                      <Text style={tw`text-blue-700 text-xs font-medium`}>
                        ✓ Currently Active
                      </Text>
                    </View>
                  )}
                </View>
                <View style={tw`ml-4`}>
                  {selectedStyle === 'hafizi' ? (
                    <View style={tw`bg-blue-500 rounded-full p-2`}>
                      <Ionicons 
                        name="checkmark" 
                        size={20} 
                        color="white" 
                      />
                    </View>
                  ) : (
                    <Ionicons 
                      name="image-outline" 
                      size={24} 
                      color="#007AFF" 
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Regular Styles Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Available Styles" />
          <View style={tw`px-4 py-6 bg-white`}>
            {chunkArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 2).map((pair, rowIndex) => (
              <View key={rowIndex} style={tw`flex-row justify-between mb-5`}>
                {pair.map((styleNumber) => (
                  <StyleCard
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
                {/* Fill empty space if odd number of items in last row */}
                {pair.length === 1 && <View style={{ width: (width - 48) / 2 }} />}
              </View>
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
