# Gemini API - Complete Integration Examples

## 🎯 Quick Integration Guide

This file contains complete, copy-paste-ready examples for integrating Gemini API with your HARVOX_AI frontend.

---

## 1️⃣ Chat Endpoint Example

### Request
```javascript
// Using fetch API
const sendMessage = async (message, chatId = null) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      message,
      chatId,
      stream: false // Set to true for streaming
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};

// Usage
const handleChat = async (message) => {
  try {
    const { chat, reply } = await sendMessage(message);
    console.log('Chat ID:', chat._id);
    console.log('Reply:', reply);
  } catch (error) {
    console.error('Chat failed:', error.message);
  }
};
```

### Response Example
```json
{
  "chat": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "title": "What is the capital of France?",
    "messages": [
      {
        "role": "user",
        "content": "What is the capital of France?"
      },
      {
        "role": "assistant",
        "content": "The capital of France is Paris..."
      }
    ],
    "createdAt": "2026-05-25T10:30:00Z"
  },
  "reply": "The capital of France is Paris, the largest city in the country..."
}
```

---

## 2️⃣ Streaming Chat Example

### Request with Streaming
```javascript
const sendMessageStreaming = async (message, chatId = null, onChunk) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      message,
      chatId,
      stream: true // Enable streaming
    })
  });

  if (!response.ok) {
    throw new Error('Chat failed');
  }

  // Handle streaming
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            fullResponse += data.content;
            onChunk?.(data.content); // Call callback for each chunk
          }
          if (data.done) {
            return data.chat;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

// Usage with React component
const ChatComponent = () => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStreamChat = async (message) => {
    setIsLoading(true);
    setResponse('');

    try {
      const chat = await sendMessageStreaming(
        message,
        null,
        (chunk) => setResponse(prev => prev + chunk) // Update as chunks arrive
      );
      console.log('Chat complete:', chat);
    } catch (error) {
      console.error('Streaming failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleStreamChat('Tell me about AI')}>
        Ask AI
      </button>
      <div>{isLoading ? 'Loading...' : response}</div>
    </div>
  );
};
```

---

## 3️⃣ Code Generation Example

### Request
```javascript
const generateCode = async (prompt, language = 'JavaScript', saveNote = false) => {
  const response = await fetch('/api/ai/generate-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      prompt,
      language,
      stream: false,
      saveNote
    })
  });

  if (!response.ok) {
    throw new Error('Code generation failed');
  }

  return response.json();
};

// Usage
const handleCodeGen = async () => {
  try {
    const { code } = await generateCode(
      'Create a function to check if a number is prime',
      'JavaScript',
      true // Save as note
    );
    console.log('Generated code:', code);
    setGeneratedCode(code);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Response Example
```json
{
  "code": "function isPrime(num) {\n  if (num <= 1) return false;\n  if (num <= 3) return true;\n  if (num % 2 === 0 || num % 3 === 0) return false;\n  for (let i = 5; i * i <= num; i += 6) {\n    if (num % i === 0 || num % (i + 2) === 0) return false;\n  }\n  return true;\n}\n\n// Test\nconsole.log(isPrime(17)); // true\nconsole.log(isPrime(20)); // false"
}
```

---

## 4️⃣ Code Debugging Example

### Request
```javascript
const debugCode = async (error, code) => {
  const response = await fetch('/api/ai/debug', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      error,
      code
    })
  });

  if (!response.ok) {
    throw new Error('Debug failed');
  }

  return response.json();
};

// Usage
const handleDebug = async () => {
  try {
    const { analysis } = await debugCode(
      "TypeError: Cannot read property 'map' of undefined",
      "const result = data.map(x => x * 2);"
    );
    console.log('Debug analysis:', analysis);
    setDebugResult(analysis);
  } catch (error) {
    console.error('Debug error:', error);
  }
};
```

### Response Example
```json
{
  "analysis": "The error occurs because 'data' is undefined. This can happen when:\n\n1. **The variable isn't declared**: Ensure `data` is properly initialized\n2. **Scope issue**: Check that `data` is accessible in this scope\n3. **API response failed**: If data comes from an API call, add error handling\n\n**Solution:**\n```javascript\nconst data = [1, 2, 3]; // Ensure data is defined\nconst result = data?.map(x => x * 2); // Use optional chaining\n// OR\nif (data) {\n  const result = data.map(x => x * 2);\n}\n```"
}
```

---

## 5️⃣ Code Explanation Example

### Request
```javascript
const explainCode = async (code) => {
  const response = await fetch('/api/ai/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ code })
  });

  if (!response.ok) {
    throw new Error('Explanation failed');
  }

  return response.json();
};

// Usage
const handleExplain = async () => {
  try {
    const { explanation } = await explainCode(
      "const arr = [3,1,4,1,5]; arr.sort((a,b) => a-b);"
    );
    setExplanation(explanation);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Response Example
```json
{
  "explanation": "This code demonstrates array sorting:\n\n1. **const arr = [3,1,4,1,5]**: Creates an array with 5 numbers\n2. **arr.sort()**: Calls the sort method on the array\n3. **(a,b) => a-b**: Comparator function\n   - Returns negative: a comes before b\n   - Returns 0: equal\n   - Returns positive: b comes before a\n\nResult: [1, 1, 3, 4, 5] (sorted in ascending order)\n\nNote: Without the comparator, sort() treats elements as strings, which can give unexpected results for numbers."
}
```

---

## 6️⃣ Project Generation Example

### Request
```javascript
const generateProject = async (idea, type = 'MERN') => {
  const response = await fetch('/api/ai/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      idea,
      type
    })
  });

  if (!response.ok) {
    throw new Error('Project generation failed');
  }

  return response.json();
};

// Usage
const handleGenerateProject = async () => {
  try {
    const { project, content } = await generateProject(
      'E-commerce platform with real-time inventory',
      'MERN'
    );
    console.log('Project created:', project);
    setProjectContent(content);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Response Example
```json
{
  "project": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439012",
    "projectName": "E-commerce platform with real-time inventory",
    "stack": "MERN",
    "description": "E-commerce platform with real-time inventory",
    "content": "# E-commerce Platform Structure\n\n## Project Setup\n...",
    "createdAt": "2026-05-25T10:35:00Z"
  },
  "content": "# E-commerce Platform - MERN Stack\n\n## Project Structure\n```\nproject/\n├── client/\n│   ├── src/\n│   │   ├── components/\n│   │   ├── pages/\n│   │   └── services/\n│   └── package.json\n├── server/\n│   ├── models/\n│   ├── routes/\n│   ├── controllers/\n│   └── server.js\n└── README.md\n```\n\n## Key Features\n1. Real-time inventory updates\n2. User authentication\n3. Payment integration\n..."
}
```

---

## 7️⃣ File Analysis Example

### Request with FormData
```javascript
const analyzeFile = async (file, action = 'summarize', question = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('action', action);
  if (question) formData.append('question', question);

  const response = await fetch('/api/ai/analyze-file', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('File analysis failed');
  }

  return response.json();
};

// Usage
const handleFileAnalysis = async (file) => {
  try {
    const { file: fileRecord, analysis } = await analyzeFile(
      file,
      'summarize'
    );
    console.log('Analysis:', analysis);
    setAnalysisResult(analysis);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Response Example
```json
{
  "file": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439012",
    "fileName": "document.pdf",
    "fileUrl": "1779173252333-489912277.pdf",
    "mimeType": "application/pdf",
    "analysis": "This document discusses...",
    "extractedText": "Full extracted text (first 5000 chars)...",
    "createdAt": "2026-05-25T10:40:00Z"
  },
  "analysis": "## Document Summary\n\nThis document covers the following key points:\n\n1. **Introduction**: Provides context about...\n2. **Main Topics**: Discusses...\n3. **Conclusion**: Summarizes...\n\n**Key Takeaways**:\n- Point 1\n- Point 2\n- Point 3"
}
```

---

## ⚙️ Provider Settings Update Example

### Update User Preferences
```javascript
const updateAISettings = async (settings) => {
  const response = await fetch('/api/user/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      ai: {
        provider: settings.provider, // 'groq' or 'gemini'
        model: settings.model,
        creativity: settings.creativity,
        responseLength: settings.responseLength,
        streaming: settings.streaming
      },
      apiKeys: {
        groq: settings.groqApiKey || '',
        gemini: settings.geminiApiKey || ''
      }
    })
  });

  if (!response.ok) {
    throw new Error('Settings update failed');
  }

  return response.json();
};

// Usage
const handleSettingsChange = async (newSettings) => {
  try {
    const updated = await updateAISettings({
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      creativity: 0.8,
      responseLength: 'long',
      streaming: true,
      geminiApiKey: 'user_api_key_optional'
    });
    console.log('Settings updated:', updated);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

---

## 🛠️ Complete React Component Example

```javascript
import React, { useState, useEffect } from 'react';

const AIIntegrationComponent = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('groq');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [error, setError] = useState('');

  const geminiModels = [
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b'
  ];

  const groqModels = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768'
  ];

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setModel(newProvider === 'gemini' ? geminiModels[0] : groqModels[0]);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message,
          stream: false
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }

      const data = await res.json();
      setResponse(data.reply);
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-container">
      <div className="settings">
        <select value={provider} onChange={(e) => handleProviderChange(e.target.value)}>
          <option value="groq">Groq</option>
          <option value="gemini">Google Gemini</option>
        </select>

        <select value={model} onChange={(e) => setModel(e.target.value)}>
          {(provider === 'gemini' ? geminiModels : groqModels).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me anything..."
        disabled={isLoading}
      />

      <button onClick={handleSendMessage} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Send'}
      </button>

      {error && <div className="error">{error}</div>}
      {response && <div className="response">{response}</div>}
    </div>
  );
};

export default AIIntegrationComponent;
```

---

## 📋 Error Handling Examples

```javascript
// Comprehensive error handling
const handleAIRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      switch (result.code) {
        case 'RATE_LIMIT':
          throw new Error('Rate limit exceeded. Please try again later.');
        case 'API_KEY':
          throw new Error('Invalid API key. Please check your settings.');
        case 'AI_ERROR':
          throw new Error(`AI Service Error: ${result.message}`);
        default:
          throw new Error(result.message || 'An error occurred');
      }
    }

    return result;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};
```

---

## 🧪 Testing with Postman

### Create a Postman Collection

**Base URL:** `http://localhost:5000/api/ai`

**Headers (for all requests):**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Endpoints:**

1. **Chat**
   - URL: `POST /chat`
   - Body: `{"message": "Hello", "stream": false}`

2. **Generate Code**
   - URL: `POST /generate-code`
   - Body: `{"prompt": "Create a function", "language": "JavaScript"}`

3. **Debug**
   - URL: `POST /debug`
   - Body: `{"error": "error message", "code": "code here"}`

4. **Explain**
   - URL: `POST /explain`
   - Body: `{"code": "code to explain"}`

5. **Project**
   - URL: `POST /project`
   - Body: `{"idea": "project idea", "type": "MERN"}`

6. **Analyze File**
   - URL: `POST /analyze-file` (form-data)
   - Fields: `file, action, question (optional)`

---

**All examples are production-ready and can be used directly in your frontend!**
