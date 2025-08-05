// analyticsService.js

import * as Analytics from 'expo-firebase-analytics';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.isEnabled = true;
    this.deviceInfo = null;
    this.initialize();
  }

  async initialize() {
    try {
      this.deviceInfo = {
        platform: Device.osName,
        platformVersion: Device.osVersion,
        deviceName: Device.deviceName,
        modelName: Device.modelName,
        appVersion: Application.nativeApplicationVersion,
        buildVersion: Application.nativeBuildVersion,
        bundleId: Application.applicationId,
      };

      console.log('📊 Analytics initialized:', this.deviceInfo);
    } catch (error) {
      console.error('Analytics init error:', error);
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackEvent(eventName, properties = {}) {
    if (!this.isEnabled) return;

    try {
      const enrichedProps = {
        ...properties,
        session_id: this.sessionId,
        user_id: this.userId,
        platform: this.deviceInfo?.platform,
        app_version: this.deviceInfo?.appVersion,
      };

      await Analytics.logEvent(eventName, enrichedProps);

      console.log('📊 Firebase Event Logged:', eventName, enrichedProps);
    } catch (error) {
      console.error('Error logging Firebase event:', error);
    }
  }

  async trackScreenView(screenName, properties = {}) {
    await Analytics.setCurrentScreen(screenName);
    await this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  async trackUserAction(action, properties = {}) {
    await this.trackEvent('user_action', { action, ...properties });
  }

  async trackQuranReading(pageNumber, duration = null) {
    await this.trackEvent('quran_page_read', {
      page_number: pageNumber,
      reading_duration: duration,
      category: 'quran_engagement',
    });
  }

  async trackSurahRead(surahName, surahNumber, pageCount) {
    await this.trackEvent('surah_completed', {
      surah_name: surahName,
      surah_number: surahNumber,
      page_count: pageCount,
      category: 'quran_completion',
    });
  }

  async trackJuzRead(juzNumber, completionPercentage) {
    await this.trackEvent('juz_progress', {
      juz_number: juzNumber,
      completion_percentage: completionPercentage,
      category: 'quran_progress',
    });
  }

  async trackStreakUpdate(streakCount, streakType) {
    await this.trackEvent('streak_updated', {
      streak_count: streakCount,
      streak_type: streakType,
      category: 'user_engagement',
    });
  }

  async trackAITafseer(pageNumber, language, responseTime = null) {
    await this.trackEvent('ai_tafseer_requested', {
      page_number: pageNumber,
      language,
      response_time: responseTime,
      category: 'ai_features',
    });
  }

  async trackLanguageSelection(language, isFirstTime = false) {
    await this.trackEvent('language_selected', {
      language,
      is_first_time: isFirstTime,
      category: 'user_preferences',
    });
  }

  async trackNavigationEvent(fromScreen, toScreen, method = 'tap') {
    await this.trackEvent('navigation', {
      from_screen: fromScreen,
      to_screen: toScreen,
      navigation_method: method,
      category: 'navigation',
    });
  }

  async trackSearchEvent(searchTerm, resultCount = 0) {
    await this.trackEvent('search', {
      search_term: searchTerm,
      result_count: resultCount,
      category: 'search',
    });
  }

  async trackErrorEvent(error, context = '') {
    await this.trackEvent('error_occurred', {
      error_message: error.message || error,
      error_context: context,
      category: 'errors',
    });
  }

  async trackPerformanceMetric(metricName, value, unit = 'ms') {
    await this.trackEvent('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      unit,
      category: 'performance',
    });
  }

  // Session
  startNewSession() {
    this.sessionId = this.generateSessionId();
    this.trackEvent('session_start');
  }

  endSession() {
    this.trackEvent('session_end');
  }

  // User
  async setUserId(userId) {
    this.userId = userId;
    await Analytics.setUserId(userId);
    this.trackEvent('user_identified', { user_id: userId });
  }

  // Privacy
  enableAnalytics() {
    this.isEnabled = true;
    console.log('📊 Analytics enabled');
  }

  disableAnalytics() {
    this.isEnabled = false;
    console.log('📊 Analytics disabled');
  }
}

const analytics = new AnalyticsService();
export default analytics;

export const {
  trackEvent,
  trackScreenView,
  trackUserAction,
  trackQuranReading,
  trackSurahRead,
  trackJuzRead,
  trackStreakUpdate,
  trackAITafseer,
  trackLanguageSelection,
  trackNavigationEvent,
  trackSearchEvent,
  trackErrorEvent,
  trackPerformanceMetric,
  setUserId,
  enableAnalytics,
  disableAnalytics,
} = analytics;
