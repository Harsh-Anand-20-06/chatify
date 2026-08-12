import {useAuthStore} from "../store/useAuthStore";
import {useChatStore} from "../store/useChatStore";
import { useSocketStore } from "../store/useSocketStore";

export const handleSocketMessage = function(data){
      if(data.type=="NEW_MESSAGE"){
        console.log("oye: ",data);

        const {senderId,text,messageId,createdAt,sender} = data;
        const { selectedUser } = useChatStore.getState();

        if(selectedUser && selectedUser._id === senderId){
            useChatStore.setState((state)=>({    //dusre store ki value set karne k liye anotherstore.setstate
                messages: [
                            ...state.messages,
                            {
                                _id: messageId,
                                senderId,
                                receiverId: useAuthStore.getState().authUser.id,
                                text,
                                status: "read",
                                createdAt,
                            }
                        ]
            }))

            useSocketStore.getState().sendMessageRead(messageId);

        }
        else{
            useSocketStore.getState().sendMessageDelivered(messageId);
            useSocketStore.setState((state)=>{
                const newMap = new Map(state.unreadCounts);   //Because in React/Zustand, state updates are detected largely through reference changes. Mutating the existing object/Map can leave the reference unchanged, so the framework may not realize anything changed.
                if(newMap.has(senderId)) newMap.set(senderId,newMap.get(senderId) + 1);
                else newMap.set(senderId,1);
                return {
                    unreadCounts : newMap,
                }
            })
        }

        // console.log("user: ",sender);

        // useChatStore.setState((state)=>{
        //     if(!state.chats.some((user)=> user._id==sender._id)){
        //        let newChats = [...state.chats,sender];
        //        return {
        //         chats : newChats,
        //        }
        //     }
        //     else{
        //         return {
        //             chats : state.chats,
        //         }
        //     }
        // })

        useChatStore.setState((state)=>{
            let newChats = state.chats.filter((user)=> user._id!=sender._id);
            return {
                chats : [sender,...newChats],
            }
        })


      }

       else if(data.type=="MESSAGE_READ"){
            const messageId = data.messageId;
            // console.log("msg", messageId);
            useChatStore.setState((state)=>({
                messages : state.messages.map((msg)=>{
                    if(msg._id === messageId) {
                        return {...msg,
                        status : "read",};
                    }
                    return msg;
                })
            }))
        }

        else if(data.type=="MESSAGE_READS"){   //when receiver opens after some time, so, sends the sender all message ids he read now.
            const messageIds = data.messageIds;
            // console.log("msg", messageId);
            useChatStore.setState((state)=>({
                messages : state.messages.map((msg)=>{
                    if(messageIds.includes(msg._id)){
                        return {...msg,
                        status : "read",};
                    }
                    return msg;
                })
            }))
        }

        else if(data.type=="DELIVERED_MESSAGE"){
            const messageId = data.messageId;

            useChatStore.setState((state)=>({    //.setstate wants a function that returns an object or object in retur, so you can also write it as((state)=>{return {}}) is similar to ((state)=>({}))
                messages : state.messages.map((msg)=>{
                    if(msg._id===messageId){
                        return {
                            ...msg,
                            status : "delivered",
                        }
                    }
                    return msg;
                })
            }))
        }

        else if(data.type=="USER_STATUS"){
            const senderId = data.senderId;
            const status = data.status;

            if(status=="ONLINE"){
                useSocketStore.getState().setUserOnline(senderId);
            }
            else{
                useSocketStore.getState().setUserOffline(senderId);
            }
        }

        else if(data.type=="ONLINE_USERS"){
            const onlineUsers = data.onlineUsers;
            useSocketStore.getState().setUsersOnline(onlineUsers);
        }

        else if(data.type=="TYPING_STARTED"){
            const senderId = data.senderId;
            useSocketStore.setState((state)=>({
                isTyping : true,
                typingUserId : senderId,
            }))
        }

        else if(data.type=="TYPING_STOPPED"){
            const senderId = data.senderId;
            useSocketStore.setState((state)=>({
                isTyping : false,
                typingUserId : null,
            }))
        }

        
}

