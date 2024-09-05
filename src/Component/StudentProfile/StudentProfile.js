import "./StudentProfile.css";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  Flex,
  Input,
  Image,
  Select,
  DatePicker,
  Modal,
  Button,
  notification,
  Spin,
} from "antd";
import Webcam from "react-webcam";
import { useDispatch } from "react-redux";
import { login_profile_Slice } from "../../redux/login-profile-Slice";
import { ref, update, get } from "firebase/database";
import { KeyOutlined, UploadOutlined, CameraOutlined } from "@ant-design/icons";
import moment from "moment";
import { Pie } from "@ant-design/plots";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bcrypt from "bcryptjs";
import { database } from "../../firebase";

import { Tooltip } from "react-tooltip";
import { title } from "process";
const { Option } = Select;
const StudentProfile = () => {
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const { t } = useTranslation(["profilestudent"]);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tempDOB, setTempDOB] = useState(undefined);
  const user = localStorage.getItem("userData");
  const userData = JSON.parse(user);

  const [avatarUser, setAvatarUser] = useState(
    localStorage.getItem("avatarUser")
  );
  //
  const [editedUser, setEditedUser] = useState(userData);
  const [errorMessageFullname, setErrorMessageFullname] = useState("");
  const [errorMessageHighSchool, setErrorMessageHighSchool] = useState("");
  const [isValueEmptyFullname, setIsValueEmptyFullname] = useState(false);
  const [errorMessageDOB, setErrorMessageDOB] = useState("");
  const [isValueEmptyDOB, setIsValueEmptyDOB] = useState(false);
  const [errorMessageAdminCode, setErrorMessageAdminCode] = useState("");
  const [isValueEmptyAdminCode, setIsValueEmptyAdminCode] = useState(false);
  const [errorMessageAdminMail, setErrorMessageAdminMail] = useState("");
  const [isValueEmptyAdminMail, setIsValueEmptyAdminMail] = useState(false);
  const [currentDOB, setCurrentDOB] = useState(editedUser.dob);
  const [errorMessageIDCard, setErrorMessageIDCard] = useState("");
  const [isValueEmptyIDCard, setIsValueEmptyIDCard] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);
  const [showButtons, setShowButtons] = useState(false);
  const [isEndwDot, setIsEndwDot] = useState(false);
  const [isValueEmpty, setIsValueEmpty] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState([]);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = ref(database, `users/${userData.id}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          const userDataFromDB = userSnapshot.val();
          setEditedUser(userDataFromDB);
          setCurrentDOB(userDataFromDB.dob);
          setAverageScore(
            calculateAverageScore(
              userDataFromDB.math,
              userDataFromDB.literature,
              userDataFromDB.english
            )
          );
          setScore(userDataFromDB);
        }
      } catch (error) {
        toast.error(t("errorFetchingUserData"));
      }
    };

    fetchUserData();
  }, [userData.id, t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowButtons(true);
    }, 6000);
    return () => clearTimeout(timeoutId);
  }, []);
  useEffect(() => {
    if (isEditing && editedUser && userData) {
      setAverageScore(
        calculateAverageScore(
          editedUser.math || userData.math,
          editedUser.literature || userData.literature,
          editedUser.english || userData.english
        )
      );
    }
  }, [isEditing, editedUser, userData]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setAvatarUser(imageSrc);
    setShowCamera(false);
  }, [webcamRef]);

  const validateScore = (score) => {
    if (score < 0 || score > 10 || score.length > 3) {
      return t("Scoremustbebetween0and10");
    }
    return "";
  };


  const handleScoreChange = (field, value) => {
    const error = validateScore(value);
    if (error) {
      setErrorMessageHighSchool(t("Scoremustbebetween0and10"));
      return;
    }
    setEditedUser({ ...editedUser, [field]: value });
  };
  const validateIDcard = (value) => {
    if (!/^\d+$/.test(value)) {
      return "ID card should only contain numbers";
    }
    return "";
  };
  
  const handleIdcardChange = (field, value) => {
    if (/^\d*$/.test(value)) {
      setEditedUser({ ...editedUser, [field]: value });
    } else {
      const error = validateIDcard(value);
      if (error) {
        toast.error(error);
      }
    }
  };

  const generateYearsOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 50; i--) {
      years.push(
        <Select.Option key={i} value={i.toString()}>
          {i}
        </Select.Option>
      );
    }
    return years;
  };

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("Filesizemustbelessthan2MB"));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatarUser(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  const updateUserInfo = async (user) => {
    try {
      const usersRef = ref(database, "users");
      const usersSnapshot = await get(usersRef);
      const users = usersSnapshot.val();
      let userIdToUpdateAdmin = userData.id;
      if (userData.role === "admin" || userData.role === "superadmin") {
        const adminRefToUpdate = ref(database, `admin/${userIdToUpdateAdmin}`);
        await update(adminRefToUpdate, user);
        toast.success(t("dataUpdatedSuccessfully"));
      } else {
        let userIdToUpdate;
        Object.keys(users).forEach((userId) => {
          if (users[userId].username === user.username) {
            userIdToUpdate = userId;
          }
        });

        if (userIdToUpdate) {
          const userRefToUpdate = ref(database, `users/${userIdToUpdate}`);
          await update(userRefToUpdate, user);
          dispatch(login_profile_Slice.actions.loginSuccess(user));
          toast.success(t("dataUpdatedSuccessfully"));
        } else {
          toast.error(t("userNotFoundForUpdating"));
        }
      }
    } catch (error) {
      toast.error(t("errorUpdatingUserInfo"));
    }
  };

  const handleSave = async () => {
    const mathError = validateScore(editedUser.math);
    const literatureError = validateScore(editedUser.literature);
    const englishError = validateScore(editedUser.english);

    if (mathError || literatureError || englishError) {
      toast.error(t("pleaseCorrectErrorsBeforeSaving"));
      return;
    }

    setShowSaveModal(true);
  };
  useEffect(() => {
    if (isEditing && editedUser && userData) {
      setAverageScore(
        calculateAverageScore(
          editedUser.math || userData.math,
          editedUser.literature || userData.literature,
          editedUser.english || userData.english
        )
      );
    }
  }, [isEditing, editedUser, userData]);

  const handleSaveConfirmed = async () => {
    setLoading(true);
    try {
      if (editedUser && editedUser.username === userData.username) {
        const userToSave = {
          ...editedUser,
          username: editedUser.username || userData.username,
          id_card: editedUser.id_card || userData.id_card,
          examcode: editedUser.examcode || userData.examcode,
          fullname: editedUser.fullname || userData.fullname,
          dob: editedUser.dob || userData.dob,
          gender: editedUser.gender || userData.gender,
          highschool_result:
            editedUser.highschool_result || userData.highschool_result,
          graduation_year:
            editedUser.graduation_year || userData.graduation_year,
          math: editedUser.math || userData.math,
          literature: editedUser.literature || userData.literature,
          english: editedUser.english || userData.english,
          avatarUser: avatarUser || userData.avatarUser,
          password: userData.password,
        };

        localStorage.setItem("userData", JSON.stringify(userToSave));
        dispatch(login_profile_Slice.actions.loginSuccess(userToSave));
        await updateUserInfo(userToSave);
        window.location.reload();

        if (avatarUser !== userData.avatarUser) {
          localStorage.setItem("avatarUser", avatarUser);
        }
      } else {
        toast.error(t("noEditedUserDataToSave"));
      }
    } catch (error) {
      toast.error(t("errorUpdatingData"));
    } finally {
      setIsEditing(false);
      setShowSaveModal(false);
      setTimeout(() => setLoading(false), 4000);
    }
  };

  const handleCancel = () => {
    setEditedUser(userData);
    setShowCamera(false);
    setIsValueEmpty(false);
    setErrorMessageFullname("");
    setIsValueEmptyFullname(false);
    setErrorMessageDOB("");
    setIsValueEmptyDOB(false);
    setErrorMessageAdminCode("");
    setIsValueEmptyAdminCode(false);
    setErrorMessageAdminMail("");
    setIsValueEmptyAdminMail(false);
    setErrorMessageHighSchool("");
    setErrorMessageHighSchool(false);
    setErrorMessageIDCard("");
    setIsValueEmptyIDCard(false);
    setCurrentDOB(editedUser.dob);
    const localAvatar = localStorage.getItem("avatarUser");
    if (localAvatar !== avatarUser) {
      setAvatarUser(localAvatar);
    }
  };

  const validateDateOfBirth = (dateOfBirth) => {
    const selectedDate = moment(dateOfBirth, "YYYY-MM-DD");
    if (!selectedDate.isValid()) return false;

    const currentDate = moment();
    const eighteenYearsAgo = currentDate.subtract(18, "years");

    return selectedDate.isBefore(eighteenYearsAgo);
  };

  const handleDateChange = (dateString) => {
    const isValidDate = validateDateOfBirth(dateString);
    if (isValidDate) {
      setEditedUser({ ...editedUser, dob: dateString });
      setErrorMessageDOB("");
      setIsValueEmptyDOB(false);
    } else {
      setErrorMessageDOB(t("Youmustbeatleast18yearsold"));
      setIsValueEmptyDOB(true);
    }
  };
  const handleGraduationYearChange = (year) => {
    const isValidYear = new Date().getFullYear();
    if (isValidYear)
      return setEditedUser({ ...editedUser, graduation_year: year });
  };

  const calculateAverageScore = (math, literature, english) => {
    const average =
      (parseFloat(math) + parseFloat(literature) + parseFloat(english)) / 3;
    return average.toFixed(1);
  };

  const [averageScore, setAverageScore] = useState(
    calculateAverageScore(userData.math, userData.literature, userData.english)
  );
  const config = {
    className: "custom-chart-class",
    data: [
      { type: t("math"), value: parseFloat(score.math) },
      { type: t("literature"), value: parseFloat(score.literature) },
      { type: t("english"), value: parseFloat(score.english) },
    ],
    angleField: "value",
    colorField: "type",
    paddingRight: 80,
    innerRadius: 0.6,
    position: "left",

    label: {
      text: "value",
      style: {
        fontWeight: "bold",
      },
    },
    legend: {
      color: {
        title: false,
        position: "top",
      },
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 20,
      },
    },
    theme: currentTheme,
    annotations: [
      {
        type: "text",
        style: {
          fill: currentTheme === "light" ? "#000" : "#fff",
          text: `${t("averageScore")} 
   ${averageScore}`,
          x: "50%",
          y: "50%",
          title: "",
          textAlign: "center",
          fontSize: 20,
          fontStyle: "bold",
        },
        tooltip: false,
      },
    ],
  };
  const [touchedFields, setTouchedFields] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  useEffect(() => {
    const validateForm = () => {
      const errors = {};
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{6,}$/;

      if (touchedFields.newPassword && newPassword && !passwordRegex.test(newPassword)) {
        errors.newPassword = t("passwordRequirements");
      }

      if (touchedFields.confirmPassword && newPassword !== confirmPassword) {
        errors.confirmPassword = t("passwordMismatch");
      }

      setErrors(errors);
      return errors;
    };

    const validationErrors = validateForm();
    setIsSubmitDisabled(
      !password || 
      !newPassword || 
      !confirmPassword || 
      Object.keys(validationErrors).length > 0
    );
  }, [password, newPassword, confirmPassword, touchedFields, t]);
  
  const handlePasswordChange = (e) => {
    const value = e.target.value.replace(/\s/g, "");
    setPassword(value);
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleOk_change = () => {
    const validationErrors = errors;
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const user = JSON.parse(localStorage.getItem("userData"));
    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);
        user.password = hashedPassword;
        localStorage.setItem("userData", JSON.stringify(user));

        const userRef =
          user.role === "admin" || user.role === "superadmin"
            ? ref(database, `admin/${user.id}`)
            : ref(database, `users/${user.id}`);

        update(userRef, { password: hashedPassword })
          .then(() => {
            notification.success({ message: t("passwordChangedSuccess") });
            setIsModalVisible(false);
            setPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
          })
          .catch((error) => {
            notification.error({
              message: t("passwordChangeError"),
              description: error.message,
            });
          });
      } else {
        setErrors({ password: t("currentPasswordIncorrect") });
      }
    } else {
      notification.error({ message: t("localStorageUserNotFound") });
    }
  };
  const validateIdCard = async (idCard) => {
    if (!/^[0-9]+$/.test(idCard)) {
      return t("onlyNumbers");
    }
    if (idCard.length !== 12) {
      return t("identificationNumberLength");
    }
    const studentRef = ref(database, "users");
    const snapshot = await get(studentRef);
    const studentData = snapshot.val();
    if (studentData) {
      const studentIDCards = Object.values(studentData).map(
        (uni) => uni.id_card
      );
      if (studentIDCards.includes(idCard)) {
        return t("studentIDExists");
      }
    }
    return null;
  };

  const handleCancel_change = () => {
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsModalVisible(false);
    setErrors({});
  };
  const handleChangePassword = () => {
    setIsModalVisible(true);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  return (
    <div className="content-profile">
      <ToastContainer />
      {userData && (
        <>
          <div className="content-profile-avt">
            <div className="content-profile-avt-box">
              <>
                <Image
                  className="student-pr5-avt"
                  width={230}
                  height={270}
                  src={avatarUser}
                  preview={{
                    mask: t("preview"),
                  }}
                />
              </>
            </div>

            <div>
              <div className="camera-container">
                <div className="camera-box">
                  {/* <button className="btn-format" data-tooltip-id="cameraTip">
                    <CameraOutlined onClick={() => setShowCamera(true)} />
                  </button> */}
                  <Tooltip id="cameraTip" place="top" effect="solid">
                    {t("camera")}
                  </Tooltip>
                  {showCamera && (
                    <div
                      class="camera-overlay"
                      onClick={() => setShowCamera(false)}
                    >
                      <div class="webcam-container">
                        <Webcam
                          className="camera-webcam"
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={videoConstraints}
                        />
                        {showButtons && (
                          <div className="webcam-buttons">
                            <Button onClick={capture}>{t("snap")}</Button>
                            <Button onClick={handleCancel}>
                              {t("cancel")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="btn-format"
                  data-tooltip-id="uploadTip"
                  onClick={handleImageUpload}
                >
                  <UploadOutlined />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </button>
                <Tooltip id="uploadTip" place="top" effect="solid">
                  {t("uploadImage")}
                </Tooltip>
                <div>
                  <button
                    onClick={handleChangePassword}
                    data-tooltip-id="changePass"
                    className="btn-format"
                  >
                    <KeyOutlined title={t("changeyourpassword")} />
                  </button>
                  <Tooltip id="changePass" place="top" effect="solid">
                    {t("changePassword")}
                  </Tooltip>
                </div>
              </div>

              <div className="ele ele-spc">
                <h2>{t("accountCreation")}:</h2>
                <h2>{userData.created_at}</h2>
              </div>
              <div className="ele ele-spc">
                <h2>{t("userRole")}:</h2>
                <h2>{userData.role}</h2>
              </div>
            </div>
          </div>
          <div className="content-profile-info">
            <div className="ele">
              <h2>{t("emailAddress")}:</h2>
              <div
                className={isValueEmptyAdminMail ? "ele-box-false" : "ele-box"}
              >
                <Input
                  value={editedUser?.username || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditedUser({ ...editedUser, username: value });

                    if (!value) {
                      setErrorMessageAdminMail(t("This field is required."));
                      setIsValueEmptyAdminMail(true);
                    } else if (!validateEmail(value)) {
                      setErrorMessageAdminMail(t("Invalid email address."));
                      setIsValueEmptyAdminMail(true);
                    } else {
                      setErrorMessageAdminMail("");
                      setIsValueEmptyAdminMail(false);
                    }
                  }}
                  disabled={userData.role === "student"}
                />
                {errorMessageAdminMail && (
                  <span className="error-mess">{errorMessageAdminMail}</span>
                )}
              </div>
            </div>

            <div className="ele">
              <h2>
                {userData.role === "student"
                  ? t("studentCode")
                  : t("adminCode")}
              </h2>
              <div
                className={isValueEmptyAdminCode ? "ele-box-false" : "ele-box"}
              >
                <div style={{ position: "relative" }}>
                  <Input
                    maxLength={8}
                    value={editedUser?.examcode || ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      const filteredValue = value.replace(/[^A-Z]/g, "");

                      setEditedUser({
                        ...editedUser,
                        examcode: filteredValue,
                      });

                      if (!filteredValue) {
                        setErrorMessageAdminCode(
                          t(
                            "This field is required and can only be entered in uppercase letter."
                          )
                        );
                        setIsValueEmptyAdminCode(true);
                      } else if (filteredValue.length !== 8) {
                        setErrorMessageAdminCode(
                          t("Please enter 8 uppercase characters.")
                        );
                        setIsValueEmptyAdminCode(true);
                      } else {
                        setErrorMessageAdminCode("");
                        setIsValueEmptyAdminCode(false);
                      }
                    }}
                    disabled
                  />
                  <span
                    className={`char-code-count ${
                      editedUser.examcode.length !== 8 ? "error" : ""
                    }`}
                  >
                    {editedUser.examcode.length}/8
                  </span>
                </div>
                <span className="error-mess"> {errorMessageAdminCode}</span>
              </div>
            </div>

            <div className="ele">
              <h2>{t("nationalIDCard")}:</h2>
              <div className={isValueEmptyIDCard ? "ele-box-false" : "ele-box"}>
                <Input
                  maxLength={12}
                  value={editedUser?.id_card || ""}
                  disabled={userData.role === "student"}
                  onChange={(e) => {
                    const value = e.target.value;
                    const filteredValue = value.replace(/[^0-9]/g, "");

                    handleIdcardChange("id_card", filteredValue);

                    if (!filteredValue) {
                      setErrorMessageIDCard(t("This field is required."));
                      setIsValueEmptyIDCard(true);
                    } else {
                      validateIdCard(filteredValue).then((error) => {
                        if (error) {
                          setErrorMessageIDCard(error);
                          setIsValueEmptyIDCard(true);
                        } else {
                          setErrorMessageIDCard("");
                          setIsValueEmptyIDCard(false);
                        }
                      });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    const filteredValue = value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 12);

                    handleIdcardChange("id_card", filteredValue);

                    if (!filteredValue) {
                      setErrorMessageIDCard(t("This field is required."));
                      setIsValueEmptyIDCard(true);
                    } else {
                      validateIdCard(filteredValue).then((error) => {
                        if (error) {
                          setErrorMessageIDCard(error);
                          setIsValueEmptyIDCard(true);
                        } else {
                          setErrorMessageIDCard("");
                          setIsValueEmptyIDCard(false);
                        }
                      });
                    }
                  }}
                />
                <span
                  className={`char-idcard ${
                    editedUser.id_card.length !== 0 &&
                    editedUser.id_card.length !== 12
                      ? "error"
                      : ""
                  }`}
                >
                  {editedUser.id_card.length}/12
                </span>
                {errorMessageIDCard && (
                  <span className="error-mess">{errorMessageIDCard}</span>
                )}
              </div>
            </div>

            <div className="ele">
              <h2>{t("fullName")}:</h2>
              <div
                className={isValueEmptyFullname ? "ele-box-false" : "ele-box"}
              >
                <Input
                  value={editedUser?.fullname || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const containsInvalidChars = /[^\p{L}\s]/u.test(value);
                    setEditedUser({ ...editedUser, fullname: value });
                    if (!value) {
                      setErrorMessageFullname(t("This field is required."));
                      setIsValueEmptyFullname(true);
                    } else if (containsInvalidChars) {
                      setErrorMessageFullname(t("pleaseEnterValidFullName"));
                      setIsValueEmptyFullname(true);
                    } else {
                      setErrorMessageFullname("");
                      setIsValueEmptyFullname(false);
                    }
                  }}
                />
                {errorMessageFullname && (
                  <span className="error-mess">{errorMessageFullname}</span>
                )}
              </div>
            </div>
            
            {userData.role === "student" && (
              <>
                <div className="ele">
                  <h2>{t("dateofBirth")}:</h2>
                  <div
                    className={
                      isValueEmptyDOB ? "ele-box-false-spc" : "ele-box"
                    }
                  >
                    <DatePicker
                      className="width-200"
                      value={currentDOB ? moment(currentDOB) : undefined}
                      onChange={(date, dateString) => {
                        handleDateChange(dateString);

                        if (!dateString) {
                          setErrorMessageDOB(t("This field is required."));
                          setIsValueEmptyDOB(true);
                          setCurrentDOB(undefined);
                        } else if (!validateDateOfBirth(dateString)) {
                          setErrorMessageDOB(t("Youmustbeatleast18yearsold"));
                          setIsValueEmptyDOB(true);
                          setCurrentDOB(undefined);
                        } else {
                          setErrorMessageDOB("");
                          setIsValueEmptyDOB(false);
                          setCurrentDOB(dateString);
                          setEditedUser({ ...editedUser, dob: dateString });
                        }
                      }}
                      onFocus={() => {
                        setTempDOB(currentDOB);
                        setCurrentDOB(undefined);
                        setIsValueEmptyDOB(true);
                        setErrorMessageDOB(t("This field is required."));
                      }}
                      placeholder="Select Date of Birth"
                    />
                    {errorMessageDOB && (
                      <span className="error-mess">{errorMessageDOB}</span>
                    )}
                  </div>
                </div>

                <div className="ele">
                  <h2>{t("gender")}:</h2>

                  <Select
                    className="width-200"
                    value={editedUser?.gender || ""}
                    onChange={(value) =>
                      setEditedUser({ ...editedUser, gender: value })
                    }
                  >
                    <Option value="male">{t("male")}</Option>
                    <Option value="female">{t("female")}</Option>
                  </Select>
                </div>

                <div className="ele">
                  <h2>{t("graduationYear")}:</h2>

                  <Select
                    className="width-200"
                    value={editedUser?.graduation_year || ""}
                    onChange={(value) => handleGraduationYearChange(value)}
                  >
                    {generateYearsOptions()}{" "}
                  </Select>
                </div>
                <div className="ele">
                  <h2>{t("highschoolResult")}:</h2>
                  <div className={isValueEmpty ? "ele-box-false" : "ele-box"}>
                    <Input
                      type="text"
                      value={editedUser?.highschool_result || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const filteredValue = value.replace(/[^0-9.]/g, "");

                        const dotCount = (filteredValue.match(/\./g) || [])
                          .length;

                        if (dotCount > 1) {
                          setErrorMessageHighSchool(
                            t("Only one dot is allowed.")
                          );
                        } else if (filteredValue.endsWith(".")) {
                          setErrorMessageHighSchool(t("Invalid input."));
                        } else {
                          setErrorMessageHighSchool("");
                        }

                        if (!filteredValue.includes("e") && dotCount <= 1) {
                          handleScoreChange("highschool_result", filteredValue);
                        }

                        if (filteredValue === "") {
                          setErrorMessageHighSchool(
                            t("This field is required.")
                          );
                          setIsValueEmpty(true);
                        } else {
                          setIsValueEmpty(false);
                        }
                      }}
                    />
                    {errorMessageHighSchool && (
                      <span className="error-mess">
                        {errorMessageHighSchool}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ele">
                  <>
                    <h2>{t("math")}:</h2>
                    <Input
                      type="text"
                      value={editedUser?.math || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const filteredValue = value.replace(/[^0-9.]/g, "");
                        if (!filteredValue.includes("e")) {
                          handleScoreChange("math", filteredValue);
                        }
                      }}
                      disabled={userData.role === "student"}
                    />
                  </>
                </div>

                <div className="ele">
                  <>
                    <h2>{t("literature")}:</h2>
                    <Input
                      type="text"
                      value={editedUser?.literature || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const filteredValue = value.replace(/[^0-9.]/g, "");
                        if (!filteredValue.includes("e")) {
                          handleScoreChange("literature", filteredValue);
                        }
                      }}
                      disabled={userData.role === "student"}
                    />
                  </>
                </div>

                <div className="ele">
                  <>
                    <h2>{t("english")}:</h2>
                    <Input
                      type="text"
                      value={editedUser?.english || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const filteredValue = value.replace(/[^0-9.]/g, "");
                        if (!filteredValue.includes("e")) {
                          handleScoreChange("english", filteredValue);
                        }
                      }}
                      disabled={userData.role === "student"}
                    />
                  </>
                </div>
                <div className="ele">
                  <>
                    <h2>{t("averageScore")}:</h2>
                    <Input
                      type="text"
                      value={averageScore}
                      // onChange={(e) => {
                      //   const value = e.target.value;
                      //   const filteredValue = value.replace(/[^0-9.]/g, "");
                      //   if (!filteredValue.includes("e")) {
                      //     handleScoreChange("english", filteredValue);
                      //   }
                      // }}
                      disabled={userData.role === "student"}
                    />
                  </>
                </div>
              </>
            )}
          </div>
          <div className="btn-function">
            <Flex className="btn-box" gap="small" wrap>
              <>
                <Button onClick={handleCancel}>{t("Resert")}</Button>

                <Button
                  type="primary"
                  onClick={handleSave}
                  disabled={
                    !editedUser.username ||
                    !editedUser.id_card ||
                    !editedUser.examcode ||
                    !editedUser.fullname ||
                    errorMessageAdminCode ||
                    errorMessageAdminMail ||
                    errorMessageHighSchool ||
                    errorMessageIDCard ||
                    isValueEmptyIDCard ||
                    isValueEmptyFullname ||
                    errorMessageDOB ||
                    (userData.role === "student" &&
                      (!editedUser.gender ||
                        !editedUser.highschool_result ||
                        !editedUser.graduation_year ||
                        !editedUser.math ||
                        !editedUser.literature ||
                        !editedUser.english ||
                        !editedUser.dob ||
                        isEndwDot))
                  }
                >
                  {t("save")}
                </Button>
              </>
            </Flex>
          </div>
        </>
      )}

      <Modal
        title={t("confirmSave")}
        open={showSaveModal}
        onCancel={() => setShowSaveModal(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setShowSaveModal(false)}
            disabled={loading}
          >
            {t("cancel")}
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSaveConfirmed}
            disabled={loading}
          >
            {t("save")}
          </Button>,
        ]}
        visible={showSaveModal}
      >
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <Spin />
          </div>
        ) : (
          <>
            <p>{t("confirmSaveChanges")}</p>
          </>
        )}
      </Modal>

      <Modal
        title={t("changePassword")}
        open={isModalVisible}
        onOk={handleOk_change}
        onCancel={handleCancel_change}
        footer={[
          <Button
            type="primary"
            danger
            key="cancel"
            onClick={handleCancel_change}
          >
            {t("cancel")}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk_change}
            disabled={isSubmitDisabled}
          >
            {t("submit")}
          </Button>,
        ]}
      >
        <div className="change-pass-box">
          <label htmlFor="currentPassword">{t("currentPassword")}:</label>
          <Input.Password
            id="currentPassword"
            value={password}
            placeholder={t("currentPassword")}
            onChange={handlePasswordChange}
            className={errors.password && "error-input"}
          />
          {errors.password && (
            <div className="error-notify">{errors.password}</div>
          )}
        </div>

        <div className="change-pass-box">
          <label htmlFor="newPassword">{t("newPassword")}:</label>
          <Input.Password
            id="newPassword"
            value={newPassword}
            placeholder={t("newPassword")}
            onChange={(e) => setNewPassword(e.target.value)}
            className={errors.newPassword && "error-input"}
            onBlur={() => handleBlur("newPassword")}
          />
          {errors.newPassword && (
            <div className="error-notify">{errors.newPassword}</div>
          )}
        </div>

        <div className="change-pass-box">
          <label htmlFor="confirmNewPassword">{t("confirmNewPassword")}:</label>
          <Input.Password
            id="confirmNewPassword"
            value={confirmPassword}
            placeholder={t("confirmNewPassword")}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.confirmPassword && "error-input"}
            onBlur={() => handleBlur("confirmPassword")}
          />
          {errors.confirmPassword && (
            <div className="error-notify">{errors.confirmPassword}</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StudentProfile;
