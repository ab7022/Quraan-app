import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rateLimitService from '../services/rateLimitService';
import RateLimitStatus from '../components/RateLimitStatus';
import analytics from '../services/analyticsService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { IOSLoader, IOSInlineLoader } from '../components/IOSLoader';
import { AlertManager } from '../components/AppleStyleAlert';

// Maximum number of chat messages to keep in history
const MAX_CHAT_MESSAGES = 20;

const SectionHeader = ({ title }) => (
  <View style={tw`px-4 py-3 bg-gray-100`}>
    <Text style={tw`text-sm font-medium text-gray-500 uppercase tracking-wide`}>
      {title}
    </Text>
  </View>
);

const QuickQuestionItem = ({ question, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw`bg-white px-4 py-4 border-b border-gray-200`}
    activeOpacity={0.3}
  >
    <View style={tw`flex-row items-center`}>
      <View style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}>
        <Ionicons name="help-circle" size={20} color="#007AFF" />
      </View>
      <Text style={tw`text-base text-black flex-1 leading-5`}>
        {question}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
    </View>
  </TouchableOpacity>
);

export default function AskDoubtScreen() {
  const [message, setMessage] = useState('');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const [chatMessages, setChatMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const scrollViewRef = useRef(null);

  // Hide tab bar completely on this screen
  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' },
        tabBarHideOnKeyboard: true // Hide tab bar when keyboard appears
      });
    }

    // Cleanup function to restore tab bar when component unmounts
    return () => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: {
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(248, 248, 248, 0.94)',
            borderTopWidth: 0.5,
            borderTopColor: 'rgba(60, 60, 67, 0.12)',
            height: 83,
            paddingBottom: 20,
            paddingTop: 8,
            paddingHorizontal: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOffset: {
              width: 0,
              height: -0.5,
            },
            shadowOpacity: 0.1,
            shadowRadius: 0,
            elevation: 0,
          },
          tabBarHideOnKeyboard: true
        });
      }
    };
  }, [navigation]);

  // Load chat history on component mount
  useEffect(() => {
    console.log('[ASK DOUBT SCREEN] Component mounted');
    analytics.trackScreenView('AskDoubtScreen', {
      has_chat_history: chatMessages.length > 0,
    });
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && !isLoading) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isLoading, isTyping]);

  // Load chat history from AsyncStorage
  const loadChatHistory = async () => {
    try {
      console.log('[CHAT] Loading chat history from storage');
      const savedMessages = await AsyncStorage.getItem('islamic_chat_history');

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        console.log(
          '[CHAT] Loaded',
          parsedMessages.length,
          'messages from storage'
        );

        // Ensure we don't load more than the maximum messages (safety check)
        const messagesToLoad =
          parsedMessages.length > MAX_CHAT_MESSAGES
            ? parsedMessages.slice(-MAX_CHAT_MESSAGES)
            : parsedMessages;

        if (messagesToLoad.length !== parsedMessages.length) {
          console.log(
            `[CHAT] Trimmed loaded messages from ${parsedMessages.length} to ${messagesToLoad.length}`
          );
          // Save the trimmed version back to storage
          await saveChatHistory(messagesToLoad);
        }

        setChatMessages(messagesToLoad);
      } else {
        // Set default welcome message if no history exists
        const welcomeMessage = {
          id: '1',
          text: "Assalamu Alaikum! Welcome to our Islamic Q&A chat. I'm here to help answer your questions about Islam, Quran, Hadith, and Islamic practices. How can I assist you today?",
          isUser: false,
          timestamp: new Date().toISOString(),
          sender: 'Islamic Scholar',
        };
        setChatMessages([welcomeMessage]);
        await saveChatHistory([welcomeMessage]);
      }
    } catch (error) {
      console.error('[CHAT] Error loading chat history:', error);
      // Fallback to default message
      const welcomeMessage = {
        id: '1',
        text: "Assalamu Alaikum! Welcome to our Islamic Q&A chat. I'm here to help answer your questions about Islam, Quran, Hadith, and Islamic practices. How can I assist you today?",
        isUser: false,
        timestamp: new Date().toISOString(),
        sender: 'Islamic Scholar',
      };
      setChatMessages([welcomeMessage]);
      await saveChatHistory([welcomeMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save chat history to AsyncStorage (keep only last 20 messages)
  const saveChatHistory = async messages => {
    try {
      // Keep only the last MAX_CHAT_MESSAGES messages to prevent storage bloat
      let messagesToSave = messages;

      if (messages.length > MAX_CHAT_MESSAGES) {
        // Keep the last messages
        messagesToSave = messages.slice(-MAX_CHAT_MESSAGES);
        console.log(
          `[CHAT] Trimmed messages from ${messages.length} to ${messagesToSave.length} (keeping last ${MAX_CHAT_MESSAGES})`
        );
      }

      await AsyncStorage.setItem(
        'islamic_chat_history',
        JSON.stringify(messagesToSave)
      );
      console.log('[CHAT] Saved', messagesToSave.length, 'messages to storage');

      // Update state with trimmed messages if we trimmed anything
      if (messages.length > MAX_CHAT_MESSAGES) {
        setChatMessages(messagesToSave);
      }
    } catch (error) {
      console.error('[CHAT] Error saving chat history:', error);
    }
  };

  // Manually trim chat history to maximum allowed messages
  const trimChatHistory = async () => {
    try {
      if (chatMessages.length > MAX_CHAT_MESSAGES) {
        const trimmedMessages = chatMessages.slice(-MAX_CHAT_MESSAGES);
        setChatMessages(trimmedMessages);
        await AsyncStorage.setItem(
          'islamic_chat_history',
          JSON.stringify(trimmedMessages)
        );
        console.log(
          `[CHAT] Manually trimmed messages from ${chatMessages.length} to ${trimmedMessages.length}`
        );
        return trimmedMessages.length;
      }
      return chatMessages.length;
    } catch (error) {
      console.error('[CHAT] Error trimming chat history:', error);
      return chatMessages.length;
    }
  };

  // Clear chat history
  const clearChatHistory = async () => {
    try {
      await AsyncStorage.removeItem('islamic_chat_history');
      const welcomeMessage = {
        id: '1',
        text: "Assalamu Alaikum! Welcome to our Islamic Q&A chat. I'm here to help answer your questions about Islam, Quran, Hadith, and Islamic practices. How can I assist you today?",
        isUser: false,
        timestamp: new Date().toISOString(),
        sender: 'Islamic Scholar',
      };
      setChatMessages([welcomeMessage]);
      await saveChatHistory([welcomeMessage]);
      console.log('[CHAT] Chat history cleared');
    } catch (error) {
      console.error('[CHAT] Error clearing chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Check rate limit before proceeding
    try {
      const rateLimitResult =
        await rateLimitService.checkRateLimit('quran/ask');

      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitService.getTimeUntilReset(
          rateLimitResult.resetTime
        );
        AlertManager.alert(
          'Rate Limit Exceeded',
          `You've reached the maximum number of AI questions (${rateLimitResult.maxRequests}) for this hour. Please try again in ${resetTime}.`
        );
        return;
      }
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Continue with request if rate limit check fails
    }

    const userMessage = {
      id: Date.now().toString(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
      sender: 'You',
    };

    // Add user message immediately
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    await saveChatHistory(updatedMessages);
    setMessage('');
    setIsSending(true);
    setIsTyping(true);

    try {
      console.log('Sending message to backend:', userMessage.text);

      const requestBody = {
        question: userMessage.text, // Changed from 'message' to 'question' to match backend
        timestamp: userMessage.timestamp,
      };

      console.log('Request body:', JSON.stringify(requestBody));

      const response = await fetch('https://api.devlop.app/quran/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Backend response:', data);

        // Record successful request for rate limiting
        await rateLimitService.recordRequest('quran/ask');

        // Simulate typing delay for better UX
        setTimeout(async () => {
          const scholarResponse = {
            id: (Date.now() + 1).toString(),
            text:
              data.answer ||
              data.response ||
              data.message ||
              'Thank you for your question. Let me provide you with an Islamic perspective on this matter...',
            isUser: false,
            timestamp: new Date().toISOString(),
            sender: 'AI', // Updated to match your backend
          };

          setIsTyping(false);
          const finalMessages = [...updatedMessages, scholarResponse];
          setChatMessages(finalMessages);
          await saveChatHistory(finalMessages);
        }, 1500);
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);

      // Add error message to chat
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date().toISOString(),
        sender: 'System',
        isError: true,
      };
      const errorMessages = [...updatedMessages, errorMessage];
      setChatMessages(errorMessages);
      await saveChatHistory(errorMessages);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // iOS-optimized Markdown styles
  const markdownStyles = {
    body: {
      color: '#000000',
      fontSize: 16,
      lineHeight: 22,
      fontFamily: 'System',
    },
    heading1: {
      color: '#000000',
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 12,
      lineHeight: 26,
    },
    heading2: {
      color: '#000000',
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 6,
      marginTop: 10,
      lineHeight: 24,
    },
    heading3: {
      color: '#000000',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      marginTop: 8,
      lineHeight: 22,
    },
    paragraph: {
      color: '#000000',
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 8,
    },
    strong: {
      fontWeight: '600',
      color: '#000000',
    },
    em: {
      fontStyle: 'italic',
      color: '#1F2937',
    },
    listItem: {
      color: '#000000',
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 4,
    },
    bullet_list: {
      marginBottom: 8,
      marginLeft: 16,
    },
    ordered_list: {
      marginBottom: 8,
      marginLeft: 16,
    },
    blockquote: {
      backgroundColor: '#F0F9FF',
      borderLeftWidth: 3,
      borderLeftColor: '#007AFF',
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
      borderRadius: 8,
    },
    code_inline: {
      backgroundColor: '#F3F4F6',
      color: '#374151',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
      fontFamily: 'Menlo',
    },
    fence: {
      backgroundColor: '#F3F4F6',
      color: '#374151',
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      marginVertical: 8,
      fontFamily: 'Menlo',
    },
  };

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setString(text);
      AlertManager.alert(
        'Copied!',
        'Message copied to clipboard.',
        [{ text: 'OK' }],
        { type: 'success' }
      );
    } catch (error) {
      console.error('Failed to copy text:', error);
      AlertManager.alert('Error', 'Failed to copy text to clipboard');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={tw`mb-4 px-4`}>
      <View
        style={[
          tw`flex-row`,
          item.isUser ? tw`justify-end` : tw`justify-start`,
        ]}
      >
        <View
          style={[
            tw`max-w-[80%] rounded-2xl px-4 py-3`,
            item.isUser
              ? tw`bg-blue-500`
              : item.isError
                ? tw`bg-red-50 border border-red-200`
                : tw`bg-gray-100 border border-gray-200`,
          ]}
        >
          <View style={tw`flex-row justify-between items-start`}>
            <View style={tw`flex-1`}>
              {!item.isUser && (
                <Text style={tw`text-xs font-medium text-gray-500 mb-2`}>
                  {item.sender || 'Islamic Scholar'}
                </Text>
              )}
              {item.isUser ? (
                <Text style={tw`text-base leading-5 text-white`}>
                  {item.text}
                </Text>
              ) : (
                <Markdown style={markdownStyles}>{item.text}</Markdown>
              )}
            </View>
            {!item.isUser && (
              <TouchableOpacity
                onPress={() => copyToClipboard(item.text)}
                style={tw`ml-2 p-2`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name="copy-outline" 
                  size={18} 
                  color={item.isError ? '#DC2626' : '#6B7280'} 
                />
              </TouchableOpacity>
            )}
          </View>
          <Text
            style={[
              tw`text-xs mt-2`,
              item.isUser
                ? tw`text-blue-200 text-right`
                : tw`text-gray-400 text-right`,
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );


  const handleStartChat = () => {
    setShowChat(true);
    analytics.trackUserAction('start_chat', {
      timestamp: new Date().toISOString(),
    });
  };

  const handleQuickQuestion = (question) => {
    setMessage(question);
    setShowChat(true);
  };

  const handleClearChat = () => {
    AlertManager.alert(
      'Clear Chat History',
      'Are you sure you want to clear all chat messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearChatHistory,
        },
      ]
    );
  };

  if (showChat || chatMessages.length > 0) {
    return (
    
        <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['left', 'right']}>
          <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />
          <View style={tw` bg-white mt-12`}>
            <View style={tw`bg-gray-100 border-b border-gray-200`}>
              </View>
              </View>
          <View style={tw`flex-1 bg-white`}>
            {/* iOS-Style Navigation Header */}
            <View style={tw`bg-gray-100 border-b border-gray-200`}>
              <View style={tw`flex-row items-center justify-between px-4 py-3`}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Home')}
                  style={tw`flex-row items-center py-1`}
                  activeOpacity={0.3}
                >
                  <Ionicons name="chevron-back" size={24} color="#007AFF" />
                  <Text style={tw`text-lg text-blue-500 ml-1 font-normal`}>Home</Text>
                </TouchableOpacity>

                <Text style={tw`text-lg font-semibold text-black`}>
                  Islamic Q&A
                </Text>

                <TouchableOpacity
                  onPress={handleClearChat}
                  style={tw`p-2 -mr-2`}
                  activeOpacity={0.3}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Chat Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={tw`flex-1`}
              contentContainerStyle={tw`py-4`}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {isLoading ? (
                <IOSLoader 
                  title="Loading Messages"
                  subtitle="Please wait while we load your chat history"
                  overlay={false}
                />
              ) : (
                chatMessages.map((item) => (
                  <View key={item.id} style={tw`mb-4 px-4`}>
                    <View
                      style={[
                        tw`flex-row`,
                        item.isUser ? tw`justify-end` : tw`justify-start`,
                      ]}
                    >
                      <View
                        style={[
                          tw`max-w-[80%] rounded-2xl px-4 py-3`,
                          item.isUser
                            ? tw`bg-blue-500`
                            : item.isError
                              ? tw`bg-red-50 border border-red-200`
                              : tw`bg-gray-100 border border-gray-200`,
                        ]}
                      >
                        {!item.isUser && (
                          <Text style={tw`text-xs font-medium text-gray-500 mb-2`}>
                            {item.sender || 'Islamic Scholar'}
                          </Text>
                        )}
                        {item.isUser ? (
                          <Text style={tw`text-base leading-5 text-white`}>
                            {item.text}
                          </Text>
                        ) : (
                          <Markdown style={markdownStyles}>{item.text}</Markdown>
                        )}
                        <Text
                          style={[
                            tw`text-xs mt-2`,
                            item.isUser
                              ? tw`text-blue-200 text-right`
                              : tw`text-gray-400 text-right`,
                          ]}
                        >
                          {formatTime(item.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <View style={tw`px-4 pb-2`}>
                  <View style={tw`flex-row justify-start`}>
                    <View style={tw`bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 max-w-[80%]`}>
                      <IOSInlineLoader message="Thinking..." />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
  <KeyboardAvoidingView
        style={tw``}
        behavior={Platform.OS === 'ios' ? 'padding' : "height"}
      >
            {/* Message Input */}
            <View style={tw`bg-gray-100 border-t border-gray-200 px-4 py-3`}>
              <View style={tw`flex-row items-end`}>
                <View style={tw`flex-1 bg-white rounded-2xl border border-gray-300 mr-3 px-4 py-3`}>
                  <TextInput
                    style={tw`text-black text-base max-h-24 leading-5`}
                    placeholder="Ask your Islamic question..."
                    placeholderTextColor="#8E8E93"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    textAlignVertical="top"
                    maxLength={1000}
                    selectionColor="#007AFF"
                    blurOnSubmit={false}
                    returnKeyType="send"
                    onSubmitEditing={() => {
                      if (message.trim()) {
                        sendMessage();
                      }
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={isSending || !message.trim()}
                  style={[
                    tw`w-12 flex flex-row align-center mb-2 h-12 bg-blue-500 rounded-full items-center justify-center`,
                    (isSending || !message.trim()) && tw`opacity-40`,
                  ]}
                  activeOpacity={0.3}
                >
                  {isSending ? (
                    <Ionicons name="hourglass-outline" size={20} color="white" />
                  ) : (
                    <Ionicons name="send" size={18} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      
    );
    } 
     return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['left', 'right']}>
      <StatusBar backgroundColor="#F2F2F7" barStyle="dark-content" />

      {/* iOS-Style Status Bar */}
      <View style={tw`bg-gray-100 px-4 py-2 border-b border-gray-200`}>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="help-circle" size={16} color="#007AFF" />
            <Text style={tw`text-sm text-gray-600 font-medium ml-2`}>Ask Islamic Questions</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-2 h-2 bg-green-500 rounded-full mr-2`} />
            <Text style={tw`text-sm text-gray-500`}>Ready</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={tw`flex-1`} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[tw`pb-6`, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Rate Limit Status */}
        <View style={tw`px-4 pt-4 pb-2`}>
          <RateLimitStatus service="quran/ask" />
        </View>

        {/* Start Chat Section */}
        <View style={tw`mt-6`}>
          <SectionHeader title="Ask Islamic Questions" />
          <View style={tw`bg-white`}>
            <TouchableOpacity
              onPress={handleStartChat}
              style={tw`px-4 py-4 border-b border-gray-200`}
              activeOpacity={0.3}
            >
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-12 h-12 rounded-xl bg-blue-100 items-center justify-center mr-4`}>
                  <Ionicons name="chatbubbles" size={24} color="#007AFF" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg font-medium text-black mb-1`}>
                    Start New Conversation
                  </Text>
                  <Text style={tw`text-base text-gray-500 leading-5`}>
                    Ask questions about Islam, Quran, and Islamic teachings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Questions Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="Popular Questions" />
          <View style={tw`bg-white`}>
            {[
              'What are the 5 pillars of Islam?',
              'How do I perform Wudu (ablution)?',
              'What is the proper way to pray?',
              'How do I calculate Zakat?',
              'What are the conditions for Hajj?',
              'How to recite Quran properly?',
              'What is the significance of Ramadan?',
              'How to seek forgiveness in Islam?'
            ].map((question, index) => (
              <QuickQuestionItem
                key={index}
                question={question}
                onPress={() => handleQuickQuestion(question)}
              />
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={tw`mt-8`}>
          <SectionHeader title="About" />
          <View style={tw`bg-white`}>
            <View style={tw`px-4 py-4`}>
              <Text style={tw`text-base text-black mb-3 font-semibold`}>
                Islamic AI Assistant
              </Text>
              <Text style={tw`text-sm text-gray-600 leading-5`}>
                Get answers to your Islamic questions from our AI assistant trained on authentic Islamic sources. Ask about prayers, Quran, Islamic history, and daily Islamic practices.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
