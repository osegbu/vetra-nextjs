"use client";
import { useState, useCallback } from "react";
import styles from "./login.module.css";
import Link from "next/link";
import Cookies from "js-cookie";
import axios from "axios";

const LoginForm = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [formData, setFormData] = useState({
    user_name: "",
    hashed_password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "user_name") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value.replace(/\s+/g, ""),
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!formData.user_name || !formData.hashed_password) {
        setMessage({ type: "error", message: "All fields are required." });
        return;
      }

      if (formData.hashed_password.length < 6) {
        setMessage({
          type: "error",
          message: "Password must be at least 6 characters long.",
        });
        return;
      }

      setLoading(true);
      setMessage("");

      axios
        .post(`${BASE_URL}/users/login`, {
          user_name: formData.user_name.trim(),
          hashed_password: formData.hashed_password,
        })
        .then((response) => {
          setMessage({
            type: "success",
            message: "Successful ! You will be redirected",
          });
          setLoading(false);
          Cookies.set("token", response.data.access_token, {
            expires: 1,
          });
          setSigning(true);
          window.location.replace("/");
        })
        .catch((error) => {
          setLoading(false);
          console.log(error);
          setMessage({
            type: "error",
            message: error.response?.data?.detail || error.message,
          });
        });
    },
    [formData]
  );

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formBody}>
        <label>
          Username:
          <input
            name="user_name"
            type="text"
            placeholder="Username"
            value={formData.user_name}
            onChange={handleChange}
          />
        </label>
        <label>
          Password:
          <input
            name="hashed_password"
            type="password"
            placeholder="Password"
            value={formData.hashed_password}
            onChange={handleChange}
          />
        </label>
        {message && (
          <div className={styles.message}>
            {message.message}{" "}
            {message.type === "success" && (
              <div className={styles.loading}></div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            signing ||
            !formData.user_name ||
            !formData.hashed_password
          }
        >
          {loading ? (
            <div>
              Sign In <div className={styles.loading}></div>
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
