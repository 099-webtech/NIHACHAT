// ChatMainPage.js
import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { ToggleDarkMode } from '../assets/js/darkmode';
import ReactMarkdown from 'react-markdown';
import ChatSideMenu from './ChatSideMenu';
import { CopyToClipboard } from 'react-copy-to-clipboard';
const { SpeechRecognition, webkitSpeechRecognition } = window; // Add this line

function ChatMainPage() {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [showSecondDiv, setShowSecondDiv] = useState(true);
    const [userName, setUserName] = useState('Guest');
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const chatContainerRef = useRef(null);
    const [error, setError] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    const handleCopy = (index) => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        const userMessage = userInput;
        setUserInput('');
        setLoading(true);
        setShowSecondDiv(false);
        setError(null);

        const newUserMessage = { role: 'user', content: userMessage };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);

        try {
            const response = await fetch(`http://localhost:2000/chat/${userName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation_id: currentConversationId,
                    messages: [...messages, newUserMessage],
                }),
            });

            const reader = response.body.getReader();

            const assistantMessageIndex = messages.length;
            setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            break;
                        }
                        try {
                            const parsedData = JSON.parse(data);
                            if (parsedData.error) {
                                throw new Error(parsedData.error);
                            }
                            if (parsedData.content) {
                                setMessages((prevMessages) => {
                                    const updatedMessages = [...prevMessages];
                                    updatedMessages[assistantMessageIndex] = {
                                        ...updatedMessages[assistantMessageIndex],
                                        content: updatedMessages[assistantMessageIndex].content + parsedData.content
                                    };
                                    return updatedMessages;
                                });
                            } else if (parsedData.conversation_id) {
                                setCurrentConversationId(parsedData.conversation_id);
                                console.log("Conversation saved with ID:", parsedData.conversation_id);
                            }
                        } catch (parseError) {
                            console.error("Error parsing JSON:", parseError);
                        }
                    }
                }
            }

            setLoading(false);
            scrollToBottom();
        } catch (error) {
            console.error("Error sending message:", error);
            setError(error.message);
            setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: "Sorry, an error occurred. Please try again." }]);
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const storedUserName = Cookies.get('userName');
        if (storedUserName) {
            setUserName(storedUserName);
        }
    }, []);

    useEffect(() => {
        const DarkModeOn = localStorage.getItem('DarkModeOn') === 'true';
        setDarkMode(DarkModeOn);
        ToggleDarkMode();
    }, []);

    const toggleDarkmode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('DarkModeOn', newDarkMode);
        ToggleDarkMode();
    };

    const handleNewChatSession = () => {
        setMessages([]);
        setShowSecondDiv(true);
        setCurrentConversationId(null);
    };

    const handleChatSelect = async (selectedConversationId) => {
        try {
            console.log("Selecting conversation:", selectedConversationId);
            const response = await fetch(`http://localhost:2000/conversation/${selectedConversationId}`);
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Data received:', data);
    
            if (data && data.messages && data.messages.length > 0) {
                console.log("Fetched conversation:", data);
                const formattedMessages = data.messages.map(msg => ({
                    role: msg.role, 
                    content: msg.content 
                }));
                setMessages(formattedMessages); 
                setCurrentConversationId(selectedConversationId);
                setShowSecondDiv(false);
            } else {
                console.error("No messages found in the conversation data");
                setMessages([]);
            }
        } catch (error) {
            console.error("Error fetching conversation:", error);
            setError("Failed to load conversation. Please try again.");
        }
    };

    const handleVoiceInput = () => {
        if (SpeechRecognition || webkitSpeechRecognition) {
            const recognition = new (SpeechRecognition || webkitSpeechRecognition)();
            recognition.lang = 'en-US'; // Set the language
            recognition.interimResults = false; // Set to true if you want interim results
            recognition.maxAlternatives = 1; // Set the number of alternatives

            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript; // Get the recognized text
                console.log('Voice to text conversion:', transcript);
                setUserInput(transcript); // Set the recognized text to userInput
                handleSubmit({ preventDefault: () => {} }); // Submit the converted text
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };

            recognition.onend = () => {
                console.log('Speech recognition service has stopped.');
            };
        } else {
            console.log('Speech recognition not supported in this browser.');
        }
    };
    

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('conversation_id', currentConversationId);

            try {
                const response = await fetch('/upload-image', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                const newImageMessage = {
                    role: 'user',
                    content: `<img src="${data.url}" alt="Uploaded Image" />`,
                };
                setMessages((prevMessages) => [...prevMessages, newImageMessage]);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    };

    return (
        <div className={`chat-mainpage ${darkMode ? 'dark-mode' : ''}`}>
            <ChatSideMenu onNewChat={handleNewChatSession} onChatSelect={handleChatSelect} />
            <div className="first-main-div">
                <div className="left-div">
                    <h1 className="title">NIHA CHATBOT</h1>
                </div>
                <div className="right-div">
                    <div className="profile-title">
                        <h3>{userName}</h3>
                    </div>
                    <div className="profile-icon">
                        <a href='/login-signup'><img src="/static/images/user.png" alt="user" /></a>
                    </div>
                    <button className="theme-toggle" onClick={toggleDarkmode}>
                        <img src={darkMode ? "/static/images/sun.png" : "/static/images/moon.png"} alt="toggle theme" />
                    </button>
                </div>
            </div>
            {showSecondDiv && (
                <div className="second-main-div">
                    <div className="second-main-div-h">
                        <h1 className="task-title">USE NIHA FOR</h1>
                        <a href="/login-signup" className="icon-link">
                            <img src="/static/images/ai.png" alt="icon" className="ai-icon-1" style={{ width: '45px' }} />
                        </a>
                    </div>
                    <div className="flex-row">
                        <div className="col-4">
                            <img src="/static/images/application.png" alt="task-1" className="center-img" />
                            <p className="tasks">Describing the contents <br /> of an image</p>
                        </div>
                        <div className="col-4">
                            <img src="/static/images/network.png" alt="task-2" className="center-img" />
                            <p className="tasks">Turning your data into <br /> graphs</p>
                        </div>
                        <div className="col-4">
                            <img src="/static/images/table.png" alt="task-3" className="center-img" />
                            <p className="tasks">Turning your data into <br /> tables</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="chat-container" ref={chatContainerRef}>
                {messages && messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className={`message-icon ${msg.role === 'user' ? 'user-icon' : ''}`}>
                                {msg.role === 'user' && (
                                    <img src="/static/images/user.png" alt={msg.role} className="user-icon-img" />
                                )}
                            </div>
                            
                            <div className="message-content">
                                <div className={`message-text ${msg.role === 'user' ? 'user-message' : 'bot-message'}`} dangerouslySetInnerHTML={{ __html: msg.content }} />

                                {msg.role === 'assistant' && (
                                    <div className="response-header">
                                        <div className="response-header-content">
                                            <img src="/static/images/ai.png" alt="AI" className="ai-icon" />
                                            <span className="response-header-text">NIHA RESPONSE</span>
                                        </div>
                                        <div className="copy-icon-wrapper">
                                            <img src="/static/images/copy.png" alt="Copy" className="copy-icon" onClick={() => navigator.clipboard.writeText(msg.content)} />
                                            <span className="copy-text" onClick={() => navigator.clipboard.writeText(msg.content)}>Copy</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No messages yet. Start a conversation!</p>
                )}
                {error && (
                    <div className="error-message">
                        <p>Error: {error}</p>
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit}>
                <div className="third-main-div">
                    <div className="message-tab">
                        <div className="icons-left">
                            <img src="/static/images/attach.png" alt="attach file" className="icon-1" onClick={() => document.getElementById('fileInput').click()} />
                            <input type="file" id="fileInput" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                            <img src="/static/images/mic.png" alt="voice input" className="icon-2" onClick={handleVoiceInput} />
                        </div>
                        <input type="text" className="message-input my-input" placeholder="Message NIHA" value={userInput} onChange={handleInputChange} disabled={loading} />
                        <div className="icons-right">
                            <button type="submit" className="icon-button" disabled={loading}>
                                <img src="/static/images/up-arrow.png" alt="send" className="icon-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ChatMainPage;
