import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

const { width, height } = Dimensions.get('window');

export default function QiblaScreen({ navigation }) {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [distance, setDistance] = useState(null);
  const compassRotation = new Animated.Value(0);

  // Mecca coordinates
  const MECCA_LAT = 21.3891;
  const MECCA_LNG = 39.8579;

  useEffect(() => {
    requestPermissions();
    return () => {
      Magnetometer.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (hasPermission) {
      getCurrentLocation();
      subscribeMagnetometer();
    }
  }, [hasPermission]);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        Alert.alert(
          'Permission Required',
          'Location permission is required to find Qibla direction. Please enable location access in settings.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Permission error:', error);
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;
      setLocation({ latitude, longitude });
      
      const qiblaAngle = calculateQiblaDirection(latitude, longitude);
      setQiblaDirection(qiblaAngle);
      
      const distanceToMecca = calculateDistance(latitude, longitude, MECCA_LAT, MECCA_LNG);
      setDistance(distanceToMecca);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please make sure GPS is enabled.',
        [{ text: 'Retry', onPress: getCurrentLocation }, { text: 'Cancel' }]
      );
      setIsLoading(false);
    }
  };

  const subscribeMagnetometer = () => {
    Magnetometer.setUpdateInterval(100);
    Magnetometer.addListener((data) => {
      const { x, y } = data;
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = angle < 0 ? angle + 360 : angle;
      setHeading(angle);
      
      // Animate compass rotation
      Animated.timing(compassRotation, {
        toValue: -angle,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });
  };

  const calculateQiblaDirection = (lat, lng) => {
    const deltaLng = (MECCA_LNG - lng) * (Math.PI / 180);
    const lat1 = lat * (Math.PI / 180);
    const lat2 = MECCA_LAT * (Math.PI / 180);
    
    const x = Math.sin(deltaLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    let bearing = Math.atan2(x, y) * (180 / Math.PI);
    bearing = (bearing + 360) % 360;
    
    return bearing;
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance);
  };

  const getQiblaAngle = () => {
    return (qiblaDirection - heading + 360) % 360;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-amber-50`}>
        <View style={tw`flex-1 items-center justify-center`}>
          <View style={tw`animate-spin mb-4`}>
            <Ionicons name="compass-outline" size={64} color="#D97706" />
          </View>
          <Text style={tw`text-lg font-semibold text-amber-800`}>Finding Qibla...</Text>
          <Text style={tw`text-sm text-amber-600 mt-2 text-center px-6`}>
            Getting your location and compass data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={tw`flex-1 bg-amber-50`}>
        <View style={tw`flex-1 items-center justify-center px-6`}>
          <Ionicons name="location-outline" size={64} color="#D97706" style={tw`mb-4`} />
          <Text style={tw`text-lg font-bold text-amber-800 text-center mb-2`}>
            Location Permission Required
          </Text>
          <Text style={tw`text-sm text-amber-600 text-center mb-6`}>
            To find the Qibla direction, we need access to your location. Please enable location permissions in your device settings.
          </Text>
          <TouchableOpacity
            onPress={requestPermissions}
            style={tw`bg-amber-600 px-6 py-3 rounded-full`}
          >
            <Text style={tw`text-white font-semibold`}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-amber-50`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-6 py-4`}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={tw`w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm`}
        >
          <Ionicons name="chevron-back" size={24} color="#D97706" />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold text-amber-800`}>Qibla Finder</Text>
        <TouchableOpacity
          onPress={getCurrentLocation}
          style={tw`w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm`}
        >
          <Ionicons name="refresh" size={20} color="#D97706" />
        </TouchableOpacity>
      </View>

      {/* Main Compass Area */}
      <View style={tw`flex-1 items-center justify-center px-6`}>
        {/* Distance Info */}
        {distance && (
          <View style={tw`bg-white rounded-2xl p-4 mb-8 shadow-sm`}>
            <View style={tw`flex-row items-center justify-center`}>
              <Ionicons name="location" size={20} color="#059669" style={tw`mr-2`} />
              <Text style={tw`text-emerald-600 font-semibold`}>
                Distance to Mecca: {distance.toLocaleString()} km
              </Text>
            </View>
          </View>
        )}

        {/* Compass Container */}
        <View style={[styles.compassContainer, tw`mb-8`]}>
          {/* Compass Background */}
          <Animated.View
            style={[
              styles.compass,
              {
                transform: [{ rotate: compassRotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })}]
              }
            ]}
          >
            {/* Compass Markings */}
            {[...Array(36)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.compassMark,
                  {
                    transform: [{ rotate: `${i * 10}deg` }],
                    height: i % 9 === 0 ? 20 : i % 3 === 0 ? 15 : 10,
                    backgroundColor: i === 0 ? '#DC2626' : '#6B7280',
                    width: i % 9 === 0 ? 3 : 2,
                  }
                ]}
              />
            ))}
            
            {/* Cardinal Directions */}
            <Text style={[styles.cardinalText, { top: 10 }]}>N</Text>
            <Text style={[styles.cardinalText, { right: 10, top: '45%' }]}>E</Text>
            <Text style={[styles.cardinalText, { bottom: 10 }]}>S</Text>
            <Text style={[styles.cardinalText, { left: 10, top: '45%' }]}>W</Text>
          </Animated.View>

          {/* Qibla Direction Indicator */}
          <View
            style={[
              styles.qiblaIndicator,
              {
                transform: [{ rotate: `${getQiblaAngle()}deg` }]
              }
            ]}
          >
            <View style={styles.qiblaArrow}>
              <Ionicons name="navigate" size={40} color="#059669" />
            </View>
          </View>

          {/* Center Dot */}
          <View style={styles.centerDot} />
        </View>

        {/* Qibla Info */}
        <View style={tw`bg-white rounded-2xl p-6 w-full shadow-sm`}>
          <View style={tw`items-center mb-4`}>
            <Text style={tw`text-2xl font-bold text-amber-800 mb-2`}>
              {Math.round(getQiblaAngle())}°
            </Text>
            <Text style={tw`text-sm text-amber-600`}>Qibla Direction</Text>
          </View>
          
          <View style={tw`border-t border-gray-200 pt-4`}>
            <View style={tw`flex-row items-center justify-center`}>
              <Ionicons name="information-circle" size={16} color="#059669" style={tw`mr-2`} />
              <Text style={tw`text-sm text-gray-600 text-center`}>
                Point your device towards the green arrow to face Qibla
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Info */}
      <View style={tw`px-6 pb-6`}>
        <View style={tw`bg-emerald-50 rounded-xl p-4`}>
          <Text style={tw`text-sm text-emerald-800 text-center`}>
            🕌 Ensure your device is held flat and away from magnetic objects for accurate reading
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  compassContainer: {
    width: width * 0.8,
    height: width * 0.8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compass: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.4,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#D97706',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  compassMark: {
    position: 'absolute',
    top: 5,
    left: '50%',
    marginLeft: -1,
  },
  cardinalText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  qiblaIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  qiblaArrow: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D97706',
  },
});
