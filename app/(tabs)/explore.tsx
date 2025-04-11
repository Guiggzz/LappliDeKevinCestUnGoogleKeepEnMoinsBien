import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Alert, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";

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

const apiUrl = "https://keep.kevindupas.com/api/tasks";

export default function Explore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { userToken, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Fetch tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, [userToken]);

  const fetchTasks = async () => {
    console.log("Fetching tasks...");

    if (!userToken) {
      Alert.alert("Erreur", "Token non disponible.");
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": "application/json"
        }
      });

      const result = await response.json();
      if (result.data) {
        setTasks(result.data);
      } else {
        setTasks([]);
        console.log("No tasks found or unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Erreur", "Impossible de récupérer les notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text) {
      const filtered = tasks.filter(task =>
        task.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }
  const goToAddTask = () => {
    router.push("/taches/createTaches");
  };

  interface DateFormatter {
    (dateString: string): string;
  }

  const formatDate: DateFormatter = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return "Date inconnue";
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>

      <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={tw`flex-1`}>
        <SafeAreaView style={tw`flex-1 px-6 pt-6`}>
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <Text style={tw`text-white text-2xl font-bold`}>Mes Tâches</Text>
            <TextInput
              style={tw`bg-white/10 text-white rounded-full px-4 py-2`}
              placeholder="Rechercher..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={search}
              onChangeText={handleSearch}
            />
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                onPress={loading ? undefined : fetchTasks}
                style={tw`p-2.5 bg-white/20 rounded-full ${loading ? "opacity-50" : ""} shadow-md`}
                disabled={loading}
              >
                <Ionicons name="reload-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToAddTask}
                style={tw`p-2.5 bg-blue-500 rounded-full shadow-lg ${loading ? "opacity-50" : ""}`}
                disabled={loading}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
                    { text: "Annuler", style: "cancel" },
                    { text: "Oui", onPress: signOut }
                  ]);
                }}
                style={tw`p-2.5 bg-red-500/70 rounded-full shadow-md`}
              >
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={tw`flex-1 justify-center items-center`}>
              <ActivityIndicator size="large" color="#ffffff" style={tw`mb-4`} />
              <Text style={tw`text-white/80 text-base`}>Chargement des tâches...</Text>
            </View>
          ) : tasks.length === 0 ? (
            <View style={tw`flex-1 items-center justify-center`}>
              <Ionicons name="checkbox-outline" size={70} color="rgba(255,255,255,0.2)" />
              <Text style={tw`text-white text-lg font-medium mt-4 mb-2`}>Aucune tâche disponible</Text>
              <TouchableOpacity
                onPress={fetchTasks}
                style={tw`mt-2 px-6 py-3 bg-blue-500 rounded-full shadow-lg`}
              >
                <Text style={tw`text-white font-medium`}>Rafraîchir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={tw`pb-20`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/taches/${item.id}`)}
                  style={tw`mb-4 overflow-hidden rounded-xl shadow-lg`}
                >
                  <LinearGradient
                    colors={item.is_completed ? ["#43cea2", "#185a9d"] : ["#4facfe", "#00f2fe"]}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={tw`absolute inset-0 opacity-10`}
                  />
                  <View style={tw`bg-white/10 backdrop-blur-md p-5 border border-white/10`}>
                    {item.note && (
                      <Text style={tw`text-white text-lg font-bold mb-2`}>
                        {item.note.title}
                      </Text>
                    )}
                    <Text style={tw`text-blue-100 text-base mb-3`}>{item.description}</Text>

                    <View style={tw`flex-row justify-between items-center mb-3`}>
                      <View style={tw`${item.is_completed ? 'bg-green-500/40' : 'bg-blue-500/40'} px-3 py-1 rounded-full`}>
                        <Text style={tw`text-white text-xs font-medium`}>
                          {item.is_completed ? "Terminé" : "En cours"}
                        </Text>
                      </View>
                      <Text style={tw`text-blue-200 text-sm`}>
                        {formatDate(item.created_at)}
                      </Text>
                    </View>

                    {item.subtasks && item.subtasks.length > 0 && (
                      <View style={tw`mt-1 p-3 bg-white/5 rounded-lg border border-white/5`}>
                        <Text style={tw`text-blue-200 text-sm mb-2 font-medium`}>Sous-tâches:</Text>
                        {item.subtasks.map((subtask, subtaskIndex) => (
                          <View
                            // Use a combination of task ID and subtask index or ID to ensure uniqueness
                            key={`task-${item.id}-subtask-${subtask.id || subtaskIndex}`}
                            style={tw`flex-row items-center mb-2`}
                          >
                            <Ionicons
                              name={subtask.is_completed ? "checkmark-circle" : "ellipse-outline"}
                              size={18}
                              color={subtask.is_completed ? "#8cf1b4" : "#a0c4ff"}
                            />
                            <Text style={tw`text-blue-100 text-sm ml-2 ${subtask.is_completed ? 'opacity-70' : ''}`}>
                              {subtask.description}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity
            onPress={goToAddTask}
            style={tw`absolute right-6 bottom-25 bg-blue-500 rounded-full p-4 shadow-lg`}
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}