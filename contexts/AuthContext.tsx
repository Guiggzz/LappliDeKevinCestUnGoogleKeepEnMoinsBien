import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

type User = {
    id: number;
    name: string;
    email: string;
};

type AuthContextType = {
    signIn: (token: string, userData: User) => Promise<void>;
    signOut: () => Promise<void>;
    isLoading: boolean;
    userToken: string | null;
    user: User | null;
};

const AuthContext = createContext<AuthContextType>({
    signIn: async () => { },
    signOut: async () => { },
    isLoading: true,
    userToken: null,
    user: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const segments = useSegments();

    const checkAndRedirect = useCallback(() => {
        const inAuthGroup = segments[0] === "(auth)";

        if (!userToken && !inAuthGroup && !isLoading) {
            router.replace("/(auth)/Login");
        } else if (userToken && inAuthGroup) {
            router.replace("/");
        }
    }, [userToken, isLoading, segments, router]);

    useEffect(() => {
        checkAndRedirect();
    }, [checkAndRedirect]);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const userData = await AsyncStorage.getItem("userData");

                setUserToken(token);

                if (userData) {
                    try {
                        const userInfo = JSON.parse(userData);
                        setUser(userInfo);
                    } catch (error) {
                        console.error(error);
                        await signOut();
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        loadToken();
    }, []);

    const signIn = async (token: string, userData: User) => {
        try {
            await AsyncStorage.setItem("userToken", token);
            await AsyncStorage.setItem("userData", JSON.stringify(userData));
            setUserToken(token);
            setUser(userData);
        } catch (error) {
            console.error(error);
        }
    };

    const signOut = async () => {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("userData");
        setUserToken(null);
        setUser(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                isLoading,
                userToken,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}