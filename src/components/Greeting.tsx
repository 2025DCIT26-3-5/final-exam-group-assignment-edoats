import React from "react";
import { Text, StyleSheet } from "react-native";

interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps) {
  return <Text style={styles.greeting}>Kamote, {name}!</Text>;
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 32,
    color: "#ec261cff",
    marginBottom: 10,
  },
});
