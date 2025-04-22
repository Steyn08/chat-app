import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000"); // Change this to your backend URL

const ChatComponent = ({ userId, chatPartnerId, isGroup, groupId }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // Fetch chat history when the component loads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let response;
        if (isGroup) {
          response = await axios.get(`http://localhost:5000/api/messages/group/${groupId}`);
        } else {
          response = await axios.get(
            `http://localhost:5000/api/messages/individual/${userId}/${chatPartnerId}`
          );
        }
        setChat(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [userId, chatPartnerId, groupId, isGroup]);

  // Connect to Socket.IO and listen for incoming messages
  useEffect(() => {
    socket.emit("join", userId);

    socket.on("receiveMessage", (newMessage) => {
      setChat((prevChat) => [...prevChat, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId]);

  // Send a message via Socket.IO
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        sender: userId,
        text: message,
        receiver: isGroup ? null : chatPartnerId,
        groupId: isGroup ? groupId : null,
      };

      socket.emit("sendMessage", newMessage);
      setChat((prevChat) => [...prevChat, newMessage]); // Update UI instantly
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {chat.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
