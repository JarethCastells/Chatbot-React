import { useState, useEffect, useRef } from 'react';
import chatbotDataset from './chatbotDataset';
import './index.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      animation: 'fadeIn'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Configuración de Gemini
  const GEMINI_API_KEY = 'AIzaSyCwCJ9Gr4U79oFgQuuYQGf6vWCMCOW0-AA';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role, content, animation = 'fadeIn') => {
    const newMessage = { role, content, animation };
    setMessages(prev => [...prev, newMessage]);
  };

  const findLocalResponse = (userInput) => {
    const input = userInput.toLowerCase().trim();
    const exactMatch = chatbotDataset.find(item => item.question.toLowerCase() === input);
    const partialMatch = chatbotDataset.find(item => input.includes(item.question.toLowerCase()));
    
    if (exactMatch) {
      return {
        response: exactMatch.responses[Math.floor(Math.random() * exactMatch.responses.length)],
        source: 'local'
      };
    }
    
    if (partialMatch) {
      return {
        response: partialMatch.responses[Math.floor(Math.random() * partialMatch.responses.length)],
        source: 'local'
      };
    }
    
    return null;
  };

  const queryGemini = async (prompt) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          safetySettings: { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
          generationConfig: { temperature: 0.9, topP: 1, topK: 40, maxOutputTokens: 2048 }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al conectar con Gemini');
      }

      const data = await response.json();
      return {
        response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude obtener una respuesta clara de Gemini',
        source: 'gemini'
      };
    } catch (error) {
      console.error('Error al consultar Gemini:', error);
      setError(error.message);
      return {
        response: `Disculpa, no puedo responder ahora. (Error: ${error.message})`,
        source: 'error'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getBotResponse = async (userInputText) => {
    if (!userInputText.trim()) return;
    
    const localResponse = findLocalResponse(userInputText);
    if (localResponse) {
      addMessage('bot', localResponse.response, 'slideInLeft');
      return;
    }
    
    addMessage('bot', 'Pensando...', 'pulse');
    const { response } = await queryGemini(userInputText);
    
    setMessages(prev => [
      ...prev.slice(0, -1),
      { 
        role: 'bot', 
        content: response,
        className: error ? 'error-message' : '',
        animation: 'slideInUp'
      }
    ]);
  };

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    
    addMessage('user', text, 'slideInRight');
    setInputValue('');
    getBotResponse(text);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <i className="fas fa-robot pulse-on-hover"></i>
          <span className="app-title">Asistente Virtual</span>
          {error && <div className="error-notice shake">{error}</div>}
        </div>
      </header>

      <div className="chat-container">
        <div className="chat-messages custom-scrollbar">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`message ${msg.role}-message ${msg.className || ''} ${msg.animation || ''}`}
            >
              <div className="message-header">
                {msg.role === 'user' ? (
                  <>
                    <i className="fas fa-user"></i>
                    <span>Tú</span>
                  </>
                ) : (
                  <span>Asistente</span>
                )}
              </div>
              <div className="message-content">{msg.content}</div>
              {msg.source === 'gemini' && (
                <div className="message-source">Respuesta generada por IA</div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="typing-indicator bounce">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container floating-effect">
          <input
            type="text"
            className="chat-input"
            placeholder="Escribe tu mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
            autoFocus
          />
          <button 
            className="send-button pulse-on-hover"
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            <i>Enviar</i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;