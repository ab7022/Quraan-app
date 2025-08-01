import * as Application from 'expo-application';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.isEnabled = true;
    this.initialize();
  }

  async initialize() {
    try {
      // Get device info for analytics
      this.deviceInfo = {
        platform: Device.osName,
        platformVersion: Device.osVersion,
        deviceName: Device.deviceName,
        modelName: Device.modelName,
        appVersion: Application.nativeApplicationVersion,
        buildVersion: Application.nativeBuildVersion,
        bundleId: Application.applicationId,
      };

      console.log('📊 Analytics Service initialized:', this.deviceInfo);
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Core tracking methods
  async trackEvent(eventName, properties = {}) {
    if (!this.isEnabled) return;

    try {
      const eventData = {
        event: eventName,
        properties: {
          ...properties,
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: new Date().toISOString(),
          platform: this.deviceInfo?.platform,
          appVersion: this.deviceInfo?.appVersion,
        },
      };

      // Log to console for development
      console.log('📊 Analytics Event:', eventData);

      // Here you could send to your analytics backend
      // await this.sendToBackend(eventData);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  async trackScreenView(screenName, properties = {}) {
    await this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  async trackUserAction(action, properties = {}) {
    await this.trackEvent('user_action', {
      action,
      ...properties,
    });
  }

  // Quran-specific tracking methods
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
      language: language,
      response_time: responseTime,
      category: 'ai_features',
    });
  }

  async trackLanguageSelection(language, isFirstTime = false) {
    await this.trackEvent('language_selected', {
      language: language,
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
      unit: unit,
      category: 'performance',
    });
  }

  // Session management
  startNewSession() {
    this.sessionId = this.generateSessionId();
    this.trackEvent('session_start');
  }

  endSession() {
    this.trackEvent('session_end');
  }

  // User management
  setUserId(userId) {
    this.userId = userId;
    this.trackEvent('user_identified', { user_id: userId });
  }

  // Privacy controls
  enableAnalytics() {
    this.isEnabled = true;
    console.log('📊 Analytics enabled');
  }

  disableAnalytics() {
    this.isEnabled = false;
    console.log('📊 Analytics disabled');
  }

  // Optional: Send data to your backend
  async sendToBackend(eventData) {
    try {
      // Replace with your analytics endpoint
      const response = await fetch('YOUR_ANALYTICS_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send analytics data:', error);
    }
  }
}

// Create and export singleton instance
const analytics = new AnalyticsService();
export default analytics;

// Export specific tracking functions for convenience
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
