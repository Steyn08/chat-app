import React, { useCallback, useEffect, useRef, useState } from "react";
import "./groupList.scss";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuth } from "../../slices/authSlice";
import moment from "moment";


const formatDateTime = (isoString) => {
  return moment(isoString).format("dddd, h:mma");
};
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const GroupList = ({ onSelect }) => {
  const dispatch = useDispatch();
  const [groups, setGroups] = useState([]);
  const getGroupsRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getGroups = useCallback(async () => {
    try {
      setLoading(true);
      getGroupsRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: getGroupsRef.current.signal,
      };

      const response = await axios.get(`${API_BASE_URL}/groups/list`, config);

      const responseData = response.data;

      if (responseData.success) {
        if (responseData.data) {
          setGroups(responseData.data);
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
    getGroups();
  }, [getGroups, token]);

  if (loading) {
    return (
      <div className="group-list d-flex justify-content-center align-items-center">
        <span className="spinner-border text-success" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="group-list d-flex justify-content-center align-items-center">
        <span>No groups to list</span>
      </div>
    );
  }

  return (
    <div className="group-list">
      {groups.map((group) => (
        <div
          key={group._id}
          onClick={() => onSelect && onSelect(group)}
          className="group-item d-flex align-items-center"
        >
          <img src={group?.image || '/assets/icons/group-placeholder.png'} alt={group.name} className="group-avatar" />
          <div className="group-info">
            <div className="group-header d-flex justify-content-between">
              <span className="group-name">{group.name}</span>
              {group.lastMessageTime && (
                <span className="group-time">
                  {formatDateTime(group.lastMessageTime)}
                </span>
              )}
            </div>
            <div className="group-message d-flex justify-content-between">
              <span>
                {group?.lastMessage ||
                  (group?.lastAttachment[group?.lastAttachment.length - 1]
                    ? group?.lastAttachment[group?.lastAttachment.length - 1]
                        .split("/")
                        .pop()
                    : "")}
              </span>
              {group.unreadCount > 0 && (
                <span className="unread-count">{group.unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupList;
