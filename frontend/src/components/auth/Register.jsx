import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEnvelope, FaLock } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RegisterSchema = Yup.object().shape({
  userName: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const Register = () => {
  const navigate = useNavigate();
  const loginsubmitref = useRef(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    return () => {
      if (loginsubmitref.current) {
        loginsubmitref.current.abort();
      }
    };
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      loginsubmitref.current = new AbortController();

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          username: values.userName,
          email: values.email,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: loginsubmitref.current.signal,
        }
      );

      const responseData = response.data;

      if (responseData.success) {
        alert("Account created successfully. Please sign in.");
        navigate("/sign-in");
      } else {
        setApiError(responseData.message || "Something went wrong.");
      }
    } catch (error) {
      console.log(error);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: RegisterSchema,
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
            <h2 className="fw-bold">Sign Up</h2>
          </div>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <div className="input-group">
                <span className="input-group-text">@</span>
                <input
                  type="text"
                  name="userName"
                  className="form-control"
                  placeholder="Enter your username"
                  value={formik.values.userName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.userName && formik.errors.userName && (
                <small className="text-danger">{formik.errors.userName}</small>
              )}
            </div>

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
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <small className="text-danger">{formik.errors.password}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm your password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <small className="text-danger">
                    {formik.errors.confirmPassword}
                  </small>
                )}
            </div>

            {apiError && <div className="text-danger mt-2">{apiError}</div>}

            <button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <p className="text-center mt-3">
            Already have an account?{" "}
            <Link to="/sign-in" className="links">
              Sign in now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
