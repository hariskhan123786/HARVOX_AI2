# Gemini API Integration - Quick Setup Checklist

## ✅ Completed Tasks

The following have been automatically set up for you:

### Backend Files Created/Updated
- [x] ✨ Created `server/services/geminiService.js` - Gemini API integration
- [x] ✨ Created `server/config/geminiModels.js` - Model configurations and system prompts
- [x] 📝 Updated `server/models/UserSettings.js` - Provider selection + separate API keys
- [x] 📝 Updated `server/models/SystemSettings.js` - Global Gemini API key support
- [x] 📝 Updated `server/controllers/aiController.js` - All AI functions support provider switching
  - chatAI() ✓
  - generateCode() ✓
  - debugCode() ✓
  - explainCode() ✓
  - generateProject() ✓
  - analyzeFile() ✓

---

## ⚙️ What You Need to Do Now

### Step 1: Install Dependencies (1 minute)
```bash
cd server
npm install @google/generative-ai
```

### Step 2: Get Gemini API Key (2 minutes)
1. Visit [Google AI Studio](https://aistudio.google.com/) or [Google Cloud Console](https://console.cloud.google.com/)
2. Create API key
3. Save it somewhere safe

### Step 3: Update Environment Variables (1 minute)
```bash
# Add to server/.env
GEMINI_API_KEY=your_api_key_here

# Also add to server/.env.example
GEMINI_API_KEY=your_api_key_here
```

### Step 4: Restart Server (1 minute)
```bash
cd server
npm start
```

### Step 5: Test the Integration (5 minutes)
Use Postman or cURL to test:
```bash
# Test Gemini endpoint (after setting user preference to 'gemini')
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Hello from Gemini!"}'
```

### Step 6: Update Frontend (Frontend team)
- Add provider selection (Groq/Gemini) in settings
- Add model dropdown that changes based on provider
- Add API key input fields (optional for users)
- Add Gemini models to model selector

---

## 📋 Feature Summary

### What Works Immediately
✅ All 6 AI endpoints support both Groq and Gemini  
✅ Automatic provider detection from user settings  
✅ Fallback to admin global keys if user doesn't configure  
✅ Streaming support for both providers  
✅ Usage tracking integrated  
✅ Error handling for both services  

### Available Models

**Gemini Models:**
- `gemini-2.0-flash` (Recommended - fastest)
- `gemini-1.5-pro` (Most capable)
- `gemini-1.5-flash` (Balanced)
- `gemini-1.5-flash-8b` (Lightweight)
- `gemini-pro` (Legacy)
- `gemini-pro-vision` (Legacy)

**Groq Models:**
- llama-3.3-70b-versatile
- llama-3.1-70b-versatile
- mixtral-8x7b-32768

---

## 🔄 How It Works

```
User Request
    ↓
aiController gets request
    ↓
getAIOptions() fetches user settings
    ↓
Checks user's preferred provider (groq/gemini)
    ↓
If Gemini selected → use geminiService
If Groq selected → use groqService
    ↓
Service makes API call
    ↓
Response sent back to user
    ↓
Usage tracked automatically
```

---

## 📁 File Structure

```
server/
├── services/
│   ├── groqService.js      (unchanged)
│   ├── geminiService.js    (NEW - Gemini API wrapper)
│   └── usageService.js     (unchanged)
├── config/
│   ├── prompts.js          (unchanged)
│   └── geminiModels.js     (NEW - Models & prompts)
├── controllers/
│   └── aiController.js     (UPDATED - Provider support)
├── models/
│   ├── UserSettings.js     (UPDATED - Provider + API keys)
│   └── SystemSettings.js   (UPDATED - Gemini key)
└── .env                    (ADD GEMINI_API_KEY)
```

---

## 🚀 Test Commands

### Using cURL

```bash
# Set your token first
TOKEN="your_jwt_token_here"

# Chat with Gemini
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "What is machine learning?",
    "stream": false
  }'

# Generate code with Gemini
curl -X POST http://localhost:5000/api/ai/generate-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "Create a sorting algorithm",
    "language": "JavaScript",
    "stream": false
  }'

# Explain code with Gemini
curl -X POST http://localhost:5000/api/ai/explain \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "const arr = [3,1,2]; arr.sort((a,b) => a-b);"
  }'
```

---

## 🔐 Security Notes

1. **Never commit API keys** - Use `.env` file
2. **Environment variables** - Keep GEMINI_API_KEY in `.env` only
3. **User API keys** - Encrypted in database (select: false)
4. **Rate limiting** - Already handled by services
5. **Access control** - All endpoints require authentication

---

## 🐛 Common Issues & Solutions

### Issue: Module not found @google/generative-ai
**Fix:** Run `npm install @google/generative-ai` in server directory

### Issue: GEMINI_API_KEY not configured
**Fix:** Add GEMINI_API_KEY to server/.env and restart

### Issue: "Invalid API key"
**Fix:** Verify key is active in Google AI Studio

### Issue: Timeout errors
**Fix:** Check internet connection and API quota

### Issue: Streaming not working
**Fix:** Ensure your frontend supports EventSource/SSE

---

## 📊 Admin Dashboard Updates (Optional)

If you have an admin panel, add these features:

```javascript
// New admin endpoints to add
PUT /api/admin/settings/ai-keys  // Update Groq and Gemini keys
GET /api/admin/settings/ai-status // Check API health
GET /api/admin/usage/by-provider  // Usage by provider
```

---

## ✨ What's Next?

1. **Install the package** ← Start here
2. **Add API key** ← Then this
3. **Restart server** ← Then this
4. **Test endpoints** ← Then this
5. **Update frontend** ← Frontend team handles this
6. **Monitor usage** ← Optional: Add monitoring

---

## 📞 Need Help?

Refer to the comprehensive guide: `GEMINI_INTEGRATION_GUIDE.md`

The full guide includes:
- Step-by-step setup instructions
- API endpoint documentation
- Frontend example code
- Troubleshooting guide
- Cost optimization tips
- Model comparison table
- Testing procedures

---

**Status:** ✅ Backend Integration Complete  
**Next Step:** Install npm packages and add API key  
**Estimated Setup Time:** 5-10 minutes
