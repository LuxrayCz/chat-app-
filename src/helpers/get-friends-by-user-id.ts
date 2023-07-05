import { fetchRedis } from "./redis";

export async function getFriendsByUserId(userId: string) {
  //retrive friend for current user
  const friendIds = (await fetchRedis("smembers", `user:${userId}:friends`)) as string[];

  const friends = Promise.all(
    friendIds.map(async (oneId) => {
      const friend = (await fetchRedis("get", `user:${oneId}`)) as string;
      const parsedFriend = JSON.parse(friend);
      return parsedFriend;
    })
  );
  return friends;
}
