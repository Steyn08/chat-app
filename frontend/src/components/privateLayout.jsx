import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/sidebar/Sidebar";

const PrivateLayout = () => {
  return (
    <div className="App p-3 d-flex justify-content-between h-100">
      <div className="d-flex">
        <Sidebar />
        <div className="content flex-grow-1 p-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PrivateLayout;
