const upstashRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Commands = "zrange" | "smembers" | "get" | "sismember";

export async function fetchRedis(command: Commands, ...args: (string | number)[]) {
  const commandUrl = `${upstashRedisUrl}/${command}/${args.join("/")}`;

  const response = await fetch(commandUrl, {
    headers: { Authorization: `Bearer ${upstashRedisToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}
