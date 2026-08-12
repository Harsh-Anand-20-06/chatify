import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore"
import {UsersLoadingSkeleton} from "../components/UsersLoadingSkeleton"
import { NoChatsFound } from "../components/NoChatsFound"
import { useSocketStore } from "../store/useSocketStore";

export const ChatsList = function(){
    const {getMyChatPartners,chats,isUserLoading,setSelectedUser,getUnreads} = useChatStore();
    const {unreadCounts} = useSocketStore();

    useEffect(()=>{
        // console.log("chats : ", chats);
        getMyChatPartners();
        getUnreads();
        // console.log("chats: ", chats);
    },[getMyChatPartners,getUnreads]);

    if(isUserLoading) return <UsersLoadingSkeleton></UsersLoadingSkeleton>
    if (chats.length==0) return <NoChatsFound></NoChatsFound>

    return (
        <>
        {chats.map((chat)=>(
            <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={()=>setSelectedUser(chat)}
            >
            <div className="flex items-center gap-3">
            <div className={`avatar online`}>
              <div className="size-12 rounded-full">
                <img src={"/avatar.png"} alt={chat.username} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{chat.username}</h4>
            <h4 className="text-slate-200 font-medium truncate">{unreadCounts.get(chat._id.toString())}</h4>
          </div>
        </div>
      ))}
    </>
  );
}