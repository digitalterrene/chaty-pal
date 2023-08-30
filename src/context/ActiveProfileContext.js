"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export const ActiveProfileContext = createContext();
export default function ActiveProfileContextProvider({ children }) {
  const [profile, setProfile] = useState({});
  useEffect(() => {
    const user = localStorage.getItem("chaty-app-user");
    setProfile(JSON.parse(user));
  }, []);
  return (
    <ActiveProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ActiveProfileContext.Provider>
  );
}
export const useActiveProfileContext = () => useContext(ActiveProfileContext);
