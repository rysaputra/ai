import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Prism from 'prismjs';
import 'prismjs/themes/prism-dark.css'; // Dark theme for code generator
import 'prismjs/components/prism-javascript.min'; // Add other languages as needed

const apiKey = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

export async function POST(request: Request) {
  try {
    const { prompt, role } = await request.json();

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.text();

    // Apply PrismJS syntax highlighting if the role is "code-generator"
    const highlightedResponse = role === 'code-generator'
      ? Prism.highlight(responseText, Prism.languages.javascript, 'javascript')
      : responseText;

    // Return the response with highlighted code if applicable
    return NextResponse.json({ response: highlightedResponse });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Failed to get a response from the AI.' }, { status: 500 });
  }
}
