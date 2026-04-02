import { View, Text, ScrollView, Pressable } from "react-native";
import { Place, AIDetails } from "@/types/place";
import * as Speech from "expo-speech";

type Props = {
  selectedPlace: Place | null;
  aiDetails: AIDetails | null;
  aiLoading: boolean;
  setSelectedPlace: React.Dispatch<React.SetStateAction<Place | null>>;
  setAiDetails: React.Dispatch<React.SetStateAction<AIDetails | null>>;
};

export default function PlaceDetailsCard({
  selectedPlace,
  aiDetails,
  aiLoading,
  setSelectedPlace,
  setAiDetails,
}: Props) {

  if (!selectedPlace) return null;

  const speakDetails = () => {
    if (!selectedPlace) return;

    let text = `${selectedPlace.name}. `;

    if (aiDetails?.overview) {
      text += `Overview of ${selectedPlace.name} is ${aiDetails.overview}. `;
    }

    if (aiDetails?.highlights?.length) {
      text += `Highlights are ${aiDetails.highlights.join(", ")}.`;
    }

    Speech.speak(text);
  };

  console.log("Selectef Place: ", selectedPlace.name)
  return (
    <View className="absolute bottom-52 left-5 right-5 bg-white p-4 rounded-2xl shadow-xl">
      <ScrollView>

          <Text className="text-lg font-bold flex-1 pr-2">
            {selectedPlace.name}
          </Text>


        {aiLoading && <Text>Generating AI guide...</Text>}

        {aiDetails && (
          <>
            <Text className="mt-3 font-semibold">Overview</Text>
            <Text>{aiDetails.overview}</Text>

            <Text className="mt-3 font-semibold">Highlights</Text>

            {aiDetails.highlights.map((item, i) => (
              <Text key={i}>• {item}</Text>
            ))}
          </>
        )}
        
        <Pressable
          className="mt-5 bg-[#d05203] py-2 rounded-lg"
          onPress={speakDetails}
        >
          <Text className="text-center text-white">Play Audio</Text>
        </Pressable>

        <Pressable
          className="mt-2 bg-[#d05203] py-2 rounded-lg"
          onPress={() => {
            setSelectedPlace(null);
            setAiDetails(null);
          }}
        >
          <Text className="text-center text-white">Close</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}