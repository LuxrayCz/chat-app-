import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    // find person you want to add
    const idToAdd = await fetchRedis("get", `user:email:${emailToAdd}`);
    if (!idToAdd) {
      return new Response("This person does not exist.", { status: 401 });
    }

    //check if the person who is adding sm is logged and do not add himself
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (idToAdd === session.user.id) {
      return new Response("You cannot add yourself", { status: 400 });
    }

    //valid request
    const isAlreadyAdded = (await fetchRedis("sismember", `user:${idToAdd}:incoming_friend_requests`, session.user.id)) as 0 | 1;
    if (isAlreadyAdded) {
      return new Response("Already added this user", { status: 400 });
    }

    const isAlreadyFriends = (await fetchRedis("sismember", `user:${session.user.id}:friends`, idToAdd)) as 0 | 1;
    if (isAlreadyFriends) {
      return new Response("Already friends with user", { status: 400 });
    }

    pusherServer.trigger(toPusherKey(`user:${idToAdd}:incoming:friend_requests`), "incoming:friend_requests", {
      senderId: session.user.id,
      senderEmail: session.user.email,
    });

    db.sadd(`user:${idToAdd}:incoming:friend_requests`, session.user.id);
    return new Response("Ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
