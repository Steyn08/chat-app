import React, { useCallback, useEffect, useRef, useState } from "react";
import "./peopleList.scss";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setAuth } from "../../slices/authSlice";

// const peoples = [
//   {
//     id: 1,
//     name: "Friends Forever",
//     message: "Hahahaha!!",
//     time: "Today, 3:52pm",
//     unreadCount: 4,
//     image: "/assets/icons/profile.jpg",
//   },
//   {
//     id: 2,
//     name: "Mera Gang",
//     message: "Kyu.....???",
//     time: "Yesterday, 7:31am",
//     unreadCount: 0,
//     image: "/assets/icons/profile.jpg",
//   },
//   {
//     id: 3,
//     name: "Hiking",
//     message: "It’s not going to happen",
//     time: "Wednesday, 9:12am",
//     unreadCount: 0,
//     image: "/assets/icons/profile.jpg",
//   },
//   {
//     id: 4,
//     name: "Hiking",
//     message: "It’s not going to happen",
//     time: "Wednesday, 9:12am",
//     unreadCount: 0,
//     image: "/assets/icons/profile.jpg",
//   },
//   {
//     id: 5,
//     name: "Hiking",
//     message: "It’s not going to happen",
//     time: "Wednesday, 9:12am",
//     unreadCount: 0,
//     image: "/assets/icons/profile.jpg",
//   },
//   {
//     id: 6,
//     name: "Hiking",
//     message: "It’s not going to happen",
//     time: "Wednesday, 9:12am",
//     unreadCount: 0,
//     image: "/assets/icons/profile.jpg",
//   },
// ];

const formatDateTime = (isoString) => {
  return moment(isoString).format("dddd, h:mma");
};
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PeopleList = ({ onSelect }) => {
  const dispatch = useDispatch();
  const [peoples, setPeoples] = useState([]);
  const getPeoplesRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getPeoples = useCallback(async () => {
    try {
      setLoading(true);
      getPeoplesRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: getPeoplesRef.current.signal,
      };

      const response = await axios.get(`${API_BASE_URL}/friends/list`, config);

      const responseData = response.data;
      console.log(responseData);

      if (responseData.success) {
        if (responseData.data) {
          setPeoples(responseData.data);
        }
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
    } finally {
      setLoading(false);
    }
  }, [dispatch, token, navigate]);

  useEffect(() => {
    getPeoples();
  }, [getPeoples, token]);

  if (loading) {
    return (
      <div className="group-list d-flex justify-content-center align-items-center">
        <span className="spinner-border text-success" />
      </div>
    );
  }

  if (peoples.length === 0) {
    return (
      <div className="group-list d-flex justify-content-center align-items-center">
        <span>No Friends to list</span>
      </div>
    );
  }
  return (
    <div className="people-list">
      {peoples.map((people) => (
        <div
          key={people._id}
          onClick={() => onSelect && onSelect(people)}
          className="people-item d-flex align-items-center"
        >
          <img
            src={
              people?.profileImage
                ? `${API_BASE_URL}/ ${people?.profileImage}`
                : "/assets/icons/profile.jpg"
            }
            alt={people.name}
            className="people-avatar"
          />
          <div className="people-info">
            <div className="people-header d-flex justify-content-between">
              <span className="people-name">{people.name}</span>
              {people.lastMessageTime && (
                <span className="people-time">
                  {formatDateTime(people.lastMessageTime || 0)}
                </span>
              )}
            </div>
            <div className="people-message d-flex justify-content-between">
              <span>
                {people?.lastMessage ||
                  (people?.lastAttachment[people?.lastAttachment.length - 1]
                    ? people?.lastAttachment[people?.lastAttachment.length - 1]
                        .split("/")
                        .pop()
                    : "")}
              </span>
              {people.unreadCount > 0 && (
                <span className="unread-count">{people.unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PeopleList;
