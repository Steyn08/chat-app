import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const user = useSelector((state) => state.auth); 

  return user ? (
    <div className="App d-flex justify-content-between h-100">
      <div className="d-flex w-100">
          <Outlet />
      </div>
    </div>
  ) : (
    <Navigate to="/sign-in" />
  );
};

export default PrivateRoute;
