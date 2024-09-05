import React, { useState, useEffect } from "react";
import "./forgot.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import fptulogo from "../../images/fptulogo.png";
import { Form, Input, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { Dropdown, Button } from "antd";
import { useLanguage } from "../../languageContext.js";
import { sendPasswordResetEmail } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import { auth, database } from "../../firebase.js";
import "../../i18n/i18n.ts";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = ({ pos, onBackToLogin }) => {
  const { changeLanguage } = useLanguage();
  const { t, i18n } = useTranslation(["forgot"]);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const makeid = (length) => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(async () => {
      const userRef = ref(database, "users");
      const snapshot = await get(userRef);
      let userFound = false;

      const result = makeid(10);
      const resetLink = `https://localhost:3000/reset-pw?token=${result}`;
      snapshot.forEach((childSnapshot) => {
        console.log(childSnapshot);
        const userData = childSnapshot.val();
        if (userData.username === email) {
          userFound = true;
          localStorage.setItem("email", email);
          const userUpdateRef = ref(database, `users/${childSnapshot.key}`);
          update(userUpdateRef, { link: result }).then(() => {
            sendPasswordResetEmail(auth, "cirsnha0301@gmail.com", {
              url: resetLink,
            })
              .then(() => {
                setEmailSent(true);
                toast.success(t("confirmationEmailSenttoast"));
              })
              .catch((error) => {
                toast.error(t("confirmationEmailError"));
              })
              .finally(() => {
                setIsLoading(false);
              });
          });
        }
      });

      if (!userFound) {
        toast.error(t("emailNotFound"));
        setIsLoading(false);
      }
    }, 2500);
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
      <ToastContainer key={pos} />
      <img
          className="video-background"
          src="https://wallpapers-clan.com/wp-content/uploads/2024/04/dragon-ball-frieza-blue-desktop-wallpaper-preview.jpg"
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
            <Form name="basic1" initialValues={{ remember: true }}>
              <div className="title-btn">
                <FontAwesomeIcon
                  className="back-button"
                  onClick={onBackToLogin}
                  icon={faArrowLeft}
                />
                <h2 className="title-login">{t("forgotPassword")}</h2>
              </div>

              <div className="form-control w3layouts">
                {!emailSent ? (
                  <Form>
                    <Form.Item
                      name="email"
                      rules={[
                        {
                          type: "email",
                          message: t("pleaseEnterValidEmail"),
                        },
                        {
                          required: true,
                          message: t("pleaseEnterEmail"),
                        },
                      ]}
                      className="custom-error-message"
                    >
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("enterYourEmail")}
                        className="input-login"
                      />
                    </Form.Item>
                    <div className="language-forgot-box">
                      <div className="language-reset-container">
                        <div className="forget-pass-cont">
                          <Button
                            type="submit"
                            className="forgot-wthree-w3l"
                            onClick={handleSubmit}
                          >
                            {isLoading ? <Spin /> : t("resetPassword")}
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
                ) : (
                  <div>
                    <p
                      className="text"
                      style={{ color: "aliceblue", textAlign: "center" }}
                    >
                      {t("confirmationEmailSent")}
                    </p>
                  </div>
                )}
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
