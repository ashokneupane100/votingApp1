import { AntDesign } from "@expo/vector-icons";
import { Link, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { supabase } from "../lib/supabase";

export default function HomeScreen() {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const fetchPolls = async () => {
      console.log("fetching....");

      let { data: polls, error } = await supabase
        .from("Polls") 
        .select("*");

      if (error) {
        console.error("Error fetching polls:", error);
        return;
      }

      if (polls) {
        setPolls(polls);
      }
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
              {item.id}. Example Poll Question
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