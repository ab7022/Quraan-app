import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get the user's preferred Mushaf style
 * @returns {Promise<number>} The style number (1-11), defaults to 9
 */
export const getMushafStyle = async () => {
  try {
    console.log('[MUSHAF SERVICE] Getting mushaf style from AsyncStorage...');
    const savedStyle = await AsyncStorage.getItem('mushaf_style');
    console.log(
      '[MUSHAF SERVICE] Raw saved style from AsyncStorage:',
      savedStyle
    );

    if (savedStyle) {
      // Handle string styles (hafizi, indo-pak)
      if (savedStyle === 'hafizi' || savedStyle === 'indo-pak') {
        console.log('[MUSHAF SERVICE] Special mushaf style:', savedStyle);
        return savedStyle;
      }

      const styleNumber = parseInt(savedStyle);
      console.log('[MUSHAF SERVICE] Parsed style number:', styleNumber);
      const validStyle =
        styleNumber >= 1 && styleNumber <= 11 ? styleNumber : 'hafizi';
      console.log('[MUSHAF SERVICE] Final validated style:', validStyle);
      return validStyle;
    }

    console.log(
      '[MUSHAF SERVICE] No saved style found, returning default: hafizi'
    );
    return 'hafizi'; // Default to hafizi style
  } catch (error) {
    console.error('[MUSHAF SERVICE] Error loading mushaf style:', error);
    return 'hafizi'; // Default to hafizi style
  }
};

/**
 * Save the user's preferred Mushaf style
 * @param {number} styleNumber - The style number (1-11)
 * @returns {Promise<boolean>} Success status
 */
export const saveMushafStyle = async styleNumber => {
  try {
    console.log(
      '[MUSHAF SERVICE] Attempting to save mushaf style:',
      styleNumber
    );
    console.log('[MUSHAF SERVICE] Style type:', typeof styleNumber);

    // Handle both string and number styles
    const styleValue =
      typeof styleNumber === 'string' ? styleNumber : styleNumber.toString();
    await AsyncStorage.setItem('mushaf_style', styleValue);

    // Verify the save by reading it back
    const verification = await AsyncStorage.getItem('mushaf_style');
    console.log('[MUSHAF SERVICE] Verification read after save:', verification);

    console.log(
      '[MUSHAF SERVICE] Mushaf style saved successfully:',
      styleNumber
    );
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
export const getMushafImageUrl = (pageNumber, styleNumber = 'hafizi') => {
  console.log(`Generating URL for page ${pageNumber}, style ${styleNumber}`);

  // Handle special mushaf styles
  if (styleNumber === 'hafizi') {
    return `https://assets.devlop.app/page${pageNumber}_img1.png`;
  }

  if (styleNumber === 'indo-pak') {
    // This would be handled by the PDF viewer
    return null;
  }

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
  const getFileExtension = style => {
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

/**
 * Get the display name for a mushaf style
 * @param {number|string} style - The style number or string
 * @returns {string} The display name
 */
export const getStyleName = style => {
  const styleNames = {
    1: 'Madani',
    2: 'Traditional',
    3: 'Modern',
    4: 'Classic',
    5: 'Elegant',
    6: 'Simple',
    7: 'Bold',
    8: 'Refined',
    9: 'Premium',
    10: 'Heritage',
    11: 'Contemporary',
    hafizi: 'Hafizi',
    'indo-pak': 'Indo-Pak',
  };
  return styleNames[style] || `Style ${style}`;
};

/**
 * Get the total pages for a mushaf style
 * @param {number|string} mushafStyle - The mushaf style
 * @returns {number} Total pages
 */
export const getTotalPages = mushafStyle => {
  if (mushafStyle === 'indo-pak') {
    return 612;
  }
  if (mushafStyle === 'hafizi') {
    return 604; // Assuming Hafizi has 604 pages like standard mushaf
  }
  return 604; // Standard mushaf pages
};
