import { createContext } from "react";

export const AuthContext = createContext<{
  userData: any | null;
  setUserData: React.Dispatch<React.SetStateAction<any | null>>;
}>({
  userData: null,
  setUserData: () => {},
});
