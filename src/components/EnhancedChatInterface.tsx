'use client';

import { useState, useEffect } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import AIService from '@/services/AIService';
import VoiceControls from './VoiceControls';
import { voiceService } from '@/services/VoiceService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHint?: boolean;
  isQuestion?: boolean;
}

import { CodingProblem } from '@/data/problems';

interface EnhancedChatInterfaceProps {
  onHintUsed?: () => void;
  onQuestionAsked?: () => void;
  currentCode?: string;
  problemTitle?: string;
  currentProblem?: CodingProblem;
  interviewPhase?: string;
  aiCodeResponse?: string;
  onCodeResponseHandled?: () => void;
}

export default function EnhancedChatInterface({ 
  onHintUsed, 
  onQuestionAsked, 
  currentCode = '', 
  problemTitle = 'Find Duplicates in Array',
  currentProblem,
  interviewPhase = 'initial',
  aiCodeResponse = '',
  onCodeResponseHandled
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiService] = useState(() => new AIService());
  const [isSpeakingEnabled] = useState(true);

  // Initial greeting effect
  useEffect(() => {
    if (messages.length === 0 && currentProblem && interviewPhase === 'initial') {
      const sendInitialGreeting = async () => {
        try {
          const greeting = await aiService.getInitialGreeting(
            currentProblem.title,
            currentProblem.description
          );
          
          const initialMessage: Message = {
            id: '1',
            type: 'assistant',
            content: greeting,
            timestamp: new Date()
          };
          
          setMessages([initialMessage]);
        } catch (error) {
          console.error('Error getting initial greeting:', error);
          // Fallback greeting that matches sample interaction
          const fallbackMessage: Message = {
            id: '1',
            type: 'assistant',
            content: `Let's start with this problem. Take your time and think aloud as you code. What's your initial approach?`,
            timestamp: new Date()
          };
          setMessages([fallbackMessage]);
        }
      };
      
      sendInitialGreeting();
    }
  }, [currentProblem, interviewPhase, messages.length, problemTitle, aiService]);

  // Handle AI code execution responses
  useEffect(() => {
    if (aiCodeResponse && onCodeResponseHandled) {
      const codeResponseMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: aiCodeResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, codeResponseMessage]);
      
      // Speak the AI response if voice is enabled
      if (isSpeakingEnabled && voiceService.isSupported().speechSynthesis) {
        voiceService.speakText(aiCodeResponse).catch(console.error);
      }
      
      onCodeResponseHandled(); // Clear the response
    }
  }, [aiCodeResponse, onCodeResponseHandled, isSpeakingEnabled]);

  // Speak AI messages when they are added
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'assistant' && isSpeakingEnabled && voiceService.isSupported().speechSynthesis) {
        // Only speak new AI messages (not initial messages or code responses which are handled above)
        if (!aiCodeResponse) {
          voiceService.speakText(lastMessage.content).catch(console.error);
        }
      }
    }
  }, [messages, isSpeakingEnabled, aiCodeResponse]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Detect message type using AI service
    const messageAnalysis = aiService.detectMessageType(inputMessage);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      isHint: messageAnalysis.isHintRequest,
      isQuestion: messageAnalysis.isQuestionAsked
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // Track analytics
    if (messageAnalysis.isHintRequest && onHintUsed) {
      onHintUsed();
    }
    if (messageAnalysis.isQuestionAsked && onQuestionAsked) {
      onQuestionAsked();
    }

    try {
      // Get AI response from Gemini
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const aiResponse = await aiService.getInterviewResponse(
        currentInput,
        currentCode,
        `Problem: ${problemTitle}`,
        conversationHistory
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        isHint: messageAnalysis.isHintRequest
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble connecting to my AI brain right now. Can you tell me more about your approach to this problem? 🤔",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const analyzeComplexity = async () => {
    if (!currentCode.trim()) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Please write some code first, then I can analyze its time and space complexity! 📝",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const analysis = await aiService.analyzeCodeComplexity(currentCode);
      
      const analysisMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🔍 **Code Complexity Analysis**\n\n⏱️ **Time Complexity:** ${analysis.timeComplexity}\n💾 **Space Complexity:** ${analysis.spaceComplexity}\n\n📝 **Analysis:** ${analysis.explanation}\n\n💡 **Optimization Tips:**\n${analysis.suggestions.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, analysisMessage]);
    } catch (error) {
      console.error('Error analyzing complexity:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I had trouble analyzing your code complexity. Could you tell me about your approach instead? 🤔",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle voice input
  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim()) {
      setInputMessage(transcript);
      // Auto-send voice input after a short delay
      setTimeout(() => {
        if (transcript.trim()) {
          sendMessage();
        }
      }, 500);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addPredefinedMessage = (message: string) => {
    setInputMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="text-xs font-medium text-gray-700 mb-2">💬 Common Interview Responses:</div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => addPredefinedMessage("I'm thinking about using nested loops for this problem")}
            className="text-xs px-3 py-1.5 bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 rounded-lg transition-colors shadow-sm"
          >
            🔄 Brute force approach
          </button>
          <button 
            onClick={() => addPredefinedMessage("What about using a hash set for O(1) lookups?")}
            className="text-xs px-3 py-1.5 bg-white border border-green-200 hover:bg-green-50 text-green-700 rounded-lg transition-colors shadow-sm"
          >
            ⚡ Optimization idea
          </button>
          <button 
            onClick={() => addPredefinedMessage("Could I get a progressive hint to guide my thinking?")}
            className="text-xs px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-lg transition-colors shadow-sm"
          >
            💡 Request guidance
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-lg shadow-sm relative ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm' 
                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
            }`}>
              {/* Speaking indicator for AI messages */}
              {message.type === 'assistant' && voiceService.getState().isSpeaking && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              {/* Message type indicator */}
              {(message.isHint || message.isQuestion) && (
                <div className={`text-xs mb-2 ${message.type === 'user' ? 'text-blue-200' : 'text-purple-600'}`}>
                  {message.isHint && '💡 Hint Request'}
                  {message.isQuestion && !message.isHint && '❓ Question'}
                  {message.type === 'assistant' && message.isHint && '🎯 AI Guidance'}
                </div>
              )}
              
              <div className="text-sm whitespace-pre-line">{message.content}</div>
              
              <div className={`text-xs mt-2 flex items-center justify-between ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                <span>
                  {String(message.timestamp.getHours()).padStart(2, '0')}:
                  {String(message.timestamp.getMinutes()).padStart(2, '0')}
                </span>
                
                {/* Analytics indicators */}
                {message.type === 'assistant' && message.isHint && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded">Tracked</span>
                )}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-700">You</span>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-sm shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        {/* Quick Actions */}
        <div className="flex space-x-2">
          <button
            onClick={analyzeComplexity}
            disabled={isAnalyzing || !currentCode.trim()}
            className="flex items-center space-x-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 disabled:bg-gray-100 text-purple-700 disabled:text-gray-400 rounded-lg transition-colors text-xs font-medium"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Bot className="w-3 h-3" />
                <span>Analyze Complexity</span>
              </>
            )}
          </button>
        </div>

        {/* Voice Controls */}
        <VoiceControls 
          onSpeechResult={handleVoiceInput}
          onSpeechStart={() => console.log('Started listening...')}
          onSpeechEnd={() => console.log('Stopped listening...')}
          className="flex justify-center"
        />

        {/* Message Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type or speak your question... Ask for hints, explain your approach, or discuss the solution..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-colors text-black placeholder-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all font-medium"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}