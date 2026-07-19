import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatNightlyPrice, getHomestayById } from "@/data/homestays";

export default function HomestayDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const homestay = typeof id === "string" ? getHomestayById(id) : undefined;
  const [bookingPreviewVisible, setBookingPreviewVisible] = useState(false);

  if (!homestay) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#f7f3f0] items-center justify-center px-6"
        style={styles.notFound}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Homestay not found
        </Text>
        <Link href="/homestays" asChild>
          <Pressable className="bg-[#d05203] px-5 py-3 rounded-xl">
            <Text className="text-white font-semibold">Back to listings</Text>
          </Pressable>
        </Link>
      </SafeAreaView>
    );
  }

  const onReservePress = () => {
    setBookingPreviewVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f7f3f0]" style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={homestay.imageSource}
          style={{ width: "100%", height: 256 }}
          resizeMode="cover"
        />

        <View className="px-5 pt-4" style={styles.content}>
          <View
            className="flex-row justify-between items-start mb-3"
            style={styles.topRow}
          >
            <Link href="/homestays" asChild>
              <Pressable
                className="px-3 py-2 rounded-lg bg-white border border-[#e8d5c8]"
                style={styles.backButton}
              >
                <Text
                  className="text-[#7d391e] font-medium"
                  style={styles.backText}
                >
                  ← Listings
                </Text>
              </Pressable>
            </Link>
            <Text className="text-gray-700 mt-2" style={styles.rating}>
              ★ {homestay.rating.toFixed(1)} · {homestay.reviewCount} reviews
            </Text>
          </View>

          <Text
            className="text-2xl font-extrabold text-gray-900"
            style={styles.title}
          >
            {homestay.title}
          </Text>
          <Text className="text-gray-600 mt-1" style={styles.meta}>
            {homestay.city}, {homestay.region}, {homestay.country}
          </Text>
          <Text className="text-gray-600 mt-1" style={styles.meta}>
            Hosted by {homestay.hostName} ·{" "}
            {homestay.roomType.replace(/_/g, " ")}
          </Text>

          <Text
            className="text-[#d05203] text-xl font-bold mt-4"
            style={styles.price}
          >
            {formatNightlyPrice(homestay)}
            <Text className="text-base text-gray-500 font-normal"> / night</Text>
          </Text>

          <View
            className="bg-white rounded-2xl p-4 mt-5 border border-[#eedfd4]"
            style={styles.infoCard}
          >
            <Text className="font-semibold text-gray-900 mb-2" style={styles.sectionTitle}>
              Overview
            </Text>
            <Text className="text-gray-700 leading-6" style={styles.bodyText}>
              {homestay.description}
            </Text>
          </View>

          <View
            className="bg-[#7d391e] rounded-2xl p-4 mt-4 flex-row items-center"
            style={styles.hostCard}
          >
            <View
              className="bg-[#f6e8df] w-12 h-12 rounded-full items-center justify-center mr-3"
              style={styles.avatar}
            >
              <Text
                className="text-[#7d391e] text-xl font-bold"
                style={styles.avatarText}
              >
                {homestay.hostName.charAt(0)}
              </Text>
            </View>
            <View className="flex-1" style={styles.hostCopy}>
              <Text className="text-white font-semibold" style={styles.hostName}>
                Hosted by {homestay.hostName}
              </Text>
              <Text className="text-[#f4c9ae] text-sm mt-1" style={styles.hostNote}>
                Local tips and a personal welcome included
              </Text>
            </View>
          </View>

          <View
            className="bg-white rounded-2xl p-4 mt-4 border border-[#eedfd4]"
            style={styles.infoCard}
          >
            <Text className="font-semibold text-gray-900 mb-2" style={styles.sectionTitle}>
              Capacity
            </Text>
            <Text className="text-gray-700" style={styles.bodyText}>
              {homestay.maxGuests} guests · {homestay.bedrooms} bedrooms ·{" "}
              {homestay.beds} beds · {homestay.bathrooms} bathrooms
            </Text>
            <Text className="text-gray-700 mt-2" style={styles.bodyTextSpaced}>
              Check-in {homestay.checkInTime} · Check-out {homestay.checkOutTime}
            </Text>
          </View>

          <View
            className="bg-white rounded-2xl p-4 mt-4 border border-[#eedfd4]"
            style={styles.infoCard}
          >
            <Text className="font-semibold text-gray-900 mb-2" style={styles.sectionTitle}>
              Amenities
            </Text>
            {homestay.amenities.map((amenity) => (
              <Text key={amenity} className="text-gray-700 mb-1" style={styles.listItem}>
                • {amenity}
              </Text>
            ))}
          </View>

          <View
            className="bg-white rounded-2xl p-4 mt-4 border border-[#eedfd4]"
            style={styles.infoCard}
          >
            <Text className="font-semibold text-gray-900 mb-2" style={styles.sectionTitle}>
              House rules
            </Text>
            {homestay.houseRules.map((rule) => (
              <Text key={rule} className="text-gray-700 mb-1" style={styles.listItem}>
                • {rule}
              </Text>
            ))}
          </View>

          <Pressable
            className="bg-[#d05203] py-4 rounded-xl mt-6 active:opacity-80"
            style={styles.reserveButton}
            onPress={onReservePress}
          >
            <Text
              className="text-white text-center text-lg font-semibold"
              style={styles.reserveText}
            >
              Check availability
            </Text>
          </Pressable>

          <Text
            className="text-center text-xs text-gray-500 mt-3"
            style={styles.disclaimer}
          >
            Booking preview only — no reservation will be created.
          </Text>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={bookingPreviewVisible}
        onRequestClose={() => setBookingPreviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>You&apos;re one step away</Text>
            <Text style={styles.modalCopy}>
              Availability and secure booking are the next milestone. No
              reservation has been created.
            </Text>
            <Pressable
              onPress={() => setBookingPreviewVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Continue exploring</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f3f0",
  },
  notFound: {
    flex: 1,
    backgroundColor: "#f7f3f0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  scrollContent: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingBottom: 32,
    backgroundColor: "#f7f3f0",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8d5c8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  backText: {
    color: "#7d391e",
    fontWeight: "600",
  },
  rating: {
    color: "#374151",
    marginTop: 9,
  },
  title: {
    color: "#111827",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  meta: {
    color: "#6b7280",
    marginTop: 5,
  },
  price: {
    color: "#d05203",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eedfd4",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    color: "#111827",
    fontWeight: "700",
    marginBottom: 8,
  },
  bodyText: {
    color: "#374151",
    lineHeight: 24,
  },
  bodyTextSpaced: {
    color: "#374151",
    lineHeight: 24,
    marginTop: 8,
  },
  hostCard: {
    backgroundColor: "#7d391e",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f6e8df",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#7d391e",
    fontSize: 20,
    fontWeight: "700",
  },
  hostCopy: {
    flex: 1,
  },
  hostName: {
    color: "#fff",
    fontWeight: "700",
  },
  hostNote: {
    color: "#f4c9ae",
    fontSize: 14,
    marginTop: 4,
  },
  listItem: {
    color: "#374151",
    lineHeight: 22,
    marginBottom: 4,
  },
  reserveButton: {
    backgroundColor: "#d05203",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 24,
  },
  reserveText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  disclaimer: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 12,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f6e8df",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalIconText: {
    color: "#7d391e",
    fontSize: 24,
    fontWeight: "700",
  },
  modalTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  modalCopy: {
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },
  modalButton: {
    width: "100%",
    backgroundColor: "#d05203",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
