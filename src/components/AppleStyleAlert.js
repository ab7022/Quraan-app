import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated } from 'react-native';
import tw from 'twrnc';

// Custom Apple-style alert component with glassmorphism
const AppleStyleAlert = ({
  visible,
  title,
  message,
  buttons = [],
  onDismiss,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleButtonPress = button => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) return null;

  // Default buttons if none provided
  const alertButtons =
    buttons.length > 0 ? buttons : [{ text: 'OK', style: 'default' }];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          tw`flex-1 justify-center items-center px-4`,
          {
            opacity: fadeAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
        ]}
      >
        {/* Simple Modal Card */}
        <Animated.View
          style={[
            tw`w-full max-w-sm mx-4 bg-white rounded-2xl overflow-hidden`,
            {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Modal Header */}
          <View style={tw`px-6 pt-6 pb-4`}>
            {title && (
              <Text
                style={[
                  tw`text-center text-black mb-2`,
                  {
                    fontSize: 17,
                    fontWeight: '600',
                    letterSpacing: -0.4,
                  },
                ]}
              >
                {title}
              </Text>
            )}
            {message && (
              <Text
                style={[
                  tw`text-center leading-5 text-gray-600`,
                  {
                    fontSize: 13,
                    letterSpacing: -0.2,
                  },
                ]}
              >
                {message}
              </Text>
            )}
          </View>

          {/* Modal Buttons */}
          <View style={tw`border-t border-gray-200`}>
            {alertButtons.map((button, index) => {
              const isLast = index === alertButtons.length - 1;
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';
              const isPrimary =
                button.style === 'default' || (!isDestructive && !isCancel);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleButtonPress(button)}
                  style={[tw`py-4`, !isLast && tw`border-b border-gray-200`]}
                  activeOpacity={0.4}
                >
                  <Text
                    style={[
                      tw`text-center`,
                      {
                        fontSize: 17,
                        letterSpacing: -0.4,
                      },
                      isPrimary && {
                        fontWeight: '600',
                        color: '#007AFF',
                      },
                      isDestructive && {
                        fontWeight: '400',
                        color: '#FF3B30',
                      },
                      isCancel && {
                        fontWeight: '400',
                        color: '#8E8E93',
                      },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Static methods to mimic Alert.alert behavior
let currentAlert = null;

const AlertManager = {
  alert: (title, message, buttons, options) => {
    return new Promise(resolve => {
      const alertButtons = buttons || [
        { text: 'OK', onPress: () => resolve() },
      ];

      // Add resolve to button callbacks
      const processedButtons = alertButtons.map(button => ({
        ...button,
        onPress: () => {
          if (button.onPress) {
            button.onPress();
          }
          resolve();
        },
      }));

      currentAlert = {
        visible: true,
        title,
        message,
        buttons: processedButtons,
        onDismiss: () => {
          currentAlert = null;
          resolve();
        },
      };

      // Force re-render
      if (global.alertUpdate) {
        global.alertUpdate();
      }
    });
  },

  getCurrentAlert: () => currentAlert,

  dismissAlert: () => {
    if (currentAlert) {
      currentAlert = null;
      if (global.alertUpdate) {
        global.alertUpdate();
      }
    }
  },
};

// Provider component to manage alerts globally
export const AppleStyleAlertProvider = ({ children }) => {
  const [currentAlert, setCurrentAlert] = useState(null);

  useEffect(() => {
    global.alertUpdate = () => {
      setCurrentAlert(AlertManager.getCurrentAlert());
    };

    return () => {
      global.alertUpdate = null;
    };
  }, []);

  useEffect(() => {
    const checkAlert = () => {
      const alert = AlertManager.getCurrentAlert();
      if (alert !== currentAlert) {
        setCurrentAlert(alert);
      }
    };

    const interval = setInterval(checkAlert, 100);
    return () => clearInterval(interval);
  }, [currentAlert]);

  return (
    <>
      {children}
      {currentAlert && (
        <AppleStyleAlert
          visible={currentAlert.visible}
          title={currentAlert.title}
          message={currentAlert.message}
          buttons={currentAlert.buttons}
          onDismiss={currentAlert.onDismiss}
        />
      )}
    </>
  );
};

export { AlertManager };
export default AppleStyleAlert;
