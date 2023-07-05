import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface loadingProps {}

const loading: FC<loadingProps> = ({}) => {
  return (
    <div className="w-full flex flex-col gap-3 pt-8">
      <Skeleton className="mb-4" height={60} width={500} />
      <Skeleton height={20} width={350} />
      <Skeleton height={20} width={350} />
      <Skeleton height={20} width={350} />
    </div>
  );
};

export default loading;
