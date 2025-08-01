import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import rateLimitService from '../services/rateLimitService';

const RateLimitStatus = ({ visible = false }) => {
  const [status, setStatus] = useState({});
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (isVisible) {
      loadStatus();
    }
  }, [isVisible]);

  const loadStatus = async () => {
    try {
      const currentStatus = await rateLimitService.getRateLimitStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Error loading rate limit status:', error);
    }
  };

  const resetRateLimit = async endpoint => {
    try {
      await rateLimitService.resetRateLimit(endpoint);
      Alert.alert('Success', `Rate limit reset for ${endpoint}`);
      loadStatus(); // Reload status
    } catch (error) {
      console.error('Error resetting rate limit:', error);
      Alert.alert('Error', 'Failed to reset rate limit');
    }
  };

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={tw`absolute top-12 right-4 bg-gray-800 px-2 py-1 rounded opacity-20`}
        onPress={() => setIsVisible(true)}
      >
        <Text style={tw`text-white text-xs`}>RL</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={tw`absolute top-12 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50 w-64`}
    >
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <Text style={tw`font-bold text-sm`}>Rate Limit Status</Text>
        <TouchableOpacity onPress={() => setIsVisible(false)}>
          <Text style={tw`text-gray-500 font-bold`}>×</Text>
        </TouchableOpacity>
      </View>

      {Object.entries(status).map(([endpoint, data]) => (
        <View key={endpoint} style={tw`mb-3 p-2 bg-gray-50 rounded`}>
          <Text style={tw`font-semibold text-xs mb-1`}>{endpoint}</Text>

          {data.allowed ? (
            <View>
              <Text style={tw`text-green-600 text-xs`}>✓ Allowed</Text>
              <Text style={tw`text-gray-600 text-xs`}>
                Remaining: {data.remainingRequests}/{data.maxRequests}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={tw`text-red-600 text-xs`}>✗ Rate Limited</Text>
              <Text style={tw`text-gray-600 text-xs`}>
                Reset in: {rateLimitService.getTimeUntilReset(data.resetTime)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={tw`mt-1 bg-red-100 px-2 py-1 rounded`}
            onPress={() => resetRateLimit(endpoint)}
          >
            <Text style={tw`text-red-600 text-xs text-center`}>Reset</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={tw`bg-blue-500 px-3 py-1 rounded mt-2`}
        onPress={loadStatus}
      >
        <Text style={tw`text-white text-xs text-center`}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RateLimitStatus;
