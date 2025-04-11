import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";

const apiUrl = "https://keep.kevindupas.com/api/tasks";

interface Taches {
    id: string;
    title: string;
    content: string;
    categories?: { id: string; name: string; }[];
}
export default function TachesDetails() {
    const { id } = useLocalSearchParams();
    const { userToken } = useAuth();

    const [Taches, setTaches] = useState<Taches | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTaches();
    }, []);

    const loadTaches = async () => {
        if (!userToken || !id) return;

        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Erreur de chargement");

            const { data } = await response.json();
            setTaches(data);
            setTitle(data.title);
            setContent(data.content.replace(/<[^>]+>/g, ''));
        } catch (error) {
            Alert.alert("Erreur", "Impossible de charger la Taches");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert("Erreur", "Le titre ne peut pas être vide");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, content })
            });

            if (!response.ok) throw new Error("Erreur de sauvegarde");

            Alert.alert("Succès", "Taches mise à jour", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de sauvegarder la tache");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Confirmation",
            "Voulez-vous vraiment supprimer cette Taches ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await fetch(`${apiUrl}/${id}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${userToken}`,
                                    "Content-Type": "application/json"
                                }
                            });

                            Alert.alert("Taches supprimée", "", [
                                { text: "OK", onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            Alert.alert("Erreur", "Échec de la suppression");
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={tw`flex-1`}>
                <SafeAreaView style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={tw`text-white/70 mt-4`}>Chargement de la Taches...</Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={tw`flex-1`}>
            <SafeAreaView style={tw`flex-1 px-6 pt-6`}>
                <View style={tw`flex-row justify-between items-center mb-6`}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={tw`p-2.5 bg-white/20 rounded-full shadow-md`}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={tw`text-white text-xl font-bold`}>Modifier la Taches</Text>
                    <TouchableOpacity
                        onPress={handleDelete}
                        style={tw`p-2.5 bg-red-500/70 rounded-full shadow-md`}
                    >
                        <Ionicons name="trash-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={tw`flex-1`}>
                    <View style={tw`bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/10 mb-4`}>
                        <Text style={tw`text-white text-base mb-2 font-medium`}>Titre</Text>
                        <TextInput
                            style={tw`bg-white/20 text-white p-4 rounded-lg mb-6 shadow-sm border border-white/10`}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Titre de la Taches"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />

                        <Text style={tw`text-white text-base mb-2 font-medium`}>Contenu</Text>
                        <TextInput
                            style={tw`bg-white/20 text-white p-4 rounded-lg min-h-64 shadow-sm border border-white/10`}
                            value={content}
                            onChangeText={setContent}
                            placeholder="Contenu de la Taches"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            multiline
                            textAlignVertical="top"
                        />

                        {(Taches?.categories ?? []).length > 0 && (
                            <View style={tw`mt-6`}>
                                <Text style={tw`text-white text-base mb-2 font-medium`}>Catégories</Text>
                                <View style={tw`flex-row flex-wrap gap-2`}>
                                    {Taches?.categories?.map(cat => (
                                        <View key={cat.id} style={tw`bg-blue-500/50 px-3 py-1.5 rounded-full shadow-sm`}>
                                            <Text style={tw`text-white text-sm`}>{cat.name}</Text>
                                        </View>
                                    )) ?? []}
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <View style={tw`py-4`}>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        style={tw`bg-blue-500 py-4 rounded-xl items-center shadow-lg ${isSaving ? 'opacity-60' : ''}`}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={tw`text-white font-bold text-lg`}>Enregistrer</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}