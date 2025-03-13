import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (isOpen && !threadId) {
      createThread();
    }
  }, [isOpen]);

  useEffect(() => {
    chatBoxRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createThread = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/create-thread`);
      setThreadId(res.data.thread_id);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !threadId) return;

    setSending(true);
    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      await axios.post(`${API_BASE_URL}/send-message`, {
        thread_id: threadId,
        content: input,
      });

      getResponse();
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setSending(false);
  };

  const getResponse = async () => {
    setIsTyping(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/get-response`, {
        thread_id: threadId,
      });

      if (res.data.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.data.content }]);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    }
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 chatbox">
      {!isOpen && (
        <button className="chatbox__button" onClick={() => setIsOpen(true)}>
          <FaComments size={35} />
        </button>
      )}
      {isOpen && (
        <div className="chatbox__support">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
          <div className="chatbox__header">
            <span className=" chatbox__heading--header font-semibold">Chat with Leo</span>
            </div>
            <FaTimes className="chatbox__close-btn" onClick={() => setIsOpen(false)} />
          </div>

          <div className="chatbox__messages">
            {messages.map((msg, index) => (
            <div
            key={index}
            className={`messages__item ${msg.role === "user" ? "messages__item--operator" : "messages__item--visitor"}`}
          >
            {msg.role === "assistant" ? (
            <ReactMarkdown
            components={{
              img: ({ node }) => (
                <img
                  src={node.properties.src}
                  alt={node.properties.alt}
                  className="custom-image-class"
                />
              ),
            }}
          >
            {msg.content}
          </ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
            ))}
            {isTyping && (
              <div className="messages__item messages__item--visitor loading">
                <span className="dot-flashing"></span>
                <span className="dot-flashing"></span>
                <span className="dot-flashing"></span>
              </div>
            )}
            <div ref={chatBoxRef}></div>
          </div>

          <div className="chatbox__footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className={`chatbox__send--footer chatbox-send-button ${sending ? "sending" : ""}`}
              onClick={sendMessage}
              disabled={sending}
            >
              {sending ? (
                <div className="dot-flashing"></div>
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const styles = `

  .react-markdown {
    word-wrap: break-word;
  }
  .custom-image-class {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 2px 0;

}
  .dot-flashing {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin: 1px;
    border-radius: 50%;
    background-color: black;
    animation: dotFlashing 1s infinite linear;
  }

  @keyframes dotFlashing {
    0% { opacity: 0.2; }
    50% { opacity: 1; }
    100% { opacity: 0.2; }
  }

  .chatbox-send-button.sending {
    animation: pulse 0.6s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
.chatbox {
    position: absolute;
    bottom: 30px;
    right: 30px;
}

.chatbox__button {
    text-align: right;
    padding: 10px;
    background: white;
    border: none;
    outline: none;
    border-top-left-radius: 50px;
    border-top-right-radius: 50px;
    border-bottom-left-radius: 50px;
    box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}


.chatbox__support {
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    display: flex;
    flex-direction: column;
    background: #eee;
    width: 300px;
    height: 480px;
    transition: all .5s ease-in-out;
}

.chatbox__header {
    background: #101010;
    display: flex;
    flex-direction: row;
    padding: 15px 20px;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    box-shadow: var(--primaryBoxShadow);
    position: sticky;
    top: 0;
}

.chatbox__heading--header {
    font-size: 1.2rem;
    color: white;
}

.chatbox__messages {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
}

.chatbox__messages {
    padding: 0 0px;
}
.chatbox__close-btn {
  position: absolute; 
  top: 10px;  
  right: 10px; 
  cursor: pointer;  
  font-size: 1.2rem; 
  color: white;
}
.chatbox__footer {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    padding: 20px 20px;
    background: #0c0c0c;
    box-shadow: var(--secondaryBoxShadow);
    border-bottom-right-radius: 10px;
    border-bottom-left-radius: 10px;
    margin-top: 20px;
}

.chatbox__footer input {
    border: none;
    padding: 10px 10px;
    border-radius: 30px;
    text-align: center;
}
.chatbox__footer {
    position: sticky;
    bottom: 0;
}

.chatbox__send--footer {
    color: white;
}

.chatbox-send-button {
    background: #4e4e50;
    color: white;
    border-radius: 5px;
    padding: 5px 20px 5px 20px;
    border: none;
}
.messages__item {
    margin-top: 10px;
    background: #E0E0E0;
    padding: 8px 12px;
    max-width: 70%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
}
.chat-container {
  margin: 20px auto;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  font-family: Arial, sans-serif;
  max-width: 60.6%;
  width: fit-content;
}
.messages__item--operator {
    margin-left: auto;
}

.messages__item--visitor {
    margin-right: auto;
}

.messages__item--visitor,
.messages__item--typing {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
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

`;

export default function FloatingChat() {
  return (
    <>
      <style>{styles}</style>
      <ChatWidget />
    </>
  );
};