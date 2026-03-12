import {useState,useEffect} from "react"
import * as Location from "expo-location"
import type {LocationObjectCoords} from "expo-location"

export default function useCurrentLocation(){

  const [location,setLocation] = useState<LocationObjectCoords|null>(null)
  const [error,setError] = useState<string|null>(null)

  useEffect(()=>{

    const load = async ()=>{

      const {status} =
        await Location.requestForegroundPermissionsAsync()

      if(status!=="granted"){
        setError("Location permission denied")
        return
      }

      const loc = await Location.getCurrentPositionAsync({})
      setLocation(loc.coords)
    }

    load()

  },[])

  return {location,error}
}