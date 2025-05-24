import { Stack } from "expo-router";
import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Button } from "react-native";

export default function CreatePoll() {
  const[question,setQuestion] = useState("")


  const createPoll = () => {
    console.log("Creating poll...");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Create Poll" }} />
      
      <View style={styles.section}>
        <Text style={styles.label}>Poll Title</Text>
        <TextInput 
          value={question}
          onChangeText={setQuestion}
          placeholder="Type your question here" 
          style={styles.input}
          multiline
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Answer Options</Text>
        <View style={styles.optionsContainer}>
          <TextInput 
            placeholder="First option" 
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput 
            placeholder="Second option" 
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
      <Button onPress={createPoll} title="Create Poll" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionsContainer: {
    gap: 12,
  },
});