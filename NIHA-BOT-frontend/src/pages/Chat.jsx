import React, { useState } from 'react';
import axios from 'axios';
// import ChatHistory from '../components/ChatHistory';
// import ChatSideMenu from '../components/ChatSideMenu';
import ChatMainPage from '../components/ChatMainPage';

function Chat() {
    const [darkMode, setDarkMode] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleTheme = () => {
        setDarkMode(prevMode => !prevMode);
    };

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    const handleSubmit = async () => {
        if (!userInput.trim()) return;
        setLoading(true);

        try {
            const openaiResponse = await axios.post('https://api.openai.com/v1/completions', {
                model: 'text-davinci-003',
                prompt: userInput,
                max_tokens: 150,
                temperature: 0.7
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer YOUR_OPENAI_API_KEY`  // Replace with your OpenAI API key
                }
            });

            setResponse(openaiResponse.data.choices[0].text);
        } catch (error) {
            console.error("Error fetching OpenAI response:", error);
            setResponse("Sorry, something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <body className='Chat-body'>
        <div className={`Chat ${darkMode ? 'dark-theme' : ''}`}>
            {/* <ChatSideMenu/> */}
            <ChatMainPage/>
        </div>
        </body>
    );
}

export default Chat;