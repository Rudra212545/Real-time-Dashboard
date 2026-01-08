import { useEffect } from "react";
import { refreshSocketAuth } from "../socket/socket";

export default function useJwtAuth() {
  useEffect(() => {
    async function getToken() {
      const res = await fetch("http://localhost:3000/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "user" })
      });

      const { token } = await res.json();
      localStorage.setItem("jwt", token);
      refreshSocketAuth();
    }

    getToken();
  }, []);
}
