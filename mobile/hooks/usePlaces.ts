import {useState,useCallback} from "react"
import {fetchNearbyPlaces} from "@/services/placesService"
import {calculateDistance} from "@/utils/distance"
import {Place} from "@/types/place"

export default function usePlaces(){

  const [places,setPlaces] = useState<Place[]>([])
  const [loading,setLoading] = useState(false)

  const fetchPlaces = useCallback(
  async(latitude:number,longitude:number,category:string)=>{

    try{

      setLoading(true)

      const response = await fetchNearbyPlaces(
        latitude,
        longitude,
        category
      )

      const formatted:Place[] =
        response.results
        .filter((p:any)=>p.location?.lat !== undefined && p.location?.lng !== undefined)
        .map((p:any)=>{

          const lat = p.location.lat
          const lng = p.location.lng

          return{
            id: p._id,              // for AI
            place_id: p.place_id,  // for Google APIs
            name:p.name,
            rating:p.rating || 0,
            type:p.category || "Place",
            open_now:p.is_open,
            latitude:lat,
            longitude:lng,
            distance:calculateDistance(
              latitude,
              longitude,
              lat,
              lng
            )
          }

        })

      setPlaces(formatted)

    }catch(err){
      console.log("Places error:",err)
    }
    finally{
      setLoading(false)
    }

  },[])

  return {places,loading,fetchPlaces}
}