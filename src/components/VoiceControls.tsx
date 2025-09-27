'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Loader2 } from 'lucide-react';
import { voiceService } from '@/services/VoiceService';

// Web Speech API types
declare global {
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
  }
}

interface VoiceControlsProps {
  onSpeechResult?: (transcript: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  className?: string;
}

export default function VoiceControls({
  onSpeechResult,
  onSpeechStart,
  onSpeechEnd,
  className = ''
}: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState(voiceService.getSettings());
  // Start with false to prevent hydration mismatch, will be updated on client
  const [supportedFeatures, setSupportedFeatures] = useState({ speechSynthesis: false, speechRecognition: false });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true);
    
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Load available voices
    const loadVoices = () => {
      setAvailableVoices(voiceService.getVoices());
    };
    
    // Update supported features and settings after client hydration
    setSupportedFeatures(voiceService.isSupported());
    setVoiceSettings(voiceService.getSettings());
    
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const startListening = () => {
    if (!supportedFeatures.speechRecognition) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    setIsProcessing(true);
    setInterimTranscript('');

    voiceService.startListening({
      onStart: () => {
        setIsListening(true);
        setIsProcessing(false);
        onSpeechStart?.();
      },
      onResult: (transcript: string) => {
        setInterimTranscript('');
        onSpeechResult?.(transcript);
        setIsListening(false);
      },
      onInterimResult: (transcript: string) => {
        setInterimTranscript(transcript);
      },
      onEnd: () => {
        setIsListening(false);
        setIsProcessing(false);
        setInterimTranscript('');
        onSpeechEnd?.();
      },
      onError: (error: Error | SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        setIsProcessing(false);
        setInterimTranscript('');
        alert('Speech recognition failed. Please try again.');
      }
    });
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    setIsProcessing(false);
    setInterimTranscript('');
  };

  const toggleSpeaker = () => {
    const newState = !isSpeakerEnabled;
    setIsSpeakerEnabled(newState);
    
    if (!newState) {
      voiceService.stopSpeaking();
    }
    
    // Update voice service settings
    voiceService.updateSettings({ autoSpeak: newState });
  };

  const handleVoiceSettingChange = (setting: string, value: string | number | boolean) => {
    const newSettings = { ...voiceSettings, [setting]: value };
    setVoiceSettings(newSettings);
    voiceService.updateSettings(newSettings);
  };

  const testTTS = async () => {
    try {
      console.log('🧪 Testing TTS from VoiceControls...');
      
      // Enable debug mode for better troubleshooting
      voiceService.enableDebugMode();
      
      // Force reinitialize if no voices are available
      const state = voiceService.getState();
      if (state.voicesAvailable === 0) {
        console.log('🔄 No voices available, reinitializing...');
        voiceService.reinitialize();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const success = await voiceService.testTTS();
      if (success) {
        alert('✅ TTS test successful! You should hear the test message.');
      } else {
        alert('❌ TTS test failed. Please check the console for error details.');
      }
    } catch (error) {
      console.error('TTS test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ TTS test failed: ${errorMessage}`);
    }
  };

  return (
    <div className={`voice-controls ${className}`}>
      {/* Main Voice Controls */}
      <div className="flex items-center space-x-2">
        {/* Microphone Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing || (!isClient || !supportedFeatures.speechRecognition)}
          className={`relative p-2 rounded-full transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : isProcessing
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
          }`}
          title={
            !isClient
              ? 'Loading voice features...'
              : !supportedFeatures.speechRecognition
              ? 'Speech recognition not supported'
              : isListening
              ? 'Click to stop listening'
              : 'Click to start voice input'
          }
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
          
          {/* Recording indicator */}
          {isListening && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          )}
        </button>

        {/* Speaker Toggle */}
        <button
          onClick={toggleSpeaker}
          disabled={!isClient || !supportedFeatures.speechSynthesis}
          className={`p-2 rounded-full transition-all duration-200 ${
            isClient && isSpeakerEnabled && supportedFeatures.speechSynthesis
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-400 text-white disabled:cursor-not-allowed'
          }`}
          title={
            !isClient
              ? 'Loading voice features...'
              : !supportedFeatures.speechSynthesis
              ? 'Text-to-speech not supported'
              : isSpeakerEnabled
              ? 'AI voice enabled - click to mute'
              : 'AI voice muted - click to enable'
          }
        >
          {isClient && isSpeakerEnabled && supportedFeatures.speechSynthesis ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200"
          title="Voice settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Test TTS Button */}
        <button
          onClick={testTTS}
          className="px-3 py-1 rounded-full bg-purple-500 hover:bg-purple-600 text-white text-xs transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title={!isClient ? "Loading..." : !supportedFeatures.speechSynthesis ? "TTS not supported" : "Test text-to-speech"}
          disabled={!isClient || !supportedFeatures.speechSynthesis}
        >
          Test TTS
        </button>
      </div>

      {/* Interim Transcript Display */}
      {interimTranscript && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <span className="text-xs text-blue-500">Listening: </span>
          {interimTranscript}
        </div>
      )}

      {/* Voice Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Voice Settings</h3>
          
          {/* Speech Rate */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Speech Rate: {voiceSettings.speechRate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.speechRate}
              onChange={(e) => handleVoiceSettingChange('speechRate', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Volume */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Volume: {Math.round(voiceSettings.speechVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceSettings.speechVolume}
              onChange={(e) => handleVoiceSettingChange('speechVolume', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Voice Selection */}
          {availableVoices.length > 0 && (
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">AI Voice</label>
              <select
                value={voiceSettings.preferredVoice}
                onChange={(e) => {
                  handleVoiceSettingChange('preferredVoice', e.target.value);
                  voiceService.setVoice(e.target.value);
                }}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="female">Female (Auto)</option>
                <option value="male">Male (Auto)</option>
                {availableVoices
                  .filter(voice => voice.lang.startsWith('en'))
                  .map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                }
              </select>
            </div>
          )}

          {/* Feature Support Status */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Browser Support:</p>
            <div className="flex space-x-4 text-xs">
              <span className={`flex items-center ${supportedFeatures.speechSynthesis ? 'text-green-600' : 'text-red-600'}`}>
                {supportedFeatures.speechSynthesis ? '✓' : '✗'} Text-to-Speech
              </span>
              <span className={`flex items-center ${supportedFeatures.speechRecognition ? 'text-green-600' : 'text-red-600'}`}>
                {supportedFeatures.speechRecognition ? '✓' : '✗'} Speech Recognition
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}