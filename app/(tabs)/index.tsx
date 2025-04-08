import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";

interface Category {
  id: number;
  name: string;
}

interface Notes {
  id: number;
  title: string;
  content: string;
  categories: Category[];
  created_at: Date;
}

const apiUrl = "https://keep.kevindupas.com/api/notes";

export default function Index() {
  const [notes, setNotes] = useState<Notes[]>([]);
  const { userToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    console.log("Fetching notes...");

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
      setNotes(result.data || []);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les rappels.");
    } finally {
      setLoading(false);
    }
  };
  const goToAddNote = () => {
    router.push("./notes/create");
  };


  return (
    <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1 px-6 pt-6`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-white text-xl font-bold`}>Mes Notes</Text>
          <TouchableOpacity
            onPress={loading ? undefined : fetchNotes}
            style={tw`p-2 bg-white/20 rounded-full ${loading ? "opacity-50" : ""}`}
            disabled={loading}
          >
            <Ionicons name="reload-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToAddNote}
            style={tw`p-2 bg-white/20 rounded-full ${loading ? "opacity-50" : ""}`}
            disabled={loading}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" style={tw`mt-10`} />
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={tw`bg-white/20 p-4 rounded-lg mb-2`}>
                <Text style={tw`text-white text-lg font-medium`}>{item.title}</Text>
                <Text style={tw`text-blue-100 text-sm`}>{item.content.replace(/<[^>]+>/g, '')}</Text>
                <Text style={tw`text-blue-200 text-xs mt-2`}>ID : {item.id}</Text>
                <Text style={tw`text-blue-200 text-xs`}>Créé le : {new Date(item.created_at).toLocaleDateString()}</Text>
                {item.categories?.length > 0 && (
                  <View>
                    <Text style={tw`text-blue-200 text-xs`}>Catégories :</Text>
                    {item.categories.map((category) => (
                      <Text key={category.id} style={tw`text-blue-300 text-xs`}>
                        - {category.name}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
