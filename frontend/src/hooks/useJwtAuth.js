import { useEffect } from "react";
import { refreshSocketAuth } from "../socket/socket";

export default function useJwtAuth() {
  useEffect(() => {
    async function getToken() {
      const id =
      sessionStorage.getItem("uid") ||
      (() => {
        const u = "user_" + Math.random().toString(36).slice(2, 6);
        sessionStorage.setItem("uid", u);
        return u;
      })();
    
    const res = await fetch("http://localhost:3000/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id })
    });

      const { token } = await res.json();
      localStorage.setItem("token", token);
      refreshSocketAuth();
    }

    getToken();
  }, []);
}
