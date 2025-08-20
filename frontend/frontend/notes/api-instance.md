# How to use api instance

```javascript

// Import the pre-configured Axios instance with token and refresh handling
import api from "../lib/api";

const fetchProfile = async () => {
  // Make a GET request using just the endpoint (baseURL is already set in api instance)
  // Automatically includes access token and handles refresh if needed
  const res = await api.get("/api/user/profile");
  return res.data;
};

```
