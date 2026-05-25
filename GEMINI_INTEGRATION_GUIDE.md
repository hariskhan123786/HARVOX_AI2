# HARVOX_AI - Gemini API Integration Guide

## 📋 Overview

This guide covers the complete integration of Google Gemini API into your HARVOX_AI project. The integration allows users to switch between Groq and Gemini AI models with full feature support.

---

## 🔧 Step 1: Get Gemini API Key

### 1.1 Create a Google Cloud Project
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API key" button
3. Create a new API key (you can use this free tier or create via Google Cloud Console)

### 1.2 Alternative: Via Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the "Generative Language API"
4. Create an API key in the credentials section

**Save your API key safely** - You'll need it in the next steps.

---

## 📦 Step 2: Install Dependencies

### 2.1 Server Dependencies
Run in the `server` directory:

```bash
npm install @google/generative-ai
```

### 2.2 Verify Installation
```bash
npm list @google/generative-ai
```

---

## 🔑 Step 3: Environment Configuration

### 3.1 Update `.env` File
Add the following to your `server/.env`:

```env
# Existing Groq Configuration
GROQ_API_KEY=your_groq_api_key_here

# New Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3.2 Update `.env.example`
Add to `server/.env.example`:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## ✅ Step 4: Verify Installation

The following files have been created/updated:

### ✨ New Files Created:
1. **`server/services/geminiService.js`** - Gemini API service
2. **`server/config/geminiModels.js`** - Gemini models configuration

### 📝 Files Updated:
1. **`server/models/UserSettings.js`** - Added provider selection and separate API keys
2. **`server/models/SystemSettings.js`** - Added global Gemini key storage
3. **`server/controllers/aiController.js`** - Updated all AI functions to support provider switching
4. **`server/services/usageService.js`** - Already compatible (no changes needed)

---

## 🎯 Step 5: User Settings Configuration

### 5.1 Update User Interface (Frontend)

Create/Update settings component to include:

```javascript
// In your React settings component

const AISettings = () => {
  const [settings, setSettings] = useState({
    ai: {
      provider: 'groq', // or 'gemini'
      model: 'llama-3.3-70b-versatile', // Groq default
      creativity: 0.7,
      responseLength: 'medium',
      streaming: true,
    }
  });

  // Add provider selection radio buttons
  // Add model dropdown (changes based on selected provider)
  // Add API key input fields for each provider
};
```

### 5.2 API Keys Storage in UserSettings

The updated schema now has:

```javascript
{
  ai: {
    provider: 'groq', // 'groq' or 'gemini'
    model: 'llama-3.3-70b-versatile',
    creativity: 0.7,
    responseLength: 'medium',
    codingMode: 'standard',
    expertiseLevel: 'intermediate',
    streaming: true,
  },
  apiKeys: {
    groq: '', // User's personal Groq API key
    gemini: '', // User's personal Gemini API key
  }
}
```

---

## 🚀 Step 6: Testing

### 6.1 Test with cURL

#### Test Groq:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hello! What is your name?",
    "stream": false
  }'
```

#### Test Gemini:
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hello! What is your name?",
    "stream": false
  }'
# (Make sure your user settings have provider set to 'gemini')
```

### 6.2 Test in Postman

1. Import the API endpoints
2. Set Authorization header with your JWT token
3. Test POST `/api/ai/chat` with both providers

### 6.3 Frontend Testing

Test each endpoint:
- `/api/ai/chat` - Chat functionality
- `/api/ai/generate-code` - Code generation
- `/api/ai/debug` - Code debugging
- `/api/ai/explain` - Code explanation
- `/api/ai/project` - Project generation
- `/api/ai/analyze-file` - File analysis

---

## 📊 Available Gemini Models

Update your frontend model selector with these options:

### Latest Models (Recommended)

| Model | Best For | Speed | Cost | Context |
|-------|----------|-------|------|---------|
| `gemini-2.0-flash` | General purpose, fastest | ⚡⚡⚡ | $ | 1M tokens |
| `gemini-1.5-pro` | Complex reasoning, long context | ⚡⚡ | $$$$ | 1M tokens |
| `gemini-1.5-flash` | Balanced speed & quality | ⚡⚡⚡ | $$ | 1M tokens |
| `gemini-1.5-flash-8b` | Cost-effective, lightweight | ⚡⚡⚡ | $ | 1M tokens |

### Legacy Models (Not Recommended)

| Model | Notes |
|-------|-------|
| `gemini-pro` | Use `gemini-1.5-flash` instead |
| `gemini-pro-vision` | Use `gemini-1.5-flash` for vision |

---

## 🔗 API Integration Points

### 6.1 Chat Endpoint
**Endpoint:** `POST /api/ai/chat`

**Request:**
```json
{
  "message": "Your message here",
  "chatId": "optional_chat_id",
  "stream": false
}
```

**Response:**
```json
{
  "chat": { "id": "...", "messages": [...] },
  "reply": "Assistant response here"
}
```

### 6.2 Code Generation
**Endpoint:** `POST /api/ai/generate-code`

**Request:**
```json
{
  "prompt": "Create a factorial function",
  "language": "JavaScript",
  "stream": false,
  "saveNote": true
}
```

### 6.3 Code Debugging
**Endpoint:** `POST /api/ai/debug`

**Request:**
```json
{
  "error": "TypeError: Cannot read property 'map' of undefined",
  "code": "const result = data.map(x => x * 2);"
}
```

### 6.4 Code Explanation
**Endpoint:** `POST /api/ai/explain`

**Request:**
```json
{
  "code": "function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }"
}
```

### 6.5 Project Generation
**Endpoint:** `POST /api/ai/project`

**Request:**
```json
{
  "idea": "E-commerce platform",
  "type": "MERN"
}
```

### 6.6 File Analysis
**Endpoint:** `POST /api/ai/analyze-file`

**Form Data:**
- `file`: (binary file)
- `action`: "summarize" | "notes" | "question"
- `question`: (optional, for "question" action)

---

## 🛡️ Admin Panel Configuration

### Update Admin Routes

If you have an admin panel, add routes to manage global API keys:

```javascript
// server/routes/adminRoutes.js

router.put('/settings/ai-keys', protect, requireAdmin, async (req, res) => {
  const { groqKey, geminiKey } = req.body;
  
  const settings = await SystemSettings.findOneAndUpdate(
    {},
    { groqKey, geminiKey },
    { new: true }
  );
  
  res.json({ settings });
});
```

---

## 🔄 Provider Switching Logic

The system uses this priority for selecting API keys:

1. **User's Personal API Key** - If user configured one for the provider
2. **Global Admin Key** - From SystemSettings
3. **Environment Variable** - GROQ_API_KEY or GEMINI_API_KEY
4. **Error** - If none found, return "API not configured"

---

## 📱 Frontend Implementation Example

### Update Settings Component

```javascript
import { useState, useEffect } from 'react';
import { GEMINI_MODELS } from '../config/geminiModels';

const AISettingsPanel = ({ userSettings, onUpdate }) => {
  const [provider, setProvider] = useState(userSettings.ai.provider || 'groq');
  const [model, setModel] = useState(userSettings.ai.model || '');
  const [apiKeys, setApiKeys] = useState(userSettings.apiKeys || {});

  const groqModels = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768'
  ];

  const geminiModels = Object.keys(GEMINI_MODELS);

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    // Update model to first available for that provider
    setModel(newProvider === 'gemini' ? geminiModels[0] : groqModels[0]);
  };

  const handleSaveSettings = async () => {
    await fetch('/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ai: { ...userSettings.ai, provider, model },
        apiKeys,
      }),
    });
    onUpdate();
  };

  return (
    <div className="ai-settings">
      <h2>AI Configuration</h2>
      
      {/* Provider Selection */}
      <div>
        <label>AI Provider</label>
        <select value={provider} onChange={(e) => handleProviderChange(e.target.value)}>
          <option value="groq">Groq</option>
          <option value="gemini">Google Gemini</option>
        </select>
      </div>

      {/* Model Selection */}
      <div>
        <label>Model</label>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          {(provider === 'gemini' ? geminiModels : groqModels).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* API Keys */}
      {provider === 'groq' && (
        <div>
          <label>Groq API Key (Optional)</label>
          <input
            type="password"
            value={apiKeys.groq || ''}
            onChange={(e) => setApiKeys({...apiKeys, groq: e.target.value})}
            placeholder="Leave empty to use admin's key"
          />
        </div>
      )}

      {provider === 'gemini' && (
        <div>
          <label>Gemini API Key (Optional)</label>
          <input
            type="password"
            value={apiKeys.gemini || ''}
            onChange={(e) => setApiKeys({...apiKeys, gemini: e.target.value})}
            placeholder="Leave empty to use admin's key"
          />
        </div>
      )}

      <button onClick={handleSaveSettings}>Save Settings</button>
    </div>
  );
};

export default AISettingsPanel;
```

---

## 🐛 Troubleshooting

### Problem: "GEMINI_API_KEY is not configured"

**Solution:**
1. Check `.env` file has `GEMINI_API_KEY` set
2. Restart the server after adding the key
3. Verify the key is valid from Google AI Studio

### Problem: "Invalid Gemini API key"

**Solution:**
1. Verify the API key is active in Google AI Studio
2. Check for typos in the key
3. Ensure the Generative Language API is enabled

### Problem: Streaming not working with Gemini

**Solution:**
Streaming for Gemini is implemented but requires proper async handling:
- Check browser console for errors
- Verify EventSource is supported in your browser
- Check network tab for SSE headers

### Problem: Model not found error

**Solution:**
1. Check the model name matches exactly from `geminiModels.js`
2. Verify the model is available in your region
3. Update `geminiModels.js` if new models are released

### Problem: Rate limiting

**Solution:**
1. Check API quota in Google Cloud Console
2. Implement rate limiting on your server
3. Consider upgrading the API plan

---

## 📈 Cost Optimization

### Recommendations:

1. **Use Flash Models** - Better price/performance ratio
   - Use `gemini-2.0-flash` for most tasks
   - Use `gemini-1.5-flash-8b` for cost-sensitive operations

2. **Set Appropriate Tokens**
   - Short responses: 512 tokens
   - Medium responses: 2048 tokens (default)
   - Long responses: 4096 tokens (only when needed)

3. **Monitor Usage**
   - Track tokens used via UserAnalytics
   - Set quotas for users if needed
   - Review billing in Google Cloud Console

4. **Batch Requests**
   - Combine multiple queries when possible
   - Reuse context to avoid re-sending data

---

## 📚 Resources

- [Google AI API Documentation](https://ai.google.dev/docs)
- [Gemini Models](https://ai.google.dev/models)
- [Google Generative AI SDK](https://github.com/google/generative-ai-js)
- [API Pricing](https://ai.google.dev/pricing)

---

## ✨ Features Now Available

### Per-User Configuration
- ✅ Choose between Groq or Gemini per user
- ✅ Set personal API keys
- ✅ Select specific models
- ✅ Adjust creativity and response length
- ✅ Enable/disable streaming

### Admin Configuration
- ✅ Set global Groq API key
- ✅ Set global Gemini API key
- ✅ Configure pricing
- ✅ System settings management

### All AI Features Support Both Providers
- ✅ Chat with AI
- ✅ Generate code
- ✅ Debug code
- ✅ Explain code
- ✅ Generate projects
- ✅ Analyze files
- ✅ Streaming responses
- ✅ Usage tracking

---

## 🎓 Next Steps

1. **Test the Integration**
   - Use Postman/cURL to test endpoints
   - Test in frontend with different providers
   - Verify usage tracking works

2. **Update Admin Panel**
   - Add UI for managing Gemini API key
   - Show provider health status
   - Display quota usage

3. **Update User Documentation**
   - Add Gemini as option in user guide
   - Document model differences
   - Add model selection guidelines

4. **Monitor & Optimize**
   - Track which models users prefer
   - Monitor token usage
   - Optimize system prompts if needed

---

## 📝 Changelog

**Version 1.0 - Initial Gemini Integration**
- Added Gemini service module
- Added model configuration
- Updated controllers for provider switching
- Enhanced UserSettings schema
- Enhanced SystemSettings schema
- Added comprehensive documentation

---

## 💬 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Google AI API documentation
3. Check server logs for detailed error messages
4. Contact your development team

---

**Integration Date:** May 25, 2026  
**Last Updated:** May 25, 2026  
**Status:** ✅ Complete & Ready to Use
