import { memo, useRef, useEffect, useState } from "react";
import styles from "./chat.module.css";
import Image from "next/image";
import { useStore } from "@/lib/StoreContext";
import ImageViewer from "./ImageViewer";

const Chats = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const endRef = useRef();
  const { state } = useStore();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const isSameDay = (date1, date2) =>
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    if (isSameDay(messageDate, today)) {
      return "Today";
    } else if (isSameDay(messageDate, yesterday)) {
      return "Yesterday";
    } else if (messageDate >= oneWeekAgo && messageDate < today) {
      return dayOfWeek[messageDate.getDay()];
    } else {
      return messageDate.toLocaleDateString(undefined, {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    }
  };

  const user = state.fullUserList.find((user) => state.userID == user.id);
  const filteredChat =
    user?.chats?.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    ) || [];

  const groupMessagesByDate = () => {
    return filteredChat.reduce((grouped, message) => {
      const date = formatDate(message.created_at);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
      return grouped;
    }, {});
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredChat]);

  const groupedMessages = groupMessagesByDate();

  const customLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };

  return (
    <div className={styles.msgContainer}>
      {isOpen && <ImageViewer image_url={imageUrl} setIsOpen={setIsOpen} />}
      <div style={{ display: "flow-root" }}>
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            <div className={styles.chatDate}>
              <span>{date}</span>
            </div>
            {messages.map((message) => (
              <div
                className={
                  message.sender_id == state.auth.id
                    ? styles.senderChat
                    : styles.receiverChat
                }
                key={message.uuid}
              >
                {message.image && (
                  <div
                    className={styles.chatImageWrapper}
                    onClick={() => {
                      setImageUrl(
                        message.id
                          ? `${BASE_URL}/static/chat/${message.image}`
                          : message.image
                      );
                      setIsOpen(true);
                    }}
                  >
                    <Image
                      loader={customLoader}
                      src={
                        message.id
                          ? `${BASE_URL}/static/chat/${message.image}`
                          : message.image
                      }
                      alt="Chat Image"
                      width={640}
                      height={480}
                      priority
                    />
                  </div>
                )}

                <div className={styles.chatContent}>
                  {message.message && (
                    <p
                      className={styles.chatMessage}
                      dangerouslySetInnerHTML={{
                        __html: message.message.replace(/\n/g, "<br />"),
                      }}
                    />
                  )}
                  <div className={styles.chatTime}>
                    {formatTime(message.created_at)}
                    {message.sender_id === state.auth.id &&
                      (message.status === "sent" ? (
                        <svg
                          viewBox="0 0 18 18"
                          height="16"
                          width="16"
                          preserveAspectRatio="xMidYMid meet"
                          version="1.1"
                        >
                          <path
                            fill="#d4d2d2"
                            d="M17.394,5.035l-0.57-0.444c-0.188-0.147-0.462-0.113-0.609,0.076l-6.39,8.198 c-0.147,0.188-0.406,0.206-0.577,0.039l-0.427-0.388c-0.171-0.167-0.431-0.15-0.578,0.038L7.792,13.13 c-0.147,0.188-0.128,0.478,0.043,0.645l1.575,1.51c0.171,0.167,0.43,0.149,0.577-0.039l7.483-9.602 C17.616,5.456,17.582,5.182,17.394,5.035z M12.502,5.035l-0.57-0.444c-0.188-0.147-0.462-0.113-0.609,0.076l-6.39,8.198 c-0.147,0.188-0.406,0.206-0.577,0.039l-2.614-2.556c-0.171-0.167-0.447-0.164-0.614,0.007l-0.505,0.516 c-0.167,0.171-0.164,0.447,0.007,0.614l3.887,3.8c0.171,0.167,0.43,0.149,0.577-0.039l7.483-9.602 C12.724,5.456,12.69,5.182,12.502,5.035z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 14 18"
                          height="18"
                          width="14"
                          preserveAspectRatio="xMidYMid meet"
                          version="1.1"
                        >
                          <path
                            fill="#d4d2d2"
                            d="M8.906,10.132h-1.64V7.569c0-0.3-0.243-0.545-0.545-0.545H6.619 c-0.3,0-0.545,0.243-0.545,0.545v3.21c0,0.3,0.243,0.545,0.545,0.545h0.102c0.001,0,0.002-0.001,0.003-0.001 s0.002,0.001,0.003,0.001h2.178c0.3,0,0.545-0.243,0.545-0.545v-0.102C9.451,10.376,9.206,10.132,8.906,10.132z M8.906,4.4H5.094 C3.112,4.4,1.5,6.012,1.5,7.994v3.812c0,1.982,1.612,3.594,3.594,3.594h3.812c1.982,0,3.594-1.612,3.594-3.594V7.994 C12.5,6.012,10.888,4.4,8.906,4.4z M11.084,11.806c0,1.203-0.975,2.178-2.178,2.178H5.094c-1.203,0-2.178-0.975-2.178-2.178V7.994 c0-1.203,0.975-2.178,2.178-2.178h3.812c1.203,0,2.178,0.975,2.178,2.178V11.806z"
                          ></path>
                        </svg>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div ref={endRef}></div>
    </div>
  );
};
export default memo(Chats);
