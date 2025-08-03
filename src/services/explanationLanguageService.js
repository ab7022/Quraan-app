import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertManager } from '../components/AppleStyleAlert';

// Get the user's preferred explanation language
export const getExplanationLanguage = async () => {
  try {
    const savedSettings = await AsyncStorage.getItem('quran_app_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.explanationLanguage || null;
    }
    return null;
  } catch (error) {
    console.log('Error loading explanation language:', error);
    return null;
  }
};

// Show language selection if not set
export const promptForExplanationLanguage = () => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  ];

  return new Promise((resolve, reject) => {
    const buttons = languages.map(lang => ({
      text: `${lang.flag} ${lang.name}`,
      onPress: async () => {
        try {
          // Save the selected language
          const savedSettings =
            await AsyncStorage.getItem('quran_app_settings');
          const settings = savedSettings ? JSON.parse(savedSettings) : {};
          const updatedSettings = { ...settings, explanationLanguage: lang };
          await AsyncStorage.setItem(
            'quran_app_settings',
            JSON.stringify(updatedSettings)
          );
          resolve(lang);
        } catch (error) {
          reject(error);
        }
      },
    }));

    buttons.push({
      text: 'Cancel',
      style: 'cancel',
      onPress: () => resolve(null),
    });

    AlertManager.alert(
      'Select Explanation Language',
      'Choose your preferred language for Quran explanations and tafseer',
      buttons
    );
  });
};

// Available languages for explanations
export const explanationLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
];
