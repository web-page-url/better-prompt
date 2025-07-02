'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, RefreshCw, RotateCcw, Sparkles, Settings, Loader2, Mic, MicOff } from 'lucide-react';

interface OptimizationResult {
  optimizedPrompt: string;
  model: string;
  usage?: any;
}

export default function Home() {
  const [inputPrompt, setInputPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-r1-distill-llama-70b:free');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedType, setSelectedType] = useState('general');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [lastRequestTime, setLastRequestTime] = useState(0);
  
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check for voice support on component mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsVoiceSupported(!!SpeechRecognition);
  }, []);

  // Cleanup voice recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Voice recognition functions
  const startVoiceRecording = () => {
    if (!isVoiceSupported) {
      setVoiceError('Voice input is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setVoiceError('');
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript);
      
      // Update input prompt with voice input
      if (finalTranscript) {
        setInputPrompt(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setVoiceError(`Voice recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setTranscript('');
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const models = [
   
    // { id: 'google/gemma-3n-e4b-it:free', name: 'Google Gemma 3N E4B IT (Free)' },
    { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B' },
    { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B' },
    { id: 'deepseek/deepseek-r1-distill-llama-70b:free', name: 'DeepSeek R1 Distill 70B' },
    { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B' },
    { id: 'moonshotai/kimi-dev-72b:free', name: 'Kimi Dev 72B (Free)' },
    { id: 'microsoft/phi-4-reasoning:free', name: 'Microsoft Phi-4 Reasoning' },
    // { id: 'google/gemini-flash-1.5-8b:free', name: 'Gemini Flash 1.5 8B' },
    // { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
    // { id: 'nvidia/llama-3.3-nemotron-super-49b-v1:free', name: 'Llama 3.3 Nemotron 49B' },
    // { id: 'deepseek/deepseek-v3-base:free', name: 'DeepSeek V3 Base' },
    // { id: 'huggingface/zephyr-7b-beta:free', name: 'Zephyr 7B Beta' },
    // { id: 'openchat/openchat-7b:free', name: 'OpenChat 7B' },
    // { id: 'gryphe/mythomist-7b:free', name: 'MythoMist 7B' },
    // { id: 'undi95/toppy-m-7b:free', name: 'Toppy M 7B' },
  ];

  const tones = [
    { id: 'professional', name: 'Professional' },
    { id: 'casual', name: 'Casual' },
    { id: 'friendly', name: 'Friendly' },
    { id: 'authoritative', name: 'Authoritative' },
    { id: 'creative', name: 'Creative' },
  ];

  const types = [
    { id: 'general', name: 'General Purpose' },
    { id: 'code generation', name: 'Code Generation' },
    { id: 'content writing', name: 'Content Writing' },
    { id: 'data analysis', name: 'Data Analysis' },
    { id: 'creative writing', name: 'Creative Writing' },
    { id: 'research', name: 'Research' },
  ];

  const optimizePrompt = async () => {
    if (!inputPrompt.trim()) {
      setError('Please enter a prompt to optimize');
      return;
    }

    // Check if user is making requests too quickly
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < 2000) { // 2 second minimum between requests
      const waitTime = 2000 - timeSinceLastRequest;
      setError(`Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request`);
      return;
    }
    
    setLastRequestTime(now);
    setIsLoading(true);
    setError('');
    
    try {
      // Try OpenRouter first
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: inputPrompt,
          model: selectedModel,
          tone: selectedTone,
          type: selectedType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If OpenRouter fails, try local optimization
        if (response.status === 503 || response.status === 408 || response.status === 401 || response.status === 402 || response.status === 429) {
          const reasonMap = {
            503: 'OpenRouter service unavailable',
            408: 'Request timeout',
            401: 'Authentication failed',
            402: 'Insufficient credits',
            429: 'Rate limit exceeded'
          };
          
          const reason = reasonMap[response.status as keyof typeof reasonMap] || 'OpenRouter unavailable';
          console.log(`${reason}, using local optimization...`);
          
          const fallbackResponse = await fetch('/api/optimize-local', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: inputPrompt,
            }),
          });

          const fallbackData = await fallbackResponse.json();
          
          if (fallbackResponse.ok) {
            setOptimizedPrompt(fallbackData.optimizedPrompt);
            setError(`⚠️ Using local optimization (${reason})`);
            return;
          }
        }
        
        throw new Error(data.error || 'Failed to optimize prompt');
      }

      setOptimizedPrompt(data.optimizedPrompt);
      
      // Show which API key was used if it's the secondary one
      if (data.apiKeyUsed === 'secondary') {
        setError('✅ Using secondary API key (primary key exhausted)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const regeneratePrompt = async () => {
    // Add slight variation by adjusting temperature or adding regeneration context
    await optimizePrompt();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const startNew = () => {
    setInputPrompt('');
    setOptimizedPrompt('');
    setError('');
    setCopyFeedback('');
    // Stop voice recording if active
    if (isRecording) {
      stopVoiceRecording();
    }
    setVoiceError('');
    setTranscript('');
  };

  const examplePrompts = [
    "Write email to boss about leave",
    "build me a startup idea", 
    "python code for image caption",
    "help me learn react hooks"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Better Prompt
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your vague ideas into powerful, optimized prompts that get better results from AI models
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Raw Prompt
              </h2>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <Settings className="h-4 w-4" />
                Advanced
              </button>
            </div>
            
            <div className="relative">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Enter your idea or prompt here, and I'll help make it more effective..."
                className="w-full h-32 p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
              
              {/* Voice Input Button */}
              {isVoiceSupported && (
                <button
                  onClick={toggleVoiceRecording}
                  disabled={isLoading}
                  className={`absolute right-3 top-3 p-2 rounded-full transition-all duration-200 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
            </div>

            {/* Voice Input Feedback */}
            {isRecording && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-700 dark:text-red-400">
                    Listening... {transcript && `"${transcript}"`}
                  </span>
                </div>
              </div>
            )}

            {/* Voice Error Display */}
            {voiceError && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">{voiceError}</p>
              </div>
            )}

            {/* Voice Support Notice */}
            {!isVoiceSupported && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 Voice input is not supported in your browser. Try Chrome, Safari, or Edge for voice input functionality.
                </p>
              </div>
            )}

            {/* Example Prompts */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick examples:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setInputPrompt(example)}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      disabled={isLoading}
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tone
                    </label>
                    <select
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      disabled={isLoading}
                    >
                      {tones.map((tone) => (
                        <option key={tone.id} value={tone.id}>
                          {tone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      disabled={isLoading}
                    >
                      {types.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Optimize Button */}
            <button
              onClick={optimizePrompt}
              disabled={isLoading || !inputPrompt.trim()}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Optimize Prompt
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Output Section */}
          {optimizedPrompt && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Optimized Prompt
                </h2>
                <div className="flex items-center gap-2">
                  {copyFeedback && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {copyFeedback}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">
                  {optimizedPrompt}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => copyToClipboard(optimizedPrompt)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                
                <button
                  onClick={regeneratePrompt}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
                
                <button
                  onClick={startNew}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
                  <RotateCcw className="h-4 w-4" />
                  Start New
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Created with ❤️ by{' '}
            <a 
              href="https://www.linkedin.com/in/anubhav-chaudhary-4bba7918b/" 
          target="_blank"
          rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
            Anubhav
            </a>
            {/* {' '}• Built with Next.js & Tailwind CSS */}
          </p>
      </footer>
      </div>
    </div>
  );
}
