import { AntDesign } from "@expo/vector-icons";
import { Link, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text } from "react-native";
import { supabase } from "../lib/supabase";

export default function HomeScreen() {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    // Optional: Ensure Supabase client is only used on the client side (to avoid SSR issues)
    if (!supabase) return;

    const fetchPolls = async () => {
      console.log("fetching....");

      let { data, error } = await supabase
        .from("Polls") // Ensure this matches your Supabase table name (case-sensitive)
        .select("*");

      if (error) {
        Alert.alert("Error", "Error fetching data: " + error.message);
        return;
      }

      console.log(data);
      setPolls(data || []); // Ensure data is an array, fallback to empty array if null
    };

    fetchPolls(); // Call the async function
  }, []); // Empty dependency array to run once on mount

  return (
    <>
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
        }}
      />

      <FlatList
        data={polls}
        contentContainerStyle={styles.container}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link style={styles.pollContainer} href={`/polls/${item.id}`}>
            <Text style={styles.pollTitle}>
              {item.id}. {item.question || "Example Poll Question"}
            </Text>
          </Link>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gainsboro",
    padding: 10,
    gap: 5,
  },
  pollContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  pollTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
});