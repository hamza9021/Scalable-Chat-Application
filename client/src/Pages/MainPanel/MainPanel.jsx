import React, { useContext, useEffect, useState } from "react";
import { chatContext } from "../../context/ChatContext.js";
import io from "socket.io-client";

const MainPanel = () => {
    const { api } = useContext(chatContext);

    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [userId, setUserId] = useState("");

    const [totalMessages, setTotalMessages] = useState({
        "group-chat": [],
    });
    const [currentUser, setCurrentUser] = useState("group-chat");

    // 🔌 Socket Setup
    useEffect(() => {
        const newSocket = io(api);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            setUserId(newSocket.id);
        });

        newSocket.on("message", (msg) => {
            if (msg.senderId === newSocket.id) return; // 🚀 ignore own msg

            setTotalMessages((prev) => ({
                ...prev,
                "group-chat": [...(prev["group-chat"] || []), msg],
            }));
        });

        newSocket.on("privateMessage", (msg) => {
            if (msg.senderId === newSocket.id) return; // 🚀 ignore own msg

            setTotalMessages((prev) => ({
                ...prev,
                [msg.senderId]: [...(prev[msg.senderId] || []), msg],
            }));
        });

        return () => {
            newSocket.disconnect();
        };
    }, [api]);

    // 📤 Send Message
    const sendMessage = () => {
        if (!newMessage.trim() || !socket) return;

        const msgObj = {
            id: Date.now(),
            senderId: userId,
            content: newMessage,
            receiverId: currentUser,
        };

        // ✅ Instant UI update
        setTotalMessages((prev) => ({
            ...prev,
            [currentUser]: [...(prev[currentUser] || []), msgObj],
        }));

        if (currentUser === "group-chat") {
            socket.emit("message", msgObj);
        } else {
            socket.emit("privateMessage", msgObj);
        }

        setNewMessage("");
    };

    // ➕ Add New Chat User
    const addChatUser = () => {
        const receiverSocket = prompt("Enter receiver's socket ID:");

        if (receiverSocket) {
            setTotalMessages((prev) => ({
                ...prev,
                [receiverSocket]: prev[receiverSocket] || [],
            }));
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Chats</h2>
                    <button
                        onClick={addChatUser}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                        +
                    </button>
                </div>

                {Object.keys(totalMessages).map((user) => (
                    <div
                        key={user}
                        onClick={() => setCurrentUser(user)}
                        className={`p-2 rounded cursor-pointer mb-2 ${
                            currentUser === user
                                ? "bg-blue-100"
                                : "hover:bg-gray-200"
                        }`}
                    >
                        {user}
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex flex-col w-3/4">
                {/* Header */}
                <div className="bg-white p-4 border-b font-semibold">
                    {currentUser}
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {(totalMessages[currentUser] || []).map((msg) => (
                        <div
                            key={msg.id}
                            className={`mb-2 flex ${
                                msg.senderId === userId
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`px-4 py-2 rounded-lg max-w-xs ${
                                    msg.senderId === userId
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-300"
                                }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <span className="text-xs opacity-70">
                                    {msg.senderId === userId
                                        ? "You"
                                        : msg.senderId}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border rounded px-3 py-2 outline-none"
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainPanel;
