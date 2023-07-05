interface IncomingFriendRequest {
  senderId: string;
  senderEmail: string | undefined | null;
}
interface ExtendedMessage extends Message {
  senderName: string;
  senderImage: string;
}
