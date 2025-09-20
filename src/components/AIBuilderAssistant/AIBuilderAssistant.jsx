import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './AIBuilderAssistant.css';

const AIBuilderAssistant = () => {
  const [textPrompt, setTextPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedAPI, setSelectedAPI] = useState('claude'); // 'claude' or 'chatgpt'
  const [generatedDrawing, setGeneratedDrawing] = useState(null);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [useCorsProxy, setUseCorsProxy] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'working', 'failed', 'unknown'
  const fileInputRef = useRef(null);

  // API Keys (in production, these should be in environment variables)
  const API_KEYS = {
    chatgpt: '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',
    claude: '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'
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textPrompt.trim()) return;

    setIsGenerating(true);
    setError('');
    setGeneratedDrawing(null);
    setDebugInfo('');

    try {
      console.log(`Starting ${selectedAPI} API call for prompt: "${textPrompt}"`);
      setDebugInfo(`Calling ${selectedAPI} API...`);
      
      const drawing = await generateDrawingFromText(textPrompt, selectedAPI);
      console.log('Generated drawing:', drawing);
      setGeneratedDrawing(drawing);
      setDebugInfo(`✅ Successfully generated drawing with ${drawing.dots.length} dots`);
    } catch (error) {
      console.error('Error generating drawing:', error);
      setDebugInfo(`❌ API Error: ${error.message}. Trying fallback...`);
      
      // Try fallback generation
      try {
        const fallbackDrawing = generateFallbackDrawing(textPrompt);
        setGeneratedDrawing(fallbackDrawing);
        setError(`API failed, but generated fallback drawing: ${error.message}`);
        setDebugInfo(`⚠️ Using fallback drawing with ${fallbackDrawing.dots.length} dots`);
      } catch (fallbackError) {
        setError(`Failed to generate drawing: ${error.message}`);
        setDebugInfo(`❌ Both API and fallback failed: ${fallbackError.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedDrawing(null);
      setError('');
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsGenerating(true);
    setError('');
    setGeneratedDrawing(null);

    try {
      const drawing = await generateDrawingFromImage(selectedFile, selectedAPI);
      setGeneratedDrawing(drawing);
    } catch (error) {
      console.error('Error generating drawing from image:', error);
      setError('Failed to generate drawing from image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDrawingFromText = async (prompt, apiType) => {
    const apiKey = API_KEYS[apiType];
    
    if (apiType === 'claude') {
      return await callClaudeAPI(prompt, apiKey);
    } else {
      return await callChatGPTAPI(prompt, apiKey);
    }
  };

  const generateDrawingFromImage = async (imageFile, apiType) => {
    const apiKey = API_KEYS[apiType];
    
    if (apiType === 'claude') {
      return await callClaudeVisionAPI(imageFile, apiKey);
    } else {
      return await callChatGPTVisionAPI(imageFile, apiKey);
    }
  };

  const callClaudeAPI = async (prompt, apiKey) => {
    console.log('Calling Claude API with key:', apiKey.substring(0, 20) + '...');
    
    const systemPrompt = `You are an AI assistant that creates dot-to-dot drawings. 
    
Given a text description, create a simple dot-to-dot drawing pattern. Return ONLY valid JSON in this exact format:

{
  "name": "DRAWING_NAME",
  "categoryName": "CATEGORY",
  "dots": [{"x": 100, "y": 100}, ...],
  "sequence": [{"from": 0, "to": 1}, ...]
}

Rules:
- X coordinates: 140-420
- Y coordinates: 105-385  
- Keep it simple with 5-20 dots
- Make logical connection sequences
- Use descriptive names in UPPERCASE
- Categories: Shapes, Animals, Objects, Symbols, etc.`;

    const requestBody = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\nCreate a dot-to-dot drawing for: "${prompt}"`
        }
      ]
    };

    console.log('Claude request body:', requestBody);

    try {
      console.log('Attempting Claude API call...');
      console.log('CORS Proxy enabled:', useCorsProxy);
      
      // Try direct API call first
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Claude response status:', response.status);
      console.log('Claude response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error response:', errorText);
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Claude API response data:', data);
      
      setApiStatus('working');
      const content = data.content[0].text;
      console.log('Claude API content:', content);
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in Claude response:', content);
        throw new Error('No valid JSON found in response');
      }

      const jsonString = jsonMatch[0];
      console.log('Extracted JSON string:', jsonString);
      
      try {
        const parsed = JSON.parse(jsonString);
        console.log('Parsed JSON:', parsed);
        return parsed;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON format: ${parseError.message}`);
      }
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      setApiStatus('failed');
      
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Claude API. This might be due to CORS restrictions or network issues. Try using the fallback mode.');
      }
      throw fetchError;
    }
  };

  const callChatGPTAPI = async (prompt, apiKey) => {
    console.log('Calling ChatGPT API with key:', apiKey.substring(0, 20) + '...');
    
    const systemPrompt = `You are an AI assistant that creates dot-to-dot drawings. 
    
Given a text description, create a simple dot-to-dot drawing pattern. Return ONLY valid JSON in this exact format:

{
  "name": "DRAWING_NAME",
  "categoryName": "CATEGORY",
  "dots": [{"x": 100, "y": 100}, ...],
  "sequence": [{"from": 0, "to": 1}, ...]
}

Rules:
- X coordinates: 140-420
- Y coordinates: 105-385  
- Keep it simple with 5-20 dots
- Make logical connection sequences
- Use descriptive names in UPPERCASE
- Categories: Shapes, Animals, Objects, Symbols, etc.`;

    const requestBody = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Create a dot-to-dot drawing for: "${prompt}"`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    console.log('ChatGPT request body:', requestBody);

    try {
          const apiUrl = useCorsProxy 
      ? 'https://cors-anywhere.herokuapp.com/https://api.openai.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
      
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(useCorsProxy && { 'Origin': window.location.origin })
      },
      body: JSON.stringify(requestBody)
    });

      console.log('ChatGPT response status:', response.status);
      console.log('ChatGPT response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ChatGPT API error response:', errorText);
        throw new Error(`ChatGPT API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('ChatGPT API response data:', data);
      
      const content = data.choices[0].message.content;
      console.log('ChatGPT API content:', content);
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in ChatGPT response:', content);
        throw new Error('No valid JSON found in response');
      }

      const jsonString = jsonMatch[0];
      console.log('Extracted JSON string:', jsonString);
      
      try {
        const parsed = JSON.parse(jsonString);
        console.log('Parsed JSON:', parsed);
        return parsed;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON format: ${parseError.message}`);
      }
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to ChatGPT API. This might be due to CORS restrictions or network issues.');
      }
      throw fetchError;
    }
  };

  const callClaudeVisionAPI = async (imageFile, apiKey) => {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const systemPrompt = `You are an AI assistant that creates dot-to-dot drawings from images. 
    
Analyze the uploaded image and create a simple dot-to-dot drawing pattern. Return ONLY valid JSON in this exact format:

{
  "name": "DRAWING_NAME",
  "categoryName": "CATEGORY",
  "dots": [{"x": 100, "y": 100}, ...],
  "sequence": [{"from": 0, "to": 1}, ...]
}

Rules:
- X coordinates: 140-420
- Y coordinates: 105-385  
- Keep it simple with 5-20 dots
- Make logical connection sequences
- Use descriptive names in UPPERCASE
- Categories: Shapes, Animals, Objects, Symbols, etc.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${systemPrompt}\n\nAnalyze this image and create a dot-to-dot drawing:`
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageFile.type,
                  data: base64Image.split(',')[1]
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  };

  const callChatGPTVisionAPI = async (imageFile, apiKey) => {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const systemPrompt = `You are an AI assistant that creates dot-to-dot drawings from images. 
    
Analyze the uploaded image and create a simple dot-to-dot drawing pattern. Return ONLY valid JSON in this exact format:

{
  "name": "DRAWING_NAME",
  "categoryName": "CATEGORY",
  "dots": [{"x": 100, "y": 100}, ...],
  "sequence": [{"from": 0, "to": 1}, ...]
}

Rules:
- X coordinates: 140-420
- Y coordinates: 105-385  
- Keep it simple with 5-20 dots
- Make logical connection sequences
- Use descriptive names in UPPERCASE
- Categories: Shapes, Animals, Objects, Symbols, etc.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and create a dot-to-dot drawing:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`ChatGPT Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const downloadDrawing = () => {
    if (!generatedDrawing) return;

    const jsonString = JSON.stringify(generatedDrawing, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const filename = (generatedDrawing.name.toLowerCase().replace(/\s+/g, '_') || 'drawing') + '.json';
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setTextPrompt('');
    setSelectedFile(null);
    setPreviewUrl('');
    setGeneratedDrawing(null);
    setError('');
    setDebugInfo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const testAPI = async () => {
    setDebugInfo('Testing API connection...');
    try {
      const apiKey = API_KEYS[selectedAPI];
      console.log(`Testing ${selectedAPI} API with key:`, apiKey.substring(0, 20) + '...');
      
      if (selectedAPI === 'claude') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 50,
            messages: [
              {
                role: 'user',
                content: 'Say "Hello" and nothing else.'
              }
            ]
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API test failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Claude test response:', data);
        setDebugInfo(`✅ Claude API test successful: "${data.content[0].text}"`);
      } else {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'user',
                content: 'Say "Hello" and nothing else.'
              }
            ],
            max_tokens: 50
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API test failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('ChatGPT test response:', data);
        setDebugInfo(`✅ ChatGPT API test successful: "${data.choices[0].message.content}"`);
      }
    } catch (error) {
      console.error('API test error:', error);
      setDebugInfo(`❌ API test failed: ${error.message}`);
    }
  };

  // Fallback function to generate a simple drawing when API fails
  const generateFallbackDrawing = (prompt) => {
    console.log('Generating fallback drawing for:', prompt);
    
    const promptLower = prompt.toLowerCase();
    let drawing;
    
    if (promptLower.includes('circle') || promptLower.includes('round')) {
      drawing = {
        name: 'CIRCLE',
        categoryName: 'Shapes',
        dots: [
          { x: 280, y: 210 }, { x: 320, y: 210 }, { x: 350, y: 240 },
          { x: 350, y: 280 }, { x: 320, y: 310 }, { x: 280, y: 310 },
          { x: 250, y: 280 }, { x: 250, y: 240 }
        ],
        sequence: [
          { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
          { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 },
          { from: 6, to: 7 }, { from: 7, to: 0 }
        ]
      };
    } else if (promptLower.includes('star')) {
      drawing = {
        name: 'STAR',
        categoryName: 'Shapes',
        dots: [
          { x: 280, y: 200 }, { x: 300, y: 240 }, { x: 340, y: 240 },
          { x: 310, y: 270 }, { x: 320, y: 310 }, { x: 280, y: 290 },
          { x: 240, y: 310 }, { x: 250, y: 270 }, { x: 220, y: 240 },
          { x: 260, y: 240 }
        ],
        sequence: [
          { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
          { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 },
          { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 8, to: 9 },
          { from: 9, to: 0 }
        ]
      };
    } else {
      // Default simple shape
      drawing = {
        name: prompt.toUpperCase().substring(0, 10),
        categoryName: 'Custom',
        dots: [
          { x: 200, y: 200 }, { x: 300, y: 200 }, { x: 300, y: 300 },
          { x: 200, y: 300 }
        ],
        sequence: [
          { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
          { from: 3, to: 0 }
        ]
      };
    }
    
    return drawing;
  };

  return (
    <div className="ai-builder-page">
      <div className="ai-builder-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>🤖 AI Drawing Assistant</h1>
        <p>Generate dot-to-dot drawings using AI</p>
      </div>

      <div className="ai-builder-content">
        {/* API Selection */}
        <div className="api-selection">
          <h3>Choose AI Service</h3>
          <div className="api-buttons">
            <button 
              className={`api-btn ${selectedAPI === 'claude' ? 'active' : ''}`}
              onClick={() => setSelectedAPI('claude')}
            >
              <span className="api-icon">🤖</span>
              Claude AI
            </button>
            <button 
              className={`api-btn ${selectedAPI === 'chatgpt' ? 'active' : ''}`}
              onClick={() => setSelectedAPI('chatgpt')}
            >
              <span className="api-icon">💬</span>
              ChatGPT
            </button>
          </div>
        </div>

        {/* Text Input Section */}
        <div className="ai-section">
          <h3>Generate from Text</h3>
          <form onSubmit={handleTextSubmit}>
            <textarea
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              placeholder="Describe what you want to draw (e.g., 'a cat', 'a flower', 'a star')"
              rows={3}
              disabled={isGenerating}
            />
            <button 
              type="submit" 
              className="generate-btn"
              disabled={isGenerating || !textPrompt.trim()}
            >
              {isGenerating ? 'Generating...' : `Generate with ${selectedAPI === 'claude' ? 'Claude' : 'ChatGPT'}`}
            </button>
          </form>
        </div>

        <div className="ai-divider">
          <span>OR</span>
        </div>

        {/* Image Upload Section */}
        <div className="ai-section">
          <h3>Generate from Image</h3>
          <form onSubmit={handleImageSubmit}>
            <div className="file-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isGenerating}
              />
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className="generate-btn"
              disabled={isGenerating || !selectedFile}
            >
              {isGenerating ? 'Generating...' : `Generate from Image with ${selectedAPI === 'claude' ? 'Claude' : 'ChatGPT'}`}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Generated Drawing Display */}
        {generatedDrawing && (
          <div className="generated-drawing">
            <h3>Generated Drawing</h3>
            <div className="drawing-info">
              <p><strong>Name:</strong> {generatedDrawing.name}</p>
              <p><strong>Category:</strong> {generatedDrawing.categoryName}</p>
              <p><strong>Dots:</strong> {generatedDrawing.dots.length}</p>
              <p><strong>Connections:</strong> {generatedDrawing.sequence.length}</p>
            </div>
            
            <div className="drawing-preview">
              <h4>Preview</h4>
              <div className="preview-canvas">
                <svg width="560" height="490" viewBox="0 0 560 490">
                  {/* Draw dots */}
                  {generatedDrawing.dots.map((dot, index) => (
                    <circle
                      key={index}
                      cx={dot.x}
                      cy={dot.y}
                      r="3"
                      fill="#007bff"
                      stroke="#0056b3"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Draw connections */}
                  {generatedDrawing.sequence.map((line, index) => {
                    const fromDot = generatedDrawing.dots[line.from];
                    const toDot = generatedDrawing.dots[line.to];
                    return (
                      <line
                        key={index}
                        x1={fromDot.x}
                        y1={fromDot.y}
                        x2={toDot.x}
                        y2={toDot.y}
                        stroke="#007bff"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
            
            <div className="drawing-actions">
              <button onClick={downloadDrawing} className="download-btn">
                📥 Download JSON
              </button>
              <button onClick={clearAll} className="clear-btn">
                🗑️ Clear All
              </button>
            </div>
          </div>
        )}

        {/* Debug Section */}
        <div className="debug-section">
          <button 
            className="debug-toggle-btn"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? '🔽 Hide Debug' : '🔼 Show Debug'}
          </button>
          
          {showDebug && (
            <div className="debug-panel">
              <h3>Debug Information</h3>
              <div className="debug-content">
                <p><strong>Selected API:</strong> {selectedAPI}</p>
                <p><strong>API Key:</strong> {API_KEYS[selectedAPI].substring(0, 20)}...</p>
                <p><strong>API Status:</strong> 
                  <span className={`status-${apiStatus}`}>
                    {apiStatus === 'working' ? '✅ Working' : 
                     apiStatus === 'failed' ? '❌ Failed' : '❓ Unknown'}
                  </span>
                </p>
                <p><strong>Status:</strong> {debugInfo || 'Ready'}</p>
                <div className="debug-option">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={useCorsProxy}
                      onChange={(e) => setUseCorsProxy(e.target.checked)}
                    />
                    Use CORS Proxy (for network issues)
                  </label>
                </div>
                {apiStatus === 'failed' && (
                  <div className="debug-warning">
                    <strong>⚠️ API Issue Detected:</strong> The API calls are failing due to CORS restrictions. 
                    The fallback mode will generate simple drawings instead. This is normal for browser-based applications.
                  </div>
                )}
                {error && (
                  <div className="debug-error">
                    <strong>Error:</strong> {error}
                  </div>
                )}
                <div className="debug-actions">
                  <button 
                    onClick={() => {
                      console.log('Current state:', {
                        textPrompt,
                        selectedAPI,
                        isGenerating,
                        error,
                        debugInfo
                      });
                    }}
                    className="debug-btn"
                  >
                    Log State to Console
                  </button>
                  <button 
                    onClick={() => {
                      setError('');
                      setDebugInfo('');
                      setGeneratedDrawing(null);
                    }}
                    className="debug-btn"
                  >
                    Clear Debug Info
                  </button>
                  <button 
                    onClick={testAPI}
                    className="debug-btn"
                  >
                    Test API Connection
                  </button>
                  <button 
                    onClick={() => {
                      const fallback = generateFallbackDrawing('test circle');
                      setGeneratedDrawing(fallback);
                      setDebugInfo(`✅ Fallback test successful: ${fallback.dots.length} dots`);
                    }}
                    className="debug-btn"
                  >
                    Test Fallback
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="ai-info">
          <h3>How it works</h3>
          <ul>
            <li><strong>Text Generation:</strong> Describe what you want to draw and the AI creates a dot-to-dot pattern</li>
            <li><strong>Image Generation:</strong> Upload an image and the AI analyzes it to create a dot-to-dot pattern</li>
            <li><strong>Download:</strong> Get the JSON file ready to use in your dot-to-dot game</li>
            <li><strong>API Choice:</strong> Choose between Claude AI or ChatGPT for different results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIBuilderAssistant; 