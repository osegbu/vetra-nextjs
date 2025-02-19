"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  startHeartbeat,
  stopHeartbeat,
  handleReconnect,
} from "./connectionUtils";
import { useStore } from "@/lib/StoreContext";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

const useWebSocket = () => {
  const {
    state,
    updateUserChat,
    addChat,
    updateUnread,
    onTyping,
    onStatusUpdate,
  } = useStore();
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const socketRef = useRef(null);
  const reconnectIntervalRef = useRef(null);
  const heartbeatRef = useRef(null);
  const missedPingCountRef = useRef(0);
  const [chats, setChats] = useState([]);
  const chatsRef = useRef(chats);
  const [messageQueue, setMessageQueue] = useState([]);

  const PING_INTERVAL = 5000;
  const MAX_MISSED_PINGS = 3;
  const QUEUE_CHECK_INTERVAL = 15000;

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    if (state.auth.id) setChats(state.Chats);
  }, [state.Chats, state.auth.id]);

  const sendMessage = useCallback(
    (props) => {
      if (
        socketRef.current &&
        connectionStatus === "Connected" &&
        navigator.onLine
      ) {
        try {
          socketRef.current.send(JSON.stringify(props));
        } catch (error) {
          if (props.type === "chat") {
            setMessageQueue((prevQueue) => [...prevQueue, props]);
          }
        }
      } else {
        if (props.type === "chat") {
          setMessageQueue((prevQueue) => [...prevQueue, props]);
        }
      }
      if (props.type === "chat") {
        addChat(props, props.receiver_id);
      }
    },
    [connectionStatus, addChat]
  );

  const sendPendingMessages = useCallback(() => {
    if (
      socketRef.current &&
      connectionStatus === "Connected" &&
      navigator.onLine
    ) {
      messageQueue.forEach((msg) => {
        socketRef.current.send(JSON.stringify(msg));
      });
    }
  }, [messageQueue, connectionStatus]);

  useEffect(() => {
    if (
      socketRef.current &&
      connectionStatus === "Connected" &&
      navigator.onLine
    ) {
      sendPendingMessages();
    }

    const interval = setInterval(() => {
      if (
        socketRef.current &&
        connectionStatus === "Connected" &&
        navigator.onLine
      ) {
        sendPendingMessages();
      }
    }, QUEUE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [connectionStatus, sendPendingMessages]);

  const handleSocketMessage = useCallback(
    (event) => {
      const message = JSON.parse(event.data);

      if (message.type !== "pong") {
        socketRef.current.send(
          JSON.stringify({
            type: "ack",
            message_id: message.message_id,
          })
        );
      }

      if (message.type == "pong") {
        missedPingCountRef.current = 0;
      }

      if (message.type === "chat") {
        addChat(message, message.sender_id);
        updateUnread(message.sender_id);
      }

      if (message.type === "msg_update") {
        updateUserChat(message.receiver_id, message.uuid);

        setMessageQueue((prevQueue) => {
          return prevQueue.filter((msg) => msg.uuid !== message.uuid);
        });
      }

      if (message.type === "status") {
        onStatusUpdate(message);
      }

      if (message.type === "blur" || message.type === "typing") {
        onTyping(message);
      }
    },
    [updateUserChat, state.auth.id, updateUnread]
  );

  const connect = useCallback(() => {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;

    if (!isOnline) {
      console.warn("No internet connection. Will retry when online.");
      return;
    }

    if (!state.auth.id) {
      console.warn(
        `User ${state.auth.id} is not available. Cannot connect to WebSocket.`
      );
      return;
    }

    if (socketRef.current) {
      console.log("WebSocket connection already established");
      return;
    }

    setConnectionStatus("Connecting...");
    const socket = new WebSocket(`ws://${WS_URL}/ws/${state.auth.id}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionStatus("Connected");
      console.log("WebSocket connection established");

      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
      missedPingCountRef.current = 0;

      heartbeatRef.current = startHeartbeat(
        socketRef,
        missedPingCountRef,
        state.auth.id,
        PING_INTERVAL,
        MAX_MISSED_PINGS
      );
    };

    socket.onmessage = handleSocketMessage;

    socket.onerror = () => {
      setConnectionStatus("Error");
    };

    socket.onclose = () => {
      setConnectionStatus("Disconnected");
      socketRef.current = null;
      stopHeartbeat(heartbeatRef);
      handleReconnect(socketRef, reconnectIntervalRef, connect);
    };
  }, [handleSocketMessage, state.auth.id]);

  useEffect(() => {
    const handleOnline = () => {
      console.log("Internet connection restored. Reconnecting...");
      connect();
    };

    const handleOffline = () => {
      console.warn("Lost internet connection.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [connect]);

  return {
    connect,
    sendMessage,
    connectionStatus,
  };
};

export default useWebSocket;
