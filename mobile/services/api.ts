import axios from "axios";

const BASE_URL = "http://10.119.66.139:5000";

export const api = axios.create({
  baseURL: BASE_URL,
});