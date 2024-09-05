import React, { useState, useEffect, useReducer } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Component/Login-page/Login";
import MainUI from "./MainUI";
import ForgotPassword from "./Component/Login-page/ForgotPassword";
import ResetPassword from "./Component/Login-page/resetpw";
import { Spin } from "antd";

const initialState = {
  loggedIn: false,
  currentComponent: "Login",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, loggedIn: true };
    case "LOGOUT":
      return { ...state, loggedIn: false };
    case "SHOW_LOGIN":
      return { ...state, currentComponent: "Login" };
    case "SHOW_FORGOT_PASSWORD":
      return { ...state, currentComponent: "ForgotPassword" };
    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      dispatch({ type: "LOGIN" });
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem("isLoggedIn", "true");
    dispatch({ type: "LOGIN" });
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    dispatch({ type: "LOGOUT" });
  };

  const handleForgotPassword = () => {
    dispatch({ type: "SHOW_FORGOT_PASSWORD" });
  };

  const handleBackButtonClick = () => {
    dispatch({ type: "SHOW_LOGIN" });
  };

  return (
    <div className="App">
      <BrowserRouter>
        {loading ? (
          <div className="example">
            <Spin
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              size="large"
            />
          </div>
        ) : (
          <Routes>
            {state.loggedIn ? (
              <Route path="*" element={<MainUI onLogout={handleLogout} />} />
            ) : (
              <>
                <Route
                  path="/login"
                  element={
                    state.currentComponent === "Login" ? (
                      <Login
                        onLoginSuccess={handleLoginSuccess}
                        onForgotPassword={handleForgotPassword}
                      />
                    ) : (
                      <ForgotPassword onBackToLogin={handleBackButtonClick} />
                    )
                  }
                />
                <Route path="/reset-pw" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
};

export default App;
