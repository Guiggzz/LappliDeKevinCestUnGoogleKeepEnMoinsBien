import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Alert, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { API } from "@/constants/config";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Notes {
  id: number;
  title: string;
  content: string;
  categories: Category[];
  created_at: Date;
}


export default function Index() {
  const [notes, setNotes] = useState<Notes[]>([]);
  const { userToken, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Notes[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Initialize filteredNotes whenever notes change
  useEffect(() => {
    setFilteredNotes(notes);

    // Extract all unique categories from notes
    if (notes.length > 0) {
      const categories = notes
        .flatMap(note => note.categories || [])
        .filter((category, index, self) =>
          index === self.findIndex((c) => c.id === category.id)
        );
      setAllCategories(categories);
    }
  }, [notes]);

  const fetchNotes = async () => {
    console.log("Fetching notes...");

    if (!userToken) {
      Alert.alert("Erreur", "Token non disponible.");
      return;
    }

    if (loading) return;
    console.log("apiCreateNote : ", API.NOTES);

    setLoading(true);
    try {
      const response = await fetch(API.NOTES, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": "application/json"
        }
      });
      const result = await response.json();
      setNotes(result.data || []);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les notes.");
    } finally {
      setLoading(false);
    }
  };

  const goToAddNote = () => {
    router.push("/notes/create");
  };

  // Filter notes by both search text and selected categories
  const filterNotes = () => {
    let filtered = notes;

    // Filter by search text
    if (search) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(note =>
        note.categories && note.categories.some(category =>
          selectedCategories.includes(category.id)
        )
      );
    }

    setFilteredNotes(filtered);
  };

  // Update filters when search text or selected categories change
  useEffect(() => {
    filterNotes();
  }, [search, selectedCategories, notes]);

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const toggleCategoryFilter = (categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
  };

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={tw`flex-1`}
    >
      <SafeAreaView style={tw`flex-1 px-6 pt-6`}>
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <Text style={tw`text-white text-2xl font-bold`}>Mes Notes</Text>
          <View style={tw`flex-1 mx-4`}>
          </View>
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              onPress={loading ? undefined : fetchNotes}
              style={tw`p-2.5 bg-white/20 rounded-full ${loading ? "opacity-50" : ""} shadow-md`}
              disabled={loading}
            >
              <Ionicons name="reload-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToAddNote}
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

        {/* Search input */}
        <TextInput
          placeholder="Rechercher..."
          placeholderTextColor="#ffffff"
          value={search}
          onChangeText={handleSearch}
          style={tw`bg-white/10 text-white rounded-full px-4 py-2 mb-2`}
        />

        {/* Category filters */}
        {allCategories.length > 0 && (
          <View style={tw`mb-4`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={tw`text-white text-base`}>Filtrer par catégorie:</Text>
              {selectedCategories.length > 0 && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={tw`text-blue-300 text-sm`}>Effacer les filtres</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`py-1`}
            >
              {allCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => toggleCategoryFilter(category.id)}
                  style={{
                    backgroundColor: selectedCategories.includes(category.id)
                      ? `${category.color}`
                      : `${category.color}80`,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 8,
                    borderWidth: selectedCategories.includes(category.id) ? 2 : 0,
                    borderColor: 'white',
                  }}
                >
                  <Text style={tw`text-white text-xs`}>
                    {category.name}
                    {selectedCategories.includes(category.id) && " ✓"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {loading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#ffffff" style={tw`mb-4`} />
            <Text style={tw`text-white/80 text-base`}>Chargement des notes...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-20`}
            ListEmptyComponent={() => (
              <View style={tw`flex-1 justify-center items-center py-20`}>
                <Text style={tw`text-white/80 text-lg`}>
                  {search || selectedCategories.length > 0
                    ? "Aucune note correspondant aux filtres"
                    : "Aucune note disponible"}
                </Text>
                {(search || selectedCategories.length > 0) && (
                  <TouchableOpacity
                    onPress={clearFilters}
                    style={tw`mt-4 bg-blue-500/50 px-6 py-2 rounded-full`}
                  >
                    <Text style={tw`text-white`}>Effacer les filtres</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/notes/${item.id}`)}
                style={tw`mb-4 overflow-hidden rounded-xl shadow-lg`}
              >
                <LinearGradient
                  colors={["#4facfe", "#00f2fe"]}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={tw`absolute inset-0 opacity-10`}
                />
                <View style={tw`bg-white/10 backdrop-blur-md p-5 border border-white/10`}>
                  <Text style={tw`text-white text-xl font-bold mb-2`}>{item.title}</Text>
                  <Text style={tw`text-blue-100 text-base mb-3`}>{item.content.replace(/<[^>]+>/g, '')}</Text>

                  <View style={tw`flex-row justify-between items-center mb-2`}>
                    <Text style={tw`text-blue-200 text-sm`}>
                      {new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>

                  {item.categories?.length > 0 && (
                    <View style={tw`mt-2`}>
                      <View style={tw`flex-row flex-wrap gap-2 mt-1`}>
                        {item.categories.map((category) => (
                          <View key={category.id}
                            style={{
                              backgroundColor: category.color ? `${category.color}80` : '#2196F380',
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 20,
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginRight: 8,
                              marginBottom: 8
                            }}>
                            <Text style={tw`text-white text-xs`}>
                              {category.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity
          onPress={goToAddNote}
          style={tw`absolute right-6 bottom-25 bg-blue-500 rounded-full p-4 shadow-lg`}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}