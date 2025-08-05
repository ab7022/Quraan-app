import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export const IOSLoader = ({
  title = 'Loading...',
  subtitle = 'Please wait',
  size = 'large',
  overlay = true,
}) => (
  <View
    style={[
      overlay
        ? tw`absolute inset-0 bg-gray-100 bg-opacity-95 justify-center items-center z-50`
        : tw`flex-1 justify-center items-center`,
    ]}
  >
    <View
      style={tw`bg-white rounded-2xl p-8 shadow-lg items-center mx-8 max-w-sm w-full`}
    >
      <View
        style={tw`w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-6`}
      >
        <ActivityIndicator size={size} color="#007AFF" />
      </View>
      <Text style={tw`text-xl font-semibold text-black mb-2 text-center`}>
        {title}
      </Text>
      <Text style={tw`text-base text-gray-500 text-center leading-6`}>
        {subtitle}
      </Text>
    </View>
  </View>
);

export const IOSProgressLoader = ({
  title = 'Processing...',
  subtitle = 'Please wait while we process your request',
  steps = [],
  currentStep = 0,
  overlay = true,
}) => (
  <View
    style={[
      overlay
        ? tw`absolute inset-0 bg-gray-100 bg-opacity-95 justify-center items-center z-50`
        : tw`flex-1 justify-center items-center`,
    ]}
  >
    <View
      style={tw`bg-white rounded-2xl p-10 shadow-lg items-center mx-4 max-w-sm w-full`}
    >
      <View
        style={tw`w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-8`}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>

      <Text style={tw`text-2xl font-semibold text-black mb-3 text-center`}>
        {title}
      </Text>

      <Text style={tw`text-base text-gray-500 mb-8 text-center leading-6`}>
        {subtitle}
      </Text>

      {/* Progress Steps */}
      {steps.length > 0 && (
        <View style={tw`w-full`}>
          {steps.map((step, index) => {
            const isActive = currentStep > index;
            const isCurrent = currentStep === index + 1;

            return (
              <View key={index} style={tw`flex-row items-center mb-4`}>
                <View
                  style={[
                    tw`w-8 h-8 rounded-full items-center justify-center mr-4`,
                    {
                      backgroundColor: isActive
                        ? '#007AFF'
                        : isCurrent
                          ? '#007AFF'
                          : '#E5E5EA',
                    },
                  ]}
                >
                  {isActive ? (
                    <Ionicons name="checkmark" size={14} color="white" />
                  ) : isCurrent ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <View style={tw`w-3 h-3 bg-gray-400 rounded-full`} />
                  )}
                </View>
                <Text
                  style={[
                    tw`flex-1 text-base`,
                    { color: isActive || isCurrent ? '#000000' : '#8E8E93' },
                  ]}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  </View>
);

export const IOSErrorView = ({
  title = 'Something went wrong',
  subtitle = 'Please try again',
  onRetry,
  icon = 'alert-circle',
  overlay = false,
}) => (
  <View
    style={[
      overlay
        ? tw`absolute inset-0 bg-gray-100 bg-opacity-95 justify-center items-center z-50`
        : tw`flex-1 justify-center items-center px-6`,
    ]}
  >
    <View
      style={tw`bg-white rounded-2xl p-8 shadow-lg items-center max-w-sm w-full`}
    >
      <View
        style={tw`w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-6`}
      >
        <Ionicons name={icon} size={36} color="#FF3B30" />
      </View>
      <Text style={tw`text-xl font-semibold text-black mb-3 text-center`}>
        {title}
      </Text>
      <Text style={tw`text-base text-gray-500 mb-8 text-center leading-6`}>
        {subtitle}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={tw`bg-blue-500 px-8 py-3 rounded-xl`}
          activeOpacity={0.8}
        >
          <Text style={tw`text-white font-semibold text-base`}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export const IOSEmptyState = ({
  title = 'No items found',
  subtitle = "There's nothing to show here",
  icon = 'document-outline',
  actionText,
  onAction,
}) => (
  <View style={tw`flex-1 justify-center items-center px-6`}>
    <View
      style={tw`bg-white rounded-2xl p-8 shadow-lg items-center max-w-sm w-full`}
    >
      <View
        style={tw`w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-6`}
      >
        <Ionicons name={icon} size={36} color="#8E8E93" />
      </View>
      <Text style={tw`text-xl font-semibold text-black mb-3 text-center`}>
        {title}
      </Text>
      <Text style={tw`text-base text-gray-500 mb-8 text-center leading-6`}>
        {subtitle}
      </Text>
      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={tw`bg-blue-500 px-8 py-3 rounded-xl`}
          activeOpacity={0.8}
        >
          <Text style={tw`text-white font-semibold text-base`}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Inline loader for smaller spaces
export const IOSInlineLoader = ({ text = 'Loading...', size = 'small' }) => (
  <View style={tw`flex-row items-center justify-center p-4`}>
    <ActivityIndicator size={size} color="#007AFF" style={tw`mr-3`} />
    <Text style={tw`text-base text-gray-500`}>{text}</Text>
  </View>
);
