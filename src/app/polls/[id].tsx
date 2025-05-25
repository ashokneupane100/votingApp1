import { Stack, useLocalSearchParams, router } from "expo-router";
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();

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
    // Check if user is properly authenticated (not anonymous)
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required", 
        "Please sign in with your account to vote on this poll.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/login") }
        ]
      );
      return;
    }

    if (!selected || !poll?.id) {
      Alert.alert("Error", "Please select an option");
      return;
    }

    console.log("Voting with authenticated user:");
    console.log("- User ID:", user?.id);
    console.log("- Is Anonymous:", user?.is_anonymous);
    console.log("- Is Authenticated:", isAuthenticated);
    console.log("- Selected option:", selected);
    console.log("- Poll ID:", poll.id);

    setVoting(true);

    try {
      // Check if user already voted on this poll
      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('user_id', user!.id)
        .maybeSingle();

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
        poll_id: parseInt(String(poll.id)),
        user_id: user!.id
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
        // Optionally redirect to results or refresh
      }
    } catch (err) {
      console.error("Unexpected voting error:", err);
      Alert.alert("Error", "An unexpected error occurred while voting");
    } finally {
      setVoting(false);
    }
  };

  // Show loading while auth is being determined
  if (authLoading || loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
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
      
      {/* Authentication Status */}
      <View style={styles.authContainer}>
        <Text style={styles.authText}>
          {isAuthenticated 
            ? `✅ Signed in as: ${user?.email || user?.id}` 
            : "⚠️ Sign in required to vote"
          }
        </Text>
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
      
      {isAuthenticated ? (
        <Button 
          onPress={vote} 
          title={voting ? "Voting..." : "Vote"} 
          disabled={!selected || voting} 
        />
      ) : (
        <Button 
          onPress={() => router.push("/login")} 
          title="Sign In to Vote" 
        />
      )}
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
  authContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  authText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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