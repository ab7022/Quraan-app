# AI Rate Limiting Implementation

This document describes the rate limiting system implemented for AI API requests to `api.devlop.app`.

## Overview

Rate limiting has been added to prevent abuse of AI services and ensure fair usage across all users. The system tracks API requests locally using AsyncStorage and enforces limits based on time windows.

## Rate Limits

### Current Limits (per hour):
- **AI Chat Questions** (`/quran/ask`): 10 requests per hour
- **AI Tafseer Requests** (`/quran/tafseer`): 30 requests per hour

These limits can be adjusted in `src/services/rateLimitService.js` by modifying the `RATE_LIMIT_CONFIG` object.

## How It Works

### 1. Rate Limit Service (`src/services/rateLimitService.js`)

The service provides:
- **Request validation**: Check if a request is allowed before making the API call
- **Request tracking**: Record successful requests for rate limiting
- **Status monitoring**: View current rate limit status for debugging
- **Reset functionality**: Reset rate limits (useful for testing)

### 2. Implementation in Screens

#### AskDoubtScreen.js
- Checks rate limit before sending AI chat questions
- Shows user-friendly alert when limit is exceeded
- Records successful requests after API response

#### QuranPageScreen.js
- Checks rate limit before requesting AI Tafseer
- Shows user-friendly alert when limit is exceeded  
- Records successful requests after API response

### 3. Rate Limit Status Component

A debugging component (`src/components/RateLimitStatus.js`) is available on both screens:
- Shows current rate limit status for all endpoints
- Displays remaining requests and reset times
- Provides manual reset functionality for testing
- Appears as a small "RL" button in the top-right corner

## Configuration

### Adjusting Rate Limits

Edit `src/services/rateLimitService.js`:

```javascript
const RATE_LIMIT_CONFIG = {
  'quran/ask': {
    maxRequests: 10,        // Change this number
    windowMs: 60 * 60 * 1000, // 1 hour window
    storageKey: 'rate_limit_ask',
  },
  'quran/tafseer': {
    maxRequests: 30,        // Change this number
    windowMs: 60 * 60 * 1000, // 1 hour window
    storageKey: 'rate_limit_tafseer',
  },
};
```

### Adding New Endpoints

To add rate limiting to new API endpoints:

1. Add configuration to `RATE_LIMIT_CONFIG`
2. Check rate limit before API call:
   ```javascript
   const rateLimitResult = await rateLimitService.checkRateLimit('endpoint/path');
   if (!rateLimitResult.allowed) {
     // Show alert to user
     return;
   }
   ```
3. Record successful requests:
   ```javascript
   await rateLimitService.recordRequest('endpoint/path');
   ```

## Data Storage

Rate limit data is stored locally using AsyncStorage:
- `rate_limit_ask`: Chat question request history
- `rate_limit_tafseer`: Tafseer request history

Data includes timestamps of requests within the current time window.

### Chat Message History Management

The chat system automatically manages message history to prevent storage bloat:
- **Maximum Messages**: Only the last 20 chat messages are kept
- **Automatic Trimming**: When saving messages, older messages beyond the limit are automatically removed
- **Storage Optimization**: Reduces app storage usage and improves performance
- **Load Safety**: When loading chat history, ensures no more than 20 messages are loaded

This is implemented in `AskDoubtScreen.js` with:
```javascript
const MAX_CHAT_MESSAGES = 20; // Configurable constant
```

## User Experience

### When Rate Limit is Exceeded:
- User sees a friendly alert explaining the limit
- Alert shows how long until the limit resets
- Request is blocked from being sent to the API

### When Within Limits:
- Requests proceed normally
- No additional UI or delays
- Rate limit tracking is transparent

## Testing

### Debugging:
1. Tap the "RL" button in the top-right corner of screens
2. View current status for all endpoints
3. Use "Reset" buttons to clear limits for testing
4. Use "Refresh" to update the status display

### Manual Testing:
1. Make requests until limit is reached
2. Verify alert appears with correct message
3. Wait for reset time or use debug reset
4. Verify requests work again after reset

## Security Considerations

### Local Storage Only:
- Rate limits are enforced locally on the device
- Determined users could potentially bypass by clearing app data
- For stronger enforcement, consider server-side rate limiting

### Backup Strategies:
- The system gracefully handles storage errors
- If rate limit checks fail, requests are allowed through
- This ensures the app remains functional even with storage issues

## Future Enhancements

Possible improvements:
1. **Server-side rate limiting**: Move enforcement to the backend
2. **User authentication**: Implement account-based limits
3. **Usage analytics**: Track actual usage patterns
4. **Dynamic limits**: Adjust limits based on user behavior
5. **Premium tiers**: Different limits for different user types
