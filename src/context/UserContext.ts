import {Coordinator} from "@/screens/ProfileScreen.tsx";
import {createContext, useContext} from "react";

interface UserContextType {
    user: Coordinator | null;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
    user: null,
    isAuthenticated: false
});

export const useUser = () => useContext(UserContext);

export const UserProvider = UserContext.Provider;