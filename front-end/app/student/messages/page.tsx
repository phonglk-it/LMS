"use client";
import { useState, useEffect, useRef } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
export default function StudentMessagesPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [instructors, setInstructors] = useState<any[]>([]);
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
        setInstructors((prev) => {
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

      const listRes = await fetch("http://localhost:8000/users/all-instructors", { headers: { Authorization: `Bearer ${token}` } });
      const response = await listRes.json();
      const list = Array.isArray(response) ? response : response.data || [];

      const enrichedList = await Promise.all(list.map(async (u: any) => {
        const historyRes = await fetch(`http://localhost:8000/chat/history/${u.id}`, { headers: { Authorization: `Bearer ${token}` } });
        const history = await historyRes.json();
        const lastMsg = history.length > 0 ? history[history.length - 1] : null;
        const unreadCount = history.filter((m: any) => {
          const mSenderId = m.sender?.id || m.senderId?.id || m.senderId;
          return !m.isRead && String(mSenderId) !== String(user.id);
        }).length;

        return { ...u, lastMessage: lastMsg ? lastMsg.content : "", unreadCount, lastActive: lastMsg ? new Date(lastMsg.createdAt).getTime() : 0 };
      }));

      setInstructors(enrichedList.sort((a, b) => b.lastActive - a.lastActive));
    };

    initData();
    return () => { socket?.disconnect(); };
  }, []);

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    selectedUserIdRef.current = user.id;
    setInstructors(prev => prev.map(u => String(u.id) === String(user.id) ? { ...u, unreadCount: 0 } : u));

    const token = Cookies.get("accessToken");
    try {
      await fetch(`http://localhost:8000/chat/mark-read/${user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { console.error(e); }
  };

  if (!currentUser) return <div className="p-10 text-center text-gray-500 font-medium">Đang tải...</div>;

  return (
    <div className="relative flex h-[calc(100vh-100px)] sm:h-[calc(100vh-150px)] border rounded-2xl overflow-hidden bg-white shadow-lg text-black mx-2 sm:mx-0">
      
      <div className={`w-full sm:w-auto sm:min-w-[300px] lg:min-w-[350px] border-r ${selectedUser ? "hidden sm:block" : "block"}`}>
        <ChatSidebar 
          users={instructors} 
          onSelectUser={handleSelectUser} 
          selectedUserId={selectedUser?.id} 
          socket={socket} 
          currentUserId={currentUser.id} 
        />
      </div>

      <div className={`flex-1 flex flex-col bg-white ${!selectedUser ? "hidden sm:flex" : "flex"}`}>
        {selectedUser ? (
          <>
            <div className="sm:hidden p-3 border-b flex items-center bg-gray-50">
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="p-2 mr-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <span className="font-bold text-sm truncate">Chat with {selectedUser.fullName || selectedUser.name}</span>
            </div>
            
            <ChatWindow 
              currentUser={currentUser} 
              receiver={selectedUser} 
              socket={socket} 
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 italic px-4 text-center">
            Select an instructor to start a conversation.
          </div>
        )}
      </div>
    </div>
  );
}