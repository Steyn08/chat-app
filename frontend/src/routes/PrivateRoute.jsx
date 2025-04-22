import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../layouts/sidebar/Sidebar";

const PrivateRoute = () => {
  const user = useSelector((state) => state.auth); // Get user from Redux store

  return user ? (
    <div className="App p-3 d-flex justify-content-between h-100">
      <div className="d-flex w-100">
        <Sidebar />
          <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to="/sign-in" />
  );
};

export default PrivateRoute;
