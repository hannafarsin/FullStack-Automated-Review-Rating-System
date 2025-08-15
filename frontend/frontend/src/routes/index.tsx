import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { Home } from "../pages";
import ReviewPredictor from "../pages/ReviewPredictor";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ReviewPredictor />} />

      <Route element={<ProtectedRoute />}>
        {/* All protected routes should be here */}

        {/* <Route path="/profile" element={<Profile />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
