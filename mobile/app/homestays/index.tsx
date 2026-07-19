import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import HomestayCard from "@/components/homestays/HomestayCard";
import { HOMESTAYS } from "@/data/homestays";

const CITIES = ["All", ...Array.from(new Set(HOMESTAYS.map((stay) => stay.city)))];

export default function HomestaysIndex() {
  const [selectedCity, setSelectedCity] = useState("All");
  const [query, setQuery] = useState("");

  const filteredHomestays = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return HOMESTAYS.filter((stay) => {
      const matchesCity = selectedCity === "All" || stay.city === selectedCity;
      const searchText = [
        stay.title,
        stay.city,
        stay.region,
        ...stay.amenities,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCity && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [query, selectedCity]);

  return (
    <SafeAreaView className="flex-1 bg-[#f7f3f0]" style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="px-5 pt-2 pb-3 flex-row items-center justify-between"
        style={styles.header}
      >
        <View className="flex-1 pr-3" style={styles.headerCopy}>
          <Text
            className="text-2xl font-extrabold text-[#7d391e]"
            style={styles.title}
          >
            Find your stay
          </Text>
          <Text className="text-gray-600 mt-1" style={styles.subtitle}>
            Local hosts. Memorable places.
          </Text>
        </View>

        <Link href="/" asChild>
          <Pressable
            className="px-3 py-2 rounded-lg bg-white border border-[#e8d5c8]"
            style={styles.homeButton}
          >
            <Text
              className="text-[#7d391e] font-medium"
              style={styles.homeButtonText}
            >
              Home
            </Text>
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={filteredHomestays}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          width: "100%",
          maxWidth: 720,
          alignSelf: "center",
          paddingHorizontal: 20,
          paddingBottom: 28,
        }}
        renderItem={({ item }) => <HomestayCard homestay={item} />}
        ListHeaderComponent={
          <View>
            <View
              className="bg-white rounded-xl px-4 py-3 mb-3 border border-[#eedfd4]"
              style={styles.searchBox}
            >
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search city, stay, or amenity"
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900"
                style={styles.searchInput}
                accessibilityLabel="Search homestays"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              style={styles.filters}
            >
              {CITIES.map((city) => {
                const selected = city === selectedCity;
                return (
                  <Pressable
                    key={city}
                    onPress={() => setSelectedCity(city)}
                    className={`mr-2 px-4 py-2 rounded-full border ${
                      selected
                        ? "bg-[#7d391e] border-[#7d391e]"
                        : "bg-white border-[#e8d5c8]"
                    }`}
                    style={[
                      styles.cityChip,
                      selected ? styles.cityChipSelected : styles.cityChipIdle,
                    ]}
                  >
                    <Text
                      className={
                        selected ? "text-white font-semibold" : "text-[#7d391e]"
                      }
                      style={[
                        styles.cityChipText,
                        selected && styles.cityChipTextSelected,
                      ]}
                    >
                      {city}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text
              className="text-sm text-gray-500 mb-3"
              style={styles.resultCount}
            >
              {filteredHomestays.length} curated{" "}
              {filteredHomestays.length === 1 ? "stay" : "stays"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View
            className="bg-white rounded-2xl p-6 items-center border border-[#eedfd4]"
            style={styles.emptyState}
          >
            <Text
              className="text-lg font-semibold text-gray-900"
              style={styles.emptyTitle}
            >
              No stays found
            </Text>
            <Text
              className="text-gray-500 text-center mt-2"
              style={styles.emptyCopy}
            >
              Try another city or clear your search.
            </Text>
            <Pressable
              onPress={() => {
                setQuery("");
                setSelectedCity("All");
              }}
              className="bg-[#d05203] px-5 py-3 rounded-xl mt-4"
              style={styles.clearButton}
            >
              <Text className="text-white font-semibold" style={styles.clearText}>
                Clear filters
              </Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f3f0",
  },
  header: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: "#7d391e",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 15,
    marginTop: 4,
  },
  homeButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8d5c8",
  },
  homeButtonText: {
    color: "#7d391e",
    fontWeight: "600",
  },
  searchBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eedfd4",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    color: "#111827",
    fontSize: 16,
  },
  filters: {
    marginBottom: 16,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  cityChipSelected: {
    backgroundColor: "#7d391e",
    borderColor: "#7d391e",
  },
  cityChipIdle: {
    backgroundColor: "#fff",
    borderColor: "#e8d5c8",
  },
  cityChipText: {
    color: "#7d391e",
  },
  cityChipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  resultCount: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eedfd4",
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyCopy: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  clearButton: {
    backgroundColor: "#d05203",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  clearText: {
    color: "#fff",
    fontWeight: "600",
  },
});
