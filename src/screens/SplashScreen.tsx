import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  runOnJS
} from "react-native-reanimated";
import { useTheme } from "react-native-paper";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withDelay(1500, withTiming(0, { duration: 500 }, (finished) => {
            if (finished) {
                runOnJS(onFinish)();
            }
        }))
    );
    scale.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withDelay(1500, withTiming(1.2, { duration: 500 }))
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.Image
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require("../../assets/logo.png")}
        style={[styles.logo, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: Dimensions.get("window").width * 0.6,
    height: Dimensions.get("window").width * 0.6,
  },
});
