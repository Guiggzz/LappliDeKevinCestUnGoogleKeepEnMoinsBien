import * as SecureStore from "expo-secure-store";
import * as Crypto from 'expo-crypto';
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

const SECURE_TOKEN_KEY = "secure_user_token";
const SECURE_USER_DATA_KEY = "secure_user_data";

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

    const signIn = async (token: string, userData: User) => {
        try {
            const userDataString = JSON.stringify(userData);
            await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
            await SecureStore.setItemAsync(SECURE_USER_DATA_KEY, userDataString);
            setUserToken(token);
            setUser(userData);
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
            await SecureStore.deleteItemAsync(SECURE_USER_DATA_KEY);
            setUserToken(null);
            setUser(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    useEffect(() => {
        const loadToken = async () => {
            setIsLoading(true);
            try {
                const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
                const userData = await SecureStore.getItemAsync(SECURE_USER_DATA_KEY);

                setUserToken(token);

                if (userData) {
                    try {
                        const hash = await Crypto.digestStringAsync(
                            Crypto.CryptoDigestAlgorithm.SHA256,
                            userData
                        );
                        const userInfo = JSON.parse(userData);
                        if (userInfo && userInfo.id && userInfo.email) {
                            setUser(userInfo);
                        } else {
                            console.error("Invalid user data:", userInfo);
                            await signOut();
                        }
                    } catch (error) {
                        console.error("Error parsing user data:", error);
                        await signOut();
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

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