"use client";
import React, { createContext, useContext, useState } from "react";

export const ActiveChatContext = createContext();
export default function ActiveChatContextProvider({ children }) {
  const [chat, setChat] = useState({});
  return (
    <ActiveChatContext.Provider value={{ chat, setChat }}>
      {children}
    </ActiveChatContext.Provider>
  );
}
export const useActiveChatContext = () => useContext(ActiveChatContext);
