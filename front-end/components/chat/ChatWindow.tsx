"use client";
import { useState, useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import Cookies from "js-cookie";

export default function ChatWindow({ currentUser, receiver, socket }: { currentUser: any, receiver: any, socket: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = "http://localhost:8000";

  // 1. Fetch History
  useEffect(() => {
    if (!receiver?.id) return;
    setMessages([]);

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/history/${receiver.id}`, {
          headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` }
        });
        const data = await res.json();
        
        const formattedData = data.map((msg: any) => ({
          ...msg,
          senderId: Number(msg.senderId || msg.sender?.id),
          receiverId: Number(msg.receiverId || msg.receiver?.id),
          content: msg.content || msg.message || msg.text,
          uniqueKey: msg.id ? `db-${msg.id}` : `hist-${Math.random()}`
        }));
        
        setMessages(formattedData);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    fetchHistory();
  }, [receiver.id]);

  // 2. Real-time Listen
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: any) => {
      const sId = Number(msg.senderId || msg.sender?.id);
      const rId = Number(msg.receiverId || msg.receiver?.id);
      const currId = Number(currentUser.id);
      const targetId = Number(receiver.id);

      if ((sId === currId && rId === targetId) || (sId === targetId && rId === currId)) {
        setMessages((prev) => {
          if (msg.id && prev.some(p => p.id === msg.id)) return prev;
          return [...prev, {
            ...msg,
            senderId: sId,
            receiverId: rId,
            content: msg.content,
            uniqueKey: msg.id ? `socket-${msg.id}` : `socket-${Date.now()}`
          }];
        });
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => { socket.off("receiveMessage"); };
  }, [socket, receiver.id, currentUser.id]);

  // 3. Auto Scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    
    const msgData = { 
      senderId: Number(currentUser.id), 
      receiverId: Number(receiver.id), 
      content: input 
    };

    socket.emit("sendMessage", msgData);
    setInput(""); 
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b bg-white font-bold text-lg shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
          {receiver?.avatar ? (
            <img 
              src={`${API_URL}/${receiver.avatar}`} 
              alt="avatar" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${receiver.fullName}&background=0D8ABC&color=fff`; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-base">
              {receiver?.fullName?.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-gray-800 leading-tight">{receiver?.fullName}</h2>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4" ref={scrollRef}>
        {messages.map((m) => (
          <MessageItem 
            key={m.uniqueKey} 
            message={m} 
            isOwn={Number(m.senderId) === Number(currentUser.id)}
            senderAvatar={Number(m.senderId) === Number(currentUser.id) ? currentUser.avatar : receiver.avatar}
          />
        ))}
      </div>

      <div className="p-4 bg-white border-t flex gap-2 items-center">
        <input 
          className="flex-1 border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-black" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white p-3 px-6 rounded-full hover:bg-blue-700 font-semibold transition shadow-md active:scale-95">
          Send
        </button>
      </div>
    </div>
  );
}