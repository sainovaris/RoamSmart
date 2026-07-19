import { Link } from "expo-router";
import {
  View,
  Text,
  Pressable,
  Image,
  LogBox,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

LogBox.ignoreLogs(["Unable to activate keep awake"]);

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-[#7d391e]" style={styles.safeArea}>
      <View className="flex-1 justify-center items-center px-6" style={styles.content}>
        <View className="bg-white/10 px-3 py-1 rounded-full mb-6" style={styles.badge}>
          <Text
            className="text-[#f8d9c6] text-xs font-semibold tracking-widest"
            style={styles.badgeText}
          >
            TRAVEL LIKE A LOCAL
          </Text>
        </View>

        <Image
          source={require("./../assets/apps-imgs/logo.jpg")}
          style={{ width: 90, height: 90, borderRadius: 18 }}
          resizeMode="contain"
        />

        <Text
          className="text-[#EAEAEA] text-4xl font-extrabold mt-4 mb-2"
          style={styles.title}
        >
          Bindaas
        </Text>

        <Text
          className="text-[#EAEAEA] text-base text-center mb-10 opacity-80 max-w-sm"
          style={styles.subtitle}
        >
          Discover authentic stays, local favorites, and journeys worth
          remembering.
        </Text>

        <Link href="/homestays" asChild>
          <Pressable
            className="bg-[#d05203] w-full py-4 rounded-xl shadow-lg active:opacity-80"
            style={styles.primaryButton}
          >
            <Text
              className="text-white text-center text-lg font-semibold"
              style={styles.primaryButtonText}
            >
              Explore Homestays
            </Text>
          </Pressable>
        </Link>

        <Link href="/map" asChild>
          <Pressable
            className="border border-[#f4c9ae] w-full py-4 rounded-xl mt-4 active:opacity-80"
            style={styles.secondaryButton}
          >
            <Text
              className="text-white text-center text-lg font-semibold"
              style={styles.secondaryButtonText}
            >
              Explore Nearby Places
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#7d391e",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: 440,
    paddingHorizontal: 24,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 24,
  },
  badgeText: {
    color: "#f8d9c6",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  title: {
    color: "#EAEAEA",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    color: "#EAEAEA",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    opacity: 0.82,
    marginBottom: 40,
    maxWidth: 360,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#d05203",
    paddingVertical: 16,
    borderRadius: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  },
  primaryButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#f4c9ae",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 16,
  },
  secondaryButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
