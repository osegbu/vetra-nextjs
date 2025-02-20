"use client";
import styles from "./user.module.css";
import Search from "./Search";
import { memo, useCallback } from "react";
import Image from "next/image";
import { useStore } from "@/lib/StoreContext";

const UserComponent = ({ connectionStatus }) => {
  const { state, openChat } = useStore();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(now.setDate(now.getDate() - 1)).toDateString() ===
      date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      });
    }
  };

  const handleUserClick = useCallback(
    (id) => {
      if (!state.userID) {
        const newUrl = "";
        window.history.pushState(
          { ...window.history.state, as: newUrl, url: newUrl },
          "",
          newUrl
        );
      }
      openChat(id);
    },
    [state.userID, openChat]
  );

  const sortedUsers = state.Users.sort((a, b) => {
    const lastChatA = a.chats.length
      ? new Date(a.chats[a.chats.length - 1].created_at).getTime()
      : 0;
    const lastChatB = b.chats.length
      ? new Date(b.chats[b.chats.length - 1].created_at).getTime()
      : 0;

    return lastChatB - lastChatA;
  });

  const customLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };

  return (
    <div
      className={`${state.isChatOpen ? styles.collapse : ""} ${
        styles.container
      }`}
    >
      <h1 className={styles.title}>Vetra</h1>

      <Search />

      {connectionStatus !== "Connected" && (
        <div className={styles.connectionStatus}>
          <svg viewBox="0 0 48 48" height="48px" width="48px" version="1.1">
            <path
              fill="#FFBC38"
              d="M24.154,2C11.919,2,2,11.924,2,24.165S11.919,46.33,24.154,46.33 s22.154-9.924,22.154-22.165S36.389,2,24.154,2z M23.985,34.138L12.976,19.459c3.028-2.294,6.881-3.67,11.009-3.67 c4.129,0,7.982,1.376,11.009,3.67L23.985,34.138z M23.04,28.488h1.981v-1.981H23.04V28.488z M23.04,24.526h1.981v-5.017H23.04 V24.526z"
            ></path>
          </svg>
          <div>
            <div>{connectionStatus}</div>
            {connectionStatus === "Disconnected" && (
              <>
                <div className={styles.note}>
                  Make sure your computer has active internet connection.
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.userList}>
        {sortedUsers.length > 0 ? (
          sortedUsers.map((user) => {
            const sortedChats = [...user.chats].sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            const lastChat = sortedChats[0];

            return (
              <div
                key={user.id}
                className={styles.eachUser}
                onClick={() => handleUserClick(user.id)}
              >
                <div className={styles.imageContainer}>
                  <div
                    className={
                      user.status === "Online"
                        ? styles.onlineIndicator
                        : styles.offlineIndicator
                    }
                  ></div>
                  <Image
                    loader={customLoader}
                    src={`${BASE_URL}/static/profile/${user.profile_image}`}
                    width={48}
                    height={48}
                    alt={`${user.user_name}'s profile picture`}
                    priority
                  />
                </div>
                <div className={styles.flexRight}>
                  <div className={styles.lastMessage}>
                    <div className={styles.username}>{user.user_name}</div>
                    <div className={styles.lastTime}>
                      {lastChat?.created_at && formatTime(lastChat.created_at)}
                    </div>
                  </div>
                  {lastChat && (
                    <div className={styles.lastMessage}>
                      <div className={styles.lastMsg}>
                        {lastChat?.sender_id === state.auth.id &&
                          (lastChat?.status === "sent" ? (
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
                              height="16"
                              width="13"
                              preserveAspectRatio="xMidYMid meet"
                              version="1.1"
                            >
                              <path
                                fill="#d4d2d2"
                                d="M8.906,10.132h-1.64V7.569c0-0.3-0.243-0.545-0.545-0.545H6.619 c-0.3,0-0.545,0.243-0.545,0.545v3.21c0,0.3,0.243,0.545,0.545,0.545h0.102c0.001,0,0.002-0.001,0.003-0.001 s0.002,0.001,0.003,0.001h2.178c0.3,0,0.545-0.243,0.545-0.545v-0.102C9.451,10.376,9.206,10.132,8.906,10.132z M8.906,4.4H5.094 C3.112,4.4,1.5,6.012,1.5,7.994v3.812c0,1.982,1.612,3.594,3.594,3.594h3.812c1.982,0,3.594-1.612,3.594-3.594V7.994 C12.5,6.012,10.888,4.4,8.906,4.4z M11.084,11.806c0,1.203-0.975,2.178-2.178,2.178H5.094c-1.203,0-2.178-0.975-2.178-2.178V7.994 c0-1.203,0.975-2.178,2.178-2.178h3.812c1.203,0,2.178,0.975,2.178,2.178V11.806z"
                              ></path>
                            </svg>
                          ))}
                        {lastChat?.message || (lastChat?.image && "Photo")}
                      </div>
                      <div className={styles.lastStatus}>
                        {user?.unread > 0 && (
                          <div className={styles.unread}>{user.unread}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noUsers}>No User Found</div>
        )}
      </div>
    </div>
  );
};

export default memo(UserComponent);
