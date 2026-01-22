import { createContext } from "react";
import {AuthContextValue} from "@/lib/types"

const UserContext = createContext<AuthContextValue | null>(null);
export default UserContext; 
