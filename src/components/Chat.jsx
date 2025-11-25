import { useEffect, useState, useRef } from "react";
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from "../firebase-config"
import { formatMessageTime, getInitials } from "../utils/chatUtils"
import '../styles/chat.css'

export const Chat = ({ chatId, currentUser, recipient }) => {
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Reference to messages subcollection for this specific chat
    const messagesRef = collection(db, "chats", chatId, "messages");

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const queryMessages = query(
            messagesRef,
            orderBy("createdAt")
        );

        const unsubscribe = onSnapshot(
            queryMessages,
            (snapshot) => {
                let messagesList = [];
                snapshot.forEach((doc) => {
                    messagesList.push({ ...doc.data(), id: doc.id });
                });
                setMessages(messagesList);
                setLoading(false);
                setError(null);
            },
            (error) => {
                console.error("Firestore error:", error);
                setError("Error loading messages. Please try again.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [chatId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedMessage = newMessage.trim();
        if (trimmedMessage === "") {
            setNewMessage("");
            return;
        }

        if (!currentUser) {
            setError("User not authenticated");
            return;
        }

        try {
            await addDoc(messagesRef, {
                senderId: currentUser.uid,
                text: trimmedMessage,
                createdAt: serverTimestamp(),
            });
            setNewMessage("");
            setError(null);
        } catch (error) {
            console.error("Error sending message:", error);
            setError("Failed to send message: " + error.message);
        }
    }

    if (loading) {
        return (
            <div className="chat-app">
                <div className="chat-header">
                    <div className="chat-header-info">
                        {recipient.avatar ? (
                            <img src={recipient.avatar} alt={recipient.name} className="chat-header-avatar" />
                        ) : (
                            <div className="chat-header-avatar-fallback">
                                {getInitials(recipient.name)}
                            </div>
                        )}
                        <div>
                            <h2 className="chat-header-name">{recipient.name}</h2>
                            <p className="chat-header-email">{recipient.email}</p>
                        </div>
                    </div>
                </div>
                <div className="loading-container">
                    Loading messages...
                </div>
            </div>
        );
    }

    return (
        <div className="chat-app">
            {/* Chat Header with Recipient Info */}
            <div className="chat-header">
                <div className="chat-header-info">
                    {recipient.avatar ? (
                        <img src={recipient.avatar} alt={recipient.name} className="chat-header-avatar" />
                    ) : (
                        <div className="chat-header-avatar-fallback">
                            {getInitials(recipient.name)}
                        </div>
                    )}
                    <div>
                        <h2 className="chat-header-name">{recipient.name}</h2>
                        <p className="chat-header-email">{recipient.email}</p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            {/* Messages Container */}
            <div className="messages">
                {messages.length === 0 && !error ? (
                    <div className="no-messages">
                        No messages yet. Start the conversation with {recipient.name}!
                    </div>
                ) : (
                    messages.map((message) => {
                        const isSent = message.senderId === currentUser.uid;
                        const sender = isSent ? currentUser : recipient;

                        return (
                            <div key={message.id} className={`message ${isSent ? 'sent' : 'received'}`}>
                                {!isSent && (
                                    sender.avatar ? (
                                        <img src={sender.avatar} alt={sender.name} className="message-avatar" />
                                    ) : (
                                        <div className="message-avatar-fallback">
                                            {getInitials(sender.name)}
                                        </div>
                                    )
                                )}
                                <div className="message-content">
                                    <p className="message-text">{message.text}</p>
                                    {message.createdAt && (
                                        <span className="message-time">
                                            {formatMessageTime(message.createdAt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form className="new-message-form" onSubmit={handleSubmit}>
                <input
                    className="new-message-input"
                    placeholder={`Message ${recipient.name}...`}
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                    maxLength={500}
                    disabled={!!error}
                />
                <button
                    className="send-button"
                    type="submit"
                    disabled={!newMessage.trim() || !!error}
                >
                    Send
                </button>
            </form>
        </div>
    )
}