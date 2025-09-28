'use client';

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

interface ExecutionResult {
  output?: string;
  error?: string;
  status?: 'success' | 'error';
  runtime?: number;
  // Code analysis properties
  complexity?: string;
  codeLines?: number;
  hasComments?: boolean;
  hasErrorHandling?: boolean;
  hasFunctionDef?: boolean;
  hasReturnStatement?: boolean;
  hasLoops?: boolean;
  hasConditionals?: boolean;
  isNestedLoop?: boolean;
  hasHashMap?: boolean;
  hasSorting?: boolean;
  isEmpty?: boolean;
  isComplete?: boolean;
}

class AIService {
  private genAI: GoogleGenerativeAI | null;
  private model: GenerativeModel | null;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      // During build time or when API key is missing, create a mock instance
      console.warn('Gemini API key not found - running in mock mode');
      this.genAI = null;
      this.model = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.5-flash which is the current stable model
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });
  }

  private checkModelAvailable(): boolean {
    return this.model !== null && this.genAI !== null;
  }

  private getMockResponse(context: string): string {
    return `I'm currently running in demo mode. In a real deployment with proper API configuration, I would provide intelligent AI feedback for: ${context}`;
  }

  /**
   * Provides initial greeting when starting a problem
   */
  async getInitialGreeting(problemTitle: string, problemDescription: string): Promise<string> {
    const prompt = `You are CodeSage, a friendly and encouraging AI interviewer. A candidate just started working on "${problemTitle}".

    Problem: ${problemDescription}

    Provide a warm, human-like greeting that:
    - Welcomes them enthusiastically
    - Mentions this is a common interview question
    - Encourages them to think aloud
    - Sets a supportive tone
    - Keeps it conversational (2-3 sentences max)
    
    Style: Be encouraging, professional but friendly, like a senior engineer mentoring a colleague.`;

    try {
      if (!this.checkModelAvailable()) {
        return `👋 Welcome! Let's tackle "${problemTitle}" together. This is a popular interview question, so take your time and think aloud as you work through it - that's exactly what interviewers love to see!`;
      }
      
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting initial greeting:', error);
      return `👋 Welcome! Let's tackle "${problemTitle}" together. This is a popular interview question, so take your time and think aloud as you work through it - that's exactly what interviewers love to see!`;
    }
  }

  /**
   * Provides contextual response when code is executed
   */
  async getCodeExecutionResponse(
    code: string, 
    problemTitle: string, 
    isFirstRun: boolean = false,
    executionResult?: ExecutionResult
  ): Promise<string> {
    const prompt = `You are CodeSage, an experienced and encouraging AI technical interviewer conducting a live coding session. The candidate just ${isFirstRun ? 'ran their first solution' : 'executed updated code'} for "${problemTitle}".

    CODE SUBMITTED:
    ${code}

    ${executionResult ? `EXECUTION RESULT: ${executionResult}` : ''}

    As an interviewer, provide immediate feedback that:

    1. **Always starts encouraging**: "Good work!", "Nice progress!", "Your logic looks solid!"
    
    2. **Analyzes approach without spoiling**:
    - If brute force/nested loops: "I can see the logic is working! This gives us O(n²) time complexity though. For a dataset of a million records, that's a trillion operations. What if we needed to process this in real-time?"
    - If using better approach: "Excellent! You're thinking about efficiency. This approach shows good algorithmic thinking."
    - If partially correct: "You're on the right track! I see what you're aiming for here."
    
    3. **Guides with questions, never gives direct answers**:
    - "What data structure could help us track what we've seen?"
    - "How could we reduce the number of passes through the data?"
    - "What's another way to approach this problem?"
    
    4. **Relates to real-world scenarios**:
    - "In production systems..."
    - "When handling user data at scale..."
    - "Enterprise applications often need..."
    
    5. **Maintains interview atmosphere**:
    - Ask follow-up questions
    - Encourage thinking aloud
    - Show interest in their thought process
    
    Respond as if you're sitting next to them in an interview. Be conversational, encouraging, and guide them toward better solutions without revealing the answer. Keep it 2-3 sentences.`;

    try {
      if (!this.checkModelAvailable()) {
        return this.getFallbackExecutionResponse(code, isFirstRun);
      }
      
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting code execution response:', error);
      return this.getFallbackExecutionResponse(code, isFirstRun);
    }
  }

  /**
   * Provides guidance when user seems stuck or taking wrong approach
   */
  async getGuidanceResponse(
    problemTitle: string,
    userCode: string,
    timeSpent: number,
    attemptCount: number
  ): Promise<string> {
    const prompt = `You are CodeSage, an experienced technical interviewer. The candidate has been working on "${problemTitle}" for ${timeSpent} minutes and this is attempt ${attemptCount}.

    CURRENT CODE:
    ${userCode}

    The candidate seems to be stuck or may need gentle guidance. Provide supportive feedback that:

    1. **Acknowledges their effort**: "I can see you're really thinking this through..."
    
    2. **Identifies the pattern without spoiling**:
    - If they're overcomplicating: "Sometimes the simplest approach is the best. What's the most straightforward way to think about this?"
    - If missing key insight: "You're close! Think about what information we need to track as we go through the data."
    - If wrong direction: "Interesting approach! Let me ask you this - what if we approached it from a different angle?"
    
    3. **Asks leading questions**:
    - "What would happen if we processed elements one by one?"
    - "What information do we need to remember from previous iterations?"
    - "How would you explain this problem to a friend?"
    
    4. **Encourages different perspective**:
    - "Let's step back for a moment - what's the core problem we're trying to solve?"
    - "What if we drew this out on paper first?"
    
    Be encouraging and helpful without giving away the solution. Keep it supportive and interview-appropriate, 2-3 sentences.`;

    try {
      if (!this.checkModelAvailable()) {
        return "I can see you're working hard on this! Sometimes it helps to step back and think about the problem differently. What's the core challenge we're trying to solve here?";
      }
      
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting guidance response:', error);
      return "I can see you're working hard on this! Sometimes it helps to step back and think about the problem differently. What's the core challenge we're trying to solve here?";
    }
  }

  /**
   * Provides contextual hints based on current progress
   */
  async getProgressiveHint(
    problemTitle: string,
    userCode: string,
    hintLevel: number // 1-3, increasing specificity
  ): Promise<string> {
    const hintLevels = {
      1: "Think about the problem conceptually first",
      2: "Consider what data structures might help",
      3: "Focus on the algorithm approach"
    };

    const prompt = `You are CodeSage giving a ${hintLevels[hintLevel as keyof typeof hintLevels]} hint for "${problemTitle}".

    CURRENT CODE:
    ${userCode}

    Provide a hint that's appropriate for level ${hintLevel}:
    - Level 1: Conceptual guidance, problem understanding
    - Level 2: Data structure suggestions, general approach
    - Level 3: More specific algorithmic direction (but no direct answers)

    Keep it encouraging and interview-appropriate. Never give the full solution.`;

    try {
      if (!this.checkModelAvailable()) {
        const fallbackHints = {
          1: "Let's think about this step by step. What exactly are we trying to find or achieve?",
          2: "Consider what data structure would help you keep track of elements efficiently.",
          3: "Think about whether you need to compare every element with every other element, or if there's a smarter way."
        };
        return fallbackHints[hintLevel as keyof typeof fallbackHints] || "Keep thinking - you're on the right track!";
      }
      
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting progressive hint:', error);
      const fallbackHints = {
        1: "Let's think about this step by step. What exactly are we trying to find or achieve?",
        2: "Consider what data structure would help you keep track of elements efficiently.",
        3: "Think about whether you need to compare every element with every other element, or if there's a smarter way."
      };
      return fallbackHints[hintLevel as keyof typeof fallbackHints] || "Keep thinking - you're on the right track!";
    }
  }

  /**
   * Provides closing remarks when interview ends
   */
  async getClosingInteraction(
    problemsSolved: number, 
    totalTime: string, 
    performance: string
  ): Promise<string> {
    const prompt = `You are CodeSage concluding an interview session. The candidate completed ${problemsSolved} problems in ${totalTime} with ${performance} performance.

    Provide a warm, professional closing that:
    1. Congratulates them on completing the session
    2. Highlights their strengths 
    3. Mentions areas for improvement (if any)
    4. Encourages continued practice
    5. Ends with a positive, motivational note
    
    Style: Supportive mentor tone, like a senior engineer wrapping up a mock interview.
    Length: 3-4 sentences.`;

    try {
      if (!this.checkModelAvailable()) {
        return `🎉 Great work completing ${problemsSolved} problems! You showed solid problem-solving skills and good coding practices. Keep practicing these patterns - you're on the right track for your next interview!`;
      }
      
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error getting closing interaction:', error);
      return `🎉 Great work completing ${problemsSolved} problems! You showed solid problem-solving skills and good coding practices. Keep practicing these patterns - you're on the right track for your next interview!`;
    }
  }

  private getFallbackExecutionResponse(code: string, isFirstRun: boolean): string {
    const codeLines = code.toLowerCase();
    
    // Empty or minimal code
    if (code.trim().length < 10) {
      return isFirstRun 
        ? "Great! I see you're starting to code. Talk me through your approach - what's your initial strategy for solving this?"
        : "I'm ready when you are! What are you thinking for the next step?";
    }
    
    // Detect nested loops (O(n²) complexity)
    if ((codeLines.includes('for i') && codeLines.includes('for j')) || 
        (codeLines.match(/for.*:/g) || []).length >= 2) {
      return isFirstRun 
        ? "Good work! Your logic is solid and this will definitely work. I notice this uses nested loops though - O(n²) complexity. For a million-element array, that's a trillion operations. What if we needed to process real-time user data?"
        : "I see you're refining the nested loop approach. For enterprise applications processing large datasets, this O(n²) complexity could become a bottleneck. What data structure might help us track elements more efficiently?";
    }
    
    // Detect hash-based solutions
    if (codeLines.includes('set(') || codeLines.includes('{}') || 
        codeLines.includes('seen') || codeLines.includes('dict') || 
        codeLines.includes('hashmap') || codeLines.includes('hashtable')) {
      return isFirstRun
        ? "Excellent thinking! Using a hash-based approach shows great algorithmic intuition. This gives us O(1) average lookup time. How does this change our overall time complexity?"
        : "Perfect! This hash-based solution is much more efficient - O(n) time complexity. This is exactly what we'd want in a production system. Can you walk me through how this handles edge cases?";
    }
    
    // Detect sorting-based approaches
    if (codeLines.includes('sort') || codeLines.includes('sorted')) {
      return "Interesting approach! Sorting first is a valid strategy. What's the time complexity when we factor in the sort operation? Are there any trade-offs we should consider?";
    }
    
    // Detect list comprehensions or functional approaches
    if (codeLines.includes('[') && codeLines.includes('for') && codeLines.includes('in')) {
      return "Nice! I like the functional programming approach - very clean and readable. This is definitely more Pythonic. What's the space complexity of this solution?";
    }
    
    // Detect conditional logic
    if (codeLines.includes('if') && codeLines.includes('return')) {
      return isFirstRun
        ? "Good start! I can see you're thinking through the logic flow. Tell me more about your approach - what conditions are you checking for?"
        : "I like how you're handling the different cases. Are there any edge cases we should consider? What happens with empty inputs?";
    }
    
    // Generic encouraging responses for other patterns
    const encouragingResponses = [
      "Good progress! I can see you're thinking systematically about this. What's your next step?",
      "Nice work! Tell me about the approach you're taking - I'd love to understand your thought process.",
      "Solid start! How are you planning to handle the core logic here?",
      "I like where this is going! What's your strategy for optimizing this solution?",
      "Excellent! You're building this step by step. What data structures are you considering?"
    ];
    
    if (isFirstRun) {
      return "Great! I can see you're getting started. Walk me through your thinking - what's your game plan for tackling this problem?";
    }
    
    return encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
  }

  /**
   * Analyzes code and provides time complexity analysis
   */
  async analyzeCodeComplexity(code: string): Promise<{
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
    suggestions: string[];
  }> {
    const prompt = `
    Analyze this code for time and space complexity. Be precise and educational:

    \`\`\`
    ${code}
    \`\`\`

    Please provide:
    1. Time Complexity (Big O notation)
    2. Space Complexity (Big O notation) 
    3. Brief explanation of why
    4. 2-3 optimization suggestions

    Format your response as JSON:
    {
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "explanation": "Brief explanation of the complexity analysis",
      "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
    }
    `;

    try {
      if (!this.checkModelAvailable()) {
        return {
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          explanation: "Analysis not available in demo mode",
          suggestions: ["Enable API key for full analysis"]
        };
      }
      
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        timeComplexity: "O(?)",
        spaceComplexity: "O(?)",
        explanation: "Unable to analyze complexity automatically.",
        suggestions: ["Review your algorithm", "Consider edge cases", "Think about optimization"]
      };
    } catch (error) {
      console.error('Error analyzing code complexity:', error);
      
      // Provide more helpful error messages
      if (error instanceof Error && error.message.includes('not found')) {
        return {
          timeComplexity: "O(?)",
          spaceComplexity: "O(?)",
          explanation: "AI analysis temporarily unavailable. Try manual analysis: count your loops and recursive calls.",
          suggestions: ["Look for nested loops (O(n²))", "Single loops are usually O(n)", "Consider your data structure usage"]
        };
      }
      
      return {
        timeComplexity: "O(?)",
        spaceComplexity: "O(?)",
        explanation: "Error occurred during analysis.",
        suggestions: ["Check your code syntax", "Try running the code first", "Consider the algorithm's steps manually"]
      };
    }
  }

  /**
   * Provides intelligent interview coaching responses
   */
  async getInterviewResponse(
    userMessage: string, 
    currentCode: string, 
    problemContext: string,
    conversationHistory: Array<{role: string; content: string}>
  ): Promise<string> {
    const contextPrompt = `
    You are CodeSage, an expert technical interview coach. You're helping a candidate practice coding interviews.

    PROBLEM CONTEXT: ${problemContext}
    
    CURRENT CODE:
    \`\`\`
    ${currentCode}
    \`\`\`

    CONVERSATION HISTORY:
    ${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

    CANDIDATE'S MESSAGE: ${userMessage}

    Respond as a supportive but challenging technical interviewer. Be:
    - Encouraging but honest
    - Focus on problem-solving approach
    - Provide hints that guide thinking, not direct answers
    - Ask follow-up questions to assess understanding
    - Mention time/space complexity when relevant
    - Keep responses concise (2-3 sentences max)
    - Use emojis sparingly for engagement

    If they ask for hints, provide progressive guidance.
    If they ask about complexity, analyze their current approach.
    If they're stuck, ask clarifying questions about their thought process.
    `;

    try {
      if (!this.checkModelAvailable()) {
        return this.getMockResponse(`interview response for "${userMessage}"`);
      }
      
      console.log('Attempting to call Gemini API with model: gemini-2.5-flash');
      const result = await this.model!.generateContent(contextPrompt);
      const response = await result.response;
      const text = response.text();
      console.log('Gemini API response received successfully');
      return text;
    } catch (error) {
      console.error('Error getting AI response:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Check if it's a model availability error
      if (error instanceof Error && error.message.includes('not found')) {
        return "🤖 I'm having trouble with my AI model right now. Let me help you the traditional way - what specific part of this problem are you struggling with?";
      }
      
      return "I'm having trouble connecting right now. Can you tell me more about your approach to this problem?";
    }
  }

  /**
   * Detects if user is asking for hints or complexity analysis
   */
  detectMessageType(message: string): {
    isHintRequest: boolean;
    isComplexityQuestion: boolean;
    isQuestionAsked: boolean;
  } {
    const lowerMsg = message.toLowerCase();
    
    const hintKeywords = ['hint', 'help', 'stuck', 'clue', 'guidance', 'tip'];
    const complexityKeywords = ['complexity', 'time', 'space', 'big o', 'efficiency', 'optimize'];
    
    return {
      isHintRequest: hintKeywords.some(keyword => lowerMsg.includes(keyword)),
      isComplexityQuestion: complexityKeywords.some(keyword => lowerMsg.includes(keyword)),
      isQuestionAsked: message.includes('?') || message.includes('how') || message.includes('why') || message.includes('what')
    };
  }
}

export default AIService;