import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import { useSocketStore } from "../store/useSocketStore";

export const MessageInput = function(){
  const [text, setText] = useState("");
  //let typing = false, on every click page rerenders, this componenets runs agin, typing again false
  const typingRef = useRef(false); //using useref survies rerender, value is retained in .current
  const timeoutRef = useRef(null);

  const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
  const { sendTyping, sendStopTyping } = useSocketStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMessage({
      text: text.trim(),
    });
    setText("");
  };

  return (
    <div className="p-4 border-t border-slate-700/50">

      <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex space-x-4">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if(!typingRef.current){
              typingRef.current = true;
              sendTyping(selectedUser._id);
            }

            clearTimeout(timeoutRef.current);  //clear timer, so if user typs e after h in 0.5 sec, new timer of 2 sec start from below code.
            timeoutRef.current = setTimeout(()=>{
              typingRef.current = false;
              sendStopTyping(selectedUser._id);
            },2000);
          }}
          
          className="flex-1 bg-slate-800/50 text-white placeholder:text-slate-400 border border-slate-700/50 focus:outline-none focus:border-cyan-500 rounded-lg py-2 px-4"
          placeholder="Type your message..."
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}