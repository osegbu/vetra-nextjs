import { memo, useState, useCallback } from "react";
import styles from "./chat.module.css";
import ChatInputField from "./ChatInputField";
import UserDetails from "./UserDetails";
import Image from "next/image";
import { useStore } from "@/lib/StoreContext";
import Chats from "./Chats";

const ChatComponent = ({ sendMessage }) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState("");
  const { state } = useStore();

  const selectImage = useCallback((fileData) => {
    if (fileData) {
      const reader = new FileReader();
      reader.onload = function (e) {
        setImagePreviewSrc(e.target.result);
      };
      reader.readAsDataURL(fileData);
    }
    setIsImageOpen((prevOpen) => !prevOpen);
  }, []);

  return (
    <div className={styles.container}>
      <UserDetails />
      <Chats />

      {isImageOpen && (
        <div className={styles.uploadImageContainer}>
          <div
            className={styles.closeUploadContainer}
            onClick={() => setIsImageOpen(false)}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="white"
              aria-hidden="true"
              style={{ marginTop: "5px" }}
            >
              <g>
                <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
              </g>
            </svg>
          </div>

          {imagePreviewSrc && (
            <div className={styles.imagePreviewWrapper}>
              <Image
                src={imagePreviewSrc}
                alt="Selected Image"
                width={640}
                height={213}
                priority
              />
            </div>
          )}
        </div>
      )}

      <ChatInputField
        receiver_id={state.userID}
        selectImage={selectImage}
        isImageOpen={isImageOpen}
        setIsImageOpen={setIsImageOpen}
        sendMessage={sendMessage}
      />
    </div>
  );
};

export default memo(ChatComponent);
