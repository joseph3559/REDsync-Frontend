"use client";
import { useState } from "react";
import { X, Eye, EyeOff, ExternalLink, Shield, Key, AlertTriangle } from "lucide-react";

interface ApiProvider {
  id: string;
  name: string;
  description: string;
  website: string;
  docUrl: string;
  color: string;
  icon: string;
  keyFormat: string;
  placeholder: string;
  guidelines: string[];
}

const API_PROVIDERS: ApiProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Access GPT-4, GPT-3.5, and other OpenAI models for advanced text processing and generation.",
    website: "https://platform.openai.com",
    docUrl: "https://platform.openai.com/docs/api-reference",
    color: "emerald",
    icon: "🤖",
    keyFormat: "sk-...",
    placeholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    guidelines: [
      "Create an account at platform.openai.com",
      "Navigate to API Keys section in your dashboard",
      "Click 'Create new secret key'",
      "Copy the key immediately (it won't be shown again)",
      "Set billing limits to control costs"
    ]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google's advanced AI model for multimodal understanding and generation.",
    website: "https://makersuite.google.com",
    docUrl: "https://ai.google.dev/docs",
    color: "blue",
    icon: "💎",
    keyFormat: "AIza...",
    placeholder: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    guidelines: [
      "Visit Google AI Studio (makersuite.google.com)",
      "Sign in with your Google account",
      "Click 'Get API Key' in the dashboard",
      "Create a new API key or use existing one",
      "Enable the Generative AI API in Google Cloud Console"
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Claude AI by Anthropic for helpful, harmless, and honest AI assistance.",
    website: "https://console.anthropic.com",
    docUrl: "https://docs.anthropic.com/claude/reference",
    color: "purple",
    icon: "🧠",
    keyFormat: "sk-ant-...",
    placeholder: "sk-ant-apiXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    guidelines: [
      "Sign up at console.anthropic.com",
      "Complete the verification process",
      "Navigate to API Keys in settings",
      "Generate a new API key",
      "Configure usage limits and monitoring"
    ]
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Large language models for enterprise applications and custom fine-tuning.",
    website: "https://dashboard.cohere.ai",
    docUrl: "https://docs.cohere.ai/reference/about",
    color: "orange",
    icon: "⚡",
    keyFormat: "COHERE-...",
    placeholder: "COHERE-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    guidelines: [
      "Create account at dashboard.cohere.ai",
      "Verify your email address",
      "Go to API Keys section",
      "Generate a new API key",
      "Choose appropriate usage tier"
    ]
  }
];

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: string, key: string, model?: string) => void;
  provider?: ApiProvider;
  currentKey?: string;
  currentModel?: string;
}

export default function ApiKeyDialog({ isOpen, onClose, onSave, provider, currentKey, currentModel }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState(currentKey || "");
  const [selectedModel, setSelectedModel] = useState(currentModel || "");
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen || !provider) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsValidating(false);
    
    onSave(provider.id, apiKey, selectedModel);
    onClose();
    setApiKey("");
    setSelectedModel("");
  };

  const getModelsForProvider = (providerId: string) => {
    switch (providerId) {
      case "openai":
        return [
          { id: "gpt-4o", name: "GPT-4o (Latest)", recommended: true },
          { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast)" },
          { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
          { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
        ];
      case "gemini":
        return [
          { id: "gemini-pro", name: "Gemini Pro", recommended: true },
          { id: "gemini-pro-vision", name: "Gemini Pro Vision" }
        ];
      case "anthropic":
        return [
          { id: "claude-3-opus", name: "Claude 3 Opus", recommended: true },
          { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
          { id: "claude-3-haiku", name: "Claude 3 Haiku" }
        ];
      case "cohere":
        return [
          { id: "command", name: "Command", recommended: true },
          { id: "command-light", name: "Command Light" }
        ];
      default:
        return [];
    }
  };

  const models = getModelsForProvider(provider.id);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${provider.color}-500 to-${provider.color}-600 px-6 py-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{provider.icon}</span>
              <div>
                <h2 className="text-xl font-semibold">{provider.name} API</h2>
                <p className="text-white/90 text-sm">Configure your API access</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div className={`bg-${provider.color}-50 border border-${provider.color}-200 rounded-lg p-4`}>
              <p className={`text-${provider.color}-800 text-sm leading-relaxed`}>
                {provider.description}
              </p>
            </div>

            {/* API Key Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                <Key className="inline h-4 w-4 mr-2" />
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider.placeholder}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Expected format: {provider.keyFormat}
              </p>
            </div>

            {/* Model Selection */}
            {models.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Model Selection
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a model...</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.recommended ? "(Recommended)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Guidelines */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Setup Guidelines
              </h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <ol className="space-y-2 text-sm text-slate-600">
                  {provider.guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-${provider.color}-100 text-${provider.color}-600 text-xs font-medium mr-3 mt-0.5 flex-shrink-0`}>
                        {index + 1}
                      </span>
                      {guideline}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-4 py-3 border border-${provider.color}-200 text-${provider.color}-700 rounded-lg hover:bg-${provider.color}-50 transition-colors text-sm font-medium`}
              >
                <ExternalLink className="h-4 w-4" />
                Get API Key
              </a>
              <a
                href={provider.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                Documentation
              </a>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>API keys are stored securely and encrypted. Never share your API keys publicly or commit them to version control.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || isValidating}
              className={`px-6 py-2 bg-${provider.color}-600 text-white rounded-lg hover:bg-${provider.color}-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2`}
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Validating...
                </>
              ) : (
                "Save API Key"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { API_PROVIDERS };
export type { ApiProvider };
