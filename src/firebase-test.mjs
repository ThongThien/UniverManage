import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyBNhqyjX6zC5oz3TlmiGa_5-W4gu5AfcC4",
  authDomain: "dummy-data-816f2.firebaseapp.com",
  databaseURL: "https://dummy-data-816f2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dummy-data-816f2",
  storageBucket: "dummy-data-816f2.appspot.com",
  messagingSenderId: "601438283731",
  appId: "1:601438283731:web:dd9637cc6649580a1b7126",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function registerStudentsAndUniversities() {
  try {
    const usersSnapshot = await get(ref(database, "users"));
    const universitiesSnapshot = await get(ref(database, "universities"));

    const users = usersSnapshot.val();
    const universities = universitiesSnapshot.val();

    const universityStudentsMap = {};

    if (!users || !universities) {
      throw new Error("Users or Universities data is missing");
    }

    Object.keys(users).forEach(async (userId) => {
      const student = users[userId];
      const universitiesRegistered = [];

      const totalScore =
        parseFloat(student.math) +
        parseFloat(student.english) +
        parseFloat(student.literature);
      const averageScore = totalScore / 3;
      // Lấy danh sách các trường đại học đủ điều kiện cho sinh viên đăng ký
      const eligibleUniversities = [];
      Object.keys(universities).forEach((universityId) => {
        const university = universities[universityId];
        const universityCutoffScore = parseFloat(
          university.admissionCutoffScore
        );
        if (averageScore >= universityCutoffScore) {
          eligibleUniversities.push(universityId);
        }
      });
      // Chọn ngẫu nhiên từ 0 đến 5 trường đầu tiên đủ điều kiện
      const numUniversitiesToRegister = randomInt(
        0,
        Math.min(5, eligibleUniversities.length)
      );
      for (let i = 0; i < numUniversitiesToRegister; i++) {
        const universityId = eligibleUniversities[i];
        const university = universities[universityId];
        const entranceNumber = parseInt(university.entranceNumber, 10);
        // Cập nhật thông tin sinh viên đã đăng ký vào danh sách sinh viên của từng trường
        if (!universityStudentsMap[universityId]) {
          universityStudentsMap[universityId] = [];
        }
        if (universityStudentsMap[universityId].length < entranceNumber) {
          universitiesRegistered.push({
            id: universityId,
            cutoffScore: university.admissionCutoffScore,
          });
          universityStudentsMap[universityId].push({
            id: userId,
            math: student.math,
            literature: student.literature,
            english: student.english,
          });
        } else {
          break;
        }
      }
      // Cập nhật thông tin đăng ký của sinh viên vào Firebase
      await set(
        ref(database, `users/${userId}/universities`),
        universitiesRegistered
      );
    });

    // Cập nhật thông tin sinh viên đã đăng ký vào mỗi trường đại học vào Firebase
    Object.keys(universityStudentsMap).forEach(async (universityId) => {
      const studentsRegisteredObject = {};
      universityStudentsMap[universityId].forEach(async (student, index) => {
        studentsRegisteredObject[index] = student;
      });

      // Cập nhật thông tin đăng ký của sinh viên vào node universities trên Firebase
      await set(
        ref(database, `universities/${universityId}/studentsRegistered`),
        studentsRegisteredObject
      );
    });
  } catch (error) {
    console.error("Error registering students and universities:", error);
  }
}

registerStudentsAndUniversities();
