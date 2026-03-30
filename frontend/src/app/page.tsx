'use client'

import { useEffect, useState } from "react";
import HomeClient from "@/component/HomeClient";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
  }, []);

  return <HomeClient isAuthenticated={isAuthenticated} />;
}