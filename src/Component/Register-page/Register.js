import React, { useState, useEffect } from "react";
import { Button, Form, Input, Select, Row, Col, Radio, Modal } from "antd";
import "./Register.css";
import { update, ref, get } from "firebase/database";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { generateRandomString } from "../../helpers/commonFunc";
import bcrypt from "bcryptjs";
import { database } from "../../firebase";

const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const App = () => {
  const { t } = useTranslation(["register"]);
  const [form] = Form.useForm();
  const [userType, setUserType] = useState(null);
  const [randomString] = useState(generateRandomString());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentID, setStudentID] = useState("");
  const [studentGender, setStudentGender] = useState("");
  const [userRole, setUserRole] = useState("");
  const [rerender, setRerender] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [studentEmailError, setStudentEmailError] = useState(false);
  const [studentGenderError, setStudentGenderError] = useState(false);
  const [studentIDError, setstudentIDError] = useState(false);
  const [studentNameError, setStudentNameError] = useState(false);
  const [studentPassword, setStudentPassword] = useState("");

  const [passwordError, setpasswordError] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] =
    useState(false);
  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    const userData = JSON.parse(userDataString);
    setUserRole(userData?.role);
  }, []);

  useEffect(() => {
    setRerender((prev) => !prev);
  }, [userType]);

  const writeUserData = async (userData) => {
    try {
      const usersRef = ref(database, "users");
      const adminRef = ref(database, "admin");
      const snapshot = await get(usersRef);
      const adminSnapshot = await get(adminRef);
      const users = snapshot.val();
      const admin = adminSnapshot.val();
      let newUserKey;
      let newAdminKey;

      if (users) {
        newUserKey = Object.keys(users).length + 1;
      } else {
        newUserKey = 1;
      }

      if (admin) {
        newAdminKey = Object.keys(admin).length + 1;
      } else {
        newAdminKey = 1;
      }

      const updates = {};

      if (userData.role === "admin") {
        updates[`admin/ad${newAdminKey}`] = {
          ...userData,
          math: "0",
          english: "0",
          literature: "0",
          dob: "2004-01-01",
          graduation_year: "2022",
          examcode: "ADMINHEH",
          highschool_result: "0",
        };
      } else {
        updates[`users/user${newUserKey}`] = {
          ...userData,
          math: "1",
          english: "1",
          literature: "1",
          dob: "2004-01-01",
          graduation_year: "2022",
          highschool_result: "1",
        };
      }
      await update(ref(database), updates);
    } catch (error) {}
  };

  const getNewUserKey = async () => {
    try {
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);
      const users = snapshot.val();
      let newKey;

      if (users) {
        newKey = Object.keys(users).length + 1;
      } else {
        newKey = 1;
      }

      return newKey;
    } catch (error) {
      return null;
    }
  };

  const getNewAdminKey = async () => {
    try {
      const adminRef = ref(database, "admin");
      const snapshot = await get(adminRef);
      const admin = snapshot.val();
      let newKey;

      if (admin) {
        newKey = Object.keys(admin).length + 1;
      } else {
        newKey = 1;
      }

      return newKey;
    } catch (error) {
      return null;
    }
  };

  const checkEmailExistence = async (email) => {
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);
    const users = snapshot.val();
    if (users) {
      const existingUser = Object.values(users).find(
        (user) => user.username === email
      );
      return !!existingUser;
    }
    return false;
  };

  const checkIdCardExistence = async (idCard) => {
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);
    const users = snapshot.val();
    if (users) {
      const existingUser = Object.values(users).find(
        (user) => user.idCard === idCard
      );
      return !!existingUser;
    }
    return false;
  };

  const showConfirmModal = () => {
    setIsConfirmModalVisible(true);
  };

  const handleCancelConfirmModal = () => {
    setIsConfirmModalVisible(false);
  };

  const handleOkConfirmModal = () => {
    setIsConfirmModalVisible(false);
    setStudentID("");
    onFinish();
  };

  const handleClear = () => {
    setIsModalVisible(true);
  };

  const handleUserTypeChange = (e) => {
    const newUserType = e.target.value;
    setUserType(newUserType);
    setTimeout(() => {
      form.resetFields();
      setStudentID("");
    }, 0);

    if (userRole === "admin") {
      setUserType("student");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleClearConfirmed = () => {
    form.resetFields();
    setStudentID("");
    setIsModalVisible(false);
  };
  const onFinish = async () => {
    setIsRegisterButtonDisabled(true);
    const role = userType || "admin";
    console.log("ROle", role);
    const examCode = userType === "admin" ? "0" : randomString;
    const emailExists = await checkEmailExistence(studentEmail);

    if (emailExists) {
      toast.error(t("emailAlreadyRegistered"));
      setIsRegisterButtonDisabled(false);
      return;
    }

    const newUserKey = await getNewUserKey();
    const newAdKey = await getNewAdminKey();
    const id = userType === "admin" ? `ad${newAdKey}` : `user${newUserKey}`;
    const salt = bcrypt.genSaltSync(10);
    const registStudent_hashPassword = bcrypt.hashSync(studentPassword, salt);
    const getCurrentDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const getDay = getCurrentDate();
    const userData = {
      created_at: getDay,
      id: id,
      username: studentEmail,
      fullname: studentName,
      password: registStudent_hashPassword,
      gender: studentGender,
      role: userRole === "admin" ? "student" : role,
      id_card: studentID,
      examcode: examCode,
      ...(userType === "admin" && {
        math: "0",
        english: "0",
        literature: "0",
        dob: "2004-01-01",
        graduation_year: "2022",
        examcode: "admin",
        highschool_result: "0",
      }),
    };

    try {
      await writeUserData(userData, userType);
      toast.success(t("registrationSuccessful"), {
        autoClose: 2000,
      });
      form.resetFields();
    } catch (error) {
      toast.error(t("registrationFailed"));
    } finally {
      setIsRegisterButtonDisabled(false);
    }
    window.location.reload();
  };
  const validateNoNumbers = (rule, value) => {
    if (/\d/.test(value)) {
      return Promise.reject(t("Name cannot contain numbers."));
    }
    return Promise.resolve();
  };

  return (
    <>
      <div>
        <ToastContainer />
        <Form
          {...formItemLayout}
          form={form}
          name="register"
          onFinish={onFinish}
          className="resigter-form-css"
          scrollToFirstError
        >
          <div className="title-box">
            <h2>{t("registration")}</h2>
            {userRole === "superadmin" && (
              <Radio.Group
                defaultValue="admin"
                buttonstyle="solid"
                onChange={handleUserTypeChange}
              >
                <Radio.Button value="student">{t("student")}</Radio.Button>
                <Radio.Button value="admin">{t("admin")}</Radio.Button>
              </Radio.Group>
            )}
            {userRole === "admin" && (
              <Button
                defaultValue="student"
                buttonstyle="solid"
                style={{ marginRight: "20px" }}
              >
                {t("student")}
              </Button>
            )}
          </div>
          <div className="input-box">
            <Row className="input-box-flex" gutter={[16, 8]}>
              <Col xs={24} sm={13}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={20}>
                    <span className="required-star">*</span>
                    <span> {t("email")}</span>
                  </Col>
                </Row>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={24}>
                    <Form.Item
                      tabIndex={1}
                      name="email"
                      autoComplete="off"
                      rules={[
                        {
                          type: "email",
                          message: t("invalidEmail"),
                        },
                        {
                          required: true,
                          message: t("inputEmail"),
                        },
                        () => ({
                          async validator(_, value) {
                            if (value) {
                              const emailExists = await checkEmailExistence(
                                value
                              );
                              if (emailExists) {
                                return Promise.reject(
                                  new Error(t("emailAlreadyRegistered"))
                                );
                              }
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Input
                        placeholder={t("pleaseEnterEmail")}
                        onChange={async (e) => {
                          const value = e.target.value;
                          setStudentEmail(value);
                          const isEmailInvalid =
                            !value || !/\S+@\S+\.\S+/.test(value);
                          let emailExists = false;
                          if (!isEmailInvalid) {
                            emailExists = await checkEmailExistence(value);
                          }
                          setStudentEmailError(isEmailInvalid || emailExists);
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col xs={24} sm={13}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={24}>
                    <span className="required-star">*</span>
                    <span> {t("fullname")}</span>
                  </Col>
                </Row>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={24}>
                    <Form.Item
                      tabIndex={2}
                      name="nickname"
                      autoComplete="off"
                      rules={[
                        {
                          required: true,
                          message: t("pleaseInputYourFullname"),
                          whitespace: true,
                        },
                        {
                          validator: (_, value) => {
                            if (!value || !/^[\p{L}\s]+$/u.test(value)) {
                              return Promise.reject(
                                new Error(t("pleaseEnterValidFullName"))
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input
                        placeholder={t("pleaseEnterFullName")}
                        autoComplete="username"
                        onChange={(e) => {
                          const value = e.target.value;
                          setStudentName(value);
                          setStudentNameError(
                            !value || !/^[\p{L}\s]+$/u.test(value)
                          );
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="input-box-flex" gutter={[16, 8]}>
              <Col xs={24} sm={13}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={24}>
                    <span className="required-star">*</span>
                    <span> {t("password")}</span>
                  </Col>
                </Row>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={24}>
                    <Form.Item
                      tabIndex={3}
                      name="rpassword"
                      autoComplete="off"
                      className="custom-form-item"
                      rules={[
                        {
                          required: true,
                          message: t("pleaseInputYourPassword"),
                        },
                        {
                          min: 8,
                          message: t("passwordLength"),
                        },
                        {
                          pattern: /^(?=.*[A-Z])/,
                          message: t("passwordUppercase"),
                        },
                        {
                          pattern: /^(?=.*[0-9])/,
                          message: t("passwordNumber"),
                        },
                        {
                          pattern: /^(?=.*[!@#$%^&*])/,
                          message: t("passwordSpecial"),
                        },
                        {
                          pattern: /^(?=.*[a-z])/,
                          message: t("passwordLowercase"),
                        },
                      ]}
                      hasFeedback
                    >
                      <Input.Password
                        placeholder={t("pleaseInputpassword")}
                        className="input-password"
                        autoComplete="current-password"
                        onChange={(e) => {
                          setStudentPassword(e.target.value);
                          setpasswordError(!e.target.value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={24}>
                    <span className="required-star">*</span>
                    <span> {t("identificationNumber")}</span>
                  </Col>
                </Row>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={24}>
                    <Form.Item
                      tabIndex={5}
                      name="idCard"
                      autoComplete="off"
                      rules={[
                        {
                          required: true,
                          message: t("inputIdentificationNumber"),
                        },
                        {
                          pattern: /^[0-9]+$/,
                          message: t("onlyNumbers"),
                        },
                        {
                          len: 12,
                          message: t("identificationNumberLength"),
                        },
                        {
                          validator: async (_, value) => {
                            const studentRef = ref(database, "users");
                            const snapshot = await get(studentRef);
                            const studentData = snapshot.val();
                            if (studentData) {
                              const studentIDCards = Object.values(
                                studentData
                              ).map((uni) => uni.id_card);
                              if (studentIDCards.includes(value)) {
                                return Promise.reject(t("studentIDExists"));
                              }
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <div className="input-idcard">
                        <Input
                          maxLength={12}
                          placeholder={t("pleaseInputIDCard")}
                          onChange={async (e) => {
                            const idCard = e.target.value.replace(/\s/g, "");
                            setStudentID(idCard);
                            const isIdCardExists = await checkIdCardExistence(
                              idCard
                            );
                            setstudentIDError(
                              !/^[0-9]+$/.test(idCard) ||
                                idCard.length !== 12 ||
                                isIdCardExists
                            );
                          }}
                          value={studentID}
                          className="input-field"
                        />
                        <span
                          className={`char-idcard ${
                            studentID.length !== 0 && studentID.length !== 12
                              ? "error"
                              : ""
                          }`}
                        >
                          {studentID.length}/12
                        </span>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col xs={24} sm={13}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={24}>
                    <span className="required-star">* </span>
                    <span>{t("confirmPassword")}</span>
                  </Col>
                </Row>
                <Row gutter={[16, 8]}>
                  <Col xs={24} sm={24}>
                    <Form.Item
                      tabIndex={4}
                      name="rconfirm"
                      dependencies={["password"]}
                      hasFeedback
                      autoComplete="off"
                      className="custom-form-item"
                      rules={[
                        {
                          required: true,
                          message: t("pleaseInputYourConfirmPassword"),
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue("rpassword") === value
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(t("passwordsDoNotMatch"))
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        placeholder={t("pleaseInputconpassword")}
                        className="input-password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => {
                          const value = e.target.value;
                          setConfirmPassword(value);
                          if (
                            form &&
                            form.getFieldValue("rpassword") !== value
                          ) {
                            setConfirmPasswordError(t("passwordsDoNotMatch"));
                          } else {
                            setConfirmPasswordError("");
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {userType === "student" && (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24}>
                      <span className="required-star">* </span>
                      <span>{t("examCode")}</span>
                    </Col>
                  </Row>
                )}
                {userType === "student" && (
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={8}>
                      <Input value={randomString} disabled />
                    </Col>
                  </Row>
                )}
                {userRole === "admin" && (
                  <Col xs={24} sm={16}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={24}>
                        <span className="required-star">* </span>
                        <span> {t("examCode")}</span>
                      </Col>
                    </Row>
                    <Row gutter={[16, 8]}>
                      <Col xs={24} sm={8}>
                        <Input value={randomString} disabled />
                      </Col>
                    </Row>
                  </Col>
                )}
              </Col>
            </Row>

            <Col xs={6} sm={5}>
              <Form.Item
                name="gender"
                label={t("gender")}
                rules={[
                  {
                    required: true,
                    message: t("selectGender"),
                  },
                ]}
              >
                <Select
                  placeholder={t("selectGender")}
                  onChange={(value) => {
                    setStudentGender(value);
                    setStudentGenderError(!value);
                  }}
                >
                  <Option value="male">{t("male")}</Option>
                  <Option value="female">{t("female")}</Option>
                </Select>
              </Form.Item>
            </Col>

            <Form.Item {...tailFormItemLayout}>
              <Button
                type="primary"
                htmlType="button"
                className="register-sub-btn"
                onClick={showConfirmModal}
                disabled={
                  isRegisterButtonDisabled ||
                  studentEmailError ||
                  studentGenderError ||
                  studentNameError ||
                  passwordError ||
                  confirmPasswordError ||
                  !studentName ||
                  !studentEmail ||
                  !studentPassword ||
                  !studentGender ||
                  (userType === "student" && !studentID) ||
                  (userType === "student" && studentIDError)
                }
              >
                {t("register")}
              </Button>
              <Modal
                title={t("confirmRegister")}
                open={isConfirmModalVisible}
                onOk={handleOkConfirmModal}
                onCancel={handleCancelConfirmModal}
                okText={t("ok")}
                cancelText={t("cancel")}
              >
                <p>{t("areYouSureYouWantToRegister")}</p>
              </Modal>
              <Button onClick={handleClear}>{t("clear")}</Button>
              <Modal
                title={t("confirmClear")}
                open={isModalVisible}
                onOk={handleClearConfirmed}
                onCancel={handleCancel}
                okText={t("ok")}
                cancelText={t("cancel")}
              >
                <p>{t("areYouSureYouWantToClearAllFields")}</p>
              </Modal>
            </Form.Item>
          </div>
        </Form>
      </div>
    </>
  );
};
export default App;
