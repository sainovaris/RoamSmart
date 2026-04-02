import {useState} from "react"
import {generatePlan} from "@/services/planService"

export default function useTripPlanner(){

  const [itinerary,setItinerary] = useState<any[]>([])
  const [planLoading,setPlanLoading] = useState(false)

  const generateTrip = async(
    lat:number,
    lng:number
  )=>{

    try{

      setPlanLoading(true)

      const response =
        await generatePlan(lat,lng,3)

      if(response.success){
        setItinerary(response.plan)
      }

      console.log("Plan data:", response.plan);
    }
    catch(err){
      console.log("Plan error:",err)
    }
    finally{
      setPlanLoading(false)
    }

  }

  return{
    itinerary,
    planLoading,
    generateTrip,
    setItinerary
  }

}