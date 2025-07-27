import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import analytics from '../services/analyticsService';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    pagesRead: 0,
    aiQueriesCount: 0,
    favoriteLanguage: 'English',
    readingStreak: 0,
    avgSessionTime: '0 min'
  });

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    // In a real implementation, you'd fetch this from your analytics backend
    // For now, we'll show mock data
    setStats({
      totalSessions: 42,
      pagesRead: 156,
      aiQueriesCount: 23,
      favoriteLanguage: 'Urdu',
      readingStreak: 7,
      avgSessionTime: '12 min'
    });
  };

  const StatCard = ({ icon, title, value, subtitle, color = '#8B5CF6' }) => (
    <View style={tw`bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4`}>
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center mb-2`}>
            <View style={[tw`w-8 h-8 rounded-full items-center justify-center mr-3`, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text style={tw`text-gray-600 text-sm font-medium`}>{title}</Text>
          </View>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-1`}>{value}</Text>
          {subtitle && (
            <Text style={tw`text-gray-500 text-xs`}>{subtitle}</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={tw`flex-1 bg-gray-50`} showsVerticalScrollIndicator={false}>
      <View style={tw`px-6 py-6`}>
        {/* Header */}
        <View style={tw`mb-6`}>
          <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>
            📊 Your Reading Analytics
          </Text>
          <Text style={tw`text-gray-600`}>
            Track your Quran reading journey and progress
          </Text>
        </View>

        {/* Stats Grid */}
        <StatCard
          icon="time-outline"
          title="Reading Sessions"
          value={stats.totalSessions}
          subtitle="Total sessions this month"
          color="#10B981"
        />

        <StatCard
          icon="book-outline"
          title="Pages Read"
          value={stats.pagesRead}
          subtitle="Quran pages completed"
          color="#3B82F6"
        />

        <StatCard
          icon="sparkles"
          title="AI Tafseer Queries"
          value={stats.aiQueriesCount}
          subtitle="Explanations requested"
          color="#8B5CF6"
        />

        <StatCard
          icon="language-outline"
          title="Preferred Language"
          value={stats.favoriteLanguage}
          subtitle="For AI explanations"
          color="#F59E0B"
        />

        <StatCard
          icon="flame-outline"
          title="Reading Streak"
          value={`${stats.readingStreak} days`}
          subtitle="Keep it up! 🔥"
          color="#EF4444"
        />

        <StatCard
          icon="time"
          title="Avg Session Time"
          value={stats.avgSessionTime}
          subtitle="Time spent reading"
          color="#6366F1"
        />

        {/* Privacy Notice */}
        <View style={tw`bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4`}>
          <View style={tw`flex-row items-start`}>
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" style={tw`mr-2 mt-0.5`} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-blue-800 font-semibold text-sm mb-1`}>
                Privacy Protected
              </Text>
              <Text style={tw`text-blue-700 text-sm leading-5`}>
                All analytics data is collected anonymously and used only to improve your reading experience. 
                No personal information is shared.
              </Text>
            </View>
          </View>
        </View>

        {/* Analytics Controls */}
        <View style={tw`mt-6`}>
          <TouchableOpacity
            style={tw`bg-gray-200 py-3 px-4 rounded-xl flex-row items-center justify-center`}
            onPress={() => analytics.disableAnalytics()}
          >
            <Ionicons name="analytics-outline" size={20} color="#6B7280" style={tw`mr-2`} />
            <Text style={tw`text-gray-700 font-medium`}>
              Disable Analytics
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
