'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Prompt } from '@/lib/supabase';
import { Copy, Trash2, Calendar, Tag, Sparkles, Loader2, RefreshCw, Search, X } from 'lucide-react';

interface SavedPromptsProps {
  onUsePrompt?: (prompt: Prompt) => void;
}

export const SavedPrompts = ({ onUsePrompt }: SavedPromptsProps) => {
  const { user, isLoaded } = useUser();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrompts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      
      const response = await fetch('/api/prompts');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to view your saved prompts');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch prompts');
      }

      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load saved prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) { // Only run when Clerk has finished loading user state
      fetchPrompts();
    }
  }, [isLoaded, user]);

  const deletePrompt = async (id: string) => {
    if (!user) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }

      setPrompts(prompts.filter(prompt => prompt.id !== id));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      setError('Failed to delete prompt');
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getToneColor = (tone: string) => {
    const colors = {
      professional: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      casual: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      friendly: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      authoritative: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      creative: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[tone as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'code generation': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'content writing': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'data analysis': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'creative writing': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      research: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getModelDisplayName = (model: string) => {
    // Convert technical model names to user-friendly display names
    const modelMap: { [key: string]: string } = {
      'deepseek/deepseek-r1-distill-llama-70b:free': 'DeepSeek R1 (Free)',
      'meta-llama/llama-3.1-8b-instruct:free': 'Llama 3.1 8B (Free)',
      'mistralai/mistral-7b-instruct:free': 'Mistral 7B (Free)',
      'openai/gpt-4o-mini': 'GPT-4 Omni Mini',
      'anthropic/claude-3-haiku': 'Claude 3 Haiku',
      'anthropic/claude-3-5-haiku': 'Claude 3.5 Haiku',
      'google/gemini-flash-1.5': 'Gemini Flash 1.5',
      'google/gemini-pro-1.5': 'Gemini Pro 1.5',
      'openai/gpt-4': 'GPT-4',
      'openai/gpt-4-turbo': 'GPT-4 Turbo',
      'anthropic/claude-3-opus': 'Claude 3 Opus',
      'anthropic/claude-3-sonnet': 'Claude 3 Sonnet',
    };

    // Return the friendly name if found, otherwise return a cleaned version
    if (modelMap[model]) {
      return modelMap[model];
    }
    
    // Fallback: Clean up the model name by removing provider prefix and technical suffixes
    return model
      .replace(/^[^/]+\//, '') // Remove provider prefix (e.g., "openai/")
      .replace(/:free$/, ' (Free)') // Convert ":free" suffix to "(Free)"
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize each word
  };

  // Filter prompts based on search query
  const filteredPrompts = prompts.filter(prompt => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const searchableText = [
      prompt.title,
      prompt.original_prompt,
      prompt.optimized_prompt,
      getModelDisplayName(prompt.model),
      prompt.tone,
      prompt.type
    ].join(' ').toLowerCase();
    
    return searchableText.includes(query);
  });

  // Show loading while Clerk is determining user state
  if (!isLoaded) {
    return (
      <div className="text-center py-12">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading...
        </h3>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Sign in to view saved prompts
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to save and manage your optimized prompts
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading saved prompts...
        </h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-center">
            <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchPrompts}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No saved prompts yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start by optimizing and saving your first prompt!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Saved Prompts ({searchQuery ? `${filteredPrompts.length} of ${prompts.length}` : prompts.length})
        </h2>
        <button
          onClick={fetchPrompts}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search prompts by content, model, tone, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredPrompts.length === 0 ? (
            <p>No prompts found matching "{searchQuery}"</p>
          ) : (
            <p>Found {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} matching "{searchQuery}"</p>
          )}
        </div>
      )}

      {/* No Search Results */}
      {searchQuery && filteredPrompts.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No prompts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try a different search term or{' '}
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              clear the search
            </button>
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {prompt.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {formatDate(prompt.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getToneColor(prompt.tone)}`}>
                  {prompt.tone}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(prompt.type)}`}>
                  {prompt.type}
                </span>
              </div>
            </div>

            {/* Original Prompt */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Original Prompt:
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {prompt.original_prompt}
                </p>
              </div>
            </div>

            {/* Optimized Prompt */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Optimized Prompt:
              </h4>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {prompt.optimized_prompt}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Tag className="h-4 w-4" />
                <span>{getModelDisplayName(prompt.model)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(prompt.optimized_prompt)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                {onUsePrompt && (
                  <button
                    onClick={() => onUsePrompt(prompt)}
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <Sparkles className="h-4 w-4" />
                    Use
                  </button>
                )}
                <button
                  onClick={() => deletePrompt(prompt.id)}
                  disabled={deletingId === prompt.id}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                >
                  {deletingId === prompt.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}; 