import { router, Stack } from "expo-router";
import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Button, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const[error,setError] = useState("")

  const createPoll =async () => {
    setError("")
    if(!question){
      setError("Please enter a question")
    }
    const validOptions=options.filter(o=>!!o);
    if(validOptions.length<2){
      setError("Please enter at least two valid options");
      return;
    }

const { data, error } = await supabase
  .from('Polls')
  .insert([
    { question, options:validOptions },
  ])
  .select()

if (error) {
  Alert.alert("Failed to create the poll");
  console.log(error);
  return;
}

router.back();

          
          



    
  };

  const removeOption = (indexToRemove: number) => {
    // Prevent removing if there are only 2 options (minimum required)
    if (options.length <= 2) {
      return;
    }
    
    const updated = options.filter((_, index) => index !== indexToRemove);
    setOptions(updated);
  };

  const updateOption = (index: number, text: string) => {
    const updated = [...options];
    updated[index] = text;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, ""]);
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
          {options.map((option, index) => (
            <View key={`option-${index}`} style={styles.optionWrapper}>
              <TextInput
                value={option}
                onChangeText={(text) => updateOption(index, text)}
                placeholder={`Option ${index + 1}`}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
              {options.length > 2 && (
                <Feather
                  name="x"
                  size={18}
                  color="gray"
                  onPress={() => removeOption(index)}
                  style={styles.removeButton}
                />
              )}
            </View>
          ))}

          <Button
            title="Add Option"
            onPress={addOption}
          />
        </View>
      </View>
      
      <Button onPress={createPoll} title="Create Poll" />
      <Text style={{color:"crimson"}}>{error}</Text>
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
  optionWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  removeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -9, // Half of icon size to center it
  },
});