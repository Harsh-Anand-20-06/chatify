import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocketStore } from "../store/useSocketStore";

export const ChatHeader =  function(){
  const { selectedUser, setSelectedUser} = useChatStore();
  const {onlineUsers, isTyping, typingUserId} = useSocketStore();

  console.log("on: ",onlineUsers);

  console.log("ss, ",selectedUser);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3">
        <div className="avatar online">
          <div className="w-12 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.username} />
          </div>
        </div>

        <div>
          <h3 className="text-slate-200 font-medium">{selectedUser.username}</h3>
          {onlineUsers.has(selectedUser._id) ?<p className="text-slate-400 text-sm">Online</p> : <p className="text-slate-400 text-sm">Offline</p>}
        </div>
      </div>

      <div>
        {isTyping && typingUserId === selectedUser._id ? <p className="text-slate-400 text-sm">Typing....</p> : <p></p>}
      </div>

      <button onClick={() => setSelectedUser(null)}>
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}