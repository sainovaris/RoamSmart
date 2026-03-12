import {useState} from "react"
import {api} from "@/services/api"
import {AIDetails} from "@/types/place"

export default function useAI(){

  const [aiDetails,setAiDetails] =
    useState<AIDetails|null>(null)

  const [aiLoading,setAiLoading] = useState(false)

  const fetchAIDetails = async(placeId:string)=>{

    try{

      setAiLoading(true)
      setAiDetails(null)

      const response = await api.get(`/ai/${placeId}`)

      if(response.data.success){
        setAiDetails(response.data.data)
      }

    }
    catch(err){
      console.log("AI error:",err)
    }
    finally{
      setAiLoading(false)
    }

  }

  return{
    aiDetails,
    aiLoading,
    fetchAIDetails,
    setAiDetails
  }

}