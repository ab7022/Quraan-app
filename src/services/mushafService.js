import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get the user's preferred Mushaf style
 * @returns {Promise<number>} The style number (1-11), defaults to 9
 */
export const getMushafStyle = async () => {
  try {
    console.log('[MUSHAF SERVICE] Getting mushaf style from AsyncStorage...');
    const savedStyle = await AsyncStorage.getItem('mushaf_style');
    console.log('[MUSHAF SERVICE] Raw saved style from AsyncStorage:', savedStyle);
    
    if (savedStyle) {
      const styleNumber = parseInt(savedStyle);
      console.log('[MUSHAF SERVICE] Parsed style number:', styleNumber);
      const validStyle = styleNumber >= 1 && styleNumber <= 11 ? styleNumber : 9;
      console.log('[MUSHAF SERVICE] Final validated style:', validStyle);
      return validStyle;
    }
    
    console.log('[MUSHAF SERVICE] No saved style found, returning default: 9');
    return 9; // Default to style 9
  } catch (error) {
    console.error('[MUSHAF SERVICE] Error loading mushaf style:', error);
    return 9; // Default to style 9
  }
};

/**
 * Save the user's preferred Mushaf style
 * @param {number} styleNumber - The style number (1-11)
 * @returns {Promise<boolean>} Success status
 */
export const saveMushafStyle = async (styleNumber) => {
  try {
    console.log('[MUSHAF SERVICE] Attempting to save mushaf style:', styleNumber);
    console.log('[MUSHAF SERVICE] Style number type:', typeof styleNumber);
    
    await AsyncStorage.setItem('mushaf_style', styleNumber.toString());
    
    // Verify the save by reading it back
    const verification = await AsyncStorage.getItem('mushaf_style');
    console.log('[MUSHAF SERVICE] Verification read after save:', verification);
    
    console.log('[MUSHAF SERVICE] Mushaf style saved successfully:', styleNumber);
    return true;
  } catch (error) {
    console.error('[MUSHAF SERVICE] Error saving mushaf style:', error);
    return false;
  }
};

/**
 * Generate the direct image URL for a specific page and style
 * @param {number} pageNumber - The page number (1-604)
 * @param {number} styleNumber - The style number (1-11)
 * @returns {string} The complete image URL
 */
export const getMushafImageUrl = (pageNumber, styleNumber = 9) => {
  console.log(`Generating URL for page ${pageNumber}, style ${styleNumber}`);
  
  // Format page number based on style requirements
  const formatPageNumber = (page, style) => {
    switch (style) {
      case 1:
        return page.toString().padStart(3, '0'); // 022
      case 2:
        return `page-${page.toString().padStart(3, '0')}`; // page-022
      case 3:
      case 4:
      case 5:
      case 6:
        return page.toString().padStart(4, '0'); // 0025
      case 7:
        return `quran_tajwid_${page.toString().padStart(6, '0')}`; // quran_tajwid_000031
      case 8:
      case 9:
      case 10:
      case 11:
        return page.toString(); // 22
      default:
        return page.toString();
    }
  };

  // Get file extension based on style
  const getFileExtension = (style) => {
    switch (style) {
      case 1:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 9:
        return 'jpg';
      case 2:
        return 'jpeg';
      case 8:
      case 10:
        return 'png';
      case 11:
        return 'gif';
      default:
        return 'jpg';
    }
  };

  const formattedPage = formatPageNumber(pageNumber, styleNumber);
  const extension = getFileExtension(styleNumber);
  
  // Build URL based on style
  if (styleNumber === 2) {
    return `https://www.searchtruth.com/quran/images/images${styleNumber}/large/${formattedPage}.${extension}`;
  } else {
    return `https://www.searchtruth.com/quran/images/images${styleNumber}/${formattedPage}.${extension}`;
  }
};
