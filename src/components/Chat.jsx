import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const formatResponse = (content) => {
  return content.split('\n').map((line, index) => {
    // Format headers
    if (line.startsWith('## ')) {
      return <h3 key={index} className="response-header">{line.replace('## ', '')}</h3>;
    }
    // Format lists
    if (line.startsWith(' - ')) {
      return <li key={index} className="response-list-item">{line.replace(' - ', '')}</li>;
    }
    // Format bold text
    const boldRegex = /\*\*(.*?)\*\*/g;
    if (boldRegex.test(line)) {
      return (
        <p key={index} className="response-text">
          {line.split(boldRegex).map((part, i) => 
            i % 2 ? <strong key={i}>{part}</strong> : part
          )}
        </p>
      );
    }
    // Default paragraph
    return <p key={index} className="response-text">{line}</p>;
  });
};


const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize chat thread on component mount
  useEffect(() => {
    const createThread = async () => {
      try {
        const response = await axios.post('http://localhost:5000/create-thread');
        setThreadId(response.data.thread_id);
      } catch (error) {
        console.error('Error creating thread:', error);
      }
    };
    createThread();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    console.log('clicked')
    if (!inputMessage.trim() || !threadId) return;

    // Add user message
    const newMessage = { content: inputMessage, isUser: true };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to backend
      await axios.post('http://localhost:5000/send-message', {
        thread_id: threadId,
        content: inputMessage
      });

      // Get assistant response
      const response = await axios.post('http://localhost:5000/get-response', {
        thread_id: threadId
      });

      // Add assistant message
      setMessages(prev => [...prev, {
        content: response.data.content,
        isUser: false
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        content: "Sorry, I'm having trouble connecting. Please try again.",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
            <div className={`bubble ${msg.isUser ? 'user-bubble' : 'bot-bubble'}`}>
              {/* {msg.content} */}
              {!msg.isUser ? formatResponse(msg.content) : msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="bot-bubble loading">
              <div className="dot-flashing"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

// Add these CSS styles
const styles = `
.chat-container {
  max-width: 800px;
  margin: 20px auto;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  font-family: Arial, sans-serif;
}

.chat-messages {
  height: 500px;
  overflow-y: auto;
  padding: 20px;
  background: #f9f9f9;
}
.response-header {
    font-size: 1.2em;
    font-weight: 600;
    margin: 8px 0;
    color: #2d3748;
  }

  .response-text {
    margin: 6px 0;
    line-height: 1.6;
    color: #4a5568;
  }

  .response-list-item {
    margin: 4px 0;
    padding-left: 1.5em;
    position: relative;
  }

  .response-list-item::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #718096;
  }

  .bot-bubble {
    max-width: 80%;
    padding: 16px;
    border-radius: 12px;
    background: #f7fafc;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    white-space: pre-wrap;
  }

  .loading .dot-flashing {
    display: inline-block;
    position: relative;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #cbd5e0;
    animation: dot-flashing 1s infinite linear;
  }

  @keyframes dot-flashing {
    0% { opacity: 0.2; }
    50% { opacity: 1; }
    100% { opacity: 0.2; }
  }
.message {
  margin: 10px 0;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.bubble {
  max-width: 70%;
  padding: 12px 18px;
  border-radius: 20px;
  line-height: 1.4;
}

.user-bubble {
  background: #007bff;
  color: white;
  border-radius: 20px 20px 5px 20px;
}

.bot-bubble {
  background: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 20px 20px 20px 5px;
}

.input-area {
  display: flex;
  padding: 20px;
  background: white;
  border-top: 1px solid #eee;
}

.input-area input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 25px;
  margin-right: 10px;
  font-size: 16px;
}

.input-area button {
  padding: 12px 25px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background 0.3s;
}

.input-area button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.loading {
  display: inline-block;
  padding: 15px;
}

.dot-flashing {
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #999;
  animation: dotFlashing 1s infinite linear;
}

@keyframes dotFlashing {
  0% { background-color: #999; }
  50% { background-color: #eee; }
  100% { background-color: #999; }
}
`;

export default function ChatBot() {
  return (
    <>
      <style>{styles}</style>
      <ChatInterface />
    </>
  );
}
