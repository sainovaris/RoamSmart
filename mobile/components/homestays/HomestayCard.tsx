import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { Homestay } from "@/types/homestay";
import { formatNightlyPrice } from "@/data/homestays";

type Props = {
  homestay: Homestay;
};

export default function HomestayCard({ homestay }: Props) {
  return (
    <Link href={`/homestays/${homestay.id}`} asChild>
      <Pressable
        className="bg-white rounded-2xl overflow-hidden mb-4 shadow-md active:opacity-90"
        style={styles.card}
      >
        <Image
          source={homestay.imageSource}
          style={{ width: "100%", height: 176 }}
          resizeMode="cover"
        />

        <View className="p-4" style={styles.content}>
          <Text
            className="text-lg font-bold text-gray-900"
            style={styles.title}
            numberOfLines={1}
          >
            {homestay.title}
          </Text>

          <Text className="text-gray-500 mt-1" style={styles.location}>
            {homestay.city}, {homestay.region}
          </Text>

          <Text className="text-gray-600 mt-2" style={styles.capacity}>
            {homestay.maxGuests} guests · {homestay.bedrooms} bed ·{" "}
            {homestay.bathrooms} bath
          </Text>

          <View className="flex-row flex-wrap mt-2" style={styles.amenities}>
            {homestay.amenities.slice(0, 3).map((amenity) => (
              <View
                key={amenity}
                className="bg-[#f6e8df] px-2 py-1 rounded-full mr-2 mb-2"
                style={styles.amenity}
              >
                <Text className="text-xs text-[#7d391e]" style={styles.amenityText}>
                  {amenity}
                </Text>
              </View>
            ))}
          </View>

          <View
            className="flex-row justify-between items-center mt-2"
            style={styles.footer}
          >
            <Text
              className="text-[#d05203] font-semibold text-base"
              style={styles.price}
            >
              {formatNightlyPrice(homestay)}
              <Text className="text-gray-500 font-normal" style={styles.priceUnit}>
                {" "}
                / night
              </Text>
            </Text>
            <Text className="text-gray-700" style={styles.rating}>
              ★ {homestay.rating.toFixed(1)} ({homestay.reviewCount})
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
    boxShadow: "0 6px 20px rgba(75, 35, 17, 0.12)",
  },
  content: {
    padding: 16,
  },
  title: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "700",
  },
  location: {
    color: "#6b7280",
    marginTop: 5,
  },
  capacity: {
    color: "#4b5563",
    marginTop: 9,
  },
  amenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  amenity: {
    backgroundColor: "#f6e8df",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    color: "#7d391e",
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: {
    color: "#d05203",
    fontSize: 16,
    fontWeight: "600",
  },
  priceUnit: {
    color: "#6b7280",
    fontWeight: "400",
  },
  rating: {
    color: "#374151",
  },
});
