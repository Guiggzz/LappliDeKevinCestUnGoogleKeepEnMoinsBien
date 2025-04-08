import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";

const apiCategories = "https://keep.kevindupas.com/api/categories";
const apiCreateNote = "https://keep.kevindupas.com/api/notes";

interface Category {
    id: number;
    name: string;
}

export default function Create() {
    const { userToken } = useAuth();
    const [Titre, setTitre] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        if (dropdownVisible) fetchCategories();
    }, [dropdownVisible]);

    const fetchCategories = async () => {
        if (!userToken) {
            Alert.alert("Erreur", "Token non disponible.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(apiCategories, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                }
            });
            const result = await response.json();
            setCategories(result.data || []);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de récupérer les catégories.");
        } finally {
            setLoading(false);
        }
    };

    const toggleCategorySelection = (id: number) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
        );
    };

    const createNote = async () => {
        if (!userToken) {
            Alert.alert("Erreur", "Token non disponible.");
            return;
        }
        if (!Titre || !content) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(apiCreateNote, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: Titre,
                    content: `<p>${content}</p>`,
                    categories: selectedCategories
                })
            });
            if (!response.ok) throw new Error("Erreur lors de la création");
            Alert.alert("Succès", "Note créée avec succès !");
        } catch (error) {
            Alert.alert("Erreur", "Impossible de créer la note.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={tw`flex-1 p-5`}>
                <SafeAreaView style={tw`flex-1 justify-center items-center`}>
                    <View style={tw`top-15 left-3 absolute`}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="home" size={30} color="white" />
                        </TouchableOpacity>
                    </View>

                    <Text style={tw`text-2xl font-bold text-white mb-5`}>Créer une nouvelle note</Text>

                    <TextInput
                        style={tw`w-full p-3 bg-white rounded-lg mb-3`}
                        placeholderTextColor="#A0A0FF"
                        placeholder="Titre"
                        value={Titre}
                        onChangeText={setTitre}
                    />
                    <TextInput
                        style={tw`w-full p-3 bg-white rounded-lg mb-3 h-32`}
                        placeholderTextColor="#A0A0FF"
                        placeholder="Contenu"
                        value={content}
                        onChangeText={setContent}
                        multiline
                    />

                    <TouchableOpacity
                        onPress={() => setDropdownVisible(!dropdownVisible)}
                        style={tw`bg-white/20 px-4 py-2 rounded-lg flex-row items-center justify-between w-full mb-2`}
                    >
                        <Text style={tw`text-white text-lg`}>Catégories</Text>
                        <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="white" />
                    </TouchableOpacity>

                    {dropdownVisible && (
                        <View style={tw`w-full bg-white/20 rounded-lg p-2 max-h-40`}>
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <FlatList
                                    data={categories}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <View style={tw`flex-row items-center p-2 border-b border-white/30`}>
                                            <Checkbox
                                                value={selectedCategories.includes(item.id)}
                                                onValueChange={() => toggleCategorySelection(item.id)}
                                                color={selectedCategories.includes(item.id) ? "#3b5998" : undefined}
                                            />
                                            <Text style={tw`text-white text-lg ml-3`}>{item.name}</Text>
                                        </View>
                                    )}
                                />
                            )}
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={createNote}
                        style={tw`bg-green-500 px-5 py-3 rounded-lg w-full items-center mt-3`}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={tw`text-white font-bold`}>Créer</Text>
                        )}
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}
