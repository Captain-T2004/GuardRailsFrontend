import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

// Input validators and output validators configurations
const INPUT_VALIDATORS = [
  { id: 'ends_with', label: 'Ends with "."' },
  { id: 'valid_length', label: 'Length Validation' },
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
  { id: 'mentions_drugs', label: 'Sentiment Analysis' },
  { id: 'profanity_filter', label: 'Profanity Filter' },
  { id: 'redundant_sentences', label: 'Redundancy Check'},
  { id: 'valid_python', label: 'Validate Python'},
  { id: 'detect_pii', label: 'PII Detection' },
];

function ApiKeyCreation() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [inputValidators, setInputValidators] = useState([]);
  const [outputValidators, setOutputValidators] = useState([]);
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);

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
    
    // Basic validation
    if (inputValidators.length === 0 || outputValidators.length === 0) {
      setError('Please select at least one input and output validator');
      return;
    }

    try {
      console.log(inputValidators); 
      console.log(outputValidators);
      const response = await fetch('http://localhost:44444/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_validators: inputValidators,
          output_validators: outputValidators
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate API key');
      }

      const data = await response.json();
      setApiKey(data.api_key);
      setError(null);
    } catch (err) {
      setError(err.message);
      setApiKey(null);
    }
  };

  // Loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col justify-center items-center text-white p-4">
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-center">Generate API Key</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Validators Section */}
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

          {/* Output Validators Section */}
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/30 p-4 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* API Key Display */}
          {apiKey && (
            <div className="bg-green-500/30 p-4 rounded-lg text-center">
              <p className="font-bold mb-2">Your API Key:</p>
              <code className="break-all">{apiKey}</code>
              <p className="text-sm mt-2">Please copy and store this key securely</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-white text-blue-600 font-bold py-3 px-6 rounded-full text-lg shadow-lg hover:bg-blue-100 transition duration-300 transform hover:scale-105"
            >
              Generate API Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApiKeyCreation;