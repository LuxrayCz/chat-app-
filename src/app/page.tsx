import Button from "@/components/Button";
import { db } from "@/lib/db";

export default async function Home() {
  await db.set("hello", "hello");
  return (
    <main className="">
      <Button size={"sm"} isLoading={false}>
        Hello
      </Button>
    </main>
  );
}
