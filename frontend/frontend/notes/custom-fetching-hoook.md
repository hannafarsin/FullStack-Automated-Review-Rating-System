## CUSTOM FETCHING HOOK

```javascript
// in useFetch.ts
import { useEffect, useState } from "react"; // React hooks for state and lifecycle
import api from "../lib/api"; // Pre-configured Axios instance

// Generic custom hook to fetch data from a given URL
export const useFetch = () => {
  // State to store the fetched data
  const [data, setData] = useState(null);

  // State to track loading status
  const [isLoading, setIsLoading] = useState(true);

  // State to track error messages
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // Api call
      const res = await api.get("/api/user");
      setData(res.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      // Turn off loading regardless of success or failure
      setLoading(false);
    }
  };

  useEffect(() => {
    // Trigger the data fetch
    fetchData();
  }, []);

  // Return the result of the fetch
  return { data, isLoading, error, refetch: fetchData };
};
```



## How to use it

```javascript
import { useFetch } from "../hooks/useFetch";

const Profile = () => {
  // Using the hook to fetch profile data
  const { data, isLoading, error } = useFetch();

    // Conditional rendering of error, loading and data
  return <section></section>;
};

```