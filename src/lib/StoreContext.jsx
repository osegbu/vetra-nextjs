"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

const initialState = {
  auth: {},
  isChatOpen: false,
  userID: null,
  Users: [],
  fullUserList: [],
  Chats: [],
  typing: {},
  pageLoad: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "AUTH":
      return { ...state, auth: action.payload };

    case "UPDATE_USER_LIST":
      return { ...state, Users: action.payload, fullUserList: action.payload };

    case "UPDATE_UNREAD":
      const updated = state.Users.map((user) => {
        if (user.id === action.payload && state.userID !== action.payload) {
          const unread = (user.unread ?? 0) + 1;
          return { ...user, unread };
        }
        return user;
      });
      return { ...state, Users: updated, fullUserList: updated };

    case "UPDATE_CHAT_LIST":
      const updatedChatList = state.Users.map((user) => {
        if (user.id === action.user_id) {
          const updatedChats = user.chats.map((chat) => {
            if (chat.uuid === action.uuid) {
              return { ...chat, status: "sent" };
            }
            return chat;
          });
          return { ...user, chats: updatedChats };
        }
        return user;
      });
      return {
        ...state,
        Users: updatedChatList,
        fullUserList: updatedChatList,
      };

    case "ADD_CHAT":
      const addChat = state.Users.map((user) => {
        if (user.id === action.user_id) {
          const updatedChats = [...user.chats, action.chat];
          return { ...user, chats: updatedChats };
        }
        return user;
      });
      return {
        ...state,
        Users: addChat,
        fullUserList: addChat,
      };

    case "UPDATE_USER_STATUS":
      const updatedUsers = state.Users.map((user) =>
        user.id === action.user_id ? { ...user, status: action.status } : user
      );
      return { ...state, Users: updatedUsers };

    case "UPDATE_TYPING_STATUS":
      return {
        ...state,
        typing:
          action.status === "typing"
            ? { typing: true, user_id: action.user_id }
            : {},
      };
    case "OPEN_CHAT":
      return { ...state, isChatOpen: true, userID: action.payload };

    case "CHAT_CLOSE":
      return { ...state, isChatOpen: false, userID: null };

    case "SEARCH":
      const searchResult = state.fullUserList.filter((user) =>
        user.user_name.toLowerCase().includes(action.value.toLowerCase())
      );
      return { ...state, Users: searchResult };

    default:
      return state;
  }
};

const StoreContext = createContext();

export const StoreProvider = ({ children, authUser }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sound =
    typeof window !== "undefined" ? new Audio("/notification.mp3") : null;

  if (sound) {
    sound.volume = 0.7;
  }

  useEffect(() => {
    if (authUser) {
      dispatch({ type: "AUTH", payload: authUser });
    }
  }, [authUser]);

  const updateUserList = (users) => {
    dispatch({ type: "UPDATE_USER_LIST", payload: users });
  };

  const updateUserChat = useCallback(
    (user_id, uuid) => {
      dispatch({
        type: "UPDATE_CHAT_LIST",
        user_id: user_id,
        uuid: uuid,
      });
    },
    [state.Users, dispatch]
  );

  const addChat = useCallback(
    (chat, user_id) => {
      dispatch({
        type: "ADD_CHAT",
        chat: chat,
        user_id: user_id,
      });
    },
    [state.Users, dispatch]
  );

  const updateUnread = useCallback(
    (user_id) => {
      sound.play();
      dispatch({ type: "UPDATE_UNREAD", payload: user_id });
    },
    [state.Users, state.userID, dispatch]
  );

  const openChat = (user_id) => {
    const updatedUsers = state.Users.map((user) => {
      if (user.id === user_id && user.unread > 0) {
        return { ...user, unread: 0 };
      }
      return user;
    });

    dispatch({ type: "OPEN_CHAT", payload: user_id });
    dispatch({ type: "UPDATE_USER_LIST", payload: updatedUsers });
  };

  const closeChat = useCallback(() => {
    dispatch({ type: "CHAT_CLOSE" });
  }, [dispatch]);

  const onStatusUpdate = useCallback(
    (message) => {
      dispatch({
        type: "UPDATE_USER_STATUS",
        user_id: message.user_id,
        status: message.status,
      });
    },
    [state.Users, dispatch]
  );

  const onTyping = useCallback(
    (message) => {
      dispatch({
        type: "UPDATE_TYPING_STATUS",
        user_id: message.sender_id,
        status: message.type,
      });
    },
    [dispatch]
  );

  const search = useCallback((value) => {
    dispatch({ type: "SEARCH", value });
  }, []);

  return (
    <StoreContext.Provider
      value={{
        state,
        updateUserList,
        updateUserChat,
        addChat,
        updateUnread,
        openChat,
        closeChat,
        onStatusUpdate,
        onTyping,
        search,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
