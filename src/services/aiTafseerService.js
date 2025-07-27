// AI Tafseer Service - Real OpenAI Integration
import axios from 'axios';

// You'll need to add this to your environment variables
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-openai-api-key-here';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Alternative: You can also use Claude AI by Anthropic
const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || 'your-claude-api-key-here';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

class AITafseerService {
  constructor() {
    this.openaiClient = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    this.claudeClient = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
    });
  }

  // System prompt for AI to understand its role
  getSystemPrompt(language = 'en') {
    const languageMap = {
      'en': 'English',
      'ar': 'Arabic',
      'ur': 'Urdu',
      'hi': 'Hindi',
      'fr': 'French',
      'es': 'Spanish',
      'tr': 'Turkish',
      'id': 'Indonesian',
      'ms': 'Malay',
      'bn': 'Bengali'
    };

    const selectedLanguage = languageMap[language] || 'English';

    return `You are an expert Islamic scholar and Quran commentator (Mufassir) with deep knowledge of:

1. **Quranic Sciences**: Tafseer, Asbab al-Nuzul (reasons for revelation), Nasikh wa Mansukh (abrogation)
2. **Islamic History**: Historical context of revelations, life of Prophet Muhammad (PBUH)
3. **Arabic Language**: Classical Arabic, rhetoric, linguistics, and Quranic terminology
4. **Islamic Jurisprudence**: Understanding of how verses relate to Islamic law and practice
5. **Comparative Tafseer**: Knowledge of classical commentaries (Ibn Kathir, At-Tabari, Al-Qurtubi, etc.)

**Your Role:**
- Provide scholarly, respectful, and accurate explanations of Quranic verses
- Always include historical context (Asbab al-Nuzul) when relevant
- Explain verses in a way that's accessible to modern Muslims
- Include practical applications for daily life
- Reference classical scholarly opinions when appropriate
- Use proper Islamic terminology and respectful language
- Format responses in clean, readable markdown

**IMPORTANT: Respond in ${selectedLanguage} language. Use appropriate cultural context and terminology for ${selectedLanguage}-speaking Muslims.**

**Guidelines:**
- Always begin with "Bismillah" (In the name of Allah)
- Be respectful and humble in tone
- Acknowledge when interpretations may vary among scholars
- Include disclaimers about consulting qualified scholars
- Avoid sectarian biases - present mainstream Sunni interpretations
- Use emojis sparingly and appropriately for Islamic content
- Always end with a relevant Quranic verse or Hadith when appropriate

**Format Requirements:**
- Use proper markdown headings (##, ###)
- Include bullet points for lists
- Use **bold** for emphasis on important terms
- Include Arabic terms with English translations
- Structure content logically with clear sections

Remember: You are helping Muslims understand their holy book better, so maintain the highest level of respect and accuracy.`;
  }

  // Generate page-specific prompt
  generatePagePrompt(pageNumber) {
    return `This is page ${pageNumber} of a standard Mushaf (Quran) that has 604 pages total with 15 lines per page in Uthmanic script.

Please provide a comprehensive Tafseer (explanation) for this page following this structure:

## 📖 Page Information
- Page number and basic details
- Standard Mushaf format information

## 🕌 Context of Revelation (Asbab al-Nuzul)
- When and why these verses were revealed
- Historical circumstances and events
- Connection to Prophet's life and early Muslim community

## 💡 Meaning and Explanation
- Clear explanation of the verses' meaning
- Key Arabic terms and their significance
- Literary and rhetorical features

## 🌟 Key Lessons and Wisdom
- Important guidance from these verses
- Moral and spiritual teachings
- Universal principles for humanity

## 🤲 Application in Daily Life
- How these teachings apply to modern Muslim life
- Practical implementation
- Personal development aspects

## 📚 Scholarly Insights
- Classical commentator perspectives
- Different interpretations where relevant
- Academic insights

Please provide this in proper markdown format. Keep the explanation scholarly yet accessible, suitable for Muslims seeking to understand the Quran better.`;
  }

  // OpenAI API call
  async getOpenAITafseer(pageNumber, language = 'en') {
    try {
      const systemPrompt = this.getSystemPrompt(language);
      const userPrompt = this.generatePagePrompt(pageNumber);

      const response = await this.openaiClient.post('/chat/completions', {
        model: 'gpt-4o', // or 'gpt-3.5-turbo' for faster/cheaper option
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      });

      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model,
        language: language
      };
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error(`OpenAI API failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Claude AI API call (Alternative)
  async getClaudeTafseer(pageNumber, language = 'en') {
    try {
      const systemPrompt = this.getSystemPrompt(language);
      const userPrompt = this.generatePagePrompt(pageNumber);

      const response = await this.claudeClient.post('/messages', {
        model: 'claude-3-sonnet-20240229', // or 'claude-3-haiku-20240307' for faster option
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7
      });

      return {
        success: true,
        content: response.data.content[0].text,
        usage: response.data.usage,
        model: response.data.model
      };
    } catch (error) {
      console.error('Claude API Error:', error.response?.data || error.message);
      throw new Error(`Claude API failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Main method - tries OpenAI first, falls back to Claude
  async getTafseer(pageNumber, language = 'en', preferredProvider = 'openai') {
    try {
      if (preferredProvider === 'openai') {
        return await this.getOpenAITafseer(pageNumber, language);
      } else if (preferredProvider === 'claude') {
        return await this.getClaudeTafseer(pageNumber, language);
      }
    } catch (error) {
      console.warn(`${preferredProvider} failed, trying fallback...`);
      
      // Fallback to the other provider
      try {
        if (preferredProvider === 'openai') {
          return await this.getClaudeTafseer(pageNumber, language);
        } else {
          return await this.getOpenAITafseer(pageNumber, language);
        }
      } catch (fallbackError) {
        console.error('Both AI providers failed:', fallbackError);
        throw new Error('All AI providers failed. Please try again later.');
      }
    }
  }

  // Helper method to get explanation with language preference
  async getExplanationWithLanguageCheck(pageNumber, preferredProvider = 'openai') {
    try {
      // Import the language service
      const { getExplanationLanguage, promptForExplanationLanguage } = await import('./explanationLanguageService');
      
      // Get user's preferred language
      let language = await getExplanationLanguage();
      
      // If no language is set, prompt user to select one
      if (!language) {
        language = await promptForExplanationLanguage();
        if (!language) {
          throw new Error('Language selection cancelled');
        }
      }
      
      // Get explanation in the selected language
      return await this.getTafseer(pageNumber, language.code, preferredProvider);
    } catch (error) {
      console.error('Error getting explanation with language check:', error);
      throw error;
    }
  }

  // Method for specialized Islamic AI (if available)
  async getIslamicAITafseer(pageNumber) {
    // You can integrate with specialized Islamic AI services like:
    // - IslamQA API
    // - Quran.com API
    // - Islamic AI chatbots
    // This is a placeholder for such services
    
    try {
      // Example for a hypothetical Islamic AI service
      const response = await axios.post('https://api.islamicai.com/tafseer', {
        page: pageNumber,
        format: 'markdown',
        language: 'english',
        detail_level: 'comprehensive'
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_ISLAMIC_AI_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        content: response.data.tafseer,
        source: 'Islamic AI',
        scholars_referenced: response.data.scholars || []
      };
    } catch (error) {
      throw new Error('Islamic AI service unavailable');
    }
  }
}

export default new AITafseerService();
