'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, RefreshCw, RotateCcw, Sparkles, Settings, Loader2, Mic, MicOff, Save, BookOpen, Zap, Cpu, Terminal } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Navigation } from '@/components/Navigation';
import { SavedPrompts } from '@/components/SavedPrompts';
import { DotGrid } from '@/components/DotGrid';
import { Prompt } from '@/lib/supabase';

interface OptimizationResult {
  optimizedPrompt: string;
  model: string;
  usage?: any;
}

export default function Home() {
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState<'optimizer' | 'saved'>('optimizer');
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

  // Save prompt state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

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
    setSaveError('');
    setSaveSuccess('');
    // Stop voice recording if active
    if (isRecording) {
      stopVoiceRecording();
    }
    setVoiceError('');
    setTranscript('');
  };

  const savePrompt = async () => {
    if (!user) {
      setSaveError('Please sign in to save prompts');
      return;
    }

    if (!inputPrompt.trim() || !optimizedPrompt.trim()) {
      setSaveError('Both original and optimized prompts are required');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      // Create a title from the first 50 characters of the input prompt
      const title = inputPrompt.length > 50
        ? inputPrompt.substring(0, 50) + '...'
        : inputPrompt;

      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          originalPrompt: inputPrompt,
          optimizedPrompt: optimizedPrompt,
          model: selectedModel,
          tone: selectedTone,
          type: selectedType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save prompt');
      }

      setSaveSuccess('Prompt saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving prompt:', error);
      setSaveError('Failed to save prompt. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const examplePrompts = [
    "Write email to boss about leave",
    "build me a startup idea",
    "python code for image caption",
    "help me learn react hooks"
  ];

  const handleUsePrompt = (prompt: Prompt) => {
    setInputPrompt(prompt.original_prompt);
    setOptimizedPrompt(prompt.optimized_prompt);
    setSelectedModel(prompt.model);
    setSelectedTone(prompt.tone);
    setSelectedType(prompt.type);
    setCurrentPage('optimizer');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <DotGrid />
      <div className="relative z-10">
        {/* <Navigation currentPage={currentPage} onPageChange={setCurrentPage} /> */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {currentPage === 'optimizer' ? (
            <>
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="relative">
                    <Terminal className="h-10 w-10 text-cyan-400 animate-pulse" />
                    <div className="absolute inset-0 h-10 w-10 text-cyan-400 blur-sm opacity-75 animate-pulse"></div>
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                    Better Prompt
                  </h1>
                  <div className="relative">
                    <Cpu className="h-10 w-10 text-purple-400 animate-pulse" />
                    <div className="absolute inset-0 h-10 w-10 text-purple-400 blur-sm opacity-75 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
                  Transform your vague ideas into powerful, optimized prompts that get better results from AI models
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400 animate-bounce" />
                  <span className="text-sm text-cyan-300 font-mono">NEURAL OPTIMIZATION ENGINE</span>
                  <Zap className="h-5 w-5 text-yellow-400 animate-bounce" />
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-8">
                {/* Input Section */}
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-cyan-100 flex items-center gap-2">
                        <Terminal className="h-6 w-6 text-cyan-400" />
                        Raw Neural Input
                      </h2>
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/30 rounded-lg px-3 py-1 hover:bg-cyan-500/10"
                      >
                        <Settings className="h-4 w-4" />
                        Advanced Matrix
                      </button>
                    </div>

                    <div className="relative">
                      <textarea
                        value={inputPrompt}
                        onChange={(e) => setInputPrompt(e.target.value)}
                        placeholder="Initialize neural prompt sequence..."
                        className="w-full h-32 p-4 pr-12 border border-cyan-500/50 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 resize-none bg-gray-900/50 text-cyan-100 placeholder-cyan-400/60 font-mono text-sm backdrop-blur-sm"
                        disabled={isLoading}
                      ></textarea>

                      {/* Voice Input Button */}
                      {isVoiceSupported && (
                        <button
                          onClick={toggleVoiceRecording}
                          disabled={isLoading}
                          className={`absolute right-3 top-3 p-2 rounded-full transition-all duration-200 ${
                            isRecording
                              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50'
                              : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isRecording ? 'Stop recording' : 'Start voice input'}
                        >
                          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>
                      )}
                    </div>

                    {/* Voice Input Feedback */}
                    {isRecording && (
                      <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-red-300 font-mono">
                            Listening... {transcript && `"${transcript}"`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Voice Error Display */}
                    {voiceError && (
                      <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg backdrop-blur-sm">
                        <p className="text-sm text-yellow-300 font-mono">{voiceError}</p>
                      </div>
                    )}

                    {/* Voice Support Notice */}
                    {!isVoiceSupported && (
                      <div className="mt-2 p-2 bg-gray-800/50 border border-gray-600/30 rounded-lg backdrop-blur-sm">
                        <p className="text-xs text-gray-400 font-mono">
                          ⚠️ Voice input not supported. Use Chrome/Safari/Edge for neural audio input.
                        </p>
                      </div>
                    )}

                    {/* Example Prompts */}
                    <div className="mt-6">
                      <p className="text-sm text-cyan-400 mb-3 font-mono">QUICK NEURAL TEMPLATES:</p>
                      <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((example, index) => (
                          <button
                            key={index}
                            onClick={() => setInputPrompt(example)}
                            className="text-xs px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/30 rounded-lg text-cyan-300 hover:text-cyan-200 transition-all duration-200 font-mono"
                            disabled={isLoading}
                          >
                            {`"${example}"`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Options */}
                    {showAdvanced && (
                      <div className="mt-6 p-4 bg-gray-800/50 border border-purple-500/30 rounded-lg backdrop-blur-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-purple-300 mb-2 font-mono">
                              AI Model
                            </label>
                            <select
                              value={selectedModel}
                              onChange={(e) => setSelectedModel(e.target.value)}
                              className="w-full p-2 border border-purple-500/50 rounded bg-gray-900/50 text-cyan-100 text-sm font-mono focus:ring-2 focus:ring-purple-400 focus:border-purple-400 backdrop-blur-sm"
                              disabled={isLoading}
                            >
                              {models.map((model) => (
                                <option key={model.id} value={model.id} className="bg-gray-900">
                                  {model.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-purple-300 mb-2 font-mono">
                              Tone Matrix
                            </label>
                            <select
                              value={selectedTone}
                              onChange={(e) => setSelectedTone(e.target.value)}
                              className="w-full p-2 border border-purple-500/50 rounded bg-gray-900/50 text-cyan-100 text-sm font-mono focus:ring-2 focus:ring-purple-400 focus:border-purple-400 backdrop-blur-sm"
                              disabled={isLoading}
                            >
                              {tones.map((tone) => (
                                <option key={tone.id} value={tone.id} className="bg-gray-900">
                                  {tone.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-purple-300 mb-2 font-mono">
                              Task Type
                            </label>
                            <select
                              value={selectedType}
                              onChange={(e) => setSelectedType(e.target.value)}
                              className="w-full p-2 border border-purple-500/50 rounded bg-gray-900/50 text-cyan-100 text-sm font-mono focus:ring-2 focus:ring-purple-400 focus:border-purple-400 backdrop-blur-sm"
                              disabled={isLoading}
                            >
                              {types.map((type) => (
                                <option key={type.id} value={type.id} className="bg-gray-900">
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
                      className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 transform hover:scale-[1.02] font-mono"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          PROCESSING NEURAL DATA...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" />
                          OPTIMIZE NEURAL PROMPT
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-red-300 font-mono">{error}</p>
                  </div>
                )}

                {/* Save Success/Error Messages */}
                {saveSuccess && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-green-300 font-mono">{saveSuccess}</p>
                  </div>
                )}

                {saveError && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-red-300 font-mono">{saveError}</p>
                  </div>
                )}

                {/* Output Section */}
                {optimizedPrompt && (
                  <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/20 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-purple-100 flex items-center gap-2">
                          <Cpu className="h-6 w-6 text-purple-400" />
                          Optimized Neural Output
                        </h2>
                        <div className="flex items-center gap-2">
                          {copyFeedback && (
                            <span className="text-sm text-green-400 font-mono">
                              {copyFeedback}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-4 mb-4 backdrop-blur-sm">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-purple-100">
                          {optimizedPrompt}
                        </pre>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => copyToClipboard(optimizedPrompt)}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-400/40 font-mono"
                        >
                          <Copy className="h-4 w-4" />
                          COPY MATRIX
                        </button>

                        <button
                          onClick={regeneratePrompt}
                          disabled={isLoading}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-400/40 font-mono"
                        >
                          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                          REGENERATE
                        </button>

                        {user && (
                          <button
                            onClick={savePrompt}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-400/40 font-mono"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            {isSaving ? 'SAVING...' : 'SAVE MATRIX'}
                          </button>
                        )}

                        <button
                          onClick={startNew}
                          className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-gray-500/25 hover:shadow-gray-400/40 font-mono"
                        >
                          <RotateCcw className="h-4 w-4" />
                          NEW SESSION
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <footer className="mt-12 text-center text-cyan-400">
                <p className="text-sm font-mono">
                  Created with ❤️ by{' '}
                  <a
                    href="https://www.linkedin.com/in/anubhav-chaudhary-4bba7918b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-cyan-300 transition-colors"
                  >
                    Anubhav
                  </a>
                  {' '}• NEURAL INTERFACE v2.0
                </p>
              </footer>
            </>
          ) : (
            <SavedPrompts onUsePrompt={handleUsePrompt} />
          )}
        </div>
      </div>
    </div>
  );
}
