// Voice service for handling Web Speech API functionality

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceServiceInterface {
  speakText(text: string, options?: { onEnd?: () => void; onError?: (error: Error | SpeechRecognitionErrorEvent) => void; }): Promise<void>;
  stopSpeaking(): void;
  startListening(options?: { onResult?: (transcript: string) => void; onInterimResult?: (transcript: string) => void; onStart?: () => void; onEnd?: () => void; onError?: (error: Error | SpeechRecognitionErrorEvent) => void; }): void;
  stopListening(): void;
  isSupported(): { speechSynthesis: boolean; speechRecognition: boolean };
  getSettings(): { speechRate: number; speechPitch: number; speechVolume: number; autoSpeak: boolean; preferredVoice: string; language: string };
  updateSettings(newSettings: Partial<{ speechRate: number; speechPitch: number; speechVolume: number; autoSpeak: boolean; preferredVoice: string; language: string }>): void;
  getVoices(): SpeechSynthesisVoice[];
  setVoice(voiceNameOrIndex: string | number): void;
  getState(): { isListening: boolean; isSpeaking: boolean; currentVoice: string; voicesAvailable: number; settings: Record<string, unknown> };
  testTTS(): Promise<boolean>;
  reinitialize(): void;
  enableDebugMode(): void;
}

export class VoiceService {
  private synthesis: SpeechSynthesis | null = null;
  private recognition: SpeechRecognition | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  
  // Voice settings
  private settings = {
    speechRate: 1.0,
    speechPitch: 1.0,
    speechVolume: 0.8,
    autoSpeak: true,
    preferredVoice: 'female', // 'male', 'female', or specific voice name
    language: 'en-US'
  };

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.initializeVoices();
      this.initializeSpeechRecognition();
    }
  }

  // Initialize available voices with enhanced loading
  private initializeVoices() {
    if (!this.synthesis) return;
    
    const loadVoices = () => {
      const availableVoices = this.synthesis!.getVoices();
      console.log(`🎤 Found ${availableVoices.length} voices:`, availableVoices.map(v => `${v.name} (${v.lang})`));
      
      if (availableVoices.length > 0) {
        this.voices = availableVoices;
        this.selectBestVoice();
      } else {
        console.warn('⚠️ No voices loaded yet, will retry...');
        // Retry after a short delay
        setTimeout(loadVoices, 500);
      }
    };

    // Load voices immediately if available
    loadVoices();
    
    // Also listen for voice changes (some browsers load voices asynchronously)
    if (this.synthesis?.addEventListener) {
      this.synthesis.addEventListener('voiceschanged', loadVoices);
    }
    
    // Force voice loading for Chrome and Safari
    if (typeof window !== 'undefined' && window.speechSynthesis.getVoices().length === 0) {
      const utterance = new SpeechSynthesisUtterance('');
      this.synthesis?.speak(utterance);
      this.synthesis?.cancel();
    }
  }

  // Select the best voice based on preferences with enhanced selection
  private selectBestVoice() {
    if (this.voices.length === 0) {
      console.warn('⚠️ No voices available for selection');
      return;
    }

    // Enhanced voice selection logic
    let selectedVoice = null;

    // Priority 1: Find high-quality natural voices
    const naturalVoices = this.voices.filter(voice => 
      voice.lang.startsWith(this.settings.language) && 
      (voice.name.includes('Natural') || voice.name.includes('Neural') || voice.name.includes('Premium'))
    );

    if (naturalVoices.length > 0) {
      selectedVoice = naturalVoices.find(voice => 
        voice.name.toLowerCase().includes(this.settings.preferredVoice)
      ) || naturalVoices[0];
    }

    // Priority 2: Try to find preferred voice type (male/female)
    if (!selectedVoice) {
      selectedVoice = this.voices.find(voice => 
        voice.lang.startsWith(this.settings.language) && 
        voice.name.toLowerCase().includes(this.settings.preferredVoice)
      );
    }

    // Priority 3: Fallback to any good English voice
    if (!selectedVoice) {
      const englishVoices = this.voices.filter(voice => voice.lang.startsWith('en'));
      selectedVoice = englishVoices.find(voice => 
        voice.localService === false // Prefer system voices over local ones
      ) || englishVoices[0];
    }

    // Final fallback to first available voice
    if (!selectedVoice) {
      selectedVoice = this.voices[0];
    }

    this.currentVoice = selectedVoice;
    console.log('🎯 Selected voice:', selectedVoice?.name, selectedVoice?.lang);
  }

  // Initialize speech recognition
  private initializeSpeechRecognition() {
    if (typeof window === 'undefined') return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    // Use webkit prefix for Chrome or standard for other browsers
    const WindowWithSpeechRecognition = window as Window & {
      SpeechRecognition?: new() => SpeechRecognition;
      webkitSpeechRecognition?: new() => SpeechRecognition;
    };
    const SpeechRecognitionClass = WindowWithSpeechRecognition.SpeechRecognition || WindowWithSpeechRecognition.webkitSpeechRecognition;
    this.recognition = SpeechRecognitionClass ? new SpeechRecognitionClass() : null;
    
    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.settings.language;
    }
  }

  // Speak text using TTS
  async speakText(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: SpeechSynthesisErrorEvent) => void;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔊 Attempting to speak:', text.substring(0, 100) + '...');
      
      if (!this.synthesis) {
        console.error('❌ Speech synthesis not supported');
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      if (!this.settings.autoSpeak) {
        console.log('🔇 Auto-speak disabled, skipping TTS');
        resolve();
        return;
      }

      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.error('⏰ TTS timeout after 30 seconds');
        this.isSpeaking = false;
        reject(new Error('TTS timeout'));
      }, 30000);

      // Stop any current speech
      this.stopSpeaking();

      // Clean text for better speech (remove markdown, code formatting)
      const cleanText = this.cleanTextForSpeech(text);
      console.log('🧹 Cleaned text:', cleanText);
      
      if (!cleanText || cleanText.trim().length === 0) {
        console.log('⚠️ No text to speak after cleaning');
        resolve();
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Ensure voices are loaded
      if (this.voices.length === 0) {
        console.log('📢 Reloading voices...');
        this.initializeVoices();
        // Wait a bit for voices to load
        setTimeout(() => this.speakText(text, options), 100);
        return;
      }
      
      // Apply voice settings for more human-like speech
      utterance.voice = this.currentVoice;
      utterance.rate = options?.rate || this.settings.speechRate * 0.9; // Slightly slower for more natural feel
      utterance.pitch = options?.pitch || this.settings.speechPitch;
      utterance.volume = options?.volume || this.settings.speechVolume;

      console.log('🎤 Using voice:', utterance.voice?.name || 'default');
      console.log('⚙️ Settings:', { rate: utterance.rate, pitch: utterance.pitch, volume: utterance.volume });

      // Event handlers
      utterance.onstart = () => {
        console.log('✅ TTS Started');
        this.isSpeaking = true;
        options?.onStart?.();
      };

      utterance.onend = () => {
        console.log('🏁 TTS Finished');
        clearTimeout(timeoutId);
        this.isSpeaking = false;
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = (error: SpeechSynthesisErrorEvent) => {
        console.error('❌ TTS Error Details:', {
          error,
          errorType: typeof error,
          errorKeys: Object.keys(error || {}),
          errorReason: error?.error || 'No reason',
          errorName: error?.type || 'No type',
          errorMessage: (error as SpeechSynthesisErrorEvent & { message?: string })?.message || 'No message',
          utteranceText: utterance.text.substring(0, 100),
          utteranceVoice: utterance.voice?.name || 'No voice',
          voicesAvailable: this.voices.length,
          currentVoice: this.currentVoice?.name || 'None',
          browserInfo: {
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
            platform: typeof window !== 'undefined' ? window.navigator.platform : 'Unknown'
          },
          synthesisState: {
            pending: this.synthesis?.pending,
            speaking: this.synthesis?.speaking,
            paused: this.synthesis?.paused
          }
        });
        
        clearTimeout(timeoutId);
        this.isSpeaking = false;
        
        // Try to determine the actual error
        let errorMessage = 'TTS failed';
        if (error?.error) {
          errorMessage = `TTS error: ${error.error}`;
        } else if (this.voices.length === 0) {
          errorMessage = 'No voices available for TTS';
        } else if (!this.currentVoice) {
          errorMessage = 'No voice selected for TTS';
        } else if (utterance.text.trim().length === 0) {
          errorMessage = 'Empty text provided for TTS';
        }
        
        console.warn('🔧 Attempting TTS recovery...');
        
        // Attempt recovery by trying basic TTS
        this.attemptBasicTTSRecovery(utterance.text)
          .then(() => {
            console.log('✅ TTS recovery successful');
            options?.onEnd?.();
            resolve();
          })
          .catch((recoveryError: Error) => {
            console.error('❌ TTS recovery also failed:', recoveryError);
            options?.onError?.(error);
            reject(new Error(errorMessage));
          });
      };

      // Chrome workaround: ensure speech synthesis is ready
      if (this.synthesis.pending || this.synthesis.speaking) {
        console.log('🔧 Cancelling existing speech synthesis');
        this.synthesis.cancel();
      }

      // Additional browser compatibility checks
      if (!this.synthesis.getVoices || this.synthesis.getVoices().length === 0) {
        console.warn('⚠️ No voices available, this might cause TTS to fail');
      }

      // Speak the text
      try {
        console.log('🚀 About to call synthesis.speak() with:', {
          textLength: utterance.text.length,
          voice: utterance.voice?.name,
          rate: utterance.rate,
          pitch: utterance.pitch,
          volume: utterance.volume
        });
        
        this.synthesis.speak(utterance);
        console.log('✅ TTS utterance queued successfully');
        
        // Force Chrome to start speaking (workaround for Chrome bug)
        if (typeof window !== 'undefined' && window.navigator.userAgent.includes('Chrome')) {
          setTimeout(() => {
            if (!this.isSpeaking && this.synthesis?.paused) {
              console.log('🔧 Chrome workaround: resuming paused synthesis');
              this.synthesis.resume();
            }
          }, 100);
        }
        
        // Additional check - if nothing happens within 5 seconds, something might be wrong
        setTimeout(() => {
          if (!this.isSpeaking && this.synthesis?.pending) {
            console.warn('⚠️ TTS seems stuck, attempting to resume');
            if (this.synthesis?.paused) {
              this.synthesis.resume();
            }
          }
        }, 5000);
        
      } catch (error) {
        console.error('❌ Failed to queue TTS utterance:', error);
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  // Clean text for better speech synthesis - enhanced for human-like delivery
  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Inline code
      .replace(/```[\s\S]*?```/g, 'code block') // Code blocks
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      
      // Enhanced emoji and symbol handling
      .replace(/[🎯🚀✅💡📊⚡🎉👋🤔❌⚠️🔍🎨🔧]/g, '') // Remove visual emojis
      
      // Make technical terms more speakable
      .replace(/\b(API|HTML|CSS|JS|JSON|XML|HTTP|URL|UI|UX)\b/gi, (match) => 
        match.toUpperCase().split('').join(' ')) // A P I instead of API
      .replace(/\b(React|Vue|Angular|Node|npm|git)\b/gi, (match) => 
        match.toLowerCase()) // Keep framework names natural
      
      // Add natural pauses and breathing room
      .replace(/([.!?])\s*([A-Z])/g, '$1... $2') // Longer pauses between sentences
      .replace(/:\s*/g, ': ') // Pause after colons
      .replace(/;\s*/g, '; ') // Pause after semicolons
      .replace(/,\s*/g, ', ') // Brief pause after commas
      
      // Handle line breaks more naturally
      .replace(/\n\n+/g, '... ') // Paragraph breaks become longer pauses
      .replace(/\n/g, '. ') // Single line breaks become sentence ends
      
      // Clean up spacing and punctuation
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/\s*([,.;:!?])\s*/g, '$1 ') // Normalize punctuation spacing
      .replace(/\.{2,}/g, '...') // Normalize ellipsis
      
      // Final cleanup
      .trim()
      .replace(/^[.,:;!?]+/, '') // Remove leading punctuation
      .replace(/[.,:;!?]+$/, '.'); // Ensure proper ending
  }

  // Start listening for speech input
  startListening(options?: {
    onResult?: (transcript: string) => void;
    onInterimResult?: (transcript: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error | SpeechRecognitionErrorEvent) => void;
  }): void {
    if (!this.recognition) {
      options?.onError?.(new Error('Speech recognition not available'));
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      options?.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      
      if (event.results[event.results.length - 1].isFinal) {
        options?.onResult?.(transcript);
      } else {
        options?.onInterimResult?.(transcript);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options?.onEnd?.();
    };

    this.recognition.onerror = (error: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      options?.onError?.(error);
    };

    this.recognition.start();
  }

  // Stop listening
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Stop speaking
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  // Set voice by name or index
  setVoice(voiceNameOrIndex: string | number): void {
    if (typeof voiceNameOrIndex === 'number') {
      this.currentVoice = this.voices[voiceNameOrIndex] || this.voices[0];
    } else {
      const voice = this.voices.find(v => v.name === voiceNameOrIndex);
      if (voice) {
        this.currentVoice = voice;
      }
    }
  }

  // Update settings
  updateSettings(newSettings: Partial<typeof this.settings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.preferredVoice) {
      this.selectBestVoice();
    }
  }

  // Get current settings
  getSettings() {
    return { ...this.settings };
  }

  // Check if features are supported
  isSupported() {
    if (typeof window === 'undefined') {
      return {
        speechSynthesis: false,
        speechRecognition: false
      };
    }
    
    return {
      speechSynthesis: 'speechSynthesis' in window,
      speechRecognition: ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)
    };
  }

  // Get current state
  getState() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      currentVoice: this.currentVoice?.name || 'Default',
      voicesAvailable: this.voices.length,
      settings: { ...this.settings }
    };
  }

  // Test TTS functionality with comprehensive diagnostics
  async testTTS(testMessage: string = "Hello! This is a test of the text to speech functionality. Can you hear me clearly?"): Promise<boolean> {
    try {
      console.log('🧪 Starting comprehensive TTS test...');
      this.logBrowserCompatibility();
      
      if (!this.synthesis) {
        console.error('❌ TTS Test failed: Speech synthesis not available');
        alert('❌ Speech synthesis is not supported in your browser. Please try Chrome, Edge, or Safari.');
        return false;
      }

      // Check if voices are loaded
      console.log(`🎤 Current voices available: ${this.voices.length}`);
      if (this.voices.length === 0) {
        console.warn('⚠️ No voices loaded, attempting to initialize...');
        this.initializeVoices();
        
        // Wait longer for voices to load
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          if (this.voices.length > 0) break;
        }
        
        if (this.voices.length === 0) {
          console.warn('⚠️ Still no voices after waiting. Proceeding with default voice.');
        }
      }

      // Try multiple test approaches in order of complexity
      const tests = [
        { name: 'Basic TTS (minimal config)', method: () => this.basicTTSTest("Test") },
        { name: 'Recovery TTS (fallback)', method: () => this.attemptBasicTTSRecovery("Test") },
        { name: 'Full TTS (complete config)', method: () => this.speakText(testMessage) }
      ];

      for (const test of tests) {
        try {
          console.log(`🔧 Attempting: ${test.name}`);
          await test.method();
          console.log(`✅ ${test.name} successful!`);
          alert(`✅ TTS test successful using ${test.name}! You should hear the test message.`);
          return true;
        } catch (testError) {
          console.warn(`⚠️ ${test.name} failed:`, testError);
        }
      }
      
      // If all tests failed
      console.error('❌ All TTS tests failed');
      alert('❌ All TTS tests failed. This might be a browser compatibility issue. Check the console for details.');
      return false;
      
    } catch (error) {
      console.error('❌ TTS test encountered unexpected error:', error);
      alert(`❌ TTS test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  // Basic TTS test with minimal configuration
  private async basicTTSTest(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('No synthesis available'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onend = () => {
        console.log('✅ Basic TTS completed');
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('❌ Basic TTS error:', error);
        reject(error);
      };

      this.synthesis.speak(utterance);
    });
  }

  // Attempt basic TTS recovery when main TTS fails
  private async attemptBasicTTSRecovery(text: string): Promise<void> {
    console.log('🔧 Starting TTS recovery process...');
    
    if (!this.synthesis) {
      throw new Error('Speech synthesis not available for recovery');
    }

    // Clean up any existing synthesis
    this.synthesis.cancel();
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try with absolute minimal configuration
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text.substring(0, 200)); // Limit text length
      
      // Use default voice (no custom voice)
      utterance.voice = null;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      let hasCompleted = false;
      
      const cleanup = () => {
        if (hasCompleted) return;
        hasCompleted = true;
      };

      utterance.onstart = () => {
        console.log('🔧 Recovery TTS started');
      };

      utterance.onend = () => {
        console.log('✅ Recovery TTS completed');
        cleanup();
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('❌ Recovery TTS failed:', error);
        cleanup();
        reject(new Error('Recovery TTS failed'));
      };

      // Set a shorter timeout for recovery
      setTimeout(() => {
        if (!hasCompleted) {
          console.warn('⏰ Recovery TTS timeout');
          cleanup();
          reject(new Error('Recovery TTS timeout'));
        }
      }, 10000);

      try {
        this.synthesis!.speak(utterance);
        console.log('🚀 Recovery utterance queued');
      } catch (error) {
        console.error('❌ Failed to queue recovery utterance:', error);
        cleanup();
        reject(error);
      }
    });
  }

  // Force reinitialize the voice service (useful for debugging)
  reinitialize(): void {
    console.log('🔄 Reinitializing voice service...');
    this.stopSpeaking();
    this.stopListening();
    this.voices = [];
    this.currentVoice = null;
    this.initializeVoices();
    this.initializeSpeechRecognition();
  }

  // Enable enhanced debugging
  enableDebugMode(): void {
    console.log('🐛 Debug mode enabled for VoiceService');
    
    // Log browser compatibility info
    this.logBrowserCompatibility();
    
    // Log all synthesis events
    if (this.synthesis) {
      const originalSpeak = this.synthesis.speak.bind(this.synthesis);
      this.synthesis.speak = (utterance: SpeechSynthesisUtterance) => {
        console.log('🔊 Synthesis.speak called with:', {
          text: utterance.text.substring(0, 100) + '...',
          voice: utterance.voice?.name,
          rate: utterance.rate,
          pitch: utterance.pitch,
          volume: utterance.volume
        });
        return originalSpeak(utterance);
      };
    }
  }

  // Log detailed browser compatibility information
  private logBrowserCompatibility(): void {
    if (typeof window === 'undefined') {
      console.log('🌍 Running in server environment');
      return;
    }

    const compatibility = {
      userAgent: window.navigator.userAgent,
      platform: window.navigator.platform,
      language: window.navigator.language,
      speechSynthesis: {
        available: 'speechSynthesis' in window,
        pending: this.synthesis?.pending,
        speaking: this.synthesis?.speaking,
        paused: this.synthesis?.paused,
        voicesLength: this.synthesis?.getVoices().length || 0
      },
      speechRecognition: {
        available: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
        webkitAvailable: 'webkitSpeechRecognition' in window
      },
      audioContext: {
        available: 'AudioContext' in window || 'webkitAudioContext' in window
      }
    };

    console.log('🔍 Browser Compatibility Report:', compatibility);
    
    // Detect known issues
    const issues = [];
    if (compatibility.userAgent.includes('Chrome') && compatibility.speechSynthesis.voicesLength === 0) {
      issues.push('Chrome: Voices not loaded yet (this is common on first load)');
    }
    if (compatibility.userAgent.includes('Safari') && !compatibility.speechSynthesis.available) {
      issues.push('Safari: Speech synthesis may need user interaction to work');
    }
    if (compatibility.userAgent.includes('Firefox')) {
      issues.push('Firefox: TTS quality may vary, consider fallbacks');
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ Potential TTS Issues Detected:', issues);
    }
  }
}

// Create singleton instance - but only in browser
let voiceServiceInstance: VoiceService | null = null;

export const voiceService = (() => {
  if (typeof window !== 'undefined') {
    if (!voiceServiceInstance) {
      voiceServiceInstance = new VoiceService();
    }
    return voiceServiceInstance;
  }
  
  // Return a dummy object for server-side rendering
  return {
    speakText: async () => {},
    stopSpeaking: () => {},
    startListening: () => {},
    stopListening: () => {},
    isSupported: () => ({ speechSynthesis: false, speechRecognition: false }),
    getSettings: () => ({ speechRate: 1.0, speechPitch: 1.0, speechVolume: 0.8, autoSpeak: true, preferredVoice: 'female', language: 'en-US' }),
    updateSettings: () => {},
    getVoices: () => [],
    setVoice: () => {},
    getState: () => ({ isListening: false, isSpeaking: false, currentVoice: 'Default', voicesAvailable: 0, settings: {} }),
    testTTS: async () => false,
    reinitialize: () => {},
    enableDebugMode: () => {}
  } as VoiceServiceInterface;
})();