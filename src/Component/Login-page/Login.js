import React, { useState, useEffect } from "react";
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faClock } from "@fortawesome/free-solid-svg-icons";
import fptulogo from "../../images/fptulogo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { login_profile_Slice } from "../../redux/login-profile-Slice.js";
import { Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { Dropdown, Button } from "antd";
import { useLanguage } from "../../languageContext.js";
import "../../i18n/i18n.ts";
import bcrypt from "bcryptjs";
import { fetchUserData } from "../../firebase";

const Login = ({ onLoginSuccess, pos, onForgotPassword }) => {
  const { language, changeLanguage } = useLanguage();
  const { t, i18n } = useTranslation(["login"]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const dispatch = useDispatch();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [rememberUser, setRememberUser] = useState(true);
  const [isDisabled, setIsDisabled] = useState(
    localStorage.getItem("isDisabled") === "true"
  );
  const [countdown, setCountdown] = useState(
    parseInt(localStorage.getItem("countdown")) || 30
  );
  const savedUsername = localStorage.getItem("savedUsername");
  const savedPassword = localStorage.getItem("savedPassword");
  const [username, setUsername] = useState(savedUsername || "");
  const [password, setPassword] = useState(savedPassword || "");
  useEffect(() => {
    if (isDisabled) {
      let timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsDisabled(false);
            setFailedAttempts(0);
            localStorage.removeItem("isDisabled");
            localStorage.removeItem("countdown");
            return 30;
          }
          localStorage.setItem("countdown", prev - 1);
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isDisabled]);

  useEffect(() => {
    if (failedAttempts >= 5) {
      setIsDisabled(true);
      localStorage.setItem("isDisabled", true);
      toast.dismiss();
      setUsername("");
      toast.error(t("too_many_attempts"), { autoClose: 3000 });
      setPassword("");
      setCountdown(30);
      localStorage.setItem("countdown", 30);
    }
  }, [failedAttempts, t]);

  const handleRememberUserChange = (event) => {
    setRememberUser(event.target.checked);
  };

  const handleLogin = async (event) => {
    if (event) {
      if (isDisabled) {
        return setIsDisabled(false);
      }

      let foundUser = null;
      let emailExists = false;

      const userList = await fetchUserData("users");
      const adminList = await fetchUserData("admin");

      userList.forEach((user) => {
        if (user.username === username) {
          emailExists = true;
          if (bcrypt.compareSync(password, user.password)) {
            foundUser = user;
          }
        }
      });

      if (!foundUser) {
        adminList.forEach((admin) => {
          if (admin.username === username) {
            emailExists = true;
            if (bcrypt.compareSync(password, admin.password)) {
              foundUser = admin;
            }
          }
        });
      }

      if (!emailExists) {
        toast.error(t("email_wrong"));
        setFailedAttempts((prev) => prev + 1);
      } else {
        if (foundUser === null) {
          toast.error(t("password_wrong"));
          setFailedAttempts((prev) => prev + 1);
          dispatch(login_profile_Slice.actions.loginFailure());
        } else {
          dispatch(login_profile_Slice.actions.loginSuccess(foundUser));
          if (onLoginSuccess) {
            onLoginSuccess();
          }
          try {
            const userDataJSON = JSON.stringify(foundUser);
            localStorage.setItem("userData", userDataJSON);
          } catch (error) {}
        }
      }
      try {
        const userDataJSON = JSON.stringify(foundUser);
        localStorage.setItem("userData", userDataJSON);
      } catch (error) {}
    }
    if (rememberUser) {
      localStorage.setItem("savedUsername", username);
      localStorage.setItem("savedPassword", password);
    } else {
      localStorage.removeItem("savedUsername");
      localStorage.removeItem("savedPassword");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  function getCurrentLanguage() {
    const currentLangCode = i18n.language;
    let currentLanguage;

    if (currentLangCode === "jp") {
      currentLanguage = "Japanese";
    } else if (currentLangCode === "vi") {
      currentLanguage = "Vietnamese";
    } else {
      currentLanguage = "English";
    }

    return currentLanguage;
  }

  const handleMenuClick = (e) => {
    changeLanguage(e.key);
  };

  const menuLanguageItems = [
    { key: "vi", label: "Vietnamese" },
    { key: "en", label: "English" },
    { key: "jp", label: "Japanese" },
  ];

  const menuProps = {
    items: menuLanguageItems,
    onClick: handleMenuClick,
  };
  function addLeadingZero(number) {
    return number < 10 ? "0" + number : number;
  }
  useEffect(() => {
    var countDownDate = new Date("Jun 27, 2024 00:00:00").getTime();
    var x = setInterval(function () {
      var now = new Date().getTime();
      var distance = countDownDate - now;
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      days = addLeadingZero(days);
      hours = addLeadingZero(hours);
      minutes = addLeadingZero(minutes);
      seconds = addLeadingZero(seconds);
      document.getElementById("days").innerHTML = days;
      document.getElementById("hours").innerHTML = hours;
      document.getElementById("minutes").innerHTML = minutes;
      document.getElementById("seconds").innerHTML = seconds;
      if (distance < 0) {
        clearInterval(x);
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";
      }
    }, 1000);
    return () => clearInterval(x);
  }, []);

  return (
    <>
      <div className="login-cont">
        <ToastContainer key={pos} />
        <img
          className="video-background"
          src="https://wallpapers-clan.com/wp-content/uploads/2024/02/aot-colossal-titan-attacks-desktop-wallpaper-preview.jpg"
          alt="Tên hình ảnh"
        />

        <div className="register-box">
          <div className="content-w3ls">
            <div className="content-agile1">
              <div className="wrapper">
                <div className="logo-fpt-box">
                  <img className="logo-fpt" src={fptulogo} alt="FPT Logo" />
                </div>
                <div className="center">
                  <FontAwesomeIcon className="clock-icon" icon={faClock} />
                  {t("exam_date")}: 27/06/2024
                  <a href="https://www.facebook.com/thongtinbogiaoducvadaotao/posts/pfbid0jUtWiXPKqm3YYoLZ6MqHLGCDcEBcijNiLPHGoyJyRD52mXUrvrWVxg61f7s1GB2bl">
                    ({t("official")})
                  </a>
                </div>
                <div className="center inner">
                  {t("time_remaining")}
                  <div className="datetime center">
                    <div className="object">
                      <p id="days">--</p>
                      <p className="object-description">{t("day")}</p>
                    </div>
                    <div className="object">
                      <p id="hours">--</p>
                      <p className="object-description">{t("hour")}</p>
                    </div>
                    <div className="object">
                      <p id="minutes">--</p>
                      <p className="object-description">{t("minute")}</p>
                    </div>
                    <div className="object">
                      <p id="seconds">--</p>
                      <p className="object-description">{t("second")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-agile2">
              <Form
                name="basic"
                initialValues={{ remember: true }}
                onFinish={handleLogin}
              >
                <h2 className="title-login">{t("sign_in")}</h2>

                <div className="form-control w3layouts">
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        type: t("email_label"),
                        message: t("validemail"),
                      },
                      language,
                    ]}
                  >
                    <Input
                      defaultValue={localStorage.getItem("savedUsername")}
                      value={username}
                      placeholder="Email@example.com"
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="input-login"
                      disabled={isDisabled}
                    />
                  </Form.Item>
                </div>
                <div className="password-box">
                  <div className="form-control agileinfo">
                    <input
                      defaultValue={localStorage.getItem("savedPassword")}
                      value={password}
                      type={passwordVisible ? "text" : "password"}
                      className="lock"
                      name="password"
                      placeholder={t("password")}
                      onChange={(e) => setPassword(e.target.value)}
                      id="password1"
                      autoComplete="current-password"
                      required
                      disabled={isDisabled}
                    />
                    <span
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                    >
                      {passwordVisible ? (
                        <FontAwesomeIcon icon={faEyeSlash} />
                      ) : (
                        <FontAwesomeIcon icon={faEye} />
                      )}
                    </span>
                  </div>
                </div>
                <div className="form-control w3layouts">
                  <input
                    className="checkremem"
                    type="checkbox"
                    checked={rememberUser}
                    onChange={handleRememberUserChange}
                  />
                  <label>{t("Remember Me")}</label>
                </div>
                <input
                  type="submit"
                  className="register"
                  disabled={isDisabled}
                  value={
                    isDisabled ? t("Waiting for") + countdown + "s" : t("login")
                  }
                />
                <div className="language-forgot-box">
                  <div className="language-forgot-container">
                    <div className="forget-pass-cont">
                      <Button className="wthree w3l" onClick={onForgotPassword}>
                        {t("forgotpassword")}
                      </Button>
                    </div>
                    <div className="change-lang-btn">
                      <Dropdown menu={menuProps} placement="bottomLeft">
                        <Button>{getCurrentLanguage()}</Button>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
