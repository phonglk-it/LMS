"use client";
import { useEffect, useState } from "react";

interface User {
  id: number | string;
  fullName: string;
  avatar?: string;
  unreadCount?: number;
  lastMessage?: string;
}

export default function ChatSidebar({ 
  users, 
  onSelectUser, 
  selectedUserId,
  socket,
  currentUserId
}: { 
  users: User[], 
  onSelectUser: (user: any) => void, 
  selectedUserId?: number | string,
  socket: any,
  currentUserId: any
}) {
  const [localUsers, setLocalUsers] = useState<User[]>([]);

  // Đồng bộ từ props vào state nội bộ
  useEffect(() => {
    if (users) setLocalUsers(users);
  }, [users]);

  // Lắng nghe socket để xử lý đẩy người dùng lên đầu và unread
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleNewMessage = (msg: any) => {
      const sId = String(msg.senderId?.id || msg.senderId);
      const rId = String(msg.receiverId?.id || msg.receiverId);
      const myId = String(currentUserId);
      const partnerId = sId === myId ? rId : sId;

      setLocalUsers((prev) => {
        const partner = prev.find(u => String(u.id) === partnerId);
        if (!partner) return prev;

        const isChatting = String(selectedUserId) === partnerId;
        const updatedPartner = {
          ...partner,
          lastMessage: msg.content,
          unreadCount: (rId === myId && !isChatting) ? (partner.unreadCount || 0) + 1 : 0
        };

        const otherUsers = prev.filter(u => String(u.id) !== partnerId);
        return [updatedPartner, ...otherUsers];
      });
    };

    socket.on("receiveMessage", handleNewMessage);
    return () => { socket.off("receiveMessage", handleNewMessage); };
  }, [socket, selectedUserId, currentUserId]);

  if (!Array.isArray(localUsers)) {
    return <div className="w-80 border-r p-4 text-gray-500 animate-pulse">Loading contacts...</div>;
  }

  return (
    <div className="w-80 border-r h-full overflow-y-auto bg-white flex-shrink-0 shadow-sm text-black">
      <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
        <h1 className="font-bold text-2xl text-gray-900 tracking-tight">Messages</h1>
        {localUsers.reduce((acc, u) => acc + (u.unreadCount || 0), 0) > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {localUsers.reduce((acc, u) => acc + (u.unreadCount || 0), 0)}
          </span>
        )}
      </div>
      
      <div className="flex flex-col">
        {localUsers.length > 0 ? (
          localUsers.map((user) => {
            const isSelected = String(selectedUserId) === String(user.id);
            const hasUnread = (user.unreadCount || 0) > 0;

            return (
              <div 
                key={user.id} 
                onClick={() => onSelectUser(user)}
                className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 relative ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'
                }`}
              >
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-lg" />}
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg border-2 ${
                    hasUnread && !isSelected ? 'border-blue-500' : 'border-transparent'
                  }`}>
                    {user.avatar ? (
                      <img src={`http://localhost:8000/${user.avatar}`} alt="" className="w-full h-full object-cover" 
                        onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${user.fullName}&background=random`; }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {hasUnread && !isSelected && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      {user.unreadCount! > 9 ? '9+' : user.unreadCount}
                    </div>
                  )}
                </div>

                <div className="ml-3 overflow-hidden flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className={`truncate text-sm ${hasUnread && !isSelected ? 'font-black text-black' : isSelected ? 'font-bold text-blue-700' : 'font-semibold text-gray-700'}`}>
                      {user.fullName}
                    </p>
                    {hasUnread && !isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 ml-2" />}
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${hasUnread && !isSelected ? 'text-gray-900 font-bold opacity-100' : 'text-gray-500 font-medium'}`}>
                    {user.lastMessage || 'Click to start chatting'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-gray-400 text-sm italic">No contacts found.</div>
        )}
      </div>
    </div>
  );
}