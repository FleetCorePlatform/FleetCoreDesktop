import { createContext, useContext } from "react";
import {UserCredentials} from "@/screens/common/types.ts";
import {Coordinator} from "@/screens/Profile/types.ts";

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