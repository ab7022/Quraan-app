import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

// Islamic geometric patterns and decorative elements
export const GeometricPattern = ({ size = 40, color = '#E5E7EB', style }) => (
  <View style={[tw`items-center justify-center`, style]}>
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 8,
          borderWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        },
      ]}
    >
      <View
        style={[
          tw`absolute inset-2 rounded`,
          {
            borderWidth: 1,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />
    </View>
  </View>
);

export const IslamicStar = ({ size = 30, color = '#E5E7EB', style }) => (
  <View style={[tw`items-center justify-center`, style]}>
    <View style={{ transform: [{ rotate: '0deg' }] }}>
      <Ionicons name="star" size={size} color={color} />
    </View>
    <View style={[tw`absolute`, { transform: [{ rotate: '45deg' }] }]}>
      <Ionicons name="star-outline" size={size * 0.7} color={color} />
    </View>
  </View>
);

export const Crescent = ({ size = 30, color = '#E5E7EB', style }) => (
  <View style={[tw`items-center justify-center`, style]}>
    <Ionicons name="moon" size={size} color={color} />
  </View>
);

export const BookPattern = ({ size = 60, color = '#E5E7EB', style }) => (
  <View style={[tw`items-center justify-center`, style]}>
    <View style={{ opacity: 0.6 }}>
      <Ionicons name="book" size={size} color={color} />
    </View>
    <View
      style={[
        tw`absolute`,
        {
          top: -size * 0.1,
          left: size * 0.1,
          opacity: 0.3,
        },
      ]}
    >
      <Ionicons name="book-outline" size={size * 0.8} color={color} />
    </View>
  </View>
);

// Decorative border component
export const IslamicBorder = ({ children, style }) => (
  <View style={[tw`relative overflow-hidden`, style]}>
    {/* Corner decorations */}
    <View style={tw`absolute top-2 left-2 opacity-20`}>
      <GeometricPattern size={20} color="currentColor" />
    </View>
    <View style={tw`absolute top-2 right-2 opacity-20`}>
      <IslamicStar size={16} color="currentColor" />
    </View>
    <View style={tw`absolute bottom-2 left-2 opacity-20`}>
      <Crescent size={16} color="currentColor" />
    </View>
    <View style={tw`absolute bottom-2 right-2 opacity-20`}>
      <GeometricPattern size={20} color="currentColor" />
    </View>

    {children}
  </View>
);

export default {
  GeometricPattern,
  IslamicStar,
  Crescent,
  BookPattern,
  IslamicBorder,
};
