// ChatSideMenu.js
import React, { useRef, useState } from 'react';
import ChatHistory from './ChatHistory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function ChatSideMenu({ onNewChat, onChatSelect }) {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const myDivRef = useRef(null);

    const hiddenVisibleToggle = () => {
        if (myDivRef.current) {
            if (isMenuVisible) {
                myDivRef.current.classList.add('hidden');
                myDivRef.current.classList.remove('visible');
            } else {
                myDivRef.current.classList.remove('hidden');
                myDivRef.current.classList.add('visible');
            }
        }
        setMenuVisible(!isMenuVisible);
    };

    return (
        <>
            <div className={`sidemenu-toggle-btn ${isMenuVisible ? 'visible' : 'hidden'}`} onClick={hiddenVisibleToggle}>
                <FontAwesomeIcon icon={faBars} />
            </div>
            <div className={`chat-sidemenu ${isMenuVisible ? 'visible' : 'hidden'}`} ref={myDivRef}>
                <div className="chat-sidemenu-content">
                    <div className="sidemenu-header">
                        <button className="new_chat_button" onClick={onNewChat}>
                            <img src="/static/images/sign.png" alt="add" style={{ width: '25px', marginRight: '10px' }} />
                            New Chat
                        </button>
                    </div>
                    <ChatHistory onChatSelect={onChatSelect} />
                </div>
            </div>
        </>
    );
}

export default ChatSideMenu;
