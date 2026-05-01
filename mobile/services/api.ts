import axios from "axios";

// const BASE_URL = "http://10.175.216.139:5000"; - Mine

const BASE_URL = `http://${process.env.EXPO_PUBLIC_IPV4_ADDR}:5000/api`;
// const BASE_URL = `${process.env.EXPO_PUBLIC_BACK}api`;
console.log("BASE URL in api.ts", BASE_URL)

// Replace with your laptop's IPv4 address, after connecting to the same Wi-Fi network to your mobile device

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

axios.get("https://bindaas-backend.onrender.com/")
  .then(res => console.log("SUCCESS from backend"))
  .catch(err => console.log("FAIL", err.message));