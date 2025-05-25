import { AntDesign } from "@expo/vector-icons";
import { Link, router, Stack } from "expo-router";
import { FlatList, StyleSheet, Text } from "react-native";

// Sample data (unchanged)
const polls = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

export default function Page() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Polls",
          headerRight: () => (
            <AntDesign
              onPress={() => router.push("/polls/new")}
              name="plus"
              size={30}
              style={{ color: "blue", marginRight: 20 }} // Fixed: Removed quotes around marginRight value
            />
          ),
        }} // Fixed: Removed extra comma
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