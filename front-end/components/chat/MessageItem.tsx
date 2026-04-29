"use client";

export default function MessageItem({ message, isOwn, senderAvatar }: { message: any, isOwn: boolean, senderAvatar?: string }) {
  const avatarSrc = senderAvatar ? `http://localhost:8000/${senderAvatar}` : null;
  const displayContent = message.content || message.message || message.text;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 items-end gap-2`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex-shrink-0 border border-gray-200 shadow-sm">
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt="avatar" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as any).src = "https://ui-avatars.com/api/?name=User"; }} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-blue-600">?</div>
          )}
        </div>
      )}
      
      <div className={`max-w-[75%] p-3 px-4 rounded-2xl shadow-sm text-sm ${
        isOwn ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
      }`}>
        {displayContent ? (
          displayContent
        ) : (
          <div className="flex flex-col">
            <span className="italic opacity-60 text-xs text-red-500 font-semibold">⚠️ No content found</span>
            <pre className="text-[10px] bg-gray-100 p-1 mt-1 rounded text-black overflow-x-auto">
              {JSON.stringify(message, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}