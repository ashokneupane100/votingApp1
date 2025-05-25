import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  Button,
  TextInput,
  Text,
} from "react-native";
import { supabase } from "@/src/lib/supabase";
import { Stack } from "expo-router";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  async function signInWithEmail() {
    setLoading(true);
    setMessage(""); // Clear previous messages

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        showMessage(
          "❌ Invalid email or password. Please check your credentials and try again.",
          "error"
        );
        Alert.alert(
          "Sign In Failed",
          "Invalid email or password. Please check your credentials and try again."
        );
      } else if (error.message.includes("Email not confirmed")) {
        showMessage(
          "📧 Please check your email and click the verification link before signing in.",
          "error"
        );
        Alert.alert(
          "Email Not Verified",
          "Please check your email and click the verification link before signing in."
        );
      } else {
        showMessage(`❌ Sign in failed: ${error.message}`, "error");
        Alert.alert("Sign In Error", error.message);
      }
    } else {
      showMessage("✅ Successfully signed in!", "success");
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    setMessage(""); // Clear previous messages

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.log("Sign up error:", error);

        if (
          error.message.includes("User already registered") ||
          error.message.includes("already registered") ||
          error.status === 422
        ) {
          const userMessage = `🚫 Account Already Exists!\n\nA user with the email "${email}" has already been registered.\n\nPlease try signing in instead or use a different email address.`;
          showMessage(userMessage, "error");

          // Also show the native alert
          Alert.alert(
            "Account Already Exists",
            `A user with the email "${email}" has already been registered. Please try signing in instead or use a different email address.`,
            [{ text: "OK", style: "default" }]
          );
        } else if (error.message.includes("Password should be at least")) {
          showMessage(
            "🔒 Password should be at least 6 characters long.",
            "error"
          );
          Alert.alert(
            "Weak Password",
            "Password should be at least 6 characters long."
          );
        } else if (error.message.includes("Unable to validate email address")) {
          showMessage("📧 Please enter a valid email address.", "error");
          Alert.alert("Invalid Email", "Please enter a valid email address.");
        } else {
          showMessage(`❌ Sign up failed: ${error.message}`, "error");
          Alert.alert("Sign Up Error", error.message);
        }
      } else if (!session) {
        showMessage(
          "📧 Check your email! We sent you a verification link to activate your account.",
          "success"
        );
        Alert.alert(
          "Verification Required",
          "Please check your inbox for email verification! Click the link in the email to activate your account."
        );
      } else {
        showMessage("🎉 Account created successfully! Welcome!", "success");
      }
    } catch (err) {
      console.error("Unexpected error during sign up:", err);
      showMessage(
        "❌ An unexpected error occurred. Please try again.",
        "error"
      );
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "oh man" }} />
      <Text style={styles.title}>Sign in or Create an account:</Text>

      {/* ON-SCREEN MESSAGE FOR USERS */}
      {message !== "" && (
        <View
          style={[
            styles.messageContainer,
            messageType === "error"
              ? styles.errorMessage
              : styles.successMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              messageType === "error" ? styles.errorText : styles.successText,
            ]}
          >
            {message}
          </Text>
        </View>
      )}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          style={styles.input}
          placeholder="email@address.com"
          autoCapitalize={"none"}
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          style={styles.input}
          secureTextEntry={true}
          placeholder="Password (min. 6 characters)"
          autoCapitalize={"none"}
          autoComplete="password"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? "Signing in..." : "Sign in"}
          disabled={loading}
          onPress={() => signInWithEmail()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title={loading ? "Creating account..." : "Sign up"}
          disabled={loading}
          onPress={() => signUpWithEmail()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
  },
  messageContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  errorMessage: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  successMessage: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  messageText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    color: "#DC2626",
  },
  successText: {
    color: "#16A34A",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
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
});
