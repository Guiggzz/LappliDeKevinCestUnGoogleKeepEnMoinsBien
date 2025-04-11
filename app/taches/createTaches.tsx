import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, Keyboard, TouchableWithoutFeedback, ActivityIndicator, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const apiCreateTaches = "https://keep.kevindupas.com/api/tasks";
const apiNotes = "https://keep.kevindupas.com/api/notes";

interface Notes {
    id: number;
    title: string;
}

interface Subtask {
    description: string;
    is_completed: boolean;
}

export default function Create() {
    const { userToken } = useAuth();
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState(""); // Nouveau champ pour le titre
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState<Notes[]>([]);
    const [selectedNote, setSelectedNote] = useState<number | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = useState("");

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
            const response = await fetch(apiNotes, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                }
            });
            const result = await response.json();
            setNotes(result.data || []);
        } catch (error) {
            console.error("Error fetching notes:", error);
            Alert.alert("Erreur", "Impossible de récupérer les notes.");
        } finally {
            setCategoriesLoading(false);
        }
    };

    const selectNote = (id: number) => {
        setSelectedNote(id);
        setDropdownVisible(false);
    };

    const addSubtask = () => {
        if (newSubtask.trim() === "") return;

        setSubtasks([
            ...subtasks,
            { description: newSubtask, is_completed: false }
        ]);
        setNewSubtask("");
    };

    const removeSubtask = (index: number) => {
        const newSubtasks = [...subtasks];
        newSubtasks.splice(index, 1);
        setSubtasks(newSubtasks);
    };

    const toggleSubtaskCompletion = (index: number) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index].is_completed = !newSubtasks[index].is_completed;
        setSubtasks(newSubtasks);
    };

    const createTaches = async () => {
        if (!userToken) {
            Alert.alert("Erreur", "Token non disponible.");
            return;
        }

        if (!title.trim()) {
            Alert.alert("Erreur", "Veuillez ajouter un titre à la tâche.");
            return;
        }

        if (!selectedNote) {
            Alert.alert("Erreur", "Veuillez sélectionner une note associée.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(apiCreateTaches, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    description: title,
                    note_id: selectedNote,
                    is_completed: isCompleted,
                    subtasks: subtasks
                })
            });

            if (!response.ok) throw new Error("Erreur lors de la création");

            Alert.alert("Succès", "Tâche créée avec succès !", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (error) {
            console.error("Error creating Taches:", error);
            Alert.alert("Erreur", "Impossible de créer la tâche.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={tw`flex-1`}>
                <SafeAreaView style={tw`flex-1 px-6 pt-6`}>
                    <View style={tw`flex-row justify-between items-center mb-6`}>
                        <Text style={tw`text-white text-2xl font-bold`}>Nouvelle Tâche</Text>
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
                        <ScrollView style={tw`flex-1`}>
                            <View style={tw`mb-5 bg-white/10 rounded-xl p-5 border border-white/10 shadow-lg`}>
                                {/* Titre de la tâche */}
                                <Text style={tw`text-blue-200 text-base mb-2 font-medium`}>Titre</Text>
                                <TextInput
                                    style={tw`w-full p-4 bg-white/10 rounded-lg mb-4 text-white border border-white/20`}
                                    placeholderTextColor="#a0c4ff"
                                    placeholder="Titre de la tâche"
                                    value={title}
                                    onChangeText={setTitle}
                                />

                                {/* Description de la tâche */}
                                <Text style={tw`text-blue-200 text-base mb-2 font-medium`}>Description (facultatif)</Text>
                                <TextInput
                                    style={tw`w-full p-4 bg-white/10 rounded-lg mb-4 min-h-20 text-white border border-white/20`}
                                    placeholderTextColor="#a0c4ff"
                                    placeholder="Entrez une description détaillée (optionnel)"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    textAlignVertical="top"
                                />

                                {/* Status de complétion */}
                                <TouchableOpacity
                                    style={tw`flex-row items-center mb-4`}
                                    onPress={() => setIsCompleted(!isCompleted)}
                                >
                                    <View style={tw`h-6 w-6 mr-3 border border-white/30 rounded justify-center items-center ${isCompleted ? 'bg-green-500' : 'bg-white/10'}`}>
                                        {isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
                                    </View>
                                    <Text style={tw`text-white`}>Tâche complétée</Text>
                                </TouchableOpacity>

                                {/* Sous-tâches */}
                                <Text style={tw`text-blue-200 text-base mb-2 font-medium`}>Sous-tâches</Text>
                                <View style={tw`mb-4`}>
                                    <View style={tw`flex-row mb-2`}>
                                        <TextInput
                                            style={tw`flex-1 p-3 bg-white/10 rounded-l-lg text-white border-l border-t border-b border-white/20`}
                                            placeholderTextColor="#a0c4ff"
                                            placeholder="Ajouter une sous-tâche"
                                            value={newSubtask}
                                            onChangeText={setNewSubtask}
                                        />
                                        <TouchableOpacity
                                            style={tw`bg-blue-500 p-3 rounded-r-lg justify-center`}
                                            onPress={addSubtask}
                                        >
                                            <Ionicons name="add" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    {subtasks.length > 0 ? (
                                        subtasks.map((subtask, index) => (
                                            <View key={index} style={tw`flex-row items-center p-3 bg-white/5 rounded-lg mb-2 border border-white/10`}>
                                                <TouchableOpacity
                                                    style={tw`mr-3`}
                                                    onPress={() => toggleSubtaskCompletion(index)}
                                                >
                                                    <View style={tw`h-5 w-5 border border-white/30 rounded justify-center items-center ${subtask.is_completed ? 'bg-green-500' : 'bg-white/10'}`}>
                                                        {subtask.is_completed && <Ionicons name="checkmark" size={14} color="white" />}
                                                    </View>
                                                </TouchableOpacity>
                                                <Text style={tw`flex-1 text-white ${subtask.is_completed ? 'line-through text-white/50' : ''}`}>{subtask.description}</Text>
                                                <TouchableOpacity onPress={() => removeSubtask(index)}>
                                                    <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={tw`text-white/50 text-center py-2`}>Aucune sous-tâche</Text>
                                    )}
                                </View>

                                {/* Sélection de note */}
                                <Text style={tw`text-blue-200 text-base mb-2 font-medium`}>Associer à une note</Text>
                                <TouchableOpacity
                                    onPress={() => setDropdownVisible(!dropdownVisible)}
                                    style={tw`bg-white/10 p-4 rounded-lg flex-row items-center justify-between border border-white/20`}
                                >
                                    <Text style={tw`text-white`}>
                                        {selectedNote
                                            ? notes.find(note => note.id === selectedNote)?.title || "Note sélectionnée"
                                            : "Sélectionner une note"}
                                    </Text>
                                    <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="white" />
                                </TouchableOpacity>

                                {dropdownVisible && (
                                    <View style={tw`mt-2 bg-white/10 rounded-lg p-3 max-h-40 border border-white/10`}>
                                        {categoriesLoading ? (
                                            <View style={tw`py-4 items-center`}>
                                                <ActivityIndicator color="#ffffff" />
                                                <Text style={tw`text-white/80 text-sm mt-2`}>Chargement des notes...</Text>
                                            </View>
                                        ) : notes.length === 0 ? (
                                            <View style={tw`py-4 items-center`}>
                                                <Text style={tw`text-white/80 text-base`}>Aucune note disponible</Text>
                                            </View>
                                        ) : (
                                            <FlatList
                                                data={notes}
                                                keyExtractor={(item) => item.id.toString()}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={tw`flex-row items-center p-3 border-b border-white/10`}
                                                        onPress={() => selectNote(item.id)}
                                                    >
                                                        <View style={tw`h-5 w-5 mr-3 bg-white/20 rounded justify-center items-center`}>
                                                            {selectedNote === item.id && (
                                                                <Ionicons name="checkmark" size={16} color="#8cf1b4" />
                                                            )}
                                                        </View>
                                                        <Text style={tw`text-white text-base`}>{item.title}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        )}
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={createTaches}
                                style={tw`bg-blue-500 p-4 rounded-xl items-center shadow-lg mb-6`}
                                disabled={loading}
                            >
                                <Text style={tw`text-white font-bold text-lg`}>Créer la tâche</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </SafeAreaView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}