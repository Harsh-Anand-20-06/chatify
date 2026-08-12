import {create} from "zustand";
import {inMemoryAccessToken} from "../lib/axios";
import { handleSocketMessage } from "../lib/handleSocketMessage";
import { useAuthStore } from "./useAuthStore";
const wsUrl = import.meta.env.VITE_WS_URL;

let reconnectAttempts = 0;

export const useSocketStore = create((set,get)=>({
    socket : null,
    isConnected : false,
    onlineUsers : new Set(),
    isTyping: false,
    typingUserId: null,
    unreadCounts : new Map(),

    connect : ()=>{
        const socket = get().socket;
         if (
        socket &&
        (
            socket.readyState === WebSocket.OPEN ||
            socket.readyState === WebSocket.CONNECTING
        )
    ) {
        return;
    }

        const accessToken = inMemoryAccessToken;

        if(!accessToken) return;

        const newSocket = new WebSocket(`${wsUrl}?accesstoken=${accessToken}`);
        set({socket : newSocket});

        newSocket.onopen = ()=>{
            reconnectAttempts = 0;
            set({isConnected : true,})
        }

        newSocket.onclose = ()=>{
            set({
                socket : null,
                isConnected : false,
            })

            const delay = Math.min(1000*2**reconnectAttempts,30000);

            reconnectAttempts++;

            setTimeout(()=>{
                if(useAuthStore.getState().authUser){
                get().connect();
                }
            },delay);
        }

        newSocket.onmessage = (event)=>{
            const data = JSON.parse(event.data);
            handleSocketMessage(data);
        }
    },

    disconnect: () => {
    const socket = get().socket;

    if (socket) {
        socket.close();
    }

    reconnectAttempts = 0;

    set({
        socket: null,
        isConnected: false,
    });
    },

    sendPrivateMessage : (savedMessage)=>{
        const socket = get().socket;

        if(socket && socket.readyState === WebSocket.OPEN){
            console.log("sent!");
            socket.send(JSON.stringify({
                type : "PRIVATE_MESSAGE",
                payload : {
                    messageId : savedMessage._id,
                    receiverId : savedMessage.receiverId,
                    text : savedMessage.text,
                    createdAt : savedMessage.createdAt,
                }
            }))
        }
    },

    sendMessageRead : (messageId)=>{
        const socket = get().socket;

        if(socket && socket.readyState==WebSocket.OPEN){
           socket.send(JSON.stringify({
            type : "READ_MESSAGE",
            payload : {
                messageId : messageId,
            }
           }))
        }
    }, 

    sendMessageDelivered : (messageId)=>{
        const socket = get().socket;

        if(socket && socket.readyState==WebSocket.OPEN){
            socket.send(JSON.stringify({
                type : "MESSAGE_DELIVERED",
                payload : {
                    messageId : messageId,
                }
            }))
        }
    },

    setUserOnline : (userId)=>{
        set((state)=>{
            const newSet = new Set(state.onlineUsers);  //don't mutate original set
            newSet.add(userId);

            return{
                onlineUsers : newSet,
            };
        })
    },

    setUserOffline : (userId)=>{
        set((state)=>{
            const newSet = new Set(state.onlineUsers);
            newSet.delete(userId);

            return {
                onlineUsers : newSet,
            }
        })
    },

    setUsersOnline : (onlineUsers)=>{
        set((state)=>{
            const newSet = new Set(state.onlineUsers);
            onlineUsers.forEach((user)=>newSet.add(user));

            return {
                onlineUsers : newSet,
            }
        })
    },

    sendTyping : (selectedUserId)=>{
        const socket = get().socket;

        if(socket && socket.readyState==WebSocket.OPEN){
            socket.send(JSON.stringify({
                type : "TYPING_START",
                receiverId : selectedUserId,
            }))
        }
    },

    sendStopTyping : (selectedUserId)=>{
        const socket = get().socket;

        if(socket && socket.readyState==WebSocket.OPEN){
            socket.send(JSON.stringify({
                type : "TYPING_STOP",
                receiverId : selectedUserId,
            }))
        }
    },

    setUnreadCountsZero : (selectedUserId)=>{
        const newMap = new Map(get().unreadCounts);  //always change reference ad dom compares prev and new state
        newMap.set(selectedUserId,0);

        set({
            unreadCounts : newMap,
        })
    },

    setInitialUnreads : (unreadsDoc)=>{
        set({
            unreadCounts : new Map(unreadsDoc),
        })
    },

}))