import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { API } from "@/constants/config";

const CATEGORY_COLORS = [
    "#9C27B0",
    "#2196F3",
    "#4CAF50",
    "#FF9800",
    "#E91E63",
    "#607D8B",
    "#F44336",
    "#009688"
];

interface Category {
    id: string;
    name: string;
    color?: string;
}

interface Note {
    id: string;
    title: string;
    content: string;
    categories?: Category[];
}

export default function NoteDetails() {
    const { id } = useLocalSearchParams();
    const { userToken } = useAuth();

    const [note, setNote] = useState<Note | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Category state
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    useEffect(() => {
        loadNote();
    }, []);

    useEffect(() => {
        if (dropdownVisible) fetchCategories();
    }, [dropdownVisible]);

    const loadNote = async () => {
        if (!userToken || !id) return;

        try {
            const response = await fetch(`${API.NOTES}/${id}`, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Erreur de chargement");

            const { data } = await response.json();
            setNote(data);
            setTitle(data.title);
            setContent(data.content.replace(/<[^>]+>/g, ''));

            // Set selected categories based on note data
            if (data.categories && data.categories.length > 0) {
                setSelectedCategories(data.categories.map((cat: Category) => cat.id));
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible de charger la note");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        if (!userToken) {
            Alert.alert("Erreur", "Token non disponible.");
            return;
        }

        setCategoriesLoading(true);
        try {
            const response = await fetch(API.NOTES, {
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
            setCategoriesLoading(false);
        }
    };

    const toggleCategorySelection = (catId: string) => {
        setSelectedCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const createNewCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert("Erreur", "Le nom de la catégorie ne peut pas être vide");
            return;
        }

        setIsCreatingCategory(true);
        try {
            // Sélection aléatoire d'une couleur dans notre palette
            const randomColor = CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];

            const response = await fetch(API.NOTES, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: newCategoryName,
                    color: randomColor
                })
            });

            if (!response.ok) throw new Error("Erreur de création de catégorie");

            const { data } = await response.json();
            setCategories(prev => [...prev, data]);
            setSelectedCategories(prev => [...prev, data.id]);
            setNewCategoryName("");
            Alert.alert("Succès", "Catégorie créée avec succès");
        } catch (error) {
            Alert.alert("Erreur", "Impossible de créer la catégorie");
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert("Erreur", "Le titre ne peut pas être vide");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API.NOTES}/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    content: `<p>${content}</p>`,
                    categories: selectedCategories
                })
            });

            if (!response.ok) throw new Error("Erreur de sauvegarde");

            Alert.alert("Succès", "Note mise à jour", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de sauvegarder la note");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Confirmation",
            "Voulez-vous vraiment supprimer cette note ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await fetch(`${API.NOTES}/${id}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${userToken}`,
                                    "Content-Type": "application/json"
                                }
                            });

                            Alert.alert("Note supprimée", "", [
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
                    <Text style={tw`text-white/70 mt-4`}>Chargement de la note...</Text>
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
                    <Text style={tw`text-white text-xl font-bold`}>Modifier la note</Text>
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
                            placeholder="Titre de la note"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />

                        <Text style={tw`text-white text-base mb-2 font-medium`}>Contenu</Text>
                        <TextInput
                            style={tw`bg-white/20 text-white p-4 rounded-lg min-h-64 shadow-sm border border-white/10`}
                            value={content}
                            onChangeText={setContent}
                            placeholder="Contenu de la note"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            multiline
                            textAlignVertical="top"
                        />

                        <Text style={tw`text-white text-base mb-2 font-medium mt-6`}>Catégories</Text>
                        <TouchableOpacity
                            onPress={() => setDropdownVisible(!dropdownVisible)}
                            style={tw`bg-white/20 p-4 rounded-lg flex-row items-center justify-between border border-white/10 mb-2`}
                        >
                            <Text style={tw`text-white`}>
                                {selectedCategories.length > 0
                                    ? `${selectedCategories.length} catégorie(s) sélectionnée(s)`
                                    : "Sélectionner des catégories"}
                            </Text>
                            <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="white" />
                        </TouchableOpacity>

                        {dropdownVisible && (
                            <View style={tw`mb-4`}>
                                <View style={tw`bg-white/20 rounded-lg p-3 max-h-40 border border-white/10 mb-2`}>
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
                                                    <View style={[
                                                        tw`rounded justify-center items-center`,
                                                        { backgroundColor: item.color || '#2196F3', width: 20, height: 20, marginRight: 12, borderRadius: 4 }
                                                    ]}>
                                                        {selectedCategories.includes(item.id) && (
                                                            <Ionicons name="checkmark" size={16} color="white" />
                                                        )}
                                                    </View>
                                                    <Text style={tw`text-white text-base`}>{item.name}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    )}
                                </View>

                                <View style={tw`flex-row items-center mt-2`}>
                                    <TextInput
                                        style={tw`flex-1 bg-white/20 text-white p-3 rounded-l-lg border-r-0 border border-white/10`}
                                        value={newCategoryName}
                                        onChangeText={setNewCategoryName}
                                        placeholder="Nouvelle catégorie"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                    <TouchableOpacity
                                        onPress={createNewCategory}
                                        disabled={isCreatingCategory || !newCategoryName.trim()}
                                        style={tw`bg-blue-500 p-3 rounded-r-lg ${(!newCategoryName.trim() || isCreatingCategory) ? 'opacity-60' : ''}`}
                                    >
                                        {isCreatingCategory ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Ionicons name="add" size={24} color="white" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={tw`flex-row flex-wrap gap-2 mt-4`}>
                            {selectedCategories.map(catId => {
                                const category = categories.find(c => c.id === catId) ||
                                    note?.categories?.find(c => c.id === catId);
                                return category ? (
                                    <View key={catId} style={[
                                        tw`px-3 py-1.5 rounded-full shadow-sm flex-row items-center`,
                                        {
                                            backgroundColor: category.color ? `${category.color}80` : '#2196F380',
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 20,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginRight: 8,
                                            marginBottom: 8
                                        }
                                    ]}>
                                        <Text style={tw`text-white text-sm mr-1`}>{category.name}</Text>
                                        <TouchableOpacity onPress={() => toggleCategorySelection(catId)}>
                                            <Ionicons name="close-circle" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : null;
                            })}
                        </View>
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