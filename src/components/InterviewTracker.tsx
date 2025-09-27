'use client';

import { Timer, Target, HelpCircle, CheckCircle, Clock, BarChart3, MessageCircle } from 'lucide-react';

interface InterviewTrackerProps {
  elapsedTime: number;
  currentPhase: 'reading' | 'coding' | 'testing' | 'discussing';
  phaseTimers: {
    reading: number;
    coding: number;
    testing: number;
    discussing: number;
  };
  hintsUsed: number;
  questionsAsked: number;
  codeSubmissions: number;
  complexityHistory: string[];
  onPhaseChange: (phase: 'reading' | 'coding' | 'testing' | 'discussing') => void;
}

export default function InterviewTracker({
  elapsedTime,
  currentPhase,
  phaseTimers,
  hintsUsed,
  questionsAsked,
  codeSubmissions,
  complexityHistory,
  onPhaseChange
}: InterviewTrackerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'reading': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'coding': return 'text-green-600 bg-green-50 border-green-200';
      case 'testing': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'discussing': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'reading': return <Target className="w-4 h-4" />;
      case 'coding': return <BarChart3 className="w-4 h-4" />;
      case 'testing': return <CheckCircle className="w-4 h-4" />;
      case 'discussing': return <MessageCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPerformanceIndicator = () => {
    const totalTime = elapsedTime;
    const efficiency = codeSubmissions > 0 ? Math.max(0, 100 - (hintsUsed * 10) - (questionsAsked * 5)) : 0;
    
    if (totalTime < 900 && efficiency > 80) return { color: 'text-green-600', label: 'Excellent' }; // < 15 min
    if (totalTime < 1800 && efficiency > 60) return { color: 'text-blue-600', label: 'Good' }; // < 30 min
    if (totalTime < 2700) return { color: 'text-orange-600', label: 'Average' }; // < 45 min
    return { color: 'text-red-600', label: 'Needs Improvement' };
  };

  const performance = getPerformanceIndicator();

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
        <Timer className="w-4 h-4 mr-2 text-purple-600" />
        Interview Analytics
      </h3>

      {/* Overall Timer */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">Total Time</span>
          <span className="text-lg font-mono font-semibold text-gray-900">
            {formatTime(elapsedTime)}
          </span>
        </div>
        <div className={`text-xs font-medium ${performance.color}`}>
          Performance: {performance.label}
        </div>
      </div>

      {/* Phase Tracker */}
      <div className="mb-4">
        <div className="text-xs text-gray-600 mb-2">Interview Phase</div>
        <div className="grid grid-cols-2 gap-2">
          {(['reading', 'coding', 'testing', 'discussing'] as const).map((phase) => (
            <button
              key={phase}
              onClick={() => onPhaseChange(phase)}
              className={`p-2 text-xs rounded-lg border transition-colors ${
                currentPhase === phase 
                  ? getPhaseColor(phase) 
                  : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-1">
                {getPhaseIcon(phase)}
                <span className="capitalize">{phase}</span>
              </div>
              <div className="font-mono text-xs mt-1">
                {formatTime(phaseTimers[phase])}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interaction Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-gray-600">Hints Used</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">{hintsUsed}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-3 h-3 text-green-500" />
            <span className="text-xs text-gray-600">Questions Asked</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">{questionsAsked}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-purple-500" />
            <span className="text-xs text-gray-600">Code Runs</span>
          </div>
          <span className="text-xs font-semibold text-gray-900">{codeSubmissions}</span>
        </div>

        {/* Complexity Evolution */}
        {complexityHistory.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-2">Complexity Evolution</div>
            <div className="flex flex-wrap gap-1">
              {complexityHistory.map((complexity, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded ${
                    index === complexityHistory.length - 1
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {complexity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interview Tips */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-1">💡 Real-time Tips</div>
          <div className="text-xs text-gray-500">
            {currentPhase === 'reading' && 'Take time to understand the problem completely'}
            {currentPhase === 'coding' && 'Think aloud and explain your approach'}
            {currentPhase === 'testing' && 'Test with edge cases and explain your solution'}
            {currentPhase === 'discussing' && 'Be ready to optimize and handle follow-up questions'}
          </div>
        </div>
      </div>
    </div>
  );
}