// App.jsx
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ChatWindow from "./components/chatwindow/ChatWindow";
import Home from "./components/home/Home";
import Login from "./components/auth/Login";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Register from "./components/auth/Register.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { setAuth } from "./slices/authSlice.jsx";
import { setUser } from "./slices/profileSlice.jsx";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const dispatch = useDispatch();
  const getSettingsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const getProfile = useCallback(async () => {
    try {
      getSettingsRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: getSettingsRef.current.signal,
      };

      const response = await axios.get(`${API_BASE_URL}/user/profile`, config);
      const responseData = response.data;
      
      if (responseData.success) {
        dispatch(setUser(responseData.user || []));
      } else {
        if (responseData.logout) {
          dispatch(
            setAuth({
              login: false,
              token: null,
            })
          );
          navigate("/sign-in");
        }
      }
    } catch (e) {
      console.log(e);
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  }, [dispatch, token, navigate]);

  useEffect(() => {
    const publicRoutes = ["/sign-in", "/sign-up"];
    if (token && !publicRoutes.includes(location.pathname)) {
      getProfile();
    }
  }, [getProfile, token, location.pathname]);

  // useEffect(() => {
  //   getProfile().then((data) => {
  //     // if (data["user"]) {
  //     //   dispatch(setUser(data["user"] ?? []));
  //     // }
  //     // setLoading(false);
  //   });
  // }, [getProfile]);

  return (
    <Routes>
      <Route path="/sign-in" element={<Login />} />
      <Route path="/sign-up" element={<Register />} />
      <Route path="" element={<PrivateRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="chats" element={<ChatWindow />} />
      </Route>
    </Routes>
  );
}

export default App;
