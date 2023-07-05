import { cn } from "@/lib/utils";
import Image from "next/image";
import { FC } from "react";
import { toast, type Toast } from "react-hot-toast";

interface UnseenChatToastProps {
  t: Toast;
  chatId: string;
  message: ExtendedMessage;
}

const UnseenChatToast: FC<UnseenChatToastProps> = ({ t, chatId, message }) => {
  const dismiss = () => toast.remove(t.id);
  return (
    <div
      className={cn("max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5", {
        "animate-enter": t.visible,
        "animate-leave": !t.visible,
      })}
    >
      <a onClick={dismiss} href={`/dashboard/chat/${chatId}`} className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5 ">
            <div className="relative">
              <Image
                fill
                referrerPolicy="no-referrer"
                className="rounded-full"
                src={message.senderImage}
                alt={`${message.senderName} profile picture`}
              />
            </div>
          </div>
          <div className="ml-3 flex-1 ">
            <p className="font-medium text-sm text-gray-900">{message.senderName}</p>
            <p className="mt-1 text-sm text-gray-500">{message.text}</p>
          </div>
        </div>
      </a>
      <div className="flex border-1 border-gray-200">
        <button
          onClick={dismiss}
          className="w-full border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UnseenChatToast;
