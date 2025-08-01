import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rateLimitService from '../services/rateLimitService';
import RateLimitStatus from '../components/RateLimitStatus';

// Maximum number of chat messages to keep in history
const MAX_CHAT_MESSAGES = 20;

export default function AskDoubtScreen() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && !isLoading) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages, isLoading]);

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
        Alert.alert(
          'Rate Limit Exceeded',
          `You've reached the maximum number of AI questions (${rateLimitResult.maxRequests}) for this hour. Please try again in ${resetTime}.`,
          [{ text: 'OK' }]
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
            sender: 'Abdul Bayees AI', // Updated to match your backend
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

  // Markdown styles for Islamic content
  const markdownStyles = {
    body: {
      color: '#92400e', // amber-800
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: '#92400e',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      marginTop: 12,
    },
    heading2: {
      color: '#92400e',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 6,
      marginTop: 10,
    },
    heading3: {
      color: '#92400e',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
      marginTop: 8,
    },
    paragraph: {
      color: '#92400e',
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 8,
    },
    strong: {
      fontWeight: 'bold',
      color: '#78350f', // amber-900
    },
    em: {
      fontStyle: 'italic',
      color: '#059669', // green-600
    },
    listItem: {
      color: '#92400e',
      fontSize: 16,
      lineHeight: 22,
      marginBottom: 4,
    },
    bullet_list: {
      marginBottom: 8,
    },
    ordered_list: {
      marginBottom: 8,
    },
    blockquote: {
      backgroundColor: '#f0fdf4', // green-50
      borderLeftWidth: 4,
      borderLeftColor: '#10b981', // green-500
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
      borderRadius: 4,
    },
    code_inline: {
      backgroundColor: '#fef3c7', // amber-100
      color: '#92400e',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
    },
    fence: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      padding: 12,
      borderRadius: 6,
      fontSize: 14,
      marginVertical: 8,
    },
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
              ? tw`bg-amber-600 ml-4`
              : item.isError
                ? tw`bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 mr-4`
                : tw`bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-600 mr-4`,
          ]}
        >
          {!item.isUser && (
            <Text
              style={tw`text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1`}
            >
              {item.sender}
            </Text>
          )}
          {item.isUser ? (
            <Text style={[tw`text-base leading-6 text-white`]}>
              {item.text}
            </Text>
          ) : (
            <Markdown style={markdownStyles}>{item.text}</Markdown>
          )}
          <Text
            style={[
              tw`text-xs mt-2`,
              item.isUser
                ? tw`text-amber-100`
                : tw`text-amber-500 dark:text-amber-500`,
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={tw`mb-4 px-4`}>
      <View style={tw`flex-row justify-start`}>
        <View
          style={tw`bg-white dark:bg-gray-800 border border-amber-200 dark:border-gray-600 mr-4 rounded-2xl px-4 py-3`}
        >
          <Text
            style={tw`text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1`}
          >
            Islamic Scholar
          </Text>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-amber-900 dark:text-amber-100 mr-2`}>
              Typing
            </Text>
            <View style={tw`flex-row`}>
              <View
                style={tw`w-2 h-2 bg-amber-600 rounded-full mr-1 animate-pulse`}
              />
              <View
                style={tw`w-2 h-2 bg-amber-600 rounded-full mr-1 animate-pulse`}
              />
              <View
                style={tw`w-2 h-2 bg-amber-600 rounded-full animate-pulse`}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1 bg-amber-50 dark:bg-gray-900`}>
        <View
          style={tw`bg-white dark:bg-gray-800 border-b border-amber-200 dark:border-gray-700 px-4 py-3`}
        >
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`w-10 h-10 bg-amber-600 rounded-full items-center justify-center mr-3`}
            >
              <Ionicons name="person" size={20} color="white" />
            </View>
            <View style={tw`flex-1`}>
              <Text
                style={tw`text-lg font-bold text-amber-900 dark:text-amber-100`}
              >
                Islamic Scholar Chat
              </Text>
              <Text style={tw`text-sm text-amber-600 dark:text-amber-400`}>
                Ask your Islamic questions
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
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
              }}
              style={tw`w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center mr-2`}
            >
              <Ionicons name="trash-outline" size={16} color="#92400e" />
            </TouchableOpacity>
            <View style={tw`w-3 h-3 bg-green-500 rounded-full`} />
          </View>
        </View>

        {/* Chat Messages */}
        {isLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <View style={tw`animate-spin`}>
              <Ionicons name="hourglass" size={32} color="#92400e" />
            </View>
            <Text style={tw`text-amber-800 mt-2`}>Loading chat history...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={tw`flex-1`}
            contentContainerStyle={tw`py-4`}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isTyping ? renderTypingIndicator : null}
          />
        )}

        {/* Quick Questions */}
        <View style={tw`px-4 py-2`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-2`}>
              {[
                'Prayer times',
                'Wudu steps',
                'Quran recitation',
                'Zakat calculation',
                'Hajj rituals',
              ].map(question => (
                <TouchableOpacity
                  key={question}
                  onPress={() => setMessage(question)}
                  style={tw`bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-full px-3 py-2`}
                >
                  <Text style={tw`text-amber-800 dark:text-amber-200 text-sm`}>
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View
            style={tw`bg-white dark:bg-gray-800 border-t border-amber-200 dark:border-gray-700 px-4 py-3 pb-24`}
          >
            <View style={tw`flex-row items-end`}>
              <View
                style={tw`flex-1 bg-amber-50 dark:bg-gray-700 rounded-2xl border border-amber-200 dark:border-gray-600 mr-3`}
              >
                <TextInput
                  style={tw`px-4 py-3 text-amber-900 dark:text-amber-100 text-base max-h-24`}
                  placeholder="Ask your Islamic question..."
                  placeholderTextColor="#92400e"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  textAlignVertical="top"
                  maxLength={1000}
                />
              </View>
              <TouchableOpacity
                onPress={sendMessage}
                disabled={isSending || !message.trim()}
                style={[
                  tw`w-12 h-12 bg-amber-600 rounded-full items-center justify-center`,
                  (isSending || !message.trim()) && tw`opacity-50`,
                ]}
              >
                {isSending ? (
                  <View style={tw`animate-spin`}>
                    <Ionicons name="hourglass" size={24} color="white" />
                  </View>
                ) : (
                  <Ionicons name="send" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Rate Limit Status Component for debugging */}
        <RateLimitStatus />
      </View>
    </SafeAreaView>
  );
}
