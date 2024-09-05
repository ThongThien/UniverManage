import React, { useState, useEffect } from "react";
import { ref, get, update, remove } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSearch, faMars, faVenus } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { database } from "../../firebase";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  Button,
  Input,
  ConfigProvider,
  Space,
  Table,
  Select,
  Modal,
  Col,
  Form,
  Row,
  Drawer,
  DatePicker,
  Spin,
  Alert,
  Tooltip,
} from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./StudentManagement.css";
import { generateRandomString } from "../../helpers/commonFunc";

const { Option } = Select;
library.add(faSearch);
const StudentManagement = (pos) => {
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("all");
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerVisit, setdrawerVisit] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentDOB, setStudentDOB] = useState("");
  const [studentIDCard, setStudentIDCard] = useState("");
  const [randomString, setRandomString] = useState(generateRandomString());
  const [studentMathScore, setStudentMathScore] = useState("");
  const [studentLiteratureScore, setStudentLiteratureScore] = useState("");
  const [studentEnglishScore, setStudentEnglishScore] = useState("");
  const [studentHighschoolResult, setStudentHighschoolResult] = useState("");
  const [studentHighschoolGraduationYear, setStudentHighschoolGraduationYear] =
    useState("");
  const [studentHighschoolResultError, setStudentHighschoolResultError] =
    useState(false);
  const [studentNameError, setStudentNameError] = useState(false);
  const [studentDOBError, setStudentDOBError] = useState(false);
  const [studentEmailError, setStudentEmailError] = useState(false);
  const [studentGenderError, setStudentGenderError] = useState(false);
  const [studentEnglishScoreError, setStudentEnglishScoreError] =
    useState(false);
  const [
    studentHighschoolGraduationYearError,
    setStudentHighschoolGraduationYearError,
  ] = useState(false);
  const [studentIDCardError, setStudentIDCardError] = useState(false);
  const [studentLiteratureScoreError, setStudentLiteratureScoreError] =
    useState(false);
  const [studentMathScoreError, setStudentMathScoreError] = useState(false);
  const [countStudent, setCountStudent] = useState("");
  const [studentGender, setStudentGender] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const showClearConfirm = () => setConfirmClearVisible(true);
  const hideSubmitConfirm = () => setConfirmSubmitVisible(false);
  const hideClearConfirm = () => setConfirmClearVisible(false);
  const [form] = Form.useForm();
  const [confirmSubmitVisible, setConfirmSubmitVisible] = useState(false);
  const [confirmClearVisible, setConfirmClearVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const { t } = useTranslation(["studentmanager"]);
  let timeoutId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const usersRef = ref(database, "users");
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersData = Object.values(snapshot.val()).filter(
            (item) => item.role === "student"
          );
          setFilteredDataSource(usersData);
          setDataFetched(true);
          setCountStudent(Object.keys(usersData).length);
        }
      } catch (error) {
        console.error(t("errorFetchingUserData"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t, dataFetched]);

  useEffect(() => {
    if (editValue) {
      form.setFieldsValue({
        fullname: editValue.fullname,
        gender: editValue.gender,
        math: editValue.math,
        literature: editValue.literature,
        english: editValue.english,
      });
    }
  }, [editValue, form]);

  const handleInputChange = (e) => {
    const value = e.target ? e.target.value : e;
    setSearchText(value);
    clearTimeout(timeoutId);
    fetchData(value, searchColumn);
  };

  const fetchData = async (searchValue, searchColumn) => {
    try {
      setLoading(true);
      const usersRef = ref(database, "users");
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = Object.values(snapshot.val());
        setDataFetched(true);
        let filteredData = usersData.filter((item) => item.role === "student");

        const searchValueLowerCase = searchValue.toLowerCase();

        if (
          searchValueLowerCase === "male" ||
          searchValueLowerCase === "female"
        ) {
          filteredData = filteredData.filter(
            (item) => item.gender.toLowerCase() === searchValueLowerCase
          );
        } else if (searchValueLowerCase) {
          filteredData = filteredData.filter((item) => {
            const isDecimalNumber =
              !isNaN(searchValueLowerCase) &&
              searchValueLowerCase.includes(".");

            const checkValue = (value) => {
              if (isDecimalNumber) {
                return parseFloat(value) === parseFloat(searchValueLowerCase);
              }
              return String(value).toLowerCase().includes(searchValueLowerCase);
            };

            if (searchColumn === "all") {
              const excludedProperties = [
                "highschool_result",
                "dob",
                "username",
                "id",
                "graduation_year",
                "password",
                "gender",
                "role",
                "universities",
              ];
              return Object.entries(item).some(
                ([key, value]) =>
                  !excludedProperties.includes(key) && checkValue(value)
              );
            } else {
              const columnValue = item[searchColumn];
              return checkValue(columnValue);
            }
          });
        }

        if (
          JSON.stringify(filteredData) !== JSON.stringify(filteredDataSource)
        ) {
          setFilteredDataSource(filteredData);
          setCurrentPage(1);
        }
      }
    } catch (error) {
      console.error(t("errorFetchingUserData"), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (value) => {
    setSearchColumn(value);
    setCurrentPage(1);
    fetchData(searchText, value);
  };

  const handleAddClick = () => {
    setdrawerVisit(true);
  };

  const getUniInfo = async (universityID) => {
    try {
      const uniRef = ref(database, `universities/${universityID}`);
      const snapshot = await get(uniRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error(t("errorFetchingUserData"), error);
      return null;
    }
  };

  const handleDetailsClick = async (record) => {
    setSelectedRecord(record);
    if (record.universities && record.universities.length > 0) {
      const uniInfoPromises = record.universities.map((uniRef) =>
        getUniInfo(uniRef.id)
      );
      const uniInfoList = await Promise.all(uniInfoPromises);
      console.log(uniInfoList);
      const updatedRecord = {
        ...record,
        universities: uniInfoList.filter((uniInfo) => uniInfo !== null),
      };
      console.log(updatedRecord);
      setSelectedRecord(updatedRecord);
    }
  };

  const handleConfirmSubmit = () => {
    handleSubmit();
    setdrawerVisit(false);
    hideSubmitConfirm();
    toast.success(t("newAccountAddedSuccessfully"));
    const newRandomString = generateRandomString();
    setRandomString(newRandomString);
  };

  const handleSubmit = async () => {
    try {
      const sID = countStudent + 1;
      const sIDToString = sID.toString();
      const salt = bcrypt.genSaltSync(10);
      const addStu_hashPassword = bcrypt.hashSync(sIDToString, salt);
      const newUniversityData = {
        id: `user${sID}`,
        fullname: studentName,
        username: studentEmail,
        id_card: studentIDCard,
        dob: studentDOB,
        examcode: randomString,
        highschool_result: studentHighschoolResult,
        math: studentMathScore,
        english: studentEnglishScore,
        literature: studentLiteratureScore,
        gender: studentGender,
        role: "student",
        graduation_year: studentHighschoolGraduationYear,
        password: addStu_hashPassword,
      };

      await update(ref(database, `users/user${sID}`), newUniversityData);

      setdrawerVisit(false);
      setStudentName("");
      setStudentIDCard("");
      setStudentGender("");
      setStudentEmail("");
      setStudentEnglishScore("");
      setStudentLiteratureScore("");
      setStudentHighschoolResult("");
      setStudentMathScore("");
      setStudentHighschoolGraduationYear("");
      setCountStudent(sID);
      setFilteredDataSource((prevData) => [newUniversityData, ...prevData]);
      form.resetFields();
    } catch (error) {}
  };

  const showSubmitConfirm = () => {
    try {
      form.validateFields();
      setConfirmSubmitVisible(true);
    } catch (error) {
      toast.error(t("pleaseFillInAllRequiredFieldsCorrectly"));
    }
  };

  const handleCancel = () => {
    setdrawerVisit(false);
    setStudentName("");
    setStudentEmail("");
    setStudentDOB("");
    setStudentIDCard("");
    setStudentMathScore("");
    setStudentLiteratureScore("");
    setStudentEnglishScore("");
    setStudentHighschoolResult("");
    setCountStudent("");
    setSelectedRecord("");
    setStudentIDCard("");
    form.resetFields();
  };

  const customPagination = () => {
    const pluralize = (total) => {
      if (total > 1) {
        return t("students");
      } else {
        return t("student");
      }
    };
    return {
      current: currentPage,
      onChange: (page) => setCurrentPage(page),
      total: filteredDataSource.length,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total) => t("total") + ` ${total} ${pluralize(total)}`,
      pageSizeOptions: ["5", "10", "20", "50"],
    };
  };

  const handleClear = () => {
    form.resetFields();
  };

  const handleConfirmClear = () => {
    handleClear();
    hideClearConfirm();
    form.resetFields();
    setStudentIDCard("");
  };

  const handleEdit = (record) => {
    setIsEditing(true);
    setEditValue({ ...record });
  };

  const handleCloseEditing = () => {
    setIsEditing(false);
    setEditValue(null);
    setIsFormInvalid(false);
  };

  const handleSaveConfirm = () => {
    Modal.confirm({
      title: t("areYouSureYouWantToSave"),
      okText: t("yes"),
      cancelText: t("no"),
      onOk: async () => {
        handleSave();
      },
    });
  };

  const handleSave = async () => {
    if (editValue && editValue.id) {
      const userKey = `${editValue.id}`;
      const userRef = ref(database, `users/${userKey}`);

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();

          userData.math = editValue.math;
          userData.literature = editValue.literature;
          userData.english = editValue.english;

          const math = Number(editValue.math) || 0;
          const literature = Number(editValue.literature) || 0;
          const english = Number(editValue.english) || 0;
          const average = (math + literature + english) / 3;

          const universitiesRef = ref(
            database,
            `users/${userKey}/universities`
          );
          const universitiesSnapshot = await get(universitiesRef);
          let universitiesData = [];
          if (universitiesSnapshot.exists()) {
            universitiesData = universitiesSnapshot.val();
          }

          const updatedUniversities = universitiesData.filter((uni) => {
            return average >= uni.cutoffScore;
          });

          userData.universities = updatedUniversities;

          await update(userRef, userData);

          setFilteredDataSource((prev) =>
            prev.map((student) =>
              student.id === editValue.id ? userData : student
            )
          );
          handleCloseEditing();
          toast.success(t("editSuccessfully"));
        }
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: t("areYouSureYouWantToDeleteThisStudent"),
      okText: t("yes"),
      cancelText: t("no"),
      okType: "danger",
      onOk: async () => {
        try {
          const userKey = `${record.id}`;
          const userRef = ref(database, `users/${userKey}`);
          await remove(userRef);

          const universitiesRef = ref(database, "universities");
          const universitiesSnapshot = await get(universitiesRef);
          if (universitiesSnapshot.exists()) {
            universitiesSnapshot.forEach((universitySnapshot) => {
              const universityData = universitySnapshot.val();
              const studentsRegistered =
                universityData.studentsRegistered || [];

              const updatedStudentsRegistered = studentsRegistered.filter(
                (student) => student.id !== record.id
              );

              update(universitySnapshot.ref, {
                studentsRegistered: updatedStudentsRegistered,
              });
            });
          }

          // Hiển thị thông báo xóa thành công
          toast.success(t("deleteSuccessfully"));
        } catch (error) {
          // Xử lý lỗi nếu có
          toast.error(t("errorDeletingStudent"), error);
        }
      },
    });
  };

  const countRegisteredUniversities = (record) => {
    return record.universities ? record.universities.length : 0;
  };

  const fullNameTitle = (record) => {
    const registeredUniversities = countRegisteredUniversities(record);

    return registeredUniversities === 5
      ? t("fullName")
      : t("fullNameIncomplete");
  };

  const greenTextRow = (record) => {
    const registeredUniversities = countRegisteredUniversities(record);

    return registeredUniversities === 5 ? "green-text-row" : "";
  };
  const columns = (handleDetailsClick) => [
    {
      title: t("codeAndId"),
      width: 140,
      fixed: "left",
      render: (record) => (
        <React.Fragment>
          <span className="merged-column-1">{record.examcode}</span>
          <br />
          <span className="merged-column-2">{record.id_card}</span>
        </React.Fragment>
      ),
    },
    // {
    //   title: t("examCode"),
    //   dataIndex: "examcode",
    //   width: 140,
    //   fixed: "left",
    //   editable: true,
    //   sorter: (a, b) =>
    //     a.examcode.toLowerCase().localeCompare(b.examcode.toLowerCase()),
    //   responsive: ["sm"],
    // },
    // {
    //   title: t("idCard"),
    //   dataIndex: "id_card",
    //   width: 130,
    //   fixed: "left",
    //   editable: true,
    //   sorter: (a, b) => a.id_card - b.id_card,
    //   responsive: ["sm"],
    // },
    {
      title: t("fullNam"),
      dataIndex: "fullname",
      width: 220,
      marginLeft: 100,
      fixed: "left",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      render: (text, record) => {
        const gender = record.gender;
        return (
          <div className="fullname" onClick={() => handleDetailsClick(record)}>
            {gender === "male" ? (
              <FontAwesomeIcon icon={faMars} className="icon-maleIcon" />
            ) : gender === "female" ? (
              <FontAwesomeIcon icon={faVenus} className="icon-femaleIcon" />
            ) : null}
            <Tooltip title={fullNameTitle(record)} className="custom-tooltip">
              <span>{text}</span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: t("math"),
      dataIndex: "math",
      width: 80,
      editable: true,
      sorter: (a, b) => a.math - b.math,
      responsive: ["sm"],
    },
    {
      title: t("literature"),
      dataIndex: "literature",
      width: 100,
      editable: true,
      sorter: (a, b) => a.literature - b.literature,
      responsive: ["sm"],
    },
    {
      title: t("english"),
      dataIndex: "english",
      width: 90,
      editable: true,
      sorter: (a, b) => a.english - b.english,
      responsive: ["sm"],
    },
    {
      title: t("averageScore"),
      width: 140,
      key: "averageScore",
      render: (_, record) => {
        const math = Number(record.math) || 0;
        const literature = Number(record.literature) || 0;
        const english = Number(record.english) || 0;
        const average = ((math + literature + english) / 3).toFixed(1);
        return <span>{average}</span>;
      },
      sorter: (a, b) => {
        const getAverage = (record) => {
          const math = Number(record.math) || 0;
          const literature = Number(record.literature) || 0;
          const english = Number(record.english) || 0;
          return (math + literature + english) / 3;
        };
        return getAverage(a) - getAverage(b);
      },
    },
    // Icon col
    {
      title: t("action"),
      dataIndex: "Action",
      fixed: "right",
      width: 120,
      render: (_, record) => {
        return (
          <Space size={"middle"}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                handleEdit(record);
              }}
            />
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              onClick={() => {
                handleDelete(record);
              }}
            />
          </Space>
        );
      },
      responsive: ["xs"],
    },
    // Button Col
    {
      title: t("action"),
      dataIndex: "Action",
      fixed: "right",
      width: 180,
      render: (_, record) => {
        return (
          <Space size={"middle"}>
            <Button
              type="primary"
              onClick={() => {
                handleEdit(record);
              }}
            >
              {t("edit")}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleDelete(record);
              }}
            >
              {t("delete")}
            </Button>
          </Space>
        );
      },
      responsive: ["sm"],
    },
  ];
  const handleDrawerClose = () => {
    setdrawerVisit(false);
    form.resetFields();
    setStudentIDCard("");
  };

  const validateNoNumbers = (_, value) => {
    if (/\d/.test(value)) {
      return Promise.reject(t("Name cannot contain numbers."));
    }
    return Promise.resolve();
  };

  return (
    <div className="student-management" key={pos}>
      <ConfigProvider
        theme={{
          components: {
            Button: {
              colorPrimary: "#888",
              colorPrimaryHover: "black",
              colorPrimaryActive: "black",
            },
          },
        }}
      >
        <Space.Compact className="search-bar">
          <div className="button-group">
            <Button type={"primary"} onClick={handleAddClick}>
              {t("add")}
            </Button>
          </div>
          <Select
            className="search-select"
            defaultValue="all"
            onChange={handleSelectChange}
          >
            <Option value="all">{t("all")}</Option>
            <Option value="id_card">{t("id")}</Option>
            <Option value="fullname">{t("name")}</Option>
            <Option value="examcode">{t("examCode")}</Option>
            <Option value="math">{t("math")}</Option>
            <Option value="literature">{t("literature")}</Option>
            <Option value="english">{t("english")}</Option>
          </Select>
          <Input
            className="fix-overlap-css"
            placeholder={t("Search student...")}
            allowClear
            suffix={
              searchText === "" ? (
                <FontAwesomeIcon
                  icon={["fas", "search"]}
                  className="search-icon"
                />
              ) : null
            }
            value={searchText}
            onChange={handleInputChange}
          />
        </Space.Compact>
        <Spin spinning={loading}>
          <Table
            rowClassName={(record) => greenTextRow(record)}
            scroll={{
              y: "calc(68vh - 110px)",
            }}
            columns={columns(handleDetailsClick)}
            dataSource={filteredDataSource.map((item) => ({
              ...item,
              key: uuidv4(),
            }))}
            pagination={{ ...customPagination() }}
            showSorterTooltip={{
              target: "sorter-icon",
            }}
          />
        </Spin>

        <Drawer
          className="add-drawer"
          title={t("addStudent")}
          closable={false}
          width={720}
          onClose={handleDrawerClose}
          open={drawerVisit}
        >
          <Form layout="vertical" form={form} onFinish={showSubmitConfirm}>
            <Row className="add-student-box" gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="name"
                  label={t("fullNam")}
                  rules={[
                    {
                      validator: (_, value) => {
                        if (
                          !value ||
                          !/^[\p{L}\s]+$/u.test(value) ||
                          /^\s+$/.test(value)
                        ) {
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
                    className="fix-overlap-css"
                    autoComplete="off"
                    placeholder={t("pleaseEnterFullName")}
                    value={studentName}
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
              <Col span={8}>
                <Form.Item
                  name="gender"
                  label={t("gender")}
                  rules={[{ required: true, message: t("pleaseSelectGender") }]}
                >
                  <Select
                    placeholder={t("pleaseSelectGender")}
                    value={studentGender}
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
            </Row>

            <Row className="add-student-box" gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="gmail"
                  label={t("email")}
                  rules={[
                    { required: true, message: t("pleaseEnterEmail") },
                    {
                      async validator(_, value) {
                        if (!/\S+@\S+\.\S+/.test(value)) {
                          return Promise.reject(t("invalidEmailFormat"));
                        }

                        const studentRef = ref(database, "users");
                        const snapshot = await get(studentRef);
                        const studentData = snapshot.val();

                        if (studentData) {
                          const studentEmail = Object.values(studentData).map(
                            (uni) => uni.username
                          );
                          if (studentEmail.includes(value)) {
                            setStudentEmailError(true);
                            return Promise.reject(t("studentEmailExists"));
                          }
                        }

                        setStudentEmailError(false);
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    className="fix-overlap-css"
                    type="email"
                    autoComplete="off"
                    placeholder={t("pleaseEnterEmail")}
                    value={studentEmail}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      setStudentEmail(newEmail);
                      setStudentEmailError(false);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row className="add-student-box" gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="idCard"
                  label={t("idCard")}
                  rules={[
                    {
                      required: true,
                      message: t("pleaseInputIDCard"),
                    },
                    {
                      pattern: /^[0-9]+$/,
                      message: t("pleaseEnterOnlyNumbers"),
                    },
                    {
                      len: 12,
                      message: t("idCardLengthError"),
                    },
                    {
                      validator: async (_, value) => {
                        const studentRef = ref(database, "users");
                        const snapshot = await get(studentRef);
                        const studentData = snapshot.val();
                        if (studentData) {
                          const studentIDCards = Object.values(studentData).map(
                            (uni) => uni.id_card
                          );
                          if (studentIDCards.includes(value)) {
                            return Promise.reject(t("studentIDExists"));
                          }
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <div className="student-container">
                    <Input
                      maxLength={12}
                      className="fix-overlap-css"
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      autoComplete="off"
                      placeholder={t("pleaseInputIDCard")}
                      value={studentIDCard}
                      onChange={(e) => {
                        let newIDCard = e.target.value
                          .replace(/\s/g, "")
                          .slice(0, 12);
                        setStudentIDCard(newIDCard);
                      }}
                      // onBlur={() => {
                      //   if (studentIDCard.length === 12) {
                      //     setStudentIDCardError(true);
                      //   } else {
                      //     setStudentIDCardError(false);

                      //   }
                      // }}
                    />

                    <span
                      className={`char-count ${
                        studentIDCard.length !== 0 &&
                        studentIDCard.length !== 12
                          ? "error"
                          : ""
                      }`}
                    >
                      {studentIDCard.length}/12
                    </span>
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Row className="add-student-box" gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="examcode"
                  label={t("examCode")}
                  initialValue={randomString}
                >
                  <Input
                    disabled
                    autoComplete="off"
                    readOnly
                    value={randomString}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dob"
                  label={t("dateOfBirth")}
                  rules={[
                    { required: true, message: t("pleaseEnterDateOfBirth") },
                    {
                      validator: (_, value) => {
                        const today = new Date();
                        const cutoffDate = new Date(
                          today.getFullYear() - 17,
                          today.getMonth(),
                          today.getDate()
                        );
                        if (!value || value < cutoffDate) {
                          return Promise.resolve();
                        }
                        return Promise.reject(t("dateOfBirthMinimumAgeError"));
                      },
                    },
                  ]}
                >
                  <DatePicker
                    className="datePicker"
                    format="DD/MM/YYYY"
                    placeholder={t("pleaseEnterDateOfBirth")}
                    onChange={(date, dateString) => {
                      setStudentDOB(dateString);
                      setStudentDOBError(!dateString);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row className="add-student-box" gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="highschoolResult"
                  label={t("highSchoolResult")}
                  rules={[
                    {
                      required: true,
                      message: t("pleaseEnterHighSchoolResult"),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          value >= 0 &&
                          value <= 10 &&
                          !value.endsWith(".") &&
                          !/\s/.test(value)
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(t("highSchoolResultMustBeBetween0And10"))
                        );
                      },
                    }),
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || (value && value.length <= 3)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(t("maximum 3 characters"))
                        );
                      },
                    }),
                  ]}
                >
                  <Input
                    className="fix-overlap-css"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9,\.]*"
                    autoComplete="off"
                    placeholder={t("pleaseEnterHighSchoolResult")}
                    value={studentHighschoolResult}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isValidNumber =
                        /^\d*\.?\d*$/.test(value) &&
                        value.length <= 3 &&
                        !value.endsWith(".") &&
                        !/\s/.test(value);
                      setStudentHighschoolResult(value);
                      setStudentHighschoolResultError(
                        !/^\d*\.?\d+$/.test(e.target.value) ||
                          e.target.value > 10 ||
                          e.target.value < 0
                      );
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="graduationYear"
                  label={t("graduationYear")}
                  rules={[
                    { required: true, message: t("pleaseEnterGraduationYear") },
                  ]}
                >
                  <Select
                    placeholder={t("pleaseEnterGraduationYear")}
                    value={studentHighschoolGraduationYear}
                    onChange={(value) => {
                      setStudentHighschoolGraduationYear(value);
                      setStudentHighschoolGraduationYearError(!value);
                    }}
                    allowClear
                  >
                    {Array.from({ length: 31 }, (_, index) => {
                      const year = new Date().getFullYear() - index;
                      return (
                        <Option key={year} value={year}>
                          {year}
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row className="add-student-box" gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="mathScore"
                  label={t("mathScore")}
                  rules={[
                    {
                      required: true,
                      message: t("pleaseEnterMathScore"),
                    },
                    {
                      validator: (_, value) => {
                        if (value >= 0 && value <= 10) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(t("mathScoreMustBeBetween0And10"))
                        );
                      },
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || (value && value.length <= 3)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(t("maximum 3 characters"))
                        );
                      },
                    }),
                    {
                      validator: (_, value) => {
                        if (value && value.endsWith(".")) {
                          return Promise.reject(
                            new Error(t("ScoreMustNotEndWithDot"))
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      validator: (_, value) => {
                        if (value && /\s/.test(value)) {
                          return Promise.reject(
                            new Error(t("ScoreMustNotContainSpaces"))
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    className="fix-overlap-css"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9,\.]*"
                    autoComplete="off"
                    placeholder={t("pleaseEnterMathScore")}
                    value={studentMathScore}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setStudentMathScore(newValue);
                      setStudentMathScoreError(
                        !/^\d*\.?\d+$/.test(newValue) ||
                          newValue > 10 ||
                          newValue < 0 ||
                          /\s/.test(newValue)
                      );
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="englishScore"
                  label={t("englishScore")}
                  rules={[
                    {
                      required: true,
                      message: t("pleaseEnterEnglishScore"),
                    },
                    {
                      validator: (_, value) => {
                        if (value >= 0 && value <= 10) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(t("englishScoreMustBeBetween0And10"))
                        );
                      },
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || (value && value.length <= 3)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(t("maximum 3 characters"))
                        );
                      },
                    }),
                    {
                      validator: (_, value) => {
                        if (value && value.endsWith(".")) {
                          return Promise.reject(
                            new Error(t("ScoreMustNotEndWithDot"))
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      validator: (_, value) => {
                        if (value && /\s/.test(value)) {
                          return Promise.reject(
                            new Error(t("ScoreMustNotContainSpaces"))
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    className="fix-overlap-css"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9,\.]*"
                    autoComplete="off"
                    placeholder={t("pleaseEnterEnglishScore")}
                    value={studentEnglishScore}
                    onChange={(e) => {
                      setStudentEnglishScore(e.target.value);
                      setStudentEnglishScoreError(
                        !/^\d*\.?\d+$/.test(e.target.value) ||
                          e.target.value > 10 ||
                          e.target.value < 0
                      );
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="literatureScore"
                  label={t("literatureScore")}
                  rules={[
                    {
                      required: true,
                      message: t("pleaseEnterLiteratureScore"),
                    },
                    {
                      validator: (_, value) => {
                        if (value >= 0 && value <= 10) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(t("literatureScoreMustBeBetween0And10"))
                        );
                      },
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || (value && value.length <= 3)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(t("maximum 3 characters"))
                        );
                      },
                    }),
                    {
                      validator: (_, value) => {
                        if (value && value.endsWith(".")) {
                          return Promise.reject(
                            new Error(t("ScoreMustNotEndWithDot"))
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      validator: (_, value) => {
                        if (value && /\s/.test(value)) {
                          return Promise.reject(
                            new Error(t("ScoreMustNotContainSpaces"))
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    className="fix-overlap-css"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9,\.]*"
                    autoComplete="off"
                    placeholder={t("pleaseEnterLiteratureScore")}
                    value={studentLiteratureScore}
                    onChange={(e) => {
                      setStudentLiteratureScore(e.target.value);
                      setStudentLiteratureScoreError(
                        !/^\d*\.?\d+$/.test(e.target.value) ||
                          e.target.value > 10 ||
                          e.target.value < 0
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row className="add-student-box" gutter={16} justify="end">
              <Col span={24} className="button-position">
                <Form.Item className="inline-button">
                  <Button key="cancel" onClick={handleCancel}>
                    {t("cancel")}
                  </Button>
                </Form.Item>
                <Form.Item className="inline-button">
                  <Button key="clear" onClick={showClearConfirm}>
                    {t("clear")}
                  </Button>
                </Form.Item>
                <Form.Item className="inline-button">
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={
                      !studentHighschoolResult ||
                      !studentName ||
                      !studentDOB ||
                      !studentEmail ||
                      !studentGender ||
                      !studentEnglishScore ||
                      !studentHighschoolGraduationYear ||
                      !studentIDCard ||
                      !studentLiteratureScore ||
                      !studentMathScore ||
                      studentHighschoolResultError ||
                      studentNameError ||
                      studentDOBError ||
                      studentEmailError ||
                      studentGenderError ||
                      studentEnglishScoreError ||
                      studentHighschoolGraduationYearError ||
                      studentIDCardError ||
                      studentLiteratureScoreError ||
                      studentMathScoreError
                    }
                  >
                    {t("submit")}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>

        <Modal
          title={t("confirmSubmit-title")}
          open={confirmSubmitVisible}
          onCancel={hideSubmitConfirm}
          onOk={handleConfirmSubmit}
          okText={t("yes")}
          cancelText={t("no")}
        >
          <p>{t("confirmSubmit")}?</p>
        </Modal>

        <Modal
          title={t("confirmClear")}
          open={confirmClearVisible}
          onCancel={hideClearConfirm}
          onOk={handleConfirmClear}
          okText={t("yes")}
          cancelText={t("no")}
        >
          <p>{t("confirmClear-title")}</p>
        </Modal>

        <Modal
          title={t("studentDetail")}
          open={!!selectedRecord}
          onCancel={() => setSelectedRecord(null)}
          footer={null}
          className="student-details-modal"
          width={1100}
        >
          {selectedRecord && (
            <>
              <div className="modal-content-container">
                <div className="modal-content-detail">
                  <p>
                    {" "}
                    <span class="id-text">{t("id")}:</span> {selectedRecord.id}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span class="id-text">{t("examCode")}:</span>{" "}
                    {selectedRecord.examcode}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span class="id-text">{t("idCard")}:</span>{" "}
                    {selectedRecord.id_card}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span class="id-text">{t("gender")}:</span>{" "}
                    {selectedRecord.gender}{" "}
                  </p>{" "}
                </div>
                <div className="modal-content-detail">
                  <p>
                    {" "}
                    <span class="id-text">{t("fullNam")}:</span>{" "}
                    {selectedRecord.fullname}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span class="id-text">{t("dateOfBirth")}:</span>{" "}
                    {selectedRecord.dob}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span class="id-text">{t("email")}:</span>{" "}
                    {selectedRecord.username}{" "}
                  </p>
                  <p>
                    {" "}
                    <span class="id-text">{t("graduationYear")}:</span>{" "}
                    {selectedRecord.graduation_year}{" "}
                  </p>
                </div>
                <div className="modal-content-detail">
                  <p>
                    {" "}
                    <span class="id-text">{t("mathScore")}:</span>{" "}
                    {selectedRecord.math}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span class="id-text">{t("literatureScore")}:</span>{" "}
                    {selectedRecord.literature}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span class="id-text">{t("englishScore")}:</span>{" "}
                    {selectedRecord.english}{" "}
                  </p>{" "}
                  <p>
                    {" "}
                    <span class="id-text">{t("highSchoolResult")}:</span>{" "}
                    {selectedRecord.highschool_result}{" "}
                  </p>
                </div>
              </div>
              <hr />
              <div className="registered-students">
                {(selectedRecord.universities?.length ?? 0) === 0 && (
                  <p className="no-universities">
                    <Alert
                      message={t("warningStudentNotRegistered")}
                      type="warning"
                      showIcon
                    />
                  </p>
                )}
                {(selectedRecord.universities?.length ?? 0) > 0 && (
                  <div className="uni-table">
                    <p>{t("registeredUniversity")}</p>
                    <Table
                      rowClassName={(record) => {
                        const entranceNumber = Number(record.entranceNumber);
                        const registeredStudentsCount =
                          record.studentsRegistered
                            ? record.studentsRegistered.length
                            : 0;

                        if (registeredStudentsCount === entranceNumber) {
                          return "green-text-row";
                        }

                        return "";
                      }}
                      dataSource={selectedRecord.universities}
                      columns={[
                        {
                          title: t("universityId"),
                          dataIndex: "id",
                        },
                        {
                          title: t("universityName"),
                          dataIndex: "name",
                        },
                        {
                          title: t("address"),
                          dataIndex: "address",
                        },
                        {
                          title: t("admissionCutoffScore"),
                          dataIndex: "admissionCutoffScore",
                        },
                        {
                          title: t("registeredEntranceNumber"),
                          dataIndex: null,
                          render: (_, record) => (
                            <span>
                              {record.studentsRegistered
                                ? record.studentsRegistered.length
                                : 0}
                              /{record.entranceNumber}
                            </span>
                          ),
                        },
                      ]}
                      pagination={false}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </Modal>
        <Modal
          title={t("editStudentInfo")}
          open={isEditing}
          okText={t("save")}
          cancelText={t("close")}
          onOk={handleSaveConfirm}
          onCancel={handleCloseEditing}
          okButtonProps={{ disabled: isFormInvalid }}
        >
          <Form
            form={form}
            layout="vertical"
            onFieldsChange={(_, allFields) => {
              const hasErrors = allFields.some(
                (field) => field.errors && field.errors.length > 0
              );
              setIsFormInvalid(hasErrors);
            }}
          >
            <Form.Item label={t("examCode")}>
              <Input value={editValue?.examcode} disabled />
            </Form.Item>
            <Form.Item
              disabled
              className="fullname-input"
              label={t("idCard")}
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
              ]}
            >
              <Input
                disabled
                value={editValue?.id_card}
                onChange={(e) =>
                  setEditValue((prev) => ({
                    ...prev,
                    id_card: e.target.value,
                  }))
                }
              />
            </Form.Item>
            <Form.Item
              label={t("fullNam")}
              name="fullname"
              className="fullname-input"
              initialValue={editValue?.fullname}
              rules={[
                {
                  validator: (_, value) => {
                    if (
                      !value ||
                      !/^[\p{L}\s]+$/u.test(value) ||
                      /^\s+$/.test(value)
                    ) {
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
                className="fix-overlap-css"
                value={editValue?.fullname}
                onChange={(e) =>
                  setEditValue((prev) => ({
                    ...prev,
                    fullname: e.target.value,
                  }))
                }
              />
            </Form.Item>
            <Form.Item
              label={t("gender")}
              name="gender"
              className="fullname-input"
              initialValue={editValue?.gender}
              rules={[
                {
                  required: true,
                  message: t("pleaseSelectGender"),
                },
              ]}
            >
              <Select
                placeholder={t("pleaseSelectGender")}
                value={editValue?.gender}
                onChange={(value) =>
                  setEditValue((prev) => ({
                    ...prev,
                    gender: value,
                  }))
                }
              >
                <Option value="male">{t("male")}</Option>
                <Option value="female">{t("female")}</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={t("mathScore")}
              name="math"
              className="fullname-input"
              initialValue={editValue?.math}
              rules={[
                {
                  required: true,
                  message: t("pleaseEnterMathScore"),
                },
                {
                  pattern: /^([0-9](\.[0-9]{1,1})?|10)$/,
                  message: t("mathScoreMustBeBetween0And10"),
                },
              ]}
            >
              <Input
                className="fix-overlap-css"
                value={editValue?.math}
                onChange={(e) =>
                  setEditValue((prev) => ({
                    ...prev,
                    math: e.target.value,
                  }))
                }
              />
            </Form.Item>
            <Form.Item
              label={t("literatureScore")}
              name="literature"
              className="fullname-input"
              initialValue={editValue?.literature}
              rules={[
                {
                  required: true,
                  message: t("pleaseEnterLiteratureScore"),
                },
                {
                  pattern: /^([0-9](\.[0-9]{1,1})?|10)$/,
                  message: t("literatureScoreMustBeBetween0And10"),
                },
              ]}
            >
              <Input
                className="fix-overlap-css"
                value={editValue?.literature}
                onChange={(e) =>
                  setEditValue((prev) => ({
                    ...prev,
                    literature: e.target.value,
                  }))
                }
              />
            </Form.Item>
            <Form.Item
              label={t("englishScore")}
              name="english"
              className="fullname-input"
              initialValue={editValue?.english}
              rules={[
                {
                  required: true,
                  message: t("pleaseEnterEnglishScore"),
                },
                {
                  pattern: /^([0-9](\.[0-9]{1,1})?|10)$/,
                  message: t("englishScoreMustBeBetween0And10"),
                },
              ]}
            >
              <Input
                className="fix-overlap-css"
                value={editValue?.english}
                onChange={(e) =>
                  setEditValue((prev) => ({
                    ...prev,
                    english: e.target.value,
                  }))
                }
              />
            </Form.Item>
          </Form>
        </Modal>

        <ToastContainer />
      </ConfigProvider>
    </div>
  );
};

export default StudentManagement;
