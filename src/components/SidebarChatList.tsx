"use client";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstruction, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

const SidebarChatList = ({ friends, sessionId }: SidebarChatListProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const messageHandler = (message: ExtendedMessage) => {
      const chatId = chatHrefConstruction(sessionId, message.senderId);
      const shouldNotify = pathname !== `/dashboard/chat/${chatId}`;
      console.log("before", shouldNotify);
      if (!shouldNotify) return;
      console.log("after");
      toast.custom((t) => <UnseenChatToast t={t} chatId={chatId} message={message} />);
      setUnseenMessages((prev) => [...prev, message]);
    };
    const friendHandler = () => {
      router.refresh();
    };
    pusherClient.bind("new-message", messageHandler);
    pusherClient.bind("new-friend", friendHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
      pusherClient.unbind("new-message", messageHandler);
      pusherClient.unbind("new-friend", friendHandler);
    };
  }, [pathname, router, sessionId]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((unseenMessage) => {
          return unseenMessage.senderId === friend.id;
        }).length;
        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstruction(sessionId, friend.id)}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-medium p-2 text-sm leadin-6 font-semibold"
            >
              {friend.name}
              {unseenMessagesCount > 0 ? (
                <div className="bg-indigo-600 text-xs font-medium text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
