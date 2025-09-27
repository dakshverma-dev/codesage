'use client';

import { useState, useCallback, useEffect } from 'react';
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

interface EnhancedChatInterfaceProps {
  onHintUsed?: () => void;
  onQuestionAsked?: () => void;
  currentCode?: string;
  problemTitle?: string;
  currentProblem?: any;
  onCodeExecution?: (response: string) => void;
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
  onCodeExecution,
  interviewPhase = 'initial',
  aiCodeResponse = '',
  onCodeResponseHandled
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiService] = useState(() => new AIService());
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);

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
  }, [currentProblem, interviewPhase, messages.length, problemTitle]);

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

  // Enhanced mock responses based on code analysis
  const getContextualResponse = useCallback((userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('nested') || message.includes('loop')) {
      return "📊 **Analytics Insight**: I notice you're considering nested loops - that's a logical first approach! \n\n⚠️ **Performance Impact**: This gives us O(n²) complexity. For enterprise-scale data (1M+ elements), this could mean billions of operations.\n\n💡 **Coaching Tip**: In real interviews, demonstrating awareness of scalability shows senior-level thinking. Can you think of a data structure that offers O(1) lookup time?";
    }
    
    if (message.includes('hash') || message.includes('set')) {
      return "🎉 **Excellent Choice!** Hash sets are the optimal solution here - you're thinking like a senior engineer!\n\n📈 **Performance Boost**: O(1) average lookup × O(n) iteration = O(n) total complexity\n\n🔧 **Implementation Strategy**: \n1. Create an empty set and result list\n2. For each element: check if it exists in set\n3. If yes → add to results, if no → add to set\n\n💼 **Interview Success**: This approach will impress any interviewer!";
    }
    
    if (message.includes('complexity') || message.includes('time')) {
      return "📊 **Complexity Analysis** - Great question! This shows algorithmic maturity:\n\n⏱️ **Time Complexity Options**:\n• Nested loops: O(n²) - Works but not scalable\n• Hash set approach: O(n) - Industry standard\n• Sorting first: O(n log n) - Alternative approach\n\n💾 **Space Complexity**: O(n) for hash set - reasonable trade-off\n\n🎯 **CodeSage Tip**: Always discuss both time and space complexity in interviews!";
    }
    
    if (message.includes('hint') || message.includes('help')) {
      return "💡 **CodeSage Progressive Coaching**:\n\n🔍 **Level 1 Hint**: What data structure allows instant membership checking?\n\n📚 **Level 2 Hint**: Think about Python's `set()` or JavaScript's `Set()`\n\n🚀 **Level 3 Hint**: Iterate once, check existence, then decide to add to results or tracking set\n\n💪 Remember: In real interviews, asking for hints shows engagement, not weakness!";
    }
    
    if (message.includes('done') || message.includes('finished')) {
      return "🎉 **Solution Analysis Complete!**\n\n✅ **Correctness**: Logic handles edge cases well\n📊 **Performance**: Efficiency meets industry standards\n🗣️ **Communication**: You explained your approach clearly\n\n📈 **CodeSage Score Factors**:\n• Algorithm choice: Optimal\n• Code clarity: Professional\n• Edge case handling: Thorough\n\n🎯 **Next Challenge**: Ready for the follow-up question about memory optimization?";
    }
    
    // Default encouraging responses
    const defaultResponses = [
      "💭 **Thoughtful approach!** CodeSage analytics show this type of reasoning leads to strong interview performance. How do you evaluate the efficiency of your current solution?",
      "🎯 **You're progressing well!** Let's consider scalability - how would your solution perform with enterprise-level data (millions of elements)?",
      "🔍 **Interesting direction!** Have you considered edge cases? Testing boundary conditions is what separates good developers from great ones.",
      "📊 **Good analytical thinking!** What's the time complexity here? Remember, interviewers love when candidates proactively discuss Big O notation.",
      "💡 **Solid reasoning!** CodeSage interview data shows optimization discussions boost candidate scores. What improvements can we explore?",
      "🚀 **Nice logic flow!** What data structures offer constant-time lookup? Think about the tools in your CS fundamentals toolkit."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }, []);

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

  const handleVoiceSpeakingToggle = () => {
    setIsSpeakingEnabled(!isSpeakingEnabled);
    if (isSpeakingEnabled) {
      voiceService.stopSpeaking();
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-colors"
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