import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

// Input validators and output validators configurations
const INPUT_VALIDATORS = [
  { id: 'detect_pii', label: 'PII Detection' },
  { id: 'gibberish_text', label: 'Gibberish Text Detection' },
  { id: 'nsfw_text', label: 'NSFW Text Detection' },
  { id: 'secrets_present', label: 'Secrets Detection' },
  { id: 'toxic_language', label: 'Toxic Text Detection' }
];

const OUTPUT_VALIDATORS = [
  { id: 'financial_tone', label: 'Financial Tone Analysis' },
  { id: 'guardrails_pii', label: 'PII Guardrails' },
  { id: 'has_url', label: 'URL Detection' },
  { id: 'mentions_drugs', label: 'Mentions Drugs' },
  { id: 'redundant_sentences', label: 'Redundancy Check'},
  { id: 'valid_python', label: 'Validate Python'},
  { id: 'detect_pii', label: 'PII Detection' },
];

const LLM_MODELS = [
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { id: 'gpt-4', label: 'GPT-4' },
  { id: 'claude-v1', label: 'Claude v1' },
  { id: 'claude-instant-v1', label: 'Claude Instant v1' },
  { id: 'palm-2', label: 'PaLM 2' },
  { id: 'llama-2', label: 'LLaMA 2' },
  { id: 'gpt-others', label: 'Other GPT based'},
  { id: 'llama-others', label: 'Other llama based'},
  { id: 'miscellaneous', label: 'Other, not listed'},
];

function ApiKeyCreation() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [inputValidators, setInputValidators] = useState([]);
  const [outputValidators, setOutputValidators] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);
  const [previousKeys, setPreviousKeys] = useState([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);

  useEffect(() => {
    fetchPreviousKeys();
  }, []);

  const fetchPreviousKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const token = await getAccessTokenSilently({
        audience: "my-backend-api"
      });
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/prev_keys`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch previous API keys');
      }
      const data = await response.json();
      setPreviousKeys(data.api_keys || []);
      console.log(data);
    } catch (err) {
      console.error('Error fetching previous API keys:', err);
      setError('Failed to fetch previous API keys');
      setPreviousKeys([]);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleInputValidatorToggle = (validator) => {
    setInputValidators(prev => 
      prev.includes(validator) 
        ? prev.filter(v => v !== validator)
        : [...prev, validator]
    );
  };

  const handleOutputValidatorToggle = (validator) => {
    setOutputValidators(prev => 
      prev.includes(validator) 
        ? prev.filter(v => v !== validator)
        : [...prev, validator]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputValidators.length === 0 || outputValidators.length === 0 || !selectedModel) {
      setError('Please select at least one input and output validator, and choose an LLM model');
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        audience: "my-backend-api"
      });
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          input_validators: inputValidators,
          output_validators: outputValidators,
          selected_model: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const data = await response.json();
      setApiKey(data.api_key);
      setError(null);
      fetchPreviousKeys();
    } catch (err) {
      setError(err.message);
      setApiKey(null);
    }
  };

  const handleDeleteKey = async (keyId) => {
    try {
      const token = await getAccessTokenSilently({
        audience: "my-backend-api"
      });
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/delete_keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key_id: keyId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      const data = await response.json();
      console.log(data.message);
      fetchPreviousKeys(); // Refresh the list after deletion
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError('Failed to delete API key');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col justify-center items-center text-white p-4">
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-center">Generate API Key</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Input Validators</h2>
            <div className="grid grid-cols-2 gap-4">
              {INPUT_VALIDATORS.map((validator) => (
                <label 
                  key={validator.id} 
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={inputValidators.includes(validator.id)}
                    onChange={() => handleInputValidatorToggle(validator.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span>{validator.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Output Validators</h2>
            <div className="grid grid-cols-2 gap-4">
              {OUTPUT_VALIDATORS.map((validator) => (
                <label 
                  key={validator.id} 
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={outputValidators.includes(validator.id)}
                    onChange={() => handleOutputValidatorToggle(validator.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                  <span>{validator.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">LLM Model</h2>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 rounded-md text-gray-800"
            >
              <option value="">Select an LLM model</option>
              {LLM_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-500/30 p-4 rounded-lg text-center">
              {error}
            </div>
          )}

          {apiKey && (
            <div className="bg-green-500/30 p-4 rounded-lg text-center">
              <p className="font-bold mb-2">Your API Key:</p>
              <code className="break-all">{apiKey}</code>
              <p className="text-sm mt-2">Please copy and store this key securely</p>
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              className="bg-white text-blue-600 font-bold py-3 px-6 rounded-full text-lg shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105"
            >
              Generate API Key
            </button>
          </div>
        </form>

        <div className="mt-12 bg-white/10 backdrop-blur-md rounded-xl p-6">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Previous API Keys</h2>
          {isLoadingKeys ? (
            <div className="text-center text-white animate-pulse">Loading previous keys...</div>
          ) : previousKeys.length > 0 ? (
            <div className="space-y-6">
              {previousKeys.map((key, index) => (
                <div key={index} className="bg-white/20 rounded-lg p-5 shadow-lg transition-all hover:shadow-xl">
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-white mb-2">API Key:</p>
                    <div className="bg-gray-800 rounded p-3 font-mono text-sm text-green-400 break-all">
                      {key.api_key}xxxxxxxxxxxxxxxxx
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-md font-semibold text-white mb-2">Input Validators:</p>
                      <ul className="list-none space-y-1">
                        {key.input_validators.map((validator, i) => (
                          <li key={i} className="text-sm text-white flex items-center">
                            <span className="mr-2 text-yellow-400">•</span>{validator}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-md font-semibold text-white mb-2">Output Validators:</p>
                      <ul className="list-none space-y-1">
                        {key.output_validators.map((validator, i) => (
                          <li key={i} className="text-sm text-white flex items-center">
                            <span className="mr-2 text-blue-400">•</span>{validator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-md font-semibold text-white mb-2">Selected Model:</p>
                      <p className="text-sm text-white bg-blue-600/50 inline-block px-3 py-1 rounded-full">
                        {key.selected_model}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(key.key_id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white text-lg">No previous API keys found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiKeyCreation;

