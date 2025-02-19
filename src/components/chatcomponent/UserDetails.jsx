import styles from "./chat.module.css";
import Image from "next/image";
import { memo, useEffect, useMemo } from "react";
import { useStore } from "@/lib/StoreContext";

const UserDetails = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { state, closeChat } = useStore();

  const user = useMemo(
    () => state.Users.find((user) => user.id === state.userID),
    [state.userID, state.Users]
  );

  useEffect(() => {
    const handlePopState = (e) => {
      if (state.userID) closeChat();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [state.userID, closeChat]);

  return (
    <div className={styles.chatUserDetails}>
      {user ? (
        <>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={styles.backBtn}
            onClick={closeChat}
          >
            <g>
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path>
            </g>
          </svg>
          <Image
            src={`${BASE_URL}/static/profile/${user.profile_image}`}
            width={42}
            height={42}
            alt={`${user.user_name}'s profile picture`}
            priority
          />
          <div className={styles.usernameArea}>
            <div className={styles.username}>
              <b>{user.user_name}</b>
            </div>
            {state.typing && state.typing.user_id === state.userID ? (
              <div className={styles.typingIndicator}>Typing...</div>
            ) : (
              <div
                className={`${styles.onlineStatus} ${
                  user.status === "Online" ? styles.online : ""
                }`}
              >
                {user.status}
              </div>
            )}
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default memo(UserDetails);
