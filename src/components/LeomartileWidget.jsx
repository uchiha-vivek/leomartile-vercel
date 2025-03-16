import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BsCartDash } from "react-icons/bs";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";
import ReactMarkdown from "react-markdown";
import "./style.css";

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
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    try {
      const res = await axios.post(`${API_BASE_URL}/send-message`, {
        thread_id: threadId,
        content: userInput,
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
        setMessages((prev) => [...prev, { sender: "ai", text: res.data.content }]);
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    }
    setIsTyping(false);
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button className={`chat-toggle-btn ${isOpen ? 'hidden' : ''}`} onClick={toggleWidget}>
        💬
      </button>
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-container">
            <div className="chat-header-container">
              <div className="chat-header">
                <BsCartDash className="cart-icon" size={20} />
                <span className="chat-header-text">Chat with Leo</span>
              </div>
              <button className="chat-close-btn" onClick={toggleWidget}>✖</button>
            </div>
            <div className="chat-body">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.sender === "ai" && <div className="chat-avatar">LT</div>}
                <div className="chat-text">
                  {msg.sender === "ai" ? (
                    <ReactMarkdown
                      components={{
                        img: ({ node, ...props }) => (
                          <img {...props} className="chat-image" />
                        ),
                        p: ({ node, children }) => <li>{children}</li>, 
                        ul: ({ node, ...props }) => <ul className="chat-list" {...props} />, 
                        ol: ({ node, ...props }) => <ol className="chat-list" {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
              
              ))}
              {isTyping && <div className="chat-message ai">...</div>}
              <div ref={chatBoxRef}></div>
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={sending}
              />
              <MdOutlineEmojiEmotions size={20} className="chat-icon emoji-icon" />
              <CiLocationArrow1 onClick={sendMessage} size={20} className="chat-icon location-icon" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;