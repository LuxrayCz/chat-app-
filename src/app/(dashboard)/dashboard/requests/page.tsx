import FriendRequests from "@/components/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  //ids of people who sent us current logged in user a friend request
  const incomingSenderIds = (await fetchRedis("smembers", `user:${session.user.id}:incoming:friend_requests`)) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
      const result = JSON.parse(sender) as User;
      return {
        senderId: result.id,
        senderEmail: result.email,
      };
    })
  );

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id} />
      </div>
    </main>
  );
};

export default page;
