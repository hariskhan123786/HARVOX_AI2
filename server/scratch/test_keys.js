import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

dotenv.config();

console.log('Testing configured API keys from server/.env...');

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  console.log(`Gemini Key: ${key ? key.substring(0, 10) + '...' : 'undefined'}`);
  if (!key) return;
  try {
    const ai = new GoogleGenerativeAI(key);
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const response = await model.generateContent('Hello');
    console.log('✅ Gemini Success:', response.response.text());
  } catch (err) {
    console.log('❌ Gemini Failed:', err.message);
  }
}

async function testGroq() {
  const key = process.env.GROQ_API_KEY;
  console.log(`Groq Key: ${key ? key.substring(0, 10) + '...' : 'undefined'}`);
  if (!key) return;
  try {
    const groq = new Groq({ apiKey: key });
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log('✅ Groq Success:', chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.log('❌ Groq Failed:', err.message);
  }
}

async function testCerebras() {
  const key = process.env.CEREBRAS_API_KEY;
  console.log(`Cerebras Key: ${key ? key.substring(0, 10) + '...' : 'undefined'}`);
  if (!key) return;
  try {
    const resList = await fetch('https://api.cerebras.ai/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });
    const modelsData = await resList.json();
    console.log('Cerebras Available Models:', modelsData.data?.map(m => m.id) || modelsData);

    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-oss-120b', // Try the model listed in models list
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Cerebras Success:', data.choices?.[0]?.message?.content);
    } else {
      console.log('❌ Cerebras Failed:', data.error?.message || JSON.stringify(data));
    }
  } catch (err) {
    console.log('❌ Cerebras Failed:', err.message);
  }
}

async function testOpenRouter() {
  const key = process.env.OPENROUTER_API_KEY;
  console.log(`OpenRouter Key: ${key ? key.substring(0, 10) + '...' : 'undefined'}`);
  if (!key) return;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ OpenRouter Success:', data.choices?.[0]?.message?.content);
    } else {
      console.log('❌ OpenRouter Failed:', JSON.stringify(data));
    }
  } catch (err) {
    console.log('❌ OpenRouter Failed:', err.message);
  }
}

async function run() {
  await testGemini();
  await testGroq();
  await testCerebras();
  await testOpenRouter();
}

run();
