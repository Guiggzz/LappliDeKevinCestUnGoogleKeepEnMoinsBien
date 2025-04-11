import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator, FlatList } from "react-native";
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
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    useEffect(() => {
        if (dropdownVisible) fetchCategories();
    }, [dropdownVisible]);

    const fetchCategories = async () => {
        if (!userToken) {
            Alert.alert("Erreur", "Token non disponible.");
            return;
        }

        setCategoriesLoading(true);
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
            console.error("Error fetching categories:", error);
            Alert.alert("Erreur", "Impossible de récupérer les catégories.");
        } finally {
            setCategoriesLoading(false);
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
        if (!title || !content) {
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
                    title: title,
                    content: `<p>${content}</p>`,
                    categories: selectedCategories
                })
            });

            if (!response.ok) throw new Error("Erreur lors de la création");

            Alert.alert("Succès", "Note créée avec succès !", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (error) {
            console.error("Error creating note:", error);
            Alert.alert("Erreur", "Impossible de créer la note.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={tw`flex-1`}>
                <SafeAreaView style={tw`flex-1 px-6 pt-6`}>
                    <View style={tw`flex-row justify-between items-center mb-6`}>
                        <Text style={tw`text-white text-2xl font-bold`}>Nouvelle Note</Text>
                        <View style={tw`flex-row gap-3`}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={tw`p-2.5 bg-white/20 rounded-full shadow-md`}
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading ? (
                        <View style={tw`flex-1 justify-center items-center`}>
                            <ActivityIndicator size="large" color="#ffffff" style={tw`mb-4`} />
                            <Text style={tw`text-white/80 text-base`}>Création en cours...</Text>
                        </View>
                    ) : (
                        <View style={tw`flex-1`}>
                            <View style={tw`mb-5 bg-white/10 rounded-xl p-5 border border-white/10 shadow-lg`}>
                                <Text style={tw`text-blue-200 text-base mb-2 font-medium`}>Titre</Text>
                                <TextInput
                                    style={tw`w-full p-4 bg-white/10 rounded-lg mb-4 text-white border border-white/20`}
                                    placeholderTextColor="#a0c4ff"
                                    placeholder="Entrez le titre"
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                <Text style={tw`text-blue-200 text-base mb-2 font-medium`}>Contenu</Text>
                                <TextInput
                                    style={tw`w-full p-4 bg-white/10 rounded-lg mb-4 min-h-32 text-white border border-white/20`}
                                    placeholderTextColor="#a0c4ff"
                                    placeholder="Entrez le contenu de votre note"
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    textAlignVertical="top"
                                />

                                <Text style={tw`text-blue-200 text-base mb-2 font-medium`}>Catégories</Text>
                                <TouchableOpacity
                                    onPress={() => setDropdownVisible(!dropdownVisible)}
                                    style={tw`bg-white/10 p-4 rounded-lg flex-row items-center justify-between border border-white/20`}
                                >
                                    <Text style={tw`text-white`}>
                                        {selectedCategories.length > 0
                                            ? `${selectedCategories.length} catégorie(s) sélectionnée(s)`
                                            : "Sélectionner des catégories"}
                                    </Text>
                                    <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="white" />
                                </TouchableOpacity>

                                {dropdownVisible && (
                                    <View style={tw`mt-2 bg-white/10 rounded-lg p-3 max-h-40 border border-white/10`}>
                                        {categoriesLoading ? (
                                            <View style={tw`py-4 items-center`}>
                                                <ActivityIndicator color="#ffffff" />
                                                <Text style={tw`text-white/80 text-sm mt-2`}>Chargement des catégories...</Text>
                                            </View>
                                        ) : categories.length === 0 ? (
                                            <View style={tw`py-4 items-center`}>
                                                <Text style={tw`text-white/80 text-base`}>Aucune catégorie disponible</Text>
                                            </View>
                                        ) : (
                                            <FlatList
                                                data={categories}
                                                keyExtractor={(item) => item.id.toString()}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={tw`flex-row items-center p-3 border-b border-white/10`}
                                                        onPress={() => toggleCategorySelection(item.id)}
                                                    >
                                                        <View style={tw`h-5 w-5 mr-3 bg-white/20 rounded justify-center items-center`}>
                                                            {selectedCategories.includes(item.id) && (
                                                                <Ionicons name="checkmark" size={16} color="#8cf1b4" />
                                                            )}
                                                        </View>
                                                        <Text style={tw`text-white text-base`}>{item.name}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        )}
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={createNote}
                                style={tw`bg-blue-500 p-4 rounded-xl items-center shadow-lg mb-4`}
                                disabled={loading}
                            >
                                <Text style={tw`text-white font-bold text-lg`}>Créer la note</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </SafeAreaView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}