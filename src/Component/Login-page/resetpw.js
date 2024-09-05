import React, { useState, useEffect } from "react";
import { ref, update, get } from "firebase/database";
import { Form, Input, Button, Dropdown, Spin, Tooltip } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../languageContext.js";
// import videoSource from "../../images/4102353-uhd_3840_2160_25fps.mp4";
import fptulogo from "../../images/fptulogo.png";
import "../../i18n/i18n.ts";
import "./resetpw.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import { database } from "../../firebase";

const ResetPassword = () => {
  const { changeLanguage } = useLanguage();
  const { t, i18n } = useTranslation(["reset"]);
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [valid, setValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const email = localStorage.getItem("email");
  const currentURL = window.location.href;
  console.log(currentURL);

  const validatePassword = (password) => {
    const uppercasePattern = /[A-Z]/;
    const lowercasePattern = /[a-z]/;
    const numberPattern = /[0-9]/;
    const specialCharPattern = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    const lengthPass = 8;
    let error = "";

    if (
      !uppercasePattern.test(password) ||
      !lowercasePattern.test(password) ||
      !numberPattern.test(password) ||
      !specialCharPattern.test(password) ||
      password.length < lengthPass
    ) {
      error = t("missingRequirements");
    }
    return error;
  };

  const handleNewPasswordBlur = () => {
    if (!newPassword) {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    if (!value) {
      setPasswordError("");
    } else {
      const passwordValidationError = validatePassword(value);
      setPasswordError(passwordValidationError);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (!value) {
      setConfirmPasswordError("");
    } else if (value !== newPassword) {
      setConfirmPasswordError(t("passwordMismatch"));
    } else {
      setConfirmPasswordError("");
    }
  };
  useEffect(() => {
    const userRef = ref(database, "users");
    get(userRef).then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.username === email) {
          const userLink = userData.link;
          if (userLink && currentURL.includes(userLink)) {
            setValid(true);
          } else {
            setValid(false);
          }
        }
      });
    });
  }, [currentURL, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    } else {
      setPasswordError("");
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t("passwordMismatch"));
      return;
    } else {
      setConfirmPasswordError("");
    }

    try {
      const userRef = ref(database, "users");
      const snapshot = await get(userRef);
      let userFound = false;

      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.username === email) {
          userFound = true;
          const userLink = userData.link;
          if (userLink && currentURL.includes(userLink)) {
            const salt = bcrypt.genSaltSync(10);
            const hashResetPassword = bcrypt.hashSync(newPassword, salt);
            const userId = childSnapshot.key;
            const userToUpdateRef = ref(database, `users/${userId}`);
            update(userToUpdateRef, {
              password: hashResetPassword,
            });
            setNewPassword("");
            setConfirmPassword("");
            toast.success(t("passwordUpdatedSuccess"));
            update(ref(database, `users/${userId}`), {
              link: "",
            });
            setTimeout(() => {
              setIsLoading(true);
              navigate("/login");
            }, 3000);
          } else {
            setValid(false);
          }
        }
      });

      if (!userFound) {
        toast.error(t("userNotFound"));
      }
    } catch (error) {
      toast.error(t("passwordUpdateError"));
    } finally {
      setIsLoading(false);
    }
  };

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

  function addLeadingZero(number) {
    return number < 10 ? "0" + number : number;
  }

  const menuLanguageItems = [
    { key: "vi", label: "Vietnamese" },
    { key: "en", label: "English" },
    { key: "jp", label: "Japanese" },
  ];

  const menuProps = {
    items: menuLanguageItems,
    onClick: handleMenuClick,
  };

  return (
    <>
      <ToastContainer />
      <img
          className="video-background"
          src="https://external-preview.redd.it/R8nSnY9GRvUuG1enTFZ7zRIzHU_qEkrZg83TGyDtIJg.jpg?auto=webp&s=fe2c0463d550dea90ef5a564316787269640c047"
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
            <Form name="basic4" initialValues={{ remember: true }}>
              {valid ? (
                <h2 className="title-reset">{t("resetPassword")}</h2>
              ) : (
                <h2 className="title-reset">{t("linkvalid")}</h2>
              )}
              <Form className="div-login-error" >
                <div className="input-error">
                  <Form.Item>
                    <Input.Password
                      className="input-login"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      onBlur={handleNewPasswordBlur}
                      placeholder={t("enterNewPassword")}
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      required
                      disabled={!valid}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Input.Password
                      className="input-login"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={handleConfirmPasswordBlur}
                      placeholder={t("confirmPassword")}
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      required
                      disabled={!valid}
                    />
                  </Form.Item>
                </div>

                <div className="error-icon">
                  <Tooltip title={passwordError}>
                    {passwordError && (
                      <ExclamationCircleOutlined className="error-icon" />
                    )}
                  </Tooltip>
                  <Tooltip title={confirmPasswordError}>
                    {confirmPasswordError && (
                      <ExclamationCircleOutlined className="error-icon" />
                    )}
                  </Tooltip>
                </div>
              </Form>
              <div className="language-forgot-box">
                <div className="language-forgot-container">
                  <div className="forget-pass-cont">
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={handleSubmit}
                      className="fixed-width-button wthree w3l"
                      disabled={!valid || isLoading}
                    >
                      {isLoading ? <Spin /> : t("updatePassword")}
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
    </>
  );
};

export default ResetPassword;
