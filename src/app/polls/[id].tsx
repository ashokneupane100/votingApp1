import { Stack, useLocalSearchParams, router } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Poll, Vote } from "@/src/types/db";
import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";

export default function PollDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userVote, setUserVote] = useState<Vote | null>(null);

  const fetchPoll = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("Polls")
      .select("*")
      .eq("id", id)
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

  const fetchUserVote = async () => {
    // Only fetch user vote if user is authenticated
    if (!user?.id || !id) return;

    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("poll_id", parseInt(id))
      .eq("user_id", user.id)
      .maybeSingle(); // Use maybeSingle since user might not have voted yet

    if (error) {
      console.error("Error fetching user vote:", error);
    } else if (data) {
      setUserVote(data);
      setSelected(data.option); // Set the selected option to what user previously voted
    }
  };

  useEffect(() => {
    fetchPoll();
  }, [id]);

  useEffect(() => {
    // Fetch user vote only when user is authenticated and poll is loaded
    if (isAuthenticated && user?.id && poll?.id) {
      fetchUserVote();
    }
  }, [isAuthenticated, user?.id, poll?.id]);

  const vote = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please sign in with your account to vote on this poll.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/login") },
        ]
      );
      return;
    }

    if (!selected || !poll?.id || !user?.id) {
      Alert.alert("Error", "Please select an option");
      return;
    }

    setVoting(true);

    try {
      const voteData = {
        option: selected,
        poll_id: poll.id,
        user_id: user.id,
        ...(userVote?.id && { id: userVote.id }), // Include ID only if updating existing vote
      };

      console.log("Vote data:", voteData);

      const { data, error } = await supabase
        .from("votes")
        .upsert(voteData)
        .select("*")
        .single();

      if (error) {
        console.error("Error voting:", error);
        Alert.alert("Error", `Failed to vote: ${error.message}`);
      } else {
        console.log("Vote successful:", data);
        setUserVote(data); // Update the local state
        Alert.alert(
          "Success",
          userVote ? "Your vote has been updated!" : "Thank you for voting!"
        );
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
            : "⚠️ Sign in required to vote"}
        </Text>
        {userVote && (
          <Text style={styles.voteStatus}>
            Previously voted for: "{userVote.option}"
          </Text>
        )}
      </View>

      <Text style={styles.question}>{poll.question}</Text>

      <View style={styles.optionsContainer}>
        {poll.options?.map((option, index) => (
          <Pressable
            onPress={() => setSelected(option)}
            style={[
              styles.optionContainer,
              option === selected && styles.selectedOption,
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
          title={voting ? "Voting..." : userVote ? "Update Vote" : "Vote"}
          disabled={!selected || voting}
        />
      ) : (
        <Button onPress={() => router.push("/login")} title="Sign In to Vote" />
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
    justifyContent: "center",
    alignItems: "center",
  },
  authContainer: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  authText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  voteStatus: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
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
