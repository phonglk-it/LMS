"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { ChevronLeft } from "lucide-react";

export default function InstructorMessagesPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]); 
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const selectedUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) return;

    const initData = async () => {
      const profileRes = await fetch("http://localhost:8000/users/profile", { headers: { Authorization: `Bearer ${token}` } });
      const user = await profileRes.json();
      setCurrentUser(user);

      const newSocket = io("http://localhost:8000", { query: { userId: user.id } });
      setSocket(newSocket);

      newSocket.on("receiveMessage", (msg) => {
        setContacts((prev) => {
          const newList = prev.map((u) => {
            if (String(u.id) === String(msg.senderId?.id || msg.senderId)) {
              const isCurrentChat = selectedUserIdRef.current && String(selectedUserIdRef.current) === String(u.id);
              return {
                ...u,
                unreadCount: isCurrentChat ? 0 : (u.unreadCount || 0) + 1,
                lastMessage: msg.content,
                lastActive: Date.now(),
              };
            }
            return u;
          });
          return [...newList].sort((a, b) => b.lastActive - a.lastActive);
        });
      });

      const [stRes, adRes] = await Promise.all([
        fetch("http://localhost:8000/users/students", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8000/users/all-admins", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const all = [...((await adRes.json()).data || []), ...((await stRes.json()).data || [])];

      const enrichedList = await Promise.all(all.map(async (u: any) => {
        const historyRes = await fetch(`http://localhost:8000/chat/history/${u.id}`, { headers: { Authorization: `Bearer ${token}` } });
        const history = await historyRes.json();
        const lastMsg = history.length > 0 ? history[history.length - 1] : null;
        const unreadCount = history.filter((m: any) => {
          const mSenderId = m.sender?.id || m.senderId?.id || m.senderId;
          return !m.isRead && String(mSenderId) !== String(user.id);
        }).length;

        return { ...u, lastMessage: lastMsg ? lastMsg.content : "", unreadCount, lastActive: lastMsg ? new Date(lastMsg.createdAt).getTime() : 0 };
      }));

      setContacts(enrichedList.sort((a, b) => b.lastActive - a.lastActive));
    };

    initData();
    return () => { socket?.disconnect(); };
  }, []);

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    selectedUserIdRef.current = user.id;
    setContacts(prev => prev.map(u => String(u.id) === String(user.id) ? { ...u, unreadCount: 0 } : u));

    const token = Cookies.get("accessToken");
    try {
      await fetch(`http://localhost:8000/chat/mark-read/${user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { console.error(e); }
  };

  if (!currentUser) return <div className="p-10 text-center text-gray-500 font-medium">Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-150px)] border rounded-2xl overflow-hidden bg-white shadow-lg text-black relative">
      
      <div className={`
        ${selectedUser ? "hidden" : "flex w-full"} 
        md:flex md:w-auto h-full
      `}>
        <ChatSidebar 
          users={contacts} 
          onSelectUser={handleSelectUser} 
          selectedUserId={selectedUser?.id} 
          socket={socket} 
          currentUserId={currentUser.id} 
        />
      </div>

      <div className={`
        flex-1 flex-col h-full
        ${selectedUser ? "flex" : "hidden md:flex"}
      `}>
        {selectedUser ? (
          <div className="flex flex-col h-full">
            <div className="md:hidden flex items-center p-4 border-b bg-white">
              <button onClick={() => setSelectedUser(null)} className="mr-2">
                <ChevronLeft size={24} />
              </button>
              <span className="font-bold">{selectedUser.fullName}</span>
            </div>
            
            <ChatWindow currentUser={currentUser} receiver={selectedUser} socket={socket} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 italic">
            Select a student or admin to chat.
          </div>
        )}
      </div>
    </div>
  );
}