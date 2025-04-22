import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { API } from "@/constants/config";

interface Subtask {
    id: number;
    description: string;
    is_completed: boolean;
}

interface Note {
    id: number;
    title: string;
}

interface Task {
    id: number;
    description: string;
    is_completed: boolean;
    user_id: number;
    note_id: number;
    subtasks: Subtask[];
    created_at: string;
    updated_at: string;
    note: Note;
}

export default function TacheDetails() {
    const { id } = useLocalSearchParams();
    const { userToken } = useAuth();

    const [task, setTask] = useState<Task | null>(null);
    const [description, setDescription] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadTask();
    }, []);

    const loadTask = async () => {
        if (!userToken || !id) return;

        try {
            const response = await fetch(`${API.TASKS}/${id}`, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Erreur de chargement");

            const { data } = await response.json();
            setTask(data);
            setDescription(data.description);
            setIsCompleted(data.is_completed);
            setNoteTitle(data.note?.title || "");
            setSubtasks(data.subtasks || []);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de charger la tâche");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!description.trim()) {
            Alert.alert("Erreur", "La description ne peut pas être vide");
            return;
        }

        setIsSaving(true);
        try {
            const taskData = {
                description,
                is_completed: isCompleted,
                note: {
                    title: noteTitle
                },
                subtasks: subtasks
            };

            const response = await fetch(`${API.TASKS}/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) throw new Error("Erreur de sauvegarde");

            Alert.alert("Succès", "Tâche mise à jour", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de sauvegarder la tâche");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Confirmation",
            "Voulez-vous vraiment supprimer cette tâche ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API.TASKS}/${id}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${userToken}`,
                                    "Content-Type": "application/json"
                                }
                            });

                            if (!response.ok) throw new Error("Erreur de suppression");

                            Alert.alert("Tâche supprimée", "", [
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

    const addSubtask = () => {
        if (!newSubtask.trim()) return;

        const newSubtaskObj: Subtask = {
            id: Date.now(), // Temporary ID for frontend use
            description: newSubtask,
            is_completed: false
        };

        setSubtasks([...subtasks, newSubtaskObj]);
        setNewSubtask("");
    };

    const toggleSubtaskCompletion = (subtaskId: number) => {
        setSubtasks(subtasks.map(subtask =>
            subtask.id === subtaskId
                ? { ...subtask, is_completed: !subtask.is_completed }
                : subtask
        ));
    };

    const removeSubtask = (subtaskId: number) => {
        setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
    };

    if (loading) {
        return (
            <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={tw`flex-1`}>
                <SafeAreaView style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={tw`text-white/70 mt-4`}>Chargement de la tâche...</Text>
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
                    <Text style={tw`text-white text-xl font-bold`}>Modifier la tâche</Text>
                    <TouchableOpacity
                        onPress={handleDelete}
                        style={tw`p-2.5 bg-red-500/70 rounded-full shadow-md`}
                    >
                        <Ionicons name="trash-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={tw`flex-1`}>
                    <View style={tw`bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/10 mb-4`}>
                        {/* Note Title */}
                        <Text style={tw`text-white text-base mb-2 font-medium`}>Titre de la note</Text>
                        <TextInput
                            style={tw`bg-white/20 text-white p-4 rounded-lg mb-6 shadow-sm border border-white/10`}
                            value={noteTitle}
                            onChangeText={setNoteTitle}
                            placeholder="Titre de la note"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />

                        {/* Task Description */}
                        <Text style={tw`text-white text-base mb-2 font-medium`}>Description</Text>
                        <TextInput
                            style={tw`bg-white/20 text-white p-4 rounded-lg mb-6 shadow-sm border border-white/10`}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Description de la tâche"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />

                        {/* Completion Status */}
                        <View style={tw`flex-row items-center justify-between mb-6 bg-white/10 p-4 rounded-lg`}>
                            <Text style={tw`text-white text-base font-medium`}>Tâche terminée</Text>
                            <Switch
                                value={isCompleted}
                                onValueChange={setIsCompleted}
                                trackColor={{ false: "#767577", true: "#4facfe" }}
                                thumbColor={isCompleted ? "#ffffff" : "#f4f3f4"}
                            />
                        </View>

                        {/* Subtasks Section */}
                        <Text style={tw`text-white text-lg mb-4 font-bold`}>Sous-tâches</Text>

                        {/* Add New Subtask */}
                        <View style={tw`flex-row mb-4`}>
                            <TextInput
                                style={tw`flex-1 bg-white/20 text-white p-4 rounded-l-lg shadow-sm border border-white/10`}
                                value={newSubtask}
                                onChangeText={setNewSubtask}
                                placeholder="Nouvelle sous-tâche"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                            />
                            <TouchableOpacity
                                onPress={addSubtask}
                                style={tw`bg-blue-500 justify-center items-center px-4 rounded-r-lg`}
                            >
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Subtasks List */}
                        {subtasks.length > 0 ? (
                            <View style={tw`bg-white/5 rounded-lg p-4 border border-white/5`}>
                                {subtasks.map((subtask, index) => (
                                    <View key={subtask.id} style={tw`flex-row items-center justify-between mb-3 ${index !== subtasks.length - 1 ? 'border-b border-white/10 pb-3' : ''}`}>
                                        <TouchableOpacity
                                            onPress={() => toggleSubtaskCompletion(subtask.id)}
                                            style={tw`flex-row items-center flex-1 mr-2`}
                                        >
                                            <Ionicons
                                                name={subtask.is_completed ? "checkmark-circle" : "ellipse-outline"}
                                                size={24}
                                                color={subtask.is_completed ? "#8cf1b4" : "#a0c4ff"}
                                            />
                                            <Text style={tw`text-white ml-3 ${subtask.is_completed ? 'line-through opacity-60' : ''}`}>
                                                {subtask.description}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeSubtask(subtask.id)}>
                                            <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={tw`bg-white/5 rounded-lg p-6 items-center border border-white/5`}>
                                <Ionicons name="list" size={40} color="rgba(255,255,255,0.2)" />
                                <Text style={tw`text-white/60 mt-2 text-center`}>Aucune sous-tâche</Text>
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