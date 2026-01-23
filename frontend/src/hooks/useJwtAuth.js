import { useEffect } from "react";
import { refreshSocketAuth } from "../socket/socket";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function useJwtAuth() {
  useEffect(() => {
    async function getToken() {
      try {
        const isAdmin = sessionStorage.getItem("asAdmin") === "true";

        const id = isAdmin
          ? "admin"
          : sessionStorage.getItem("uid") ||
            (() => {
              const u = "user_" + Math.random().toString(36).slice(2, 6);
              sessionStorage.setItem("uid", u);
              return u;
            })();

        const res = await fetch(`${BACKEND_URL}/auth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        });

        if (!res.ok) {
          throw new Error(`Backend returned ${res.status}`);
        }

        const { token } = await res.json();
        localStorage.setItem("token", token);
        refreshSocketAuth();
      } catch (err) {
        console.error("[AUTH ERROR] Backend not reachable:", err.message);
        console.log("Please ensure backend is running on", BACKEND_URL);
      }
    }

    getToken();
  }, []);
}
