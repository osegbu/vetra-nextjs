import { memo } from "react";
import { useHomeContext } from "../homeComponent/HomeComponent";
import ChatComponent from "../chatcomponent/ChatComponent";

const LoadChat = () => {
  const { isChatOpen } = useHomeContext();

  if (!isChatOpen) return null;

  return (
    <>
      <ChatComponent />
    </>
  );
};

export default memo(LoadChat);
