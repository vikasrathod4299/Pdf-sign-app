import { useEffect } from "react";
import { createContext, useContext, useState } from "react";
import { LocalStorage } from "../lib/util";

const authContext = createContext(null);

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  } else {
    return context;
  }
};

const AuthProvider = ({ children }) => {
  const data = LocalStorage.get("user");
  const [user, setUser] = useState(data);

  useEffect(() => {
    LocalStorage.set("user", user);
  }, [user]);

  return (
    <authContext.Provider value={{ user, setUser }}>
      {children}
    </authContext.Provider>
  );
};

export default AuthProvider;
