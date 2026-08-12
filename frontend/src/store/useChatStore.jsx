import {create} from "zustand"
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./useSocketStore";

export const useChatStore = create((set,get)=>({
    allContacts : [],
    chats : [],
    messages : [],
    activeTab : "chats",
    selectedUser : null,
    isUserLoading : false,
    isMessagesLoading : false,
    isSoundEnabled : JSON.parse(localStorage.getItem("isSoundEnabled"))===true,

    toggleSound : async()=>{
        localStorage.setItem("isSoundEnabled",!get().isSoundEnabled);
        set({isSoundEnabled:!get().isSoundEnabled});
    },

    setActiveTab : (tab)=> set({activeTab:tab}),
    setSelectedUser : (selectedUser)=> set({selectedUser:selectedUser}),

    getAllContacts : async()=>{
        try{
        set({isUserLoading:true});
        const res = await axiosInstance.get("/msg/contacts");
        const {restUsers} = res.data;
        set({allContacts:restUsers});}catch(error){
         toast.error(error.response.data.message);
        }finally{
            set({isUserLoading:false});
        }
    },

    getMyChatPartners : async()=>{
     try{
        set({isUserLoading:true});
        const res = await axiosInstance.get("/msg/chats");
        // console.log("get partneres: ",res.data.chatPartners);
        set({chats:res.data.chatPartners});
     }catch(error){
        toast.error(error.response.data.message);
     }finally{
        set({isUserLoading:false});
     }
    },

    getMessagesByUserId : async(id)=>{
        set({isMessagesLoading:true})
      try {const res = await axiosInstance.get(`/msg/${id}`);
      set({messages : res.data.messages});
    console.log("msgn: ", res.data.messages)

    useSocketStore.getState().setUnreadCountsZero(id.toString());
}
      catch(error){;
        toast.error(error.config.data.message)
      }finally{
        set({isMessagesLoading : false})
      }
    },

    sendMessage : async(messageData)=>{
        const {selectedUser,messages} = get()
        const {authUser} = useAuthStore.getState();  //using zustand, get another store value here.

        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id : tempId,
            senderId : authUser.id,
            receiverId : selectedUser._id,
            text : messageData.text,
            createdAt : new Date().toISOString(),
            isOptimistic : true,
        };
        //immediately update ui by adding message
        set({messages : [...messages,optimisticMessage]});

        try{
            const res = await axiosInstance.post(`msg/send/${selectedUser._id}`,messageData);
            set({messages:messages.concat(res.data.message)});  //wapas db ne new msg bheja jisme optimistic nhi tha obviously
            useSocketStore.getState().sendPrivateMessage(res.data.message);

        }catch(error){
            //remove optimistic message on failure.
            set({messages : messages});
            toast.error(error.config.data.message)
        }
    },

    getUnreads : async()=>{
       try{
        // console.log("here")
        const res = await axiosInstance.get("/msg/unreads");
        // console.log("h: ",res.data);
        const unreadsDoc = res.data.unreadsDoc;
        useSocketStore.getState().setInitialUnreads(unreadsDoc);
    }catch (error) {
        console.log("GET UNREADS ERROR:", error.response?.data);
        toast.error(
            error.response?.data?.message || "Failed to fetch unread messages"
        );
    }

    },
}))