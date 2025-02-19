import styles from "./chat.module.css";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import debounce from "lodash/debounce";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "@/lib/StoreContext";

const ChatInputField = ({
  receiver_id,
  selectImage,
  isImageOpen,
  setIsImageOpen,
  sendMessage,
}) => {
  const { state } = useStore();
  const [message, setMessage] = useState("");
  const [fileData, setFileData] = useState(null);
  const textareaRef = useRef(null);
  const file = useRef(null);

  const handleInputChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() && !fileData) return;

    const uuid = uuidv4();
    const created_at = new Date().toISOString();

    let base64File = null;

    if (fileData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        base64File = reader.result.split(",")[1];
        const jsonMessage = {
          type: "chat",
          uuid,
          message,
          sender_id: state.auth.id,
          receiver_id,
          status: "sending...",
          created_at,
          image: `data:${fileData.type};base64,${base64File}`,
          file: {
            name: fileData.name,
            type: fileData.type,
            size: fileData.size,
            data: base64File,
          },
        };

        sendMessage(jsonMessage);
        setMessage("");
        setFileData(null);
        setIsImageOpen(false);
      };
      reader.readAsDataURL(fileData);
    } else {
      const jsonMessage = {
        type: "chat",
        uuid,
        message: message.trimStart().trimEnd(),
        sender_id: state.auth.id,
        receiver_id,
        status: "sending...",
        created_at,
      };

      sendMessage(jsonMessage);
      setMessage("");
    }
  }, [
    message,
    fileData,
    state.auth.id,
    receiver_id,
    setIsImageOpen,
    sendMessage,
  ]);

  const handleTyping = useCallback(
    debounce(() => {
      const jsonMessage = {
        type: "typing",
        sender_id: state.auth.id,
        receiver_id,
      };
      sendMessage(jsonMessage);
    }, 300),
    [state.auth.id, receiver_id, sendMessage]
  );

  const handleBlur = useCallback(() => {
    const jsonMessage = {
      type: "blur",
      sender_id: state.auth.id,
      receiver_id,
    };
    sendMessage(jsonMessage);
  }, [state.auth.id, receiver_id, sendMessage]);

  const handleImageUpload = useCallback(() => {
    const data = file.current.files[0];
    if (data) {
      setFileData(data);
    }
  }, []);

  useEffect(() => {
    if (fileData) selectImage(fileData);
  }, [fileData, selectImage]);

  useEffect(() => {
    if (!isImageOpen) setFileData(null);
    file.current.value = "";
  }, [isImageOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "30px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [message]);

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputCover}>
        <button
          className={styles.selectImage}
          onClick={() => file.current.click()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M20 14V2C20 0.9 19.1 0 18 0H6C4.9 0 4 0.9 4 2V14C4 15.1 4.9 16 6 16H18C19.1 16 20 15.1 20 14ZM9.4 10.53L11.03 12.71L13.61 9.49C13.81 9.24 14.19 9.24 14.39 9.49L17.35 13.19C17.61 13.52 17.38 14 16.96 14H7C6.59 14 6.35 13.53 6.6 13.2L8.6 10.53C8.8 10.27 9.2 10.27 9.4 10.53ZM0 18V5C0 4.45 0.45 4 1 4C1.55 4 2 4.45 2 5V17C2 17.55 2.45 18 3 18H15C15.55 18 16 18.45 16 19C16 19.55 15.55 20 15 20H2C0.9 20 0 19.1 0 18Z"
              fill="white"
            ></path>
          </svg>
        </button>

        <input
          type="file"
          id="imageUpload"
          accept="image/jpeg, image/png"
          style={{ display: "none" }}
          onChange={handleImageUpload}
          ref={file}
        />
        <textarea
          placeholder="Type a message"
          name="chat"
          className={styles.inputTag}
          value={message}
          onChange={handleInputChange}
          onFocus={handleTyping}
          onBlur={handleBlur}
          ref={textareaRef}
        />

        <button
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={!message.trim() && !fileData}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="none"
            viewBox="0 0 32 32"
          >
            <path
              fill="rgba(0,0,0,.7)"
              d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default memo(ChatInputField);
