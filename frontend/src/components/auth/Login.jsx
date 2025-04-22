import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../../slices/authSlice.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";
import * as Yup from "yup";

const INIT_STATE = {
  email: "",
  password: "",
  rememberMe: false,
};

const Signinschema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rememberMe: Yup.boolean(),
});

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const loginsubmitref = useRef(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (loginsubmitref.current) {
      loginsubmitref.current.abort();
    }
  }, []);

  const handleSubmit = async (values) => {
    try {
      setApiError(null);
      loginsubmitref.current = new AbortController();

      const response = await axios.post(`${API_BASE_URL}/auth/login`, values, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: loginsubmitref.current.signal,
      });

      const responseData = response.data;
      if (responseData.success && responseData?.token) {
        dispatch(
          setAuth({
            login: true,
            token: responseData?.token,
          })
        );
        navigate("/");
      } else {
        setApiError(response.data.message || "Something went wrong");
      }
    } catch (e) {
      setApiError("Something went wrong. Please try again.");
    }
  };

  const formik = useFormik({
    initialValues: { ...INIT_STATE },
    validationSchema: Signinschema,
    onSubmit: handleSubmit,
  });

  return (
    <div
      style={{
        background: `linear-gradient(rgb(247 247 247 / 17%), rgb(56 56 56 / 57%)) center center / cover, url(/bg.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <div className="d-flex justify-content-center align-items-center h-100">
        <div
          className="w-100 max-w-md bg-white p-4 rounded shadow-lg"
          style={{ maxWidth: "400px" }}
        >
          <div className="text-center mb-3">
            <h2 className="fw-bold">Welcome Back</h2>
          </div>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="off"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <small className="text-danger">{formik.errors.email}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoComplete="off"
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <small className="text-danger">{formik.errors.password}</small>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-primary">
                Forgot password?
              </a>
            </div>

            {apiError && <div className="text-danger mt-2">{apiError}</div>}

            <button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-3">
            Don't have an account?{" "}
            <Link to="/sign-up" className="links">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
