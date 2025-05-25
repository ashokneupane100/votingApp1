import { AntDesign } from "@expo/vector-icons";
import { Link, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import {Poll} from "../types/db"


export default function HomeScreen() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("Polls")
      .select("*")
      .order('created_at', { ascending: false });
    
    setPolls(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Polls App",
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
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={fetchPolls}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Link style={styles.pollContainer} href={`/polls/${item.id}`}>
            <Text style={styles.pollTitle}>
               {item.question}
            </Text>
          </Link>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "Loading..." : "No polls yet"}
          </Text>
        }
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
  pollContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
  },
  pollTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 50,
  },
});