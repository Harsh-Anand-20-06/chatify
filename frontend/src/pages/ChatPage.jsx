import { useChatStore } from "../store/useChatStore"

import {BorderAnimatedContainer} from "../components/BorderAnimatedContainer";
import {ProfileHeader} from "../components/ProfileHeader";
import {ActiveTabSwitch} from "../components/ActiveTabSwitch";
import {ChatsList} from "../components/ChatsList";
import {ContactList} from "../components/ContactList";
import {ChatContainer} from "../components/ChatContainer";
import {NoConversationPlaceholder} from "../components/NoConversationPlaceholder";
import { useSocketStore } from "../store/useSocketStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

export const ChatPage = function(){
    const { activeTab, selectedUser } = useChatStore();
    const {authUser} = useAuthStore();

    useEffect(() => {
    if (authUser) {
        useSocketStore.getState().connect();
    } else {
        useSocketStore.getState().disconnect();
    }
}, [authUser]);

  return (
    <div className="relative w-full max-w-6xl h-[800px]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}