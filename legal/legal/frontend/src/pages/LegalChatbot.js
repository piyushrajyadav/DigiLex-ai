import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../utils/api';
import PageBackground from '../components/PageBackground';
import TypingEffect from '../components/TypingEffect';
import ReasoningDisplay from '../components/ReasoningDisplay';

const LegalChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'नमस्ते! I\'m your AI-powered legal assistant specialized in Indian law. I can provide information about Indian legal matters including constitutional law, criminal law, civil law, family law, corporate law, and more. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [typingComplete, setTypingComplete] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingComplete]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentQuery(input);
    setInput('');
    setLoading(true);
    setError(null);
    setTypingComplete(true);
    
    try {
      const response = await aiAPI.chat(input);
      
      if (response.data.success) {
        setTypingComplete(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.data.response,
          isTyping: true
        }]);
      } else {
        setError('Failed to get response. Please try again.');
      }
    } catch (err) {
      console.error('Error in chat:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTypingComplete = () => {
    setTypingComplete(true);
  };
  
  const toggleReasoning = () => {
    setShowReasoning(!showReasoning);
  };
  
  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const isLastAssistantMessage = !isUser && index === messages.length - 1;
    
    return (
      <div 
        key={index} 
        className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}
      >
        {!isUser && isLastAssistantMessage && showReasoning && (
          <ReasoningDisplay query={currentQuery} isVisible={true} />
        )}
        <div 
          className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
            isUser 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white'
          }`}
        >
          {isUser || (isLastAssistantMessage && !message.isTyping) ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : isLastAssistantMessage && message.isTyping ? (
            <TypingEffect 
              text={message.content} 
              speed={30} 
              onComplete={handleTypingComplete}
            />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    );
  };
  
  const renderSuggestions = () => {
    const suggestions = [
      "What are my rights if I'm arrested?",
      "How do I file for divorce in India?",
      "Explain the GST registration process",
      "What are the requirements for starting a company in India?",
      "How does property inheritance work in India?"
    ];
    
    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggested questions:</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(suggestion);
                // Focus the input field
                document.getElementById('chat-input').focus();
              }}
              className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <PageBackground>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DigiLex Legal Assistant</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get expert legal guidance on Indian laws, regulations, and procedures.
            </p>
          </div>
          <button 
            onClick={toggleReasoning}
            className={`flex items-center px-3 py-2 rounded-md text-sm ${
              showReasoning 
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${showReasoning ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Show Reasoning
          </button>
        </div>
        
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-4">
          <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50/70 dark:bg-gray-900/70 rounded-lg">
            {messages.map(renderMessage)}
            {loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                </div>
              </div>
            )}
            {error && (
              <div className="text-center py-2">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your legal question here..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading || !typingComplete}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !typingComplete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
          
          {messages.length <= 2 && renderSuggestions()}
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          <p>
            This AI assistant provides general legal information based on Indian law. 
            It is not a substitute for professional legal advice.
          </p>
        </div>
      </div>
    </PageBackground>
  );
};

export default LegalChatbot; 