import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet, Pressable, Button, ActivityIndicator, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Poll } from "@/src/types/db";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";

export default function PollDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const { user } = useAuth();

  const fetchPoll = async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("Polls")
      .select("*")
      .eq('id', id)
      .single(); 
    
    if (error) {
      console.error("Error fetching poll:", error);
      Alert.alert("Error", "Failed to load poll");
    } else {
      console.log("Fetched poll:", data); // Debug log
      setPoll(data);
      if (data?.options && data.options.length > 0) {
        setSelected(data.options[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const vote = async () => {
    if (!user) {
      Alert.alert("Authentication Required", "Please sign in to vote");
      return;
    }

    if (!selected || !poll?.id) {
      Alert.alert("Error", "Please select an option");
      return;
    }

    // Debug logs
    console.log("Voting with data:");
    console.log("- poll.id:", poll.id, "type:", typeof poll.id);
    console.log("- user.id:", user.id, "type:", typeof user.id);
    console.log("- selected:", selected, "type:", typeof selected);

    setVoting(true);

    try {
      // Check if user already voted on this poll
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single

      if (checkError) {
        console.error("Error checking existing vote:", checkError);
      }

      if (existingVote) {
        Alert.alert("Already Voted", "You have already voted on this poll");
        setVoting(false);
        return;
      }

      // Prepare vote data
      const voteData = {
        option: selected,
        poll_id: parseInt(String(poll.id)), // Ensure it's a number
        user_id: user.id
      };

      console.log("Inserting vote data:", voteData);

      // Cast the vote
      const { data, error } = await supabase
        .from('votes')
        .insert(voteData)
        .select();

      if (error) {
        console.error("Voting error details:", error);
        Alert.alert("Error", `Failed to cast vote: ${error.message}`);
      } else {
        console.log("Vote successful:", data);
        Alert.alert("Success", "Thank you for voting!");
      }
    } catch (err) {
      console.error("Unexpected voting error:", err);
      Alert.alert("Error", "An unexpected error occurred while voting");
    } finally {
      setVoting(false);
    }
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

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Please sign in to vote on this poll</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Poll Voting" }} />
      
      {/* Debug Info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>Debug Info:</Text>
        <Text style={styles.debugText}>Poll ID: {poll.id} ({typeof poll.id})</Text>
        <Text style={styles.debugText}>User ID: {user.id} ({typeof user.id})</Text>
        <Text style={styles.debugText}>Selected: {selected}</Text>
      </View>

      <Text style={styles.question}>{poll.question}</Text>

      <View style={styles.optionsContainer}>
        {poll.options?.map((option, index) => (
          <Pressable 
            onPress={() => setSelected(option)} 
            style={[
              styles.optionContainer,
              option === selected && styles.selectedOption
            ]} 
            key={`${option}-${index}`}
          >
            <Feather 
              name={option === selected ? "check-circle" : "circle"} 
              size={18} 
              color={option === selected ? "green" : "gray"} 
            />
            <Text style={option === selected ? styles.selectedText : undefined}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
      
      <Button 
        onPress={vote} 
        title={voting ? "Voting..." : "Vote"} 
        disabled={!selected || voting} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
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
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedOption: {
    borderColor: "green",
    backgroundColor: "#f0f9f0",
  },
  selectedText: {
    color: "green",
    fontWeight: "500",
  },
});