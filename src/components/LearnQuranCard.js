import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import tw from 'twrnc';

export default function LearnQuranCard({ navigation }) {
  return (
    <View>
      <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>For Everyone</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('LearnQuran')}
        style={tw`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
          style={tw`rounded-2xl overflow-hidden`}
          imageStyle={tw`opacity-20`}
        >
          <LinearGradient
            colors={['#059669', '#047857', '#065f46']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`p-4`}
          >
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4`}>
                <MaterialCommunityIcons name="book-open-variant" size={32} color="white" />
              </View>
              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <Text style={tw`text-lg font-bold text-white mr-2`}>
                    Learn Quran
                  </Text>
                  <View style={tw`bg-emerald-600 px-2 py-1 rounded-full`}>
                    <Text style={tw`text-xs font-bold text-white`}>START</Text>
                  </View>
                </View>
                <Text style={tw`text-white/90 text-sm mb-2 leading-5`}>
                  Learn to read Quran beautifully with correct pronunciation
                </Text>
                <View style={tw`flex-row items-center`}>
                  <MaterialCommunityIcons name="star-circle" size={14} color="white" style={tw`mr-1`} />
                  <Text style={tw`text-white/90 text-xs font-medium`}>
                    Try free for 7 days!
                  </Text>
                </View>
              </View>
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                duration={2000}
              >
                <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
              </Animatable.View>
            </View>
          </LinearGradient>
        </ImageBackground>
        
        {/* Bottom section with features */}
        <View style={tw`p-4 bg-emerald-50`}>
          <View style={tw`flex-row justify-between items-center`}>
            {[
              { icon: 'account-voice', text: 'Tajweed' },
              { icon: 'lightbulb-on', text: 'Meaning' },
              { icon: 'trophy', text: 'Progress' }
            ].map((feature, index) => (
              <View key={feature.text} style={tw`items-center flex-1`}>
                <MaterialCommunityIcons 
                  name={feature.icon} 
                  size={16} 
                  color="#047857" 
                  style={tw`mb-1`}
                />
                <Text style={tw`text-xs text-emerald-700 font-medium`}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
