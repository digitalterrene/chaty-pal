"use client";
import React from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { auth } from "@/app/firebase";
import AppLoading from "@/layout/AppLoading";

export const AuthContext = React.createContext({});

export const useAuthContext = () => React.useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  console.log("AuthContext state for chaty_pals_user: ", user);
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user }}>
      <div>
        {loading ? (
          <div style={{ marginTop: 400 }}>
            <AppLoading />
          </div>
        ) : (
          children
        )}
      </div>
    </AuthContext.Provider>
  );
};
