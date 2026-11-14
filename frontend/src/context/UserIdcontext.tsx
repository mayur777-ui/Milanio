"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type UserId = string | null;

const UserIdContext = createContext<UserId>(null);

export const UseridProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<UserId>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setUserId(null);
      return;
    }

    try {
      const payloadBase64 = token.split(".")[1];
      if (payloadBase64) {
        const payload = JSON.parse(atob(payloadBase64));
        setUserId(payload?.id || null);
      }
    } catch (err) {
      console.warn("Could not decode user token:", err);
      setUserId(null);
    }
  }, []);

  return (
    <UserIdContext.Provider value={userId}>{children}</UserIdContext.Provider>
  );
};

export const useUserid = () => useContext(UserIdContext);
