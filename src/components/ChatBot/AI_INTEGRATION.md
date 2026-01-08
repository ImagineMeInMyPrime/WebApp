# Интеграция реального AI API

Текущая версия использует простую систему ответов на основе ключевых слов. Для подключения реального AI API (например, OpenAI GPT):

## Вариант 1: OpenAI API

1. Установите пакет:
```bash
npm install openai
```

2. Создайте файл `.env` в корне проекта:
```
VITE_OPENAI_API_KEY=your_api_key_here
```

3. Обновите функцию `generateAIResponse` в `ChatBot.tsx`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Только для клиентского использования
});

const generateAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ты AI-ассистент, помогающий посетителям сайта-резюме. Отвечай кратко и по делу."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 150
    });
    
    return completion.choices[0].message.content || "Извините, не могу ответить.";
  } catch (error) {
    console.error('AI API Error:', error);
    return "Извините, произошла ошибка. Попробуйте позже.";
  }
};
```

## Вариант 2: Через бэкенд (рекомендуется)

Для безопасности API ключей лучше использовать бэкенд:

1. Создайте API endpoint на вашем сервере
2. Обновите `generateAIResponse`:

```typescript
const generateAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage })
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI API Error:', error);
    return "Извините, произошла ошибка. Попробуйте позже.";
  }
};
```

## Вариант 3: Другие AI сервисы

- **Anthropic Claude**: https://www.anthropic.com/
- **Google Gemini**: https://ai.google.dev/
- **Hugging Face**: https://huggingface.co/
