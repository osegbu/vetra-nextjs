"use client";
import { useStore } from "@/lib/StoreContext";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import UserComponent from "../usercomponent/UserComponent";
import ChatComponent from "../chatcomponent/ChatComponent";
import useWebSocket from "@/app/websocket/Websocket";
import axios from "axios";
import Cookies from "js-cookie";

const HomeComponent = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("token");

  const { state, updateUserList } = useStore();
  const [loading, setLoading] = useState(true);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [hasFetchedUsers, setHasFetchedUsers] = useState(false);

  const FetchUsers = useCallback(async () => {
    if (!isFetchingUsers) {
      setIsFetchingUsers(true);
      axios
        .get(`${BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          updateUserList(response.data);
          setHasFetchedUsers(true);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          setIsFetchingUsers(false);
          console.log(error);
        });
    }
  }, [isFetchingUsers, state.auth.id]);

  useEffect(() => {
    if (!isFetchingUsers && !hasFetchedUsers && state.auth.id) {
      FetchUsers();
    }
  }, [isFetchingUsers, hasFetchedUsers, state.auth.id, FetchUsers]);

  const { connect, sendMessage, connectionStatus } = useWebSocket();

  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current && connectionStatus !== "Connected" && state.auth.id) {
      connect();
      hasRun.current = true;
    }
  }, [state.auth.id, connect, connectionStatus]);

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="mainContainer">
          <UserComponent connectionStatus={connectionStatus} />
          {state.userID && <ChatComponent sendMessage={sendMessage} />}
        </div>
      )}
    </>
  );
};

export default memo(HomeComponent);
