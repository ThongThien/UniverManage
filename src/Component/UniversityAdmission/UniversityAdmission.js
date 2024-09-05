import React, { useState, useEffect, useCallback, useRef } from "react";
import { ref, get, set } from "firebase/database";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Modal, Space, Table, Tabs, Input, Button, Spin, Tooltip } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UniversityAdmission.css";
import { database } from "../../firebase";
library.add(faSearch);

const UniversityAdmission = () => {
  const { t } = useTranslation(["universityregistion"]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [registeredDataSource, setRegisteredDataSource] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTabKey, setActiveTabKey] = useState("2");
  const [unregisteredUniversities, setUnregisteredUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const buttonRef = useRef(null);
  const studentID = userData.id;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const universitiesRef = ref(database, "universities");
      const userRef = ref(database, `users/${studentID}`);
      const [universitiesSnapshot, userSnapshot] = await Promise.all([
        get(universitiesRef),
        get(userRef),
      ]);

      if (universitiesSnapshot.exists() && userSnapshot.exists()) {
        const universitiesData = Object.values(universitiesSnapshot.val());
        const userData = userSnapshot.val();

        const totalScore =
          (parseFloat(userData.math) +
            parseFloat(userData.english) +
            parseFloat(userData.literature)) /
          3.0;

        const unregisteredUniversities = universitiesData.filter(
          (university) => {
            const cutoffScore = parseFloat(university.admissionCutoffScore);
            return (
              totalScore >= cutoffScore &&
              !(userData.universities || []).some(
                (registeredUni) => registeredUni.id === university.id
              )
            );
          }
        );

        const registeredUniversityIds = (userData.universities || []).map(
          (university) => university.id
        );
        const registeredUniversityData = await fillRegisteredUniversityData(
          registeredUniversityIds,
          totalScore
        );

        setUnregisteredUniversities(unregisteredUniversities);

        if (activeTabKey === "1") {
          setFilteredDataSource(unregisteredUniversities);
        } else if (activeTabKey === "2") {
          setRegisteredDataSource(registeredUniversityData);
        }
      }
    } catch (error) {
      toast.error(t("errorFetchingUniverData"));
    } finally {
      setLoading(false);
    }
  }, [activeTabKey, studentID]);

  useEffect(() => {
    fetchData();
  }, [fetchData, activeTabKey]);
  const handleTabChange = (key) => {
    if (!loading) {
      setActiveTabKey(key);
      setSearchText("");
    }
  };
  const removeUniversityFromUser = async (universityId) => {
    const userRef = ref(database, `users/${studentID}/universities`);
    const userSnapshot = await get(userRef);
    if (userSnapshot.exists()) {
      const userUniversities = userSnapshot.val();
      const updatedUniversities = userUniversities.filter(
        (university) => university.id !== universityId
      );
      await set(userRef, updatedUniversities);
    }
  };
  const fillRegisteredUniversityData = async (
    registeredUniversityIds,
    totalScore
  ) => {
    const registeredUniversityData = [];
    for (const universityId of registeredUniversityIds) {
      const universityRef = ref(database, `universities/${universityId}`);
      const universitySnapshot = await get(universityRef);
      if (universitySnapshot.exists()) {
        const universityData = universitySnapshot.val();
        if (universityData) {
          const cutoffScore = parseFloat(universityData.admissionCutoffScore);
          if (totalScore >= cutoffScore) {
            const studentsRegistered = universityData.studentsRegistered
              ? universityData.studentsRegistered.length
              : 0;
            const entranceNumber = parseInt(universityData.entranceNumber);
            const entranceRatio = studentsRegistered + "/" + entranceNumber;
            registeredUniversityData.push({
              ...universityData,
              entranceRatio: entranceRatio,
            });
          } else {
            await removeUniversityFromUser(universityId);
          }
        }
      }
    }
    return registeredUniversityData;
  };

  const addStudentToUniversity = async (universityID, studentID) => {
    try {
      const studentRef = ref(database, `users/${studentID}`);
      const studentSnapshot = await get(studentRef);
      const studentData = studentSnapshot.val();
      const universityRef = ref(
        database,
        `universities/${universityID}/studentsRegistered`
      );
      const universitySnapshot = await get(universityRef);
      const studentList = universitySnapshot.val() || [];

      const newStudent = {
        id: studentID,
        math: studentData.math,
        literature: studentData.literature,
        english: studentData.english,
      };
      const newStudentList = [...studentList, newStudent];

      await set(universityRef, newStudentList);
      fetchData();
    } catch (error) {
      toast.error(t("errorAddingStudentToUniversity"), error);
    }
  };

  // ************************ Register Modal *************************** //
  const handleRegister = async (record) => {
    if (registeredDataSource.length >= 5) {
      showNotification(t("limit_reached"), "error");
      setLoading(false);
      return;
    } else {
      setLoading(false);
    }
    Modal.confirm({
      title: t("confirmregistration"),
      okText: t("ok"),
      cancelText: t("cancel"),
      content: t("confirmregister"),
      onOk: async () => {
        setLoading(true);
        try {
          setTimeout(async () => {
            const universityRef = ref(
              database,
              `universities/${record.id}/studentsRegistered/`
            );
            const universitySnapshot = await get(universityRef);
            const studentList = universitySnapshot.val() || [];

            if (studentList.includes(studentID)) {
              showNotification(t("alreadyregistered"), "error");
              setLoading(false);
              return;
            } else {
              setLoading(false);
            }

            const newFilteredDataSource = filteredDataSource.filter(
              (university) => university.id !== record.id
            );
            setFilteredDataSource(newFilteredDataSource);

            await addStudentToUniversity(record.id, studentID);

            const userRef = ref(database, `users/${studentID}/universities`);
            const newUniversity = {
              id: record.id,
              cutoffScore: record.admissionCutoffScore,
            };
            const newRegisteredUniversities = [
              ...registeredDataSource,
              newUniversity,
            ];
            await set(userRef, newRegisteredUniversities);

            setRegisteredDataSource(newRegisteredUniversities);
            showNotification(t("registered") + record.name);
            setLoading(false);
          }, 1000);
        } catch (error) {
          showNotification(t("registerfailed"), "error");
          setLoading(false);
        }
      },
      onCancel: () => {},
    });
  };

  // **************************************************************************
  const removeStudentFromUniversity = async (universityID, studentID) => {
    try {
      const universityRef = ref(
        database,
        `universities/${universityID}/studentsRegistered`
      );
      const universitySnapshot = await get(universityRef);
      const studentList = universitySnapshot.val();
      const updatedStudentList = studentList.filter(
        (student) => student.id !== studentID
      );
      await set(universityRef, updatedStudentList);
      fetchData();
    } catch (error) {
      toast.error(t("errorRemovingStudentFromUniversity"), error);
    }
  };


  const handleRemove = async (record) => {
    Modal.confirm({
      title: t("confirmremoval"),
      content: t("confirmremovemessage"),
      okText: t("ok"),
      cancelText: t("cancel"),
      onOk: async () => {
        setLoading(true);
        try {
          setTimeout(async () => {
            const userRef = ref(database, `users/${studentID}/universities`);
            const userSnapshot = await get(userRef);
            const userData = userSnapshot.val() || [];

            const updatedUniversities = userData.filter(
              (university) => university.id !== record.id
            );
            await set(userRef, updatedUniversities);
            await removeStudentFromUniversity(record.id, studentID);
            setRegisteredDataSource(updatedUniversities);
            showNotification(t("removed") + record.name);
            setLoading(false);
          }, 1150);
        } catch (error) {
          showNotification(t("removefailed"), "error");
        }
      },
      onCancel: () => {},
    });
  };
  // **************************************************************************
  const showNotification = (message, type = "success") => {
    const notify = type === "success" ? toast.success : toast.error;
    notify(message, {
      position: "top-right",
      autoClose: 1200,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };
  // **************************************************************************
  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchText(value);
    const filteredData = unregisteredUniversities.filter((university) =>
      university.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDataSource(filteredData);
  };
  // **************************************************************************
  const renderRegisteredUniversitiesTable = () => {
    const columns = [
      {
        title: t("id"),
        dataIndex: "id",
        key: "id",
        width: 80,
        fixed: "left",
      },
      {
        title: t("name"),
        dataIndex: "name",
        key: "name",
        width: 320,
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
          >
            <span
              onClick={() => handleDetailsClick(record)}
              style={{ cursor: "pointer" }}
            >
              {text}
            </span>
          </Tooltip>
        ),
      },
      { title: t("address"), dataIndex: "address", key: "address", width: 310 },
      {
        title: t("cutoffscore"),
        dataIndex: "admissionCutoffScore",
        key: "admissionCutoffScore",
        width: 120,
      },
      {
        title: t("entranceratio2"),
        dataIndex: "entranceRatio",
        key: "entranceRatio",
        width: 125,
      },
      {
        loading: "loading",
        title: t("actions"),
        dataIndex: "Actions",
        fixed: "right",
        width: 110,
        render: (_, record) => (
          <Space size={"middle"}>
            <Button
              type="primary"
              className="action-btn"
              danger
              onClick={() => handleRemove(record)}
            >
              {t("remove")}
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Spin spinning={loading}>
        <Table
          rowClassName={(record) => {
            if (
              record.studentsRegistered !== undefined &&
              record.entranceNumber !== undefined &&
              Array.isArray(record.studentsRegistered) &&
              record.studentsRegistered.length ===
                parseInt(record.entranceNumber)
            ) {
              return "green-text-row";
            }
            return "";
          }}
          columns={columns}
          dataSource={registeredDataSource}
          scroll={{ x: false }}
          rowKey="id"
          pagination={{
            current: currentPage,
            onChange: (page) => {
              setCurrentPage(page);
            },
          }}
        />
      </Spin>
    );
  };

  // **************************************************************************
  const renderUnregisteredUniversitiesTable = () => {
    const columns = [
      {
        title: t("id"),
        dataIndex: "id",
        key: "id",
        width: 80,
        fixed: "left",
      },
      {
        title: t("name"),
        dataIndex: "name",
        key: "name",
        width: 280,
        fixed: "left",
        render: (text, record) => (
          <span
            onClick={() => handleDetailsClick(record)}
            style={{ cursor: "pointer" }}
          >
            {text}
          </span>
        ),
      },
      { title: t("address"), dataIndex: "address", key: "address", width: 310 },
      {
        title: t("cutoffscore"),
        dataIndex: "admissionCutoffScore",
        key: "admissionCutoffScore",
        width: 120,
      },
      {
        title: t("entranceratio1"),
        dataIndex: "entranceNumber",
        key: "entranceNumber",
        width: 120,
      },
      {
        loading: "loading",
        title: t("actions"),
        dataIndex: "Actions",
        fixed: "right",
        width: 110,
        render: (_, record) => {
          const isRegisteredFull =
            (record.studentsRegistered?.length || 0) >=
            parseInt(record.entranceNumber);
          const isDisabled =
            registeredDataSource.length >= 5 || isRegisteredFull;
          const tooltipTitle =
            registeredDataSource.length >= 5
              ? t("maxuniversitiesreached")
              : isRegisteredFull
              ? t("universitylimitreached")
              : "";

          return (
            <Space size={"middle"}>
              <Tooltip title={tooltipTitle}>
                <Button
                  type="primary"
                  onClick={() => handleRegister(record)}
                  disabled={isDisabled}
                  ref={buttonRef}
                >
                  {t("registeraction")}
                </Button>
              </Tooltip>
            </Space>
          );
        },
      },
    ];

    return (
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredDataSource}
          scroll={{ x: false, y: 380 }}
          rowKey="id"
          pagination={{
            current: currentPage,
            onChange: (page) => {
              setCurrentPage(page);
            },
          }}
        />
      </Spin>
    );
  };
  // **************************************************************************
  const getUserInfo = async (userID) => {
    try {
      const userRef = ref(database, `users/${userID}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleDetailsClick = async (record) => {
    setLoading(true);
    try {
      const userInfoPromises = record.studentsRegistered.map((userRef) =>
        getUserInfo(userRef.id)
      );
      const userInfoList = await Promise.all(userInfoPromises);
      const updatedRecord = {
        ...record,
        studentsRegistered: userInfoList.filter(
          (userInfo) => userInfo !== null
        ),
        entranceNumber: record.entranceNumber,
      };
      setSelectedRecord(updatedRecord);
    } catch (error) {
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  // **************************************************************************
  const tabItems = [
    {
      key: "2",
      label: (
        <span className="registered-tab">{t("registereduniversities")}</span>
      ),
      children: <div>{renderRegisteredUniversitiesTable()}</div>,
    },
    {
      key: "1",
      label: (
        <span className="unregistered-tab">
          {t("unregistereduniversities")}
        </span>
      ),
      children: (
        <div>
          <Space>
            <Input
              placeholder={t("searchbyname")}
              value={searchText}
              onChange={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Space>
          {renderUnregisteredUniversitiesTable()}
        </div>
      ),
    },
  ];
  return (
    <div className="university-admission">
      <ToastContainer />
      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        items={tabItems}
      />
      <Modal
        title={t("universitydetails")}
        visible={loading || !!selectedRecord}
        open={!!selectedRecord}
        onCancel={() => setSelectedRecord(null)}
        footer={null}
        className="university-details-modal"
        width={1000}
      >
        {selectedRecord && (
          <>
            <div className="modal-content-container">
              <div className="modal-content-detail">
                <p>
                  <span class="field-name">{t("id")}:</span> {selectedRecord.id}
                </p>
                <p>
                  <span class="field-name">{t("cutoffscore")}:</span>{" "}
                  {selectedRecord.admissionCutoffScore}
                </p>
                <p>
                  <span class="field-name">{t("entrancenumber")}:</span>{" "}
                  {selectedRecord.entranceNumber}
                </p>
              </div>
              <div className="modal-content-detail">
                <p>
                  <span class="field-name">{t("name")}:</span>{" "}
                  {selectedRecord.name}
                </p>
                <p>
                  <span class="field-name">{t("address")}:</span>{" "}
                  {selectedRecord.address}
                </p>
              </div>
            </div>
            <hr />
            <div className="registered-students" style={{ minHeight: "200px" }}>
              <p>{t("registeredstudents")}</p>
              {loading ? (
                <div style={{ textAlign: "center" }}>
                  <Spin />
                </div>
              ) : (
                <Table
                  dataSource={selectedRecord.studentsRegistered}
                  columns={[
                    {
                      title: t("studentcode"),
                      dataIndex: "examcode",
                    },
                    {
                      title: t("name"),
                      dataIndex: "fullname",
                      render: (text) => (
                        <span style={{ textTransform: "capitalize" }}>
                          {text}
                        </span>
                      ),
                    },
                    {
                      title: t("email"),
                      dataIndex: "username",
                    },
                    {
                      title: t("highschoolresult"),
                      dataIndex: "highschool_result",
                    },
                  ]}
                  pagination={{ pageSize: 5 }}
                />
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UniversityAdmission;
