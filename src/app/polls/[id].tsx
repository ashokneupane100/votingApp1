import { useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

const poll = {
  question: "React Native vs Flutter ?",
  options: ["React Native FTW", "Flutter", "SwiftUI"],
};

export default function PollDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{poll.question}</Text>

      <View style={{gap:5}}>
        {poll.options.map((option) => (
          <View style={styles.optionContainer} key={option}>
            <Text>{option}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap:20,
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: "dimgray",
  },
  optionContainer: {
    backgroundColor: "white",
    padding:10,
    borderRadius: 5,

  },
});
