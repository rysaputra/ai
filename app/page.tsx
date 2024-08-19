'use client';
import { useState, useEffect, useRef } from 'react';
import { Inter } from 'next/font/google';
import { Textarea } from '@/components/ui/textarea'; // Adjust this import based on your setup
import { PaperAirplaneIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import parse from 'html-react-parser'; // For parsing HTML responses

const inter = Inter({ subsets: ['latin'] });

type Message = {
  text: string;
  sender: 'user' | 'ai';
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('seo');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSavePrompt = () => {
    localStorage.setItem('userPrompt', prompt);
    alert('Your prompt has been successfully saved.');
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };

  const convertToHTML = (text: string) => {
    const parts = text.split("**");
    let html = '';
  
    for (let i = 0; i < parts.length; i++) {
      if (i === 0 || i % 2 === 1) {
        html += parts[i];
      } else {
        html += "<b>"+parts[i]+"</b>";
      }
    }
    let newResponse = html.split("*").join("</br>")
    return newResponse;
  };
  
  const sendPrompt = async () => {
    if (!prompt.trim()) return;
  
    setMessages([...messages, { text: prompt, sender: 'user' }]);
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, role: selectedRole }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      let aiMessage = result.error ? result.error : result.response;
  
      // Check if the response contains code
      if (result.response && result.response.startsWith('```')) {
        const codeLanguage = result.response.match(/^```(\w+)/)?.[1] || 'javascript';
        aiMessage = `\`\`\`${codeLanguage}\n${aiMessage.replace(/^```[\s\S]*```$/, '')}\n\`\`\``;
      } else {
        // Apply bold text formatting
        aiMessage = convertToHTML(aiMessage);
      }
  
      setMessages((prevMessages) => [...prevMessages, { text: aiMessage, sender: 'ai' }]);
    } catch (error) {
      console.error('Error sending prompt:', error);
      setMessages((prevMessages) => [...prevMessages, { text: 'An error occurred while processing your request. Please try again later.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };
  
  const getRoleIcon = () => (
    <SparklesIcon className="h-6 w-6 text-gray-500" />
  );

  return (
    <div className={`flex flex-col justify-between w-full transition-colors duration-300`}>
      <main className={`flex-1 container py-20 px-4 md:px-44 transition-all h-screen justify-between duration-300 p-6`}>
        <h1 className="text-3xl font-bold mb-4">Welcome to Q AI</h1>
        <p className="text-lg mb-4">
          Explore the various features and customize your experience to your liking.
        </p>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto mb-4 p-4" ref={chatContainerRef}>
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div
                  className={`p-4 rounded-lg ${
                    message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                  } max-w-full`}
                >
                  {message.sender === 'ai' && getRoleIcon()}
                  <div>
                    {message.text.startsWith('```') ? (
                      <pre className="bg-gray-100 p-2 rounded-lg">
                        {message.text.replace(/^```[\s\S]*```$/, '')} {/* Remove code block markers */}
                      </pre>
                    ) : (
                      parse(message.text) // Safely render HTML
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-lg bg-gray-200 text-gray-700 max-w-full">
                  <p>Loading your response...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Section for Prompt Input */}
        <section className="shadow-lg rounded-lg p-4">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={handlePromptChange}
              rows={4}
              className="w-full border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Type your prompt here..."
            />
            {prompt && (
              <button
                onClick={sendPrompt}
                className="absolute right-4 top-2 text-blue-500"
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Select Role */}
          <div className="mt-4">
            <Select onValueChange={handleRoleChange} value={selectedRole}>
              <SelectTrigger className="w-full border-gray-300 rounded-lg">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seo">SEO</SelectItem>
                <SelectItem value="generate-content">Generate Content</SelectItem>
                <SelectItem value="generate-ads-meta">Generate Ads Meta</SelectItem>
                <SelectItem value="generate-information">Generate Information</SelectItem>
                <SelectItem value="friendly-chat">Friendly Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      </main>
    </div>
  );
}
