"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type userId = string | null;

let UserIdContext = createContext<userId>(null);

export const UseridProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<userId>(null);
  useEffect(() => {
    let id = localStorage.getItem("userRefId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("userRefId", id);
    }
    // console.log(id);
    setUserId(id);
  }, []);
  return (
    <UserIdContext.Provider value={userId}>{children}</UserIdContext.Provider>
  );
};

export const useUserid = () => {
  const context = useContext(UserIdContext);
  return context;
};
