import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...input: ClassValue[]) {
  return twMerge(clsx(input));
}
export function chatHrefConstruction(id: string, id2: string) {
  const sortedIds = [id, id2].sort();
  return `${sortedIds[0]}--${sortedIds[1]}`;
}
export function toPusherKey(key: string) {
  return key.replace(/:/g, "__");
}
