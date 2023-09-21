import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstruction } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC } from "react";

interface pageProps {}

const page = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (oneFriend) => {
      const [lastMessage] = (await fetchRedis("zrange", `chat:${chatHrefConstruction(session.user.id, oneFriend.id)}:messages`, -1, -1)) as
        | string[]
        | [];
      const parsedLastMessage = JSON.parse(lastMessage) as Message;
      return { ...oneFriend, parsedLastMessage };
    })
  );
  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here..</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md mb-2" key={friend.id}>
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="h-7 w-7 text-zinc-400" />
            </div>
            <Link className="relative sm:flex" href={`/dashboard/chat/${chatHrefConstruction(friend.id, session.user.id)}`}>
              <div className="mb-4   flex-shrink-0 sm:mb-0 sm:mr-3">
                <div className="relative h-6 w-6 ">
                  <Image src={friend.image} referrerPolicy="no-referrer" alt={`${friend.name} profile picture`} fill className=" rounded-full" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                <p className="mt-1 max-w-md">
                  <span className="text-zinc-400">{friend.parsedLastMessage.senderId === session.user.id ? "You: " : ""}</span>
                  {friend.parsedLastMessage.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default page;
