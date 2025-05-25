import { AntDesign } from "@expo/vector-icons";
import { Link, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";

interface Poll {
  id: number;
  question: string;
  created_at: string;
}

export default function HomeScreen() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching polls...");

        const { data, error } = await supabase
          .from("Polls") 
          .select("*")
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          setError(`Failed to fetch polls: ${error.message}`);
          Alert.alert("Error", `Failed to fetch polls: ${error.message}`);
          return;
        }

        console.log("Polls fetched successfully:", data);
        setPolls(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
        Alert.alert("Error", "An unexpected error occurred while fetching polls");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const renderPollItem = ({ item }: { item: Poll }) => (
    <Link style={styles.pollContainer} href={`/polls/${item.id}`}>
      <Text style={styles.pollTitle}>
        {item.id}. {item.question || "Untitled Poll"}
      </Text>
    </Link>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading ? "Loading polls..." : error ? "Failed to load polls" : "No polls available"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Poll App Made by Ashok Neupane",
          headerRight: () => (
            <AntDesign
              onPress={() => router.push("/polls/new")}
              name="plus"
              size={30}
              style={{ color: "blue", marginRight: 20 }}
            />
          ),

             headerLeft: () => (
            <AntDesign
              onPress={() => router.push("/profile")}
              name="user"
              size={30}
              style={{ color: "blue", marginLeft: 5 }}
            />
          ),


        }}
      />

      <FlatList
        data={polls}
        renderItem={renderPollItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          polls.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={loading}
        onRefresh={() => {
          // Re-run the fetch function
          const fetchPolls = async () => {
            try {
              setLoading(true);
              setError(null);
              
              const { data, error } = await supabase
                .from("Polls") 
                .select("*")
                .order('created_at', { ascending: false });

              if (error) {
                setError(`Failed to fetch polls: ${error.message}`);
                Alert.alert("Error", `Failed to fetch polls: ${error.message}`);
                return;
              }

              setPolls(data || []);
            } catch (err) {
              setError("An unexpected error occurred");
              Alert.alert("Error", "An unexpected error occurred while fetching polls");
            } finally {
              setLoading(false);
            }
          };

          fetchPolls();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gainsboro",
  },
  listContainer: {
    padding: 10,
    gap: 5,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  pollTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
});