import { createContext, useContext } from "react";
import { Coordinator } from "@/screens/ProfileScreen";
import { UserCredentials } from "@/models/User"; // Ensure this model exists

interface UserContextType {
    user: Coordinator | null;
    credentials: UserCredentials | null;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
    user: null,
    credentials: null,
    isAuthenticated: false
});

export const useUser = () => useContext(UserContext);

export const UserProvider = UserContext.Provider;