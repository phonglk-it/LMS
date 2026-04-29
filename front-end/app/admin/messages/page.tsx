"use client";
import { useState, useEffect, useRef } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { ChevronLeft } from "lucide-react";

export default function AdminMessagesPage() {
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
            const isSender = String(u.id) === String(msg.senderId?.id || msg.senderId);
            if (isSender) {
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

        return {
          ...u,
          lastMessage: lastMsg ? lastMsg.content : "",
          unreadCount,
          lastActive: lastMsg ? new Date(lastMsg.createdAt).getTime() : 0,
        };
      }));

      setInstructors(enrichedList.sort((a, b) => b.lastActive - a.lastActive));
    };

    initData();
    return () => { socket?.disconnect(); };
  }, []);

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    selectedUserIdRef.current = user.id;

    setInstructors((prev) => prev.map((u) => (String(u.id) === String(user.id) ? { ...u, unreadCount: 0 } : u)));

    const token = Cookies.get("accessToken");
    try {
      await fetch(`http://localhost:8000/chat/mark-read/${user.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) { console.error(e); }
  };

  if (!currentUser) return <div className="p-10 text-center text-gray-500 font-medium">Đang tải dữ liệu...</div>;

  return (
    <div className="px-4 py-2 md:p-0">
 
      <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-150px)] border md:rounded-2xl overflow-hidden bg-white shadow-lg text-black relative">
        
 
        <div className={`${selectedUser ? "hidden" : "flex"} w-full md:flex md:w-80 border-r`}>
          <ChatSidebar 
            users={instructors} 
            onSelectUser={handleSelectUser} 
            selectedUserId={selectedUser?.id} 
            socket={socket} 
            currentUserId={currentUser.id} 
          />
        </div>


        <div className={`${selectedUser ? "flex" : "hidden"} flex-1 md:flex flex-col bg-white`}>
          {selectedUser ? (
            <>
              <div className="md:hidden flex items-center p-3 border-b bg-white sticky top-0 z-10">
                <button 
                  onClick={() => {
                    setSelectedUser(null);
                    selectedUserIdRef.current = null;
                  }}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="ml-2">
                  <p className="font-bold text-sm">{selectedUser.fullName}</p>
                  <p className="text-[10px] text-green-500 uppercase font-bold tracking-widest">Active Now</p>
                </div>
              </div>

              <ChatWindow currentUser={currentUser} receiver={selectedUser} socket={socket} />
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 bg-gray-50 italic">
              Select an instructor to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}