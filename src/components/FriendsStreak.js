import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useSelector } from 'react-redux';

const ContactCard = ({ contact, onPress }) => {
  const getStreakColor = (streak) => {
    if (streak >= 20) return 'text-yellow-600 dark:text-yellow-400'; // Gold
    if (streak >= 10) return 'text-purple-600 dark:text-purple-400'; // Purple
    if (streak >= 5) return 'text-blue-600 dark:text-blue-400'; // Blue
    return 'text-green-600 dark:text-green-400'; // Green
  };

  const getStreakIcon = (streak) => {
    if (streak >= 20) return 'trophy';
    if (streak >= 10) return 'star';
    if (streak >= 5) return 'flame';
    return 'checkmark-circle';
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(contact)}
      style={tw`bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700`}
    >
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center flex-1`}>
          {/* Avatar */}
          <View style={tw`w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mr-3`}>
            <Text style={tw`text-lg font-bold text-green-800 dark:text-green-200`}>
              {contact.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Name and status */}
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-base font-semibold text-gray-800 dark:text-gray-200`}>
                {contact.name}
              </Text>
              {contact.isActive && (
                <View style={tw`w-2 h-2 bg-green-500 rounded-full ml-2`} />
              )}
            </View>
            <Text style={tw`text-sm text-gray-500 dark:text-gray-400 mt-1`}>
              {contact.totalDays} days total • {contact.isActive ? 'Active today' : 'Last seen yesterday'}
            </Text>
          </View>
        </View>

        {/* Streak info */}
        <View style={tw`items-center`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons 
              name={getStreakIcon(contact.streak)} 
              size={20} 
              color={contact.streak >= 20 ? '#D97706' : contact.streak >= 10 ? '#7C3AED' : contact.streak >= 5 ? '#2563EB' : '#059669'} 
            />
            <Text style={tw`text-lg font-bold ml-1 ${getStreakColor(contact.streak)}`}>
              {contact.streak}
            </Text>
          </View>
          <Text style={tw`text-xs text-gray-400 dark:text-gray-500`}>
            streak
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FriendsStreak = ({ onContactPress, onInvite }) => {
  const { contacts = [], streak } = useSelector(s => s.streak);
  const sortedContacts = [...contacts].sort((a, b) => b.streak - a.streak);

  const handleContactPress = (contact) => {
    Alert.alert(
      contact.name,
      `Current streak: ${contact.streak} days\nTotal days read: ${contact.totalDays}\nStatus: ${contact.isActive ? 'Active today' : 'Last seen yesterday'}`,
      [
        { text: 'Send Encouragement', onPress: () => sendEncouragement(contact) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const sendEncouragement = (contact) => {
    Alert.alert(
      'Encouragement Sent! 💪',
      `You've sent a motivational message to ${contact.name}`,
      [{ text: 'OK' }]
    );
  };

  const onInviteFriends = () => {
    Alert.alert(
      'Invite Friends',
      'Share the app with your friends to compete and motivate each other in reading the Quran!',
      [
        { text: 'Share App', onPress: () => console.log('Share app functionality') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderContact = ({ item }) => (
    <ContactCard contact={item} onPress={handleContactPress} />
  );

  const renderHeader = () => (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-xl font-bold text-gray-800 dark:text-gray-200`}>
          Friends' Streaks 🔥
        </Text>
        <TouchableOpacity
          onPress={onInviteFriends}
          style={tw`bg-green-500 px-3 py-2 rounded-lg`}
        >
          <Text style={tw`text-white font-medium text-sm`}>Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard header */}
      <View style={tw`bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4`}>
        <Text style={tw`text-base font-semibold text-gray-800 dark:text-gray-200 mb-2`}>
          🏆 Leaderboard
        </Text>
        <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>
          Compete with friends and motivate each other to read daily!
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={tw`bg-white dark:bg-gray-800 rounded-xl p-6 items-center`}>
      <Ionicons name="people-outline" size={48} color="#9CA3AF" style={tw`mb-3`} />
      <Text style={tw`text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2`}>
        No Friends Yet
      </Text>
      <Text style={tw`text-sm text-gray-500 dark:text-gray-500 text-center mb-4`}>
        Invite your friends to join and track reading streaks together!
      </Text>
      <TouchableOpacity
        onPress={onInviteFriends}
        style={tw`bg-green-500 px-6 py-3 rounded-lg`}
      >
        <Text style={tw`text-white font-medium`}>Invite Friends</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      {renderHeader()}
      {sortedContacts.length === 0 ? (
        renderEmpty()
      ) : (
        <View style={tw`pb-6`}>
          {sortedContacts.map((item) => (
            <ContactCard key={item.id} contact={item} onPress={handleContactPress} />
          ))}
        </View>
      )}
    </View>
  );
};

export default FriendsStreak;
