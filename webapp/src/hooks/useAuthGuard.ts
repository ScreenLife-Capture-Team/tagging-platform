import { useEffect } from "react";
import { useAuth } from "../store/useAuth";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const { loading, loggedIn, initialLogin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    initialLogin();
  }, []);

  useEffect(() => {
    if (!loading && !loggedIn) {
      router.push("/login");
    }
  }, [loading, loggedIn]);
}
