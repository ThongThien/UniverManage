import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, update, remove } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { initializeApp } from "firebase/app";
import {
  Button,
  Input,
  ConfigProvider,
  Space,
  Table,
  Select,
  Modal,
  Form,
  Spin,
  Alert,
  Tooltip,
} from "antd";
import "./UniversityManagement.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UniversityAdd from "./UniversityAdd";
const firebaseConfig = {
  apiKey: "AIzaSyBNhqyjX6zC5oz3TlmiGa_5-W4gu5AfcC4",
  authDomain: "dummy-data-816f2.firebaseapp.com",
  databaseURL:
    "https://dummy-data-816f2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dummy-data-816f2",
  storageBucket: "dummy-data-816f2.appspot.com",
  messagingSenderId: "601438283731",
  appId: "1:601438283731:web:dd9637cc6649580a1b7126",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const { Option } = Select;
library.add(faSearch);

const UniversityManagement = () => {
  const { t } = useTranslation(["universitymanager"]);
  const [searchText, setSearchText] = useState("");
  const [searchColumn, setSearchColumn] = useState("all");
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerVisit, setDrawerVisit] = useState(false);
  const [universityName, setUniversityName] = useState("");
  const [universityAddress, setUniversityAddress] = useState("");
  const [universityScore, setUniversityScore] = useState("");
  const [universityEntranceNumber, setUniversityEntranceNumber] = useState("");
  const [universityCode, setUniversityCode] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmSubmitVisible, setConfirmSubmitVisible] = useState(false);
  const [confirmClearVisible, setConfirmClearVisible] = useState(false);
  const [modalSearchText, setModalSearchText] = useState("");
  const [modalSearchColumn, setModalSearchColumn] = useState("all");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editValue, setEditValue] = useState("");
  const userDataString = localStorage.getItem("userData");
  const userData = JSON.parse(userDataString || "{}");
  const userRole = userData.role || "";
  const [form] = Form.useForm();
  const [isSearching, setIsSearching] = useState(false);

  const columns = (handleDetailsClick, handleEdit, handleDelete) => {
    const userRoleStu = userData.role;
    const cols = [
      {
        title: t("id") + " " + t("name"),
        width: 180,
        fixed: "left",
        render: (text, record) => (
          <Tooltip
            title={
              (record.studentsRegistered
                ? record.studentsRegistered.length
                : 0) < record.entranceNumber
                ? t("notEnoughEntranceNumber")
                : t("enoughEntranceNumber")
            }
            className="custom-tooltip"
          >
            <div className="name-click">
              <span className="merged-column">({record.id})</span>
              {"\t"}
              <span onClick={() => handleDetailsClick(record)}>
                {record.name}
              </span>
            </div>
          </Tooltip>
        ),
      },
      {
        title: t("address"),
        dataIndex: "address",
        width: 220,
        responsive: ["sm"],
      },
      {
        title: t("admissionCutoffScore"),
        dataIndex: "admissionCutoffScore",
        width: 100,
      },
      {
        title: t("registeredEntranceNumber"),
        dataIndex: null,
        width: 180,
        render: (_, record) => (
          <span>
            {record.studentsRegistered ? record.studentsRegistered.length : 0}/
            {record.entranceNumber}
          </span>
        ),
      },
    ];

    if (userRoleStu !== "student") {
      cols.push(
        // Icon col for small screens
        {
          title: t("action"),
          dataIndex: "Action",
          key: "actionIcons",
          fixed: "right",
          width: 180,
          render: (_, record) => (
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
          ),
          responsive: ["xs"],
        },
        // Button col for larger screens
        {
          title: t("action"),
          dataIndex: "Action",
          key: "actionButtons",
          fixed: "right",
          width: 180,
          render: (_, record) => (
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
          ),
          responsive: ["sm"],
        }
      );
    }

    return cols;
  };

  const hideSubmitConfirm = () => setConfirmSubmitVisible(false);
  const hideClearConfirm = () => setConfirmClearVisible(false);
  const handleCloseModaldetail = () => {
    form.resetFields();
    setSelectedRecord(null);
    setModalSearchColumn("all");
  };
  let timeoutId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!dataFetched) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const universitiesRef = ref(database, "universities");
          const snapshot = await get(universitiesRef);
          const universitiesData = snapshot.val();
          if (universitiesData) {
            setFilteredDataSource(Object.values(universitiesData));
            setDataFetched(true);
          } else {
            toast.warn(t("noUniversitiesDataAvailable"));
          }
        }
      } catch (error) {
        toast.error(t("errorFetchingUniversitiesData"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataFetched, t]);

  useEffect(() => {
    if (editValue) {
      form.setFieldsValue({
        address: editValue.address,
        admissionCutoffScore: editValue.admissionCutoffScore,
        entranceNumber: editValue.entranceNumber,
      });
    }
  }, [editValue, form]);

  const handleInputChange = async (e) => {
    const value = e.target ? e.target.value : e;
    setSearchText(value);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await fetchData(value, searchColumn);
    }, 200);
  };

  const fetchData = async (searchValue, searchColumn) => {
    try {
      setLoading(true);
      const universitiesRef = ref(database, "universities");
      const snapshot = await get(universitiesRef);
      if (snapshot.exists()) {
        const universitiesData = Object.values(snapshot.val());
        setDataFetched(true);
        const filteredData = universitiesData.filter((item) => {
          if (searchColumn === "all") {
            const excludedProperties = ["studentsRegistered"];
            return Object.entries(item).some(
              ([key, value]) =>
                !excludedProperties.includes(key) &&
                String(value).toLowerCase().includes(searchValue.toLowerCase())
            );
          } else {
            const columnValue = item[searchColumn];
            return String(columnValue)
              .toLowerCase()
              .includes(searchValue.toLowerCase());
          }
        });
        if (
          JSON.stringify(filteredData) !== JSON.stringify(filteredDataSource)
        ) {
          setFilteredDataSource(filteredData);
          setCurrentPage(1);
        }
      } else {
        toast.info(t("noUniversitiesDataAvailable"));
      }
    } catch (error) {
      toast.error(t("errorFetchingUniversitiesData"), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (value) => {
    setSearchColumn(value);
    setCurrentPage(1);
    fetchData(searchText, value);
  };

  const handleStudentSearch = async (e) => {
    const searchValue = e.target.value.toLowerCase();
    setModalSearchText(searchValue);
    setIsSearching(true);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await fetchStudents(searchValue, modalSearchColumn);
      setIsSearching(false);
    }, 200);
  };

  const fetchStudents = async (searchValue, modalSearchColumn) => {
    try {
      setLoading(true);
      if (selectedRecord && selectedRecord.studentsRegistered) {
        const filteredData = selectedRecord.studentsRegistered.filter(
          (student) => {
            const mathScore = parseFloat(student.math);
            const literatureScore = parseFloat(student.literature);
            const englishScore = parseFloat(student.english);
            const averageScore = (
              (mathScore + literatureScore + englishScore) /
              3
            )
              .toFixed(1)
              .toString();
            if (modalSearchColumn === "all") {
              return (
                student.examcode?.toLowerCase().includes(searchValue) ||
                student.fullname?.toLowerCase().includes(searchValue) ||
                student.username?.toLowerCase().includes(searchValue) ||
                averageScore.includes(searchValue)
              );
            } else if (modalSearchColumn === "averageScore") {
              if (
                isNaN(mathScore) ||
                isNaN(literatureScore) ||
                isNaN(englishScore)
              ) {
                return false;
              }
              return averageScore.includes(searchValue);
            } else {
              return student[modalSearchColumn]
                ?.toLowerCase()
                .includes(searchValue);
            }
          }
        );
        if (JSON.stringify(filteredData) !== JSON.stringify(filteredStudents)) {
          setFilteredStudents(filteredData);
          setModalCurrentPage(1);
        }
      }
    } catch (error) {
      toast.error(t("errorFilteringStudents"), error);
      setIsSearching(false);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSelectChange = (value) => {
    setModalSearchColumn(value);
    setModalCurrentPage(1);
    fetchStudents(modalSearchText, value);
  };

  const handleAddClick = () => {
    setDrawerVisit(true);
    setIsEditing(false);
    setIsAdding(true);
  };

  const getUserInfo = async (userID) => {
    try {
      const userRef = ref(database, `users/${userID}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      toast.error(t("errorFetchingUserData"), error);
      return null;
    }
  };

  const handleDetailsClick = async (record) => {
    try {
      setModalSearchText("");
      setModalCurrentPage(1);
      setSelectedRecord(record);
      setModalLoading(true);
      if (record.studentsRegistered && record.studentsRegistered.length > 0) {
        const userInfoPromises = record.studentsRegistered.map((userRef) =>
          getUserInfo(userRef.id)
        );
        const userInfoList = await Promise.all(userInfoPromises);
        const updatedRecord = {
          ...record,
          studentsRegistered: userInfoList.filter(
            (userInfo) => userInfo !== null
          ),
        };
        setSelectedRecord(updatedRecord);
        setFilteredStudents(
          userInfoList.filter((userInfo) => userInfo !== null)
        );
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const newUniversityData = {
        id: universityCode,
        name: universityName,
        address: universityAddress,
        admissionCutoffScore: universityScore,
        entranceNumber: universityEntranceNumber,
        studentsRegistered: [],
      };

      await update(
        ref(database, `universities/${universityCode}`),
        newUniversityData
      );
      setUniversityName("");
      setUniversityAddress("");
      setUniversityScore("");
      setUniversityEntranceNumber("");
      setUniversityCode("");
      setFilteredDataSource((prevData) => [newUniversityData, ...prevData]);
    } catch (error) {
      toast.error(t("errorAddingUniversity"), error);
    }
  };

  const handleCancel = () => {
    setDrawerVisit(false);
    setUniversityName("");
    setUniversityAddress("");
    setUniversityScore("");
    setUniversityEntranceNumber("");
    setSelectedRecord("");
    form.resetFields();
  };

  const handleClear = () => {
    form.resetFields();
    setUniversityName("");
    setUniversityAddress("");
    setUniversityScore("");
    setUniversityEntranceNumber("");
  };

  const customPagination = () => {
    const pluralize = (total) => {
      if (total > 1) {
        return t("universities");
      } else {
        return t("university");
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
  const customMiniTablePagination = () => {
    const pluralize = (total) => {
      if (total > 1) {
        return t("students");
      } else {
        return t("student");
      }
    };

    return {
      current: modalCurrentPage,
      onChange: (page) => setModalCurrentPage(page),
      total: filteredStudents.length,
      showQuickJumper: true,
      showTotal: (total) => t("total") + ` ${total} ${pluralize(total)}`,
    };
  };

  const handleConfirmSubmit = () => {
    handleSubmit();
    handleClear();
    setDrawerVisit(false);
    hideSubmitConfirm();
    toast.success(t("newUniAddedSuccessfully"));
  };

  const handleConfirmClear = () => {
    handleClear();
    hideClearConfirm();
  };

  const handleEdit = (record) => {
    setDrawerVisit(true);
    setIsEditing(true);
    setIsAdding(false);
    setEditValue({
      ...record,
      registeredStudent: record.studentsRegistered
        ? record.studentsRegistered.length
        : "0",
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: t("areYouSureYouWantToDeleteThisUniversity"),
      okText: t("yes"),
      cancelText: t("no"),
      onOk: async () => {
        try {
          const uniKey = `${record.id}`;
          const uniRef = ref(database, `universities/${uniKey}`);
          await remove(uniRef);

          const usersRef = ref(database, "users");
          const usersSnapshot = await get(usersRef);
          if (usersSnapshot.exists()) {
            usersSnapshot.forEach((userSnapshot) => {
              const userData = userSnapshot.val();
              const universitiesRegistered = userData.universities || [];

              const updatedUniversitiesRegistered =
                universitiesRegistered.filter(
                  (university) => university.id !== record.id
                );

              update(userSnapshot.ref, {
                universities: updatedUniversitiesRegistered,
              });
            });
          }

          setFilteredDataSource((prev) => {
            return prev.filter((university) => university.id !== record.id);
          });
          toast.success(t("deleteSuccessfully"));
        } catch (error) {
          toast.error(t("errorDeletingUniversityInfo"), error);
        }
      },
    });
  };

  const updateFilteredDataSource = (newData) => {
    // Kiểm tra xem có record nào trong filteredDataSource có cùng id với newData không
    const existingIndex = filteredDataSource.findIndex(
      (item) => item.id === newData.id
    );
    if (existingIndex !== -1) {
      // Nếu đã tồn tại record với cùng id, thì cập nhật dữ liệu của record đó
      setFilteredDataSource((prevData) => {
        const newDataList = [...prevData];
        newDataList[existingIndex] = newData;
        return newDataList;
      });
    } else {
      // Nếu không có record nào có cùng id, thêm newData vào đầu danh sách
      setFilteredDataSource((prevData) => [newData, ...prevData]);
    }
  };
  const dataSource =
    selectedRecord?.studentsRegistered && filteredStudents
      ? filteredStudents.map((item) => ({ ...item, key: item.id }))
      : [];

  return (
    <div className="uni-manga-cont">
      <ToastContainer />
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
            {userRole !== "student" && (
              <Button type="primary" onClick={handleAddClick}>
                {t("add")}
              </Button>
            )}
          </div>

          <Select
            className="uni-select"
            defaultValue="all"
            onChange={handleSelectChange}
          >
            <Option value="all">{t("all")}</Option>
            <Option value="id">{t("id")}</Option>
            <Option value="name">{t("name")}</Option>
            <Option value="address">{t("address")}</Option>
            <Option value="admissionCutoffScore">
              {t("admissionCutoffScore")}
            </Option>
            <Option value="entranceNumber">{t("entranceNumber")}</Option>
          </Select>
          <Input
            className="fix-overlap-css"
            allowClear
            placeholder={t("Search university...")}
            suffix={
              searchText === "" ? (
                <FontAwesomeIcon
                  className="search-icon"
                  icon={["fas", "search"]}
                />
              ) : null
            }
            value={searchText}
            onChange={handleInputChange}
          />
        </Space.Compact>

        <Spin spinning={loading}>
          <Table
            rowClassName={(record) => {
              const entranceNumber = Number(record.entranceNumber);
              const registeredStudentsCount = record.studentsRegistered
                ? record.studentsRegistered.length
                : 0;

              if (registeredStudentsCount === entranceNumber) {
                return "green-text-row";
              }

              return "";
            }}
            scroll={{
              y: "calc(68vh - 110px)",
            }}
            columns={columns(handleDetailsClick, handleEdit, handleDelete)}
            dataSource={filteredDataSource.map((item) => ({
              ...item,
              key: item.id,
            }))}
            pagination={{ ...customPagination() }}
            showSorterTooltip={{
              target: "sorter-icon",
            }}
          />
        </Spin>
        <UniversityAdd
          isVisible={drawerVisit}
          onCancel={handleCancel}
          updateFilteredDataSource={updateFilteredDataSource}
          isEditing={isEditing}
          isAdding={isAdding}
          editValue={editValue}
        />

        <Modal
          title={t("universityDetails")}
          open={!!selectedRecord}
          onCancel={handleCloseModaldetail}
          footer={null}
          className="university-details-modal"
          width={1000}
        >
          {selectedRecord && (
            <>
              <div className="modal-content-container">
                <div className="modal-content-detail">
                  <p>
                    <span className="field-name">{t("id")}: </span>
                    {selectedRecord.id}
                  </p>
                  <p>
                    <span className="field-name">
                      {t("admissionCutoffScore")}:{" "}
                    </span>

                    {selectedRecord.admissionCutoffScore}
                  </p>
                  <p>
                    <span className="field-name">{t("entranceNumber")}: </span>
                    {selectedRecord.entranceNumber}
                  </p>
                </div>

                <div className="modal-content-detail">
                  <p>
                    <span className="field-name">{t("name")}: </span>
                    {selectedRecord.name}
                  </p>
                  <p>
                    <span className="field-name">{t("address")}: </span>
                    {selectedRecord.address}
                  </p>
                </div>
              </div>
              <hr />
              <div className="registered-students">
                {dataSource.length === 0 &&
                  !modalSearchText &&
                  !isSearching &&
                  !modalLoading && (
                    <p className="no-students">
                      <Alert
                        message={t("warningStudentNotRegistered")}
                        type="warning"
                        showIcon
                      />
                    </p>
                  )}
                {(dataSource.length > 0 ||
                  modalSearchText ||
                  isSearching ||
                  modalLoading) && (
                  <div className="stu-table">
                    <p>{t("registeredStudents")}</p>
                    <Space>
                      <Select
                        className="stu-select"
                        defaultValue="all"
                        value={modalSearchColumn}
                        onChange={handleModalSelectChange}
                      >
                        <Option value="all">{t("all")}</Option>
                        <Option value="examcode">{t("studentCode")}</Option>
                        <Option value="fullname">{t("name")}</Option>
                        <Option value="username">{t("email")}</Option>
                        <Option value="averageScore">
                          {t("averageScore")}
                        </Option>
                      </Select>
                      <Input
                        placeholder={t("searchStudents")}
                        className="student-search"
                        allowClear
                        value={modalSearchText}
                        onChange={handleStudentSearch}
                      />
                    </Space>
                    <Spin spinning={modalLoading}>
                      <Table
                        dataSource={dataSource}
                        columns={[
                          {
                            title: t("studentCode"),
                            dataIndex: "examcode",
                          },
                          {
                            title: t("name"),
                            dataIndex: "fullname",
                            render: (text) => (
                              <span className="text-capitalize">{text}</span>
                            ),
                          },
                          {
                            title: t("email"),
                            dataIndex: "username",
                          },
                          {
                            title: t("averageScore"),
                            dataIndex: "highschool_result",
                            render: (_, record) => {
                              const mathScore = parseFloat(record.math);
                              const literatureScore = parseFloat(
                                record.literature
                              );
                              const englishScore = parseFloat(record.english);

                              if (
                                isNaN(mathScore) ||
                                isNaN(literatureScore) ||
                                isNaN(englishScore)
                              ) {
                                return t("Invalid scores");
                              }
                              const averageScore = (
                                (mathScore + literatureScore + englishScore) /
                                3
                              ).toFixed(1);
                              return <span>{averageScore}</span>;
                            },
                          },
                        ]}
                        pagination={{
                          ...customMiniTablePagination(),
                          showSizeChanger: false,
                          pageSize: 5,
                        }}
                      />
                    </Spin>
                  </div>
                )}
              </div>
            </>
          )}
        </Modal>
        <Modal
          title={t("confirmSubmission")}
          open={confirmSubmitVisible}
          onCancel={hideSubmitConfirm}
          onOk={handleConfirmSubmit}
        >
          <p>{t("confirmSubmitPrompt")}</p>
        </Modal>

        <Modal
          title={t("confirmClear")}
          open={confirmClearVisible}
          onCancel={hideClearConfirm}
          onOk={handleConfirmClear}
        >
          <p>{t("confirmClearPrompt")}</p>
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default UniversityManagement;
