import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { messageValidator } from "@/lib/validations/message";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    const [id1, id2] = chatId.split("--") as string[];
    if (session.user.id !== id1 && session.user.id !== id2) return new Response("Unauthorized", { status: 401 });

    const friendId = session.user.id === id1 ? id2 : id1;
    const friendList = (await fetchRedis("smembers", `user:${session.user.id}:friends`)) as string[];
    const isFriend = friendList.includes(friendId);
    if (!isFriend) return new Response("Unauthorized", { status: 401 });

    const rawSender = (await fetchRedis("get", `user:${session.user.id}`)) as string;
    const sender = JSON.parse(rawSender) as User;

    const timestamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      receiverId: friendId,
      timestamp,
    };
    const message = messageValidator.parse(messageData);

    await pusherServer.trigger(toPusherKey(`chat:${chatId}`), "incoming-message", message);
    await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), "new-message", {
      ...message,
      senderName: sender.name,
      senderImage: sender.image,
    });

    await db.zadd(`chat:${chatId}:messages`, { score: timestamp, member: JSON.stringify(message) });

    return new Response("Ok");
  } catch (error) {
    if (error instanceof Error) return new Response(error.message, { status: 500 });
    return new Response("Internal server error", { status: 500 });
  }
}
