import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet, Pressable, Button, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Poll } from "@/src/types/db";
import { supabase } from "@/src/lib/supabase";

export default function PollDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null); // Fixed: single poll, not array
  const [selected, setSelected] = useState<string>(""); // Fixed: empty string initially
  const [loading, setLoading] = useState(true); // Fixed: start with true

  const fetchPoll = async () => { // Fixed: renamed to fetchPoll (singular)
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("Polls")
      .select("*")
      .eq('id', id)
      .single(); 
    
    if (error) {
      console.error("Error fetching poll:", error);
    } else {
      setPoll(data);
      // Set first option as default selection
      if (data?.options && data.options.length > 0) {
        setSelected(data.options[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPoll();
  }, [id]); // Fixed: added id as dependency

  const vote = () => {
    console.log("Vote:", selected);
    // TODO: Implement voting logic
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text>Loading poll...</Text>
      </View>
    );
  }

  if (!poll) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Poll not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Poll Voting" }} />
      <Text style={styles.question}>{poll.question}</Text>

      <View style={styles.optionsContainer}>
        {poll.options?.map((option, index) => ( // Fixed: added optional chaining and index
          <Pressable 
            onPress={() => setSelected(option)} 
            style={styles.optionContainer} 
            key={`${option}-${index}`} // Fixed: better key using index
          >
            <Feather 
              name={option === selected ? "check-circle" : "circle"} 
              size={18} 
              color={option === selected ? "green" : "gray"} 
            />
            <Text>{option}</Text>
          </Pressable>
        ))}
      </View>
      <Button onPress={vote} title="Vote" disabled={!selected} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 20,
  },
  centered: { // Added: centering style for loading/error states
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: "dimgray",
  },
  optionsContainer: {
    gap: 5,
  },
  optionContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});