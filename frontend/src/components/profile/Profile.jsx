import React, { useRef, useState } from "react";
import "./Profile.scss";
import { Pencil, Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  faAddressBook,
  faCheck,
  faClose,
  faEnvelope,
  faHome,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setAuth, setUser } from "../../slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const Profile = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const [showOptions, setShowOptions] = useState(false);
  const deleteProfileRef = useRef(null);
  const updateProfileRef = useRef(null);
  const updateDetailsRef = useRef(null);
  const uploadImageRef = useRef(null);

  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    profilename: user?.profilename || "",
    email: user?.email || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      updateDetailsRef.current = new AbortController();

      const formData = new FormData();
      formData.append("name", profileData.profilename);
      formData.append("email", profileData.email);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: updateDetailsRef.current.signal,
      };
      const response = await axios.post(
        `${API_BASE_URL}/user/profile/update`,
        formData,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        dispatch(setUser(responseData.user || []));
        // window.location.reload();
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
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
    setIsEditing(false);
  };

  const handleToggle = () => {
    setShowOptions(!showOptions);
  };

  const handleOption = (action) => {
    setShowOptions(false);
    if (action === "view") {
      window.open(`${API_BASE_URL}/${user.profileImage}`, "_blank");
    } else if (action === "upload") {
      document.getElementById("profileUpload").click();
    } else if (action === "remove") {
      console.log("Remove profile image");
      handleProfileDelete();
    }
  };

  const handleProfileDelete = async () => {
    try {
      deleteProfileRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: deleteProfileRef.current.signal,
      };
      const response = await axios.delete(
        `${API_BASE_URL}/user/profile/image`,
        config
      );

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
  };

  const handleProfileUpdate = async (file) => {
    try {
      updateProfileRef.current = new AbortController();

      const formData = new FormData();
      formData.append("profile_image", file);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: updateProfileRef.current.signal,
      };
      const response = await axios.post(
        `${API_BASE_URL}/user/profile/update-profile-image`,
        formData,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        dispatch(setUser(responseData.user || []));
        window.location.reload();
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
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

  return (
    <div className="profile-container mx-2">
      <h4 className="profile-title">Profile</h4>

      <div className="profile-photo-section d-flex flex-column justify-content-center">
        <div className="profile-photo">
          {user?.profileImage ? (
            <img
              src={`${API_BASE_URL}/${user.profileImage}?v=${Date.now()}`}
              onError={(e) => (e.target.src = "/assets/icons/profile.jpg")}
              alt="Profile"
              className="profile-pic"
              style={{ objectFit: "cover" }}
              height={120}
              width={120}
            />
          ) : (
            <img
              src="/assets/icons/profile.jpg"
              alt="Profile"
              className="profile-pic"
              style={{ objectFit: "cover" }}
              height={120}
              width={120}
            />
          )}
          <div className="profile-photo-overlay" onClick={() => handleToggle()}>
            <Camera size={24} />

            <div className="photo-text text-white text-center">
              CHANGE
              <br />
              PROFILE
              <br />
              PHOTO
            </div>
          </div>

          {showOptions && (
            <div className="profile-options">
              <div
                className="option-item"
                onClick={() => handleOption("upload")}
              >
                Upload New
              </div>
              {user?.profileImage && (
                <>
                  <div
                    className="option-item"
                    onClick={() => handleOption("view")}
                  >
                    View
                  </div>
                  <div
                    className="option-item"
                    onClick={() => handleOption("remove")}
                  >
                    Remove
                  </div>
                </>
              )}
            </div>
          )}

          <input
            type="file"
            id="profileUpload"
            ref={uploadImageRef}
            style={{ display: "none" }}
            onChange={(e) => handleProfileUpdate(e.target.files[0])}
          />
        </div>
        {/* <button className="btn btn-outline-light btn-sm mt-2">Change profile photo</button> */}
      </div>

      <div className="info-block d-flex justify-content-between align-items-start flex-wrap">
        <div className="flex-grow-1">
          <div className="profile-item d-flex align-items-center mb-3">
            <FontAwesomeIcon icon={faAddressBook} className="me-2" />
            {isEditing ? (
              <input
                className="form-control"
                type="text"
                name="profilename"
                value={profileData.profilename}
                onChange={handleChange}
              />
            ) : (
              <span>{profileData?.profilename || "-"}</span>
            )}
          </div>

          <div className="profile-item d-flex align-items-center">
            <FontAwesomeIcon icon={faEnvelope} className="me-2" />
            {isEditing ? (
              <input
                className="form-control"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
              />
            ) : (
              <span>{profileData?.email || "-"}</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        {isEditing ? (
          <div className="mt-2 ms-3 w-100 d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsEditing(false)}
            >
              <FontAwesomeIcon icon={faClose} className="me-1" />
              Cancel
            </button>
            <button className="btn btn-sm btn-success" onClick={handleSubmit}>
              <FontAwesomeIcon icon={faCheck} className="me-1" />
              Save
            </button>
          </div>
        ) : (
          <div className="mt-2 ms-3">
            <button
              className="btn btn-sm btn-outline-secondary rounded-circle"
              onClick={() => setIsEditing(true)}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
