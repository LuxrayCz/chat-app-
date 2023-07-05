import AddFriendButton from "@/components/AddFriendButton";
import { FC } from "react";

interface addProps {}

const add: FC<addProps> = ({}) => {
  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add friend</h1>
      <AddFriendButton />
    </main>
  );
};

export default add;
