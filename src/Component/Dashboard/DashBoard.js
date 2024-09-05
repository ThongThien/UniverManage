import React, { useState, useEffect } from "react";
import { Pie, Column, Line } from "@ant-design/plots";
import { Card, Popover, Space } from "antd";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  PushpinOutlined,
  UserAddOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { child, ref, get } from "firebase/database";
import { database } from "../../firebase";
import "./Dashboard.css";
const Dashboard = () => {
  const currentTheme = useSelector((state) => state.theme.currentTheme);

  const { t } = useTranslation(["dashboard"]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalUniversities, setTotalUniversities] = useState(0);
  const [genderData, setGenderData] = useState([]);

  const [averageScores, setAverageScores] = useState({
    math: 0,
    literature: 0,
    english: 0,
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const [mathScores, setMathScores] = useState([]);
  const [studentsAbove5, setStudentsAbove5] = useState(0);
  const [studentsBelow5, setStudentsBelow5] = useState(0);
  const [universitiesAbove50Percent, setUniversitiesAbove50Percent] =
    useState(0);
  const [universitiesBelow50Percent, setUniversitiesBelow50Percent] =
    useState(0);
  const [pieData, setPieData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [literatureScores, setLiteratureScores] = useState([]);
  const [englishScores, setEnglishScores] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth >= 0 && window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await get(child(ref(database), "users/"));
        if (usersSnapshot.exists()) {
          const usersData = Object.values(usersSnapshot.val());

          const studentsCount = usersData.filter(
            (user) => user.role === "student"
          ).length;
          setTotalStudents(studentsCount);
          const genderData = usersData.map((user) => user.gender);
          setGenderData(genderData);

          const mathScores = usersData
            .filter(
              (user) => user.role !== "superadmin" && user.role !== "admin"
            )
            .map((user) => parseFloat(user.math) || 0);
          const literatureScores = usersData
            .filter(
              (user) => user.role !== "superadmin" && user.role !== "admin"
            )
            .map((user) => parseFloat(user.literature) || 0);
          const englishScores = usersData
            .filter(
              (user) => user.role !== "superadmin" && user.role !== "admin"
            )
            .map((user) => parseFloat(user.english) || 0);

          const averageMath =
            mathScores.reduce((acc, score) => acc + score, 0) /
            mathScores.length;
          const averageLiterature =
            literatureScores.reduce((acc, score) => acc + score, 0) /
            literatureScores.length;
          const averageEnglish =
            englishScores.reduce((acc, score) => acc + score, 0) /
            englishScores.length;

          setAverageScores({
            math: parseFloat(averageMath.toFixed(4)),
            literature: parseFloat(averageLiterature.toFixed(4)),
            english: parseFloat(averageEnglish.toFixed(4)),
          });

          setMathScores(mathScores);

          const totalStudentsAbove5 = usersData.filter(
            (user) =>
              ((parseFloat(user.math) || 0) +
                (parseFloat(user.literature) || 0) +
                (parseFloat(user.english) || 0)) /
                3 >
              5
          ).length;
          setStudentsAbove5(totalStudentsAbove5);

          const totalStudentsBelow5 = studentsCount - totalStudentsAbove5;
          setStudentsBelow5(totalStudentsBelow5);

          const universitiesSnapshot = await get(
            child(ref(database), "universities/")
          );
          if (universitiesSnapshot.exists()) {
            const universitiesData = universitiesSnapshot.val();

            let universitiesAbove50PercentCount = 0;
            let universitiesBelow50PercentCount = 0;

            for (const universityId in universitiesData) {
              if (universitiesData.hasOwnProperty(universityId)) {
                const university = universitiesData[universityId];

                const studentsRegisteredCount = Array.isArray(
                  university.studentsRegistered
                )
                  ? university.studentsRegistered.length
                  : Object.keys(university.studentsRegistered || {}).length;

                const registrationPercent =
                  (studentsRegisteredCount / university.entranceNumber) * 100;

                if (registrationPercent > 50) {
                  universitiesAbove50PercentCount++;
                } else {
                  universitiesBelow50PercentCount++;
                }
              }
            }

            setTotalUniversities(Object.keys(universitiesData).length);
            setUniversitiesAbove50Percent(universitiesAbove50PercentCount);
            setUniversitiesBelow50Percent(universitiesBelow50PercentCount);
          }

          const studentsWithUniversities = usersData.filter(
            (user) => user.role === "student" && user.universities
          );
          const studentsWithoutUniversities = usersData.filter(
            (user) => user.role === "student" && !user.universities
          );

          const universitiesCountMap = studentsWithUniversities.reduce(
            (acc, student) => {
              const universitiesCount = student.universities.length;
              acc[universitiesCount] = (acc[universitiesCount] || 0) + 1;
              return acc;
            },
            {}
          );

          const fetchData = async () => {
            try {
              // Fetch dữ liệu từ Firebase
              const usersSnapshot = await get(child(ref(database), "users/"));
              if (usersSnapshot.exists()) {
                const usersData = Object.values(usersSnapshot.val());

                // Lấy dữ liệu điểm Literature
                const literatureScores = usersData
                  .filter(
                    (user) =>
                      user.role !== "superadmin" && user.role !== "admin"
                  )
                  .map((user) => parseFloat(user.literature) || 0);

                // Đếm số lần xuất hiện của mỗi điểm Literature
                const literatureCounts = literatureScores.reduce(
                  (acc, score) => {
                    acc[score] = (acc[score] || 0) + 1;
                    return acc;
                  },
                  {}
                );

                // Chuyển đổi dữ liệu sang dạng phù hợp cho biểu đồ
                const literatureData = Object.entries(literatureCounts)
                  .map(([score, count]) => ({
                    score: parseFloat(score),
                    occurrences: count,
                  }))
                  .sort((a, b) => a.score - b.score);

                // Lưu trữ dữ liệu Literature vào state
                setLiteratureScores(literatureData);
              }
            } catch (error) {
              // Xử lý lỗi nếu có
              console.error("Error fetching Literature data:", error);
            }
          };
          fetchData();
          const fetchEnglishData = async () => {
            try {
              // Fetch dữ liệu từ Firebase
              const usersSnapshot = await get(child(ref(database), "users/"));
              if (usersSnapshot.exists()) {
                const usersData = Object.values(usersSnapshot.val());

                // Lấy dữ liệu điểm English
                const englishScores = usersData
                  .filter(
                    (user) =>
                      user.role !== "superadmin" && user.role !== "admin"
                  )
                  .map((user) => parseFloat(user.english) || 0);

                // Đếm số lần xuất hiện của mỗi điểm English
                const englishCounts = englishScores.reduce((acc, score) => {
                  acc[score] = (acc[score] || 0) + 1;
                  return acc;
                }, {});

                // Chuyển đổi dữ liệu sang dạng phù hợp cho biểu đồ
                const englishData = Object.entries(englishCounts)
                  .map(([score, count]) => ({
                    score: parseFloat(score),
                    occurrences: count,
                  }))
                  .sort((a, b) => a.score - b.score);

                // Lưu trữ dữ liệu English vào state
                setEnglishScores(englishData);
              }
            } catch (error) {
              // Xử lý lỗi nếu có
              console.error("Error fetching English data:", error);
            }
          };
          fetchEnglishData();

          const pieChartData = [
            {
              type: t("notRegisteredToAnyUniversity"),
              value: studentsWithoutUniversities.length,
            },
            {
              type: t("registeredToOneUniversity"),
              value: universitiesCountMap[1] || 0,
            },
            {
              type: t("registeredToTwoUniversities"),
              value: universitiesCountMap[2] || 0,
            },
            {
              type: t("registeredToThreeUniversities"),
              value: universitiesCountMap[3] || 0,
            },
            {
              type: t("registeredToFourUniversities"),
              value: universitiesCountMap[4] || 0,
            },
            {
              type: t("registeredToFiveUniversities"),
              value: universitiesCountMap[5] || 0,
            },
          ].filter((item) => item.value !== 0);

          setPieData(pieChartData);

          const studentsWithScores = usersData
            .filter((user) => user.role === "student")
            .map((student) => ({
              fullname: student.fullname,
              math: parseFloat(student.math) || 0,

              literature: parseFloat(student.literature) || 0,
              english: parseFloat(student.english) || 0,
              totalScore: parseFloat(
                (
                  (parseFloat(student.math) || 0) +
                  (parseFloat(student.literature) || 0) +
                  (parseFloat(student.english) || 0)
                ).toFixed(4)
              ),
            }));

          const sortedStudents = studentsWithScores.sort(
            (a, b) => b.totalScore - a.totalScore
          );

          const top3Students = sortedStudents.slice(0, 3);
          setTopStudents(top3Students);
        }
      } catch (error) {
        setTotalStudents(0);
        // setTotalSchools(0);
        setTotalUniversities(0);
        setGenderData([]);
        setMathScores([]);
        setPieData([]);
      }
    };
    fetchData();
  }, [t,currentTheme]);

  const maleCount = genderData.filter((gender) => gender === "male").length;
  const femaleCount = genderData.filter((gender) => gender === "female").length;

  const scoreCounts = mathScores.reduce((acc, score) => {
    acc[score] = (acc[score] || 0) + 1;
    return acc;
  }, {});

  const scoreData = Object.entries(scoreCounts)
    .map(([score, count]) => ({ score: parseFloat(score), occurrences: count }))
    .sort((a, b) => a.score - b.score);

  return (
    <div className="dashboard">
      <div className="Card-items">
        <Card className="card1" bordered={false}>
          <div className="items-students-title">
            <div className="icon-wrapper">
              <UserAddOutlined />
            </div>
            <Popover
              content={
                <div>
                  <p>
                    {t("totalMale")}: {maleCount}
                  </p>
                  <p>
                    {t("totalFemale")}: {femaleCount}
                  </p>
                </div>
              }
              title={t("genderDistribution")}
            >
              <p className="item-chung">{totalStudents}</p>
            </Popover>
            <p className="items-chung">{t("dashboard:students")}</p>
          </div>
          <Space className="items-Students">
            <Popover
              content={
                <div>
                  {t("dashboard:numberOfStudentsWithAverageScoreAbove5")}
                </div>
              }
              title={`${t("dashboard:above")} 5`}
            >
              <p className="items-green-card">
                {studentsAbove5}
                <ArrowUpOutlined />
              </p>
            </Popover>
            <div className="Below5">
              <Popover
                content={
                  <div>
                    {t("dashboard:numberOfStudentsWithAverageScoreBelow5")}
                  </div>
                }
                title={`${t("dashboard:below")} 5`}
              >
                <p className="items-red-card">
                  {studentsBelow5}
                  <ArrowDownOutlined />
                </p>
              </Popover>
            </div>
          </Space>
        </Card>
        <Card className="card1" bordered={false}>
          <div className="items-students-title">
            <div className="icon-wrapper">
              <HomeOutlined />
            </div>
            <div>
              <p className="item-chung">{totalUniversities}</p>
              <p className="items-chung">{t("dashboard:universities")}</p>
            </div>
          </div>
          <Space className="items-Students">
            <Popover
              content={
                <div>
                  {t(
                    "dashboard:numberOfUniversitiesWithMoreThan50PercentRegistration"
                  )}
                </div>
              }
              title={`${t("dashboard:above")} 50%`}
            >
              <p className="items-green-card">
                {universitiesAbove50Percent} <ArrowUpOutlined />
              </p>
            </Popover>
            <div className="Below5">
              <Popover
                content={
                  <div>
                    {t(
                      "dashboard:numberOfUniversitiesWithLessThan50PercentRegistration"
                    )}
                  </div>
                }
                title={`${t("dashboard:below")} 50%`}
              >
                <p className="below50Percent">
                  {universitiesBelow50Percent} <ArrowDownOutlined />
                </p>
              </Popover>
            </div>
          </Space>
        </Card>
        {/* <Card className="card2" bordered={false}>
          <div className="items-uni">
            <div className="icon-wrapper">
              <HomeOutlined />
            </div>
            <div>
              <p className="item-chung">{totalUniversities}</p>
              <p className="items-chung">{t("dashboard:universities")}</p>
            </div>
          </div>
          <Space className="items-Uni">
            <Popover
              content={
                <div>
                  {t(
                    "dashboard:numberOfUniversitiesWithMoreThan50PercentRegistration"
                  )}
                </div>
              }
              title={`${t("dashboard:above")} 50%`}
            >
              <p className="items-green-card">
                {universitiesAbove50Percent} <ArrowUpOutlined />
              </p>
            </Popover>
            <Popover
              content={
                <div>
                  {t(
                    "dashboard:numberOfUniversitiesWithLessThan50PercentRegistration"
                  )}
                </div>
              }
              title={`${t("dashboard:below")} 50%`}
            >
              <p className="below50Percent">
                {universitiesBelow50Percent} <ArrowDownOutlined />
              </p>
            </Popover>
          </Space>
        </Card> */}
        <Card className="card3" bordered={false}>
          <div className="top-students">
            <div className="congratulations-title">
              <div className="icon-wrapper">
                <PushpinOutlined />
              </div>
              <p className="items-chung">{t("dashboard:congratulations")}</p>
            </div>
            {topStudents.map((student, index) => (
              <div key={index} className="student-name">
                <p>
                  {student.fullname}:{" "}
                  <Popover
                    content={
                      <div>
                        <p>
                          {t("dashboard:math")}: {student.math}
                        </p>
                        <p>
                          {t("dashboard:literature")}: {student.literature}
                        </p>
                        <p>
                          {t("dashboard:english")}: {student.english}
                        </p>
                      </div>
                    }
                    title={`${student.fullname}`}
                  >
                    <span style={{ cursor: "pointer" }}>
                      {student.totalScore}
                    </span>
                  </Popover>
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="charts">
        <div className="chart-Pie1">
          <h1>{t("dashboard:percentOfRegistration")}</h1>
          <div className="pie">
            <Pie
              data={pieData}
              angleField="value"
              colorField="type"
              radius={2}
              width={400}
              height={400}
              marginLeft={100}
              label={{
                text: "value",
                style: { fontWeight: "bold" },
                position: "outside",
              }}
              legend={{
                color: { title: false, position: "right", rowPadding: 0.5 },
                formatter: (text, item) => (item.value === 0 ? null : text),
              }}
              theme={currentTheme}
            />
          </div>
        </div>
        <div className="chart-Column">
          <h1>
            {t("dashboard:averageScoresInNationalHighSchoolExamSubjects")}
          </h1>
          <Column
            data={[
              { type: t("dashboard:math"), value: averageScores.math },
              {
                type: t("dashboard:literature"),
                value: averageScores.literature,
              },
              { type: t("dashboard:english"), value: averageScores.english },
            ]}
            width={500}
            height={400}
            xField="type"
            yField="value"
            colorField="type"
            scale={{
              y: {
                domainMin: 0,
                domainMax: 10,
                nice: true,
              },
            }}
            axis={{
              x: { size: 40 },
              y: { nice: true },
            }}
            theme={currentTheme}
          />
        </div>
      </div>
      <div className="chart-Line">
        <h1>{t("dashboard:distributionOfMathScores")}</h1>
        <Line
          data={scoreData}
          width={900}
          height={400}
          xField="score"
          yField="occurrences"
          point={{ shapeField: "square", sizeField: 4 }}
          interaction={{ tooltip: { marker: false } }}
          style={{ lineWidth: 2 }}
          theme={currentTheme}
        />
      </div>

      <div className="chart-Line1">
        <h1>{t("dashboard:distributionOfLiteratureScores")}</h1>
        <Line
          width={900}
          height={400}
          data={literatureScores}
          xField="score"
          yField="occurrences"
          point={{ shapeField: "square", sizeField: 4 }}
          interaction={{ tooltip: { marker: false } }}
          style={{ lineWidth: 2 }}
          theme={currentTheme}
        />
      </div>
      <div className="chart-Line1">
        <h1>{t("dashboard:distributionOfEnglishScores")}</h1>
        <Line
          width={900}
          height={400}
          data={englishScores}
          xField="score"
          yField="occurrences"
          point={{ shapeField: "square", sizeField: 4 }}
          interaction={{ tooltip: { marker: false } }}
          style={{ lineWidth: 2 }}
          theme={currentTheme}
        />
      </div>
    </div>
  );
};

export default Dashboard;
