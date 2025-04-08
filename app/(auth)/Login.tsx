import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

const apiUrl = "https://keep.kevindupas.com/api";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [debug, setDebug] = useState("");
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        setLoading(true);
        setDebug("Démarre la connexion...");

        try {
            setDebug((prev) => prev + `\nURL de l'API: ${apiUrl}/login`);

            const response = await fetch(`${apiUrl}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const rawText = await response.text();
            setDebug(
                (prev) => prev + `\nRéponse brute: ${rawText.substring(0, 50)}...`
            );

            let data;
            try {
                data = JSON.parse(rawText);
                setDebug((prev) => prev + `\nRéponse parsé avec succès`);
            } catch (error) {
                setDebug((prev) => prev + `\nErreur: ${(error as Error).message}`);
                setLoading(false);
                return;
            }

            setDebug((prev) => prev + `\nConnexion réussie`);

            await signIn(data.access_token, data.user);
        } catch (error) {
            setDebug((prev) => prev + `\nErreur: ${(error as Error).message}`);
            setLoading(false);
            Alert.alert("Erreur de connexion", "Impossible de se connecter. Veuillez vérifier vos identifiants.");
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={tw`flex-1`}
            >
                <SafeAreaView style={tw`flex-1 px-6 justify-center`}>
                    <View style={tw`items-center mb-12`}>
                        <View style={tw`bg-white h-24 w-24 rounded-full shadow-xl items-center justify-center mb-4`}>
                            <Text style={tw`text-blue-800 text-3xl font-bold`}>CACA</Text>
                        </View>
                        <Text style={tw`text-white text-center text-3xl font-bold tracking-wider`}>
                            L'appli de Kevin c'est un Google Keep en moins bien
                        </Text>
                        <Text style={tw`text-blue-100 text-base mt-2`}>
                            Connectez-vous pour continuer
                        </Text>
                    </View>

                    <View style={tw`bg-white/10 rounded-3xl p-6 backdrop-blur-md shadow-lg`}>
                        <View style={tw`mb-6`}>
                            <Text style={tw`text-blue-100 text-sm mb-2 ml-1`}>Email</Text>
                            <View style={tw`flex-row items-center bg-white/20 rounded-xl px-4 py-3`}>
                                <Ionicons name="mail-outline" size={20} color="#E0E0FF" />
                                <TextInput
                                    style={tw`flex-1 text-white pl-3 font-medium`}
                                    placeholder="Entrez votre email"
                                    placeholderTextColor="#A0A0FF"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={tw`mb-8`}>
                            <Text style={tw`text-blue-100 text-sm mb-2 ml-1`}>Mot de passe</Text>
                            <View style={tw`flex-row items-center bg-white/20 rounded-xl px-4 py-3`}>
                                <Ionicons name="lock-closed-outline" size={20} color="#E0E0FF" />
                                <TextInput
                                    style={tw`flex-1 text-white pl-3 font-medium`}
                                    placeholder="Entrez votre mot de passe"
                                    placeholderTextColor="#A0A0FF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#E0E0FF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            style={tw`bg-blue-500 rounded-xl py-4 shadow-lg`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={tw`text-white text-center font-bold text-lg`}>
                                    Se connecter
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {debug ? (
                        <View style={tw`mt-8 bg-black/30 p-4 rounded-xl`}>
                            <Text style={tw`text-xs text-blue-100 font-mono`}>
                                {debug}
                            </Text>
                        </View>
                    ) : null}
                </SafeAreaView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}