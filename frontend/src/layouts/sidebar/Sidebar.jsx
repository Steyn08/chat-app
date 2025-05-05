import React, { useEffect, useRef } from "react";
import "./../../style.scss";
import "./sidebar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faComment,
  faBell,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAuth } from "../../slices/authSlice";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const Sidebar = () => {
  const navigate = useNavigate();
  const logoutController = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  console.log("user", user);

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      if (logoutController.current) {
        logoutController.current.abort();
      }
    };
  }, []);

  const handleLogOutClick = async () => {
    try {
      // const result = await Swal.fire({
      //   // title: 'Are you sure?',
      //   text: "Are you sure you want to logout?",
      //   icon: 'question',
      //   showCancelButton: true,
      //   confirmButtonColor: '#83C212',
      //   cancelButtonColor: '#d33',
      //   confirmButtonText: 'Yes, I am sure!',
      //   cancelButtonText: "No, cancel it!",

      // });

      // if (!result.isConfirmed) return;

      if (logoutController.current) {
        logoutController.current.abort();
      }
      logoutController.current = new AbortController();

      const config = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: logoutController.current.signal,
      };
      const response = await axios.post(
        `${API_BASE_URL}/auth/logout`,
        [],
        config
      );
      const responseData = response.data;
      if (responseData.success || responseData?.logout) {
        dispatch(
          setAuth({
            login: false,
            token: null,
          })
        );
        navigate("/login");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="sidebar rounded h-100 text-center d-flex flex-column justify-content-between align-items-center">
      <div>
        <div className="profile-section">
          <img
            src={
              user?.profileImage
                ? `${API_BASE_URL}/${user?.profileImage}`
                : "/assets/icons/profile.jpg"
            }
            style={{objectFit:"cover"}}
            alt="Profile"
            className="profile-pic"
            height={50}
            width={50}
          />
        </div>
        <nav>
          <ul>
            <li className="">
              <Link to="/" className="links active">
                <FontAwesomeIcon icon={faHome} />
              </Link>
            </li>
            <li>
              <Link to="/chats" className="links">
                <FontAwesomeIcon icon={faComment} />
              </Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faBell} />
            </li>
            <li>
              <FontAwesomeIcon icon={faCog} />
            </li>
          </ul>
        </nav>
      </div>
      <button
        onClick={handleLogOutClick}
        style={{ background: "none", border: "none" }}
      >
        <img
          src="/assets/icons/logout.png"
          alt="logout"
          className="logout-pic"
          width={25}
          height={25}
        />
      </button>
    </div>
  );
};

export default Sidebar;
