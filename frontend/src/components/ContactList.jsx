import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore"
import {UsersLoadingSkeleton} from "../components/UsersLoadingSkeleton"
import { useSocketStore } from "../store/useSocketStore";

export const ContactList = function(){

    const {allContacts,getAllContacts,isUserLoading,setSelectedUser} = useChatStore();
    const {unreadCounts} = useSocketStore();

    useEffect(()=>{
        getAllContacts();
    },[getAllContacts]);
    
    if(isUserLoading) return <UsersLoadingSkeleton></UsersLoadingSkeleton>



    return (
        <>
        {allContacts.map((contact)=>(
            <div
            key={contact._id}
            className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={()=>setSelectedUser(contact)}
            >
            <div className="flex items-center gap-3">
            <div className={`avatar online`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} alt={contact.username} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{contact.username}</h4>
            <h4 className="text-slate-200 font-medium truncate">{unreadCounts.get(contact._id)}</h4>
          </div>
        </div>
      ))}
    </>
  );
}