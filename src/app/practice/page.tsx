'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Clock, BarChart3, MessageSquare, ArrowLeft, Timer, Target, HelpCircle, CheckCircle, Send } from 'lucide-react';
import Link from 'next/link';
import CodeEditor from '@/components/CodeEditor';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import { CODING_PROBLEMS, CodingProblem } from '@/data/problems';
import AIService from '@/services/AIService';

export default function PracticePage() {
  // Problem management
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<CodingProblem>(CODING_PROBLEMS[0]);
  const [code, setCode] = useState(CODING_PROBLEMS[0].initialCode);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [hasStartedCoding, setHasStartedCoding] = useState(false);
  
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState({
    executionTime: 0,
    memoryUsage: 0,
    complexity: 'O(?)',
    codeQuality: 0
  });

  // Interview state
  const [interviewPhase, setInterviewPhase] = useState<'initial' | 'coding' | 'submitted' | 'completed' | 'guidance'>('initial');
  const [problemsCompleted, setProblemsCompleted] = useState(0);
  const [aiService] = useState(() => new AIService());

  // Interview tracking states
  const [isInterviewActive] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [codeSubmissions, setCodeSubmissions] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Add state for triggering AI responses in chat
  const [aiCodeResponse, setAiCodeResponse] = useState<string>('');

  // Problem navigation functions
  const handleNextProblem = () => {
    if (currentProblemIndex < CODING_PROBLEMS.length - 1) {
      const nextIndex = currentProblemIndex + 1;
      const nextProblem = CODING_PROBLEMS[nextIndex];
      setCurrentProblemIndex(nextIndex);
      setCurrentProblem(nextProblem);
      setCode(nextProblem.initialCode);
      setIsFirstRun(true);
      setHasStartedCoding(false);
      setInterviewPhase('initial');
      setAiCodeResponse(''); // Reset AI response
    } else {
      setInterviewPhase('completed');
    }
  };

  const handleSubmitProblem = async () => {
    setCodeSubmissions(prev => prev + 1);
    setProblemsCompleted(prev => prev + 1);
    setInterviewPhase('submitted');
    
    // Get AI feedback on submission
    try {
      await aiService.getCodeExecutionResponse(
        code, 
        currentProblem.title, 
        false
      );
      // You can add this response to chat or show in a modal
    } catch (error) {
      console.error('Error getting submission feedback:', error);
    }
  };

  // Timer effect for tracking interview phases
  useEffect(() => {
    if (isInterviewActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInterviewActive]);

  // Initial greeting effect
  useEffect(() => {
    if (interviewPhase === 'initial') {
      const sendInitialGreeting = async () => {
        try {
          await aiService.getInitialGreeting(
            currentProblem.title,
            currentProblem.description
          );
          // The greeting will be handled by the EnhancedChatInterface
        } catch (error) {
          console.error('Error sending initial greeting:', error);
        }
      };
      
      sendInitialGreeting();
    }
  }, [currentProblem, interviewPhase, aiService]);

  // Advanced complexity detection
  const analyzeTimeComplexity = (codeText: string): string => {
    if (!codeText.trim()) return 'O(?)';
    
    // Normalize code for analysis
    const normalizedCode = codeText.toLowerCase();
    const lines = codeText.split('\n');
    
    // Track patterns
    let maxNestedLoops = 0;
    let hasRecursiveCall = false;
    let hasHashSet = false;
    let hasHashMap = false;
    let hasSorting = false;
    let hasLinearSearch = false;
    let hasBinarySearch = false;
    let singleLoop = false;
    
    // Analyze each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      
      // Track loop nesting by indentation and keywords
      if (line.includes('for ') || line.includes('while ')) {
        singleLoop = true;
        
        // Check if this loop is nested inside another
        let isNested = false;
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
          const innerLine = lines[j].trim().toLowerCase();
          if (innerLine && (innerLine.includes('for ') || innerLine.includes('while '))) {
            if (lines[j].length > lines[i].length) { // More indented = nested
              maxNestedLoops = Math.max(maxNestedLoops, 1);
              isNested = true;
            }
          }
        }
        
        // Check for triple nested loops
        if (isNested) {
          for (let k = i + 2; k < Math.min(i + 15, lines.length); k++) {
            const deepLine = lines[k].trim().toLowerCase();
            if (deepLine && (deepLine.includes('for ') || deepLine.includes('while '))) {
              if (lines[k].length > lines[i + 1].length) {
                maxNestedLoops = Math.max(maxNestedLoops, 2);
              }
            }
          }
        }
      }
      
      // Data structures
      if (line.includes('set()') || line.includes('set(') || line.includes('hashset')) {
        hasHashSet = true;
      }
      
      if (line.includes('dict()') || line.includes('dict(') || line.includes('{}') || 
          line.includes('hashmap') || line.includes('map(')) {
        hasHashMap = true;
      }
      
      // Algorithms
      if (line.includes('.sort(') || line.includes('sorted(') || line.includes('sort(')) {
        hasSorting = true;
      }
      
      // Search patterns
      if (line.includes('in arr') || line.includes('in array') || line.includes('in nums') ||
          line.includes('.find(') || line.includes('.index(') || line.includes('linear')) {
        hasLinearSearch = true;
      }
      
      if (line.includes('binary') || line.includes('bisect') || line.includes('log')) {
        hasBinarySearch = true;
      }
      
      // Recursion detection
      if (line.includes('def ')) {
        const funcName = line.match(/def\s+(\w+)/)?.[1];
        if (funcName) {
          // Check if function calls itself
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].toLowerCase().includes(funcName + '(')) {
              hasRecursiveCall = true;
              break;
            }
          }
        }
      }
    }
    
    // Complexity determination
    if (hasRecursiveCall) {
      if (maxNestedLoops >= 2) return 'O(2^n)';
      if (maxNestedLoops === 1) return 'O(n²)';
      if (hasBinarySearch || normalizedCode.includes('//2') || normalizedCode.includes('/2')) return 'O(log n)';
      return 'O(n)';
    }
    
    if (maxNestedLoops >= 2) return 'O(n³)';
    if (maxNestedLoops === 1) return 'O(n²)';
    
    if (hasSorting && !hasHashSet && !hasHashMap) return 'O(n log n)';
    
    if (singleLoop) {
      if (hasHashSet || hasHashMap) return 'O(n)';
      return 'O(n)';
    }
    
    if (hasBinarySearch) return 'O(log n)';
    
    if (hasHashSet || hasHashMap) {
      if (hasLinearSearch) return 'O(n)';
      if (normalizedCode.includes('lookup') || normalizedCode.includes('get(')) return 'O(1)';
      return 'O(n)';
    }
    
    // Simple operations
    if (lines.length <= 3 && normalizedCode.includes('return')) return 'O(1)';
    
    return 'O(?)';
  };

  const analyzeCodeExecution = (code: string) => {
    const codeLines = code.split('\n').filter(line => line.trim()).length;
    const complexity = analyzeTimeComplexity(code);
    const hasComments = code.includes('#') || code.includes('//') || code.includes('"""');
    const hasErrorHandling = code.includes('try') || code.includes('except') || code.includes('if not') || code.includes('if len');
    const hasFunctionDef = code.includes('def ');
    const hasReturnStatement = code.includes('return');
    const hasLoops = code.includes('for') || code.includes('while');
    const hasConditionals = code.includes('if ');
    
    // Detect approach patterns
    const isNestedLoop = (code.match(/for.*:/g) || []).length >= 2;
    const hasHashMap = code.includes('{}') || code.includes('dict') || code.includes('set(');
    const hasSorting = code.includes('sort') || code.includes('sorted');
    
    return {
      complexity,
      codeLines,
      hasComments,
      hasErrorHandling,
      hasFunctionDef,
      hasReturnStatement,
      hasLoops,
      hasConditionals,
      isNestedLoop,
      hasHashMap,
      hasSorting,
      isEmpty: code.trim().length < 10,
      isComplete: hasReturnStatement && hasLoops && codeLines > 3
    };
  };

  const runCode = async () => {
    setIsRunning(true);
    setCodeSubmissions(prev => prev + 1);
    setHasStartedCoding(true);
    
    // Analyze execution result for more context
    const executionAnalysis = analyzeCodeExecution(code);
    
    // Get comprehensive AI response for code execution
    try {
      const response = await aiService.getCodeExecutionResponse(
        code,
        currentProblem.title,
        isFirstRun,
        executionAnalysis
      );
      
      // Trigger AI response in chat interface with enhanced context
      setAiCodeResponse(response);
      setIsFirstRun(false);
      
      // Update interview phase based on progress
      if (isFirstRun) {
        setInterviewPhase('coding');
      } else if (codeSubmissions >= 3) {
        setInterviewPhase('guidance'); // Switch to guidance mode after multiple attempts
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Enhanced fallback with encouragement
      const encouragingFallbacks = [
        "Great work! I'm analyzing your approach. Tell me about your thought process - what's your strategy here?",
        "Nice progress! I can see you're thinking through this systematically. What aspects are you focusing on?",
        "Good job! Your code is taking shape. Walk me through your logic - I'd love to understand your approach better.",
        "Excellent! Let's discuss the complexity and see if there are ways to optimize this further."
      ];
      setAiCodeResponse(encouragingFallbacks[Math.floor(Math.random() * encouragingFallbacks.length)]);
    }
    
    // Simulate code execution with enhanced analysis
    setTimeout(() => {
      const detectedComplexity = analyzeTimeComplexity(code);
      
      // Enhanced analysis based on code patterns
      const codeLines = code.split('\n').filter(line => line.trim()).length;
      const hasComments = code.includes('#') || code.includes('//') || code.includes('"""');
      const hasVariableNames = /\b(seen|duplicates|result|arr|nums|count|freq)\b/.test(code);
      const hasErrorHandling = code.includes('try') || code.includes('except') || code.includes('if not') || code.includes('if len');
      const hasFunctionDef = code.includes('def ');
      const hasDocstring = code.includes('"""') || code.includes("'''");
      const hasTypeHints = code.includes(':') && (code.includes('List') || code.includes('int') || code.includes('str'));
      const hasReturnStatement = code.includes('return');
      
      // Calculate quality score
      let quality = 30; // Base score
      
      // Code structure points
      if (codeLines >= 5 && codeLines <= 20) quality += 15; // Appropriate length
      else if (codeLines > 20) quality += 5; // Too long
      else if (codeLines < 5) quality += 10; // Concise
      
      if (hasComments || hasDocstring) quality += 15; // Documentation
      if (hasVariableNames) quality += 15; // Good naming
      if (hasErrorHandling) quality += 10; // Edge cases
      if (hasFunctionDef) quality += 10; // Proper structure
      if (hasTypeHints) quality += 5; // Modern practices
      if (hasReturnStatement) quality += 5; // Complete function
      
      // Algorithm efficiency points  
      switch (detectedComplexity) {
        case 'O(1)': quality += 30; break;
        case 'O(log n)': quality += 25; break;
        case 'O(n)': quality += 20; break;
        case 'O(n log n)': quality += 15; break;
        case 'O(n²)': quality += 5; break;
        case 'O(n³)': quality -= 5; break;
        case 'O(2^n)': quality -= 10; break;
        default: quality -= 15; // Unknown complexity
      }
      
      // Code patterns bonus
      if (code.includes('set(') || code.includes('dict(')) quality += 10; // Good data structures
      if (code.includes('enumerate') || code.includes('zip')) quality += 5; // Pythonic
      if (code.includes('list comprehension') || /\[.*for.*in.*\]/.test(code)) quality += 5; // Concise
      
      // Execution time simulation based on complexity
      let execTime = 10;
      const randomFactor = Math.random(); // Generate once to avoid hydration issues
      switch (detectedComplexity) {
        case 'O(1)': execTime = 1 + randomFactor * 2; break;
        case 'O(n)': execTime = 5 + randomFactor * 10; break;
        case 'O(n log n)': execTime = 15 + randomFactor * 15; break;
        case 'O(n²)': execTime = 50 + randomFactor * 50; break;
        case 'O(n³)': execTime = 200 + randomFactor * 100; break;
        case 'O(2^n)': execTime = 1000 + randomFactor * 1000; break;
        default: execTime = 0;
      }
      
      // Calculate realistic memory usage based on data structures
      let memoryUsage = 8; // Base memory for function
      
      // Add memory for data structures
      if (code.includes('set(') || code.includes('dict(')) {
        memoryUsage += 32; // Hash table overhead
      }
      if (code.includes('[]') || code.includes('list(')) {
        memoryUsage += 24; // List overhead
      }
      if (code.includes('result') || code.includes('duplicates')) {
        memoryUsage += 16; // Result storage
      }
      
      // Memory complexity based on algorithm
      switch (detectedComplexity) {
        case 'O(1)': memoryUsage += randomFactor * 5; break;
        case 'O(log n)': memoryUsage += 5 + randomFactor * 10; break;
        case 'O(n)': memoryUsage += 20 + randomFactor * 25; break;
        case 'O(n²)': memoryUsage += 50 + randomFactor * 40; break;
        default: memoryUsage += 15 + randomFactor * 20;
      }
      
      setMetrics({
        executionTime: execTime,
        memoryUsage: Math.round(memoryUsage * 100) / 100,
        complexity: detectedComplexity,
        codeQuality: Math.min(100, Math.max(0, Math.round(quality)))
      });
      
      setIsRunning(false);
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHintUsed = () => {
    setHintsUsed(prev => prev + 1);
  };

  const handleQuestionAsked = () => {
    // Track questions asked for analytics
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Simplified Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">CodeSage Interview</h1>
            </div>
          </div>
          
          {/* Compact Interview Stats */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Timer className="w-4 h-4" />
                <span>{Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <HelpCircle className="w-4 h-4" />
                <span>{hintsUsed}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{codeSubmissions}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <Play className="w-4 h-4" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
              
              <button
                onClick={handleSubmitProblem}
                disabled={!hasStartedCoding || isRunning}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Submit Solution</span>
              </button>
              
              {interviewPhase === 'submitted' && currentProblemIndex < CODING_PROBLEMS.length - 1 && (
                <button
                  onClick={handleNextProblem}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  <Target className="w-4 h-4" />
                  <span>Next Problem</span>
                </button>
              )}
              
              {interviewPhase === 'completed' && (
                <button
                  onClick={async () => {
                    const closingMessage = await aiService.getClosingInteraction(
                      problemsCompleted, 
                      formatTime(timeElapsed), 
                      "excellent"
                    );
                    alert(closingMessage); // You can replace this with a proper modal
                  }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Interview</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Clean 3-Panel Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Problem Statement Panel - Streamlined */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">{currentProblem.title}</h2>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                currentProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                currentProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentProblem.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-600">{currentProblem.category}</p>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Medium</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Array</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Problem Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{currentProblem.description}</div>
              </div>

              {/* Examples - Compact */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Examples</h3>
                <div className="space-y-2">
                  {currentProblem.testCases.slice(0, 2).map((example: { input: string; output: string; explanation?: string }, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded border-l-2 border-purple-400">
                      <div className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">Input:</span> <code className="bg-white px-1 rounded text-purple-700">{example.input}</code>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Output:</span> <code className="bg-white px-1 rounded text-blue-700">{example.output}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints - Compact */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Constraints</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  {['Array length: 1 ≤ n ≤ 10^5', 'Time complexity: O(n)', 'Space complexity: O(n)'].map((constraint: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span>{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Performance Metrics - Compact */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded border">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-1 text-purple-600" />
                  Results
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-mono">{metrics.executionTime > 0 ? `${metrics.executionTime.toFixed(1)}ms` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-mono">{metrics.memoryUsage > 0 ? `${metrics.memoryUsage.toFixed(1)}MB` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complexity:</span>
                    <span className="font-mono text-purple-600">{metrics.complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality:</span>
                    <span className="font-mono text-green-600">{metrics.codeQuality > 0 ? `${metrics.codeQuality}%` : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Your Solution</span>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{metrics.executionTime > 0 ? `${metrics.executionTime.toFixed(1)}ms` : 'Not run yet'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              language="python"
            />
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-medium text-gray-700">AI Assistant</h3>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <EnhancedChatInterface 
              onHintUsed={handleHintUsed}
              onQuestionAsked={handleQuestionAsked}
              currentCode={code}
              problemTitle={currentProblem.title}
              currentProblem={currentProblem}
              interviewPhase={interviewPhase}
              aiCodeResponse={aiCodeResponse}
              onCodeResponseHandled={() => setAiCodeResponse('')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}