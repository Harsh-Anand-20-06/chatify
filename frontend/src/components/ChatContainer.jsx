import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"
import {ChatHeader} from "../components/ChatHeader"
import { NoChatHistoryPlaceholder } from "./NoChatHistoryPlaceholder";
import { MessageInput } from "./MessageInput";

export const ChatContainer = function(){
    const {messages,getMessagesByUserId,selectedUser,isMessagesLoading} = useChatStore();  
    const {authUser} = useAuthStore();
    const messagesEndRef = useRef();

    useEffect(()=>{
        getMessagesByUserId(selectedUser._id);
    },[selectedUser,getMessagesByUserId]);

    useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

//   console.log("AUTH USER:", authUser);
// console.log("AUTH ID:", authUser?._id);
// console.log("msg: ",messages);

    return (<> 
       <ChatHeader></ChatHeader>
       <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser.id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser.id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    })}
                  </p>
                  {msg.senderId === authUser.id && (
                <div className="chat-footer mt-1">
                  <span
                    className={`text-[10px] uppercase tracking-wide ${
                      msg.status === "read"
                        ? "text-info"
                        : "text-base-content/50"
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>
              )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.username} />
           )}
      </div>

      <MessageInput />
    </>
  );
}