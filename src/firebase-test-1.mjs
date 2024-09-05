import bcrypt from "bcryptjs";
import { ref, set, getDatabase } from "firebase/database";
import { initializeApp } from "firebase/app";
export const firebaseConfig = {
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
function randomAddress() {
  const addresses = [
    "57/4C Pham Van Chieu Street, Ward 12, Go Vap District",
    "Viallage 1A, An Phu, Binh Duong",
    "10 Ton That Hiep Street, Ward 13, District 11, Ho Chi Minh City",
    "212/3 Huynh Van Banh St., Ward 11,  Ho Chi Minh City",
    "13 - 13Bis Ky Dong, Ward 9, District 3, Ho Chi Minh City",
    "163 Pho Hue Street, Hanoi",
    "Dong Tien Ward, Town, Hoa Binh",
    "20/1/1 Truc St., Ward 13, Ho Chi Minh City",
    " 529A Ha Hoang Ho St. An Giang",
    "No. 334, 48 street, Tan Phu area, Nghe An",
    "2 Nguyen Huy Tu, Ha Tinh",
    "30A Ly Thuong Kiet Street, Hanoi",
    "38/1 Tran Xuan Soan, Tan Hung Ward, Dist.7, Ho Chi Minh City",
    "Binh Thuan Hamlet, Ben Tre",
    "339 Hung Vuong, Vinh Trung Ward, Danang",
    "8 Kim Long Hamlet, Tam Duong Dist, Vinh Phuc",
    "HOANG MAI HAMLET, Bac Giang",
    "Phan Boi Chau, Quang Nam",
    "399 Cach Mang Thang Tam Street, Binh Duong",
    "Area 2, Hung Quoc Town, Tra Linh District ,Cao Bang",
  ];
  return addresses[Math.floor(Math.random() * addresses.length)];
}
function randomName() {
  const names = [
    "Anh",
    "Bình",
    "Dũng",
    "Duy",
    "Giang",
    "Hà",
    "Hải",
    "Hạnh",
    "Hiếu",
    "Hoàng",
    "Linh",
    "Loan",
    "Long",
    "Minh",
    "Nam",
    "Nga",
    "Ngọc",
    "Nhi",
    "Nhung",
    "Phát",
    "Phong",
    "Phúc",
    "Quân",
    "Quang",
    "Sơn",
    "Tâm",
    "Thảo",
    "Thắng",
    "Thành",
    "Thảo",
    "Thu",
    "Thúy",
    "Tiến",
    "Trang",
    "Trinh",
    "Trung",
    "Tú",
    "Tuấn",
    "Tường",
    "Vân",
    "Vy",
    "Yến",
    "Thị",
    "Thiên",
    "Thông",
    "Hồ",
    "Hưng",
    "Quân",
    "Phụng",
    "Hạ",
    "Huy",
    "An",
    "Nguyễn",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function randomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(1);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomDOB() {
  const start = new Date(1980, 0, 1);
  const end = new Date(2005, 11, 31);
  const randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  const day = String(randomDate.getDate()).padStart(2, "0");
  const month = String(randomDate.getMonth() + 1).padStart(2, "0");
  const year = randomDate.getFullYear();
  return `${year}-${month}-${day}`;
}

function randomBoolean() {
  return Math.random() < 0.5 ? true : false;
}

function randomUniversity() {
  const universities = [
    "Đại học Bách Khoa Hà Nội",
    "Đại học Quốc gia Hà Nội",
    "Đại học Quốc gia TP.HCM",
    "Đại học Kinh tế Quốc dân",
    "Đại học Ngoại thương",
    "Đại học Sư phạm Hà Nội",
    "Đại học Y Hà Nội",
    "Đại học Y Dược TP.HCM",
    "Đại học Khoa học Tự nhiên - ĐHQG Hà Nội",
    "Đại học Khoa học Tự nhiên - ĐHQG TP.HCM",
    "Đại học Khoa học Xã hội và Nhân văn - ĐHQG Hà Nội",
    "Đại học Khoa học Xã hội và Nhân văn - ĐHQG TP.HCM",
    "Đại học Bách khoa TP.HCM",
    "Đại học Sư phạm Kỹ thuật TP.HCM",
    "Đại học Cần Thơ",
    "Đại học Đà Nẵng",
    "Đại học Huế",
    "Đại học Thương mại",
    "Đại học Luật Hà Nội",
    "Đại học Luật TP.HCM",
    "Học viện Tài chính",
    "Học viện Ngân hàng",
    "Học viện Kỹ thuật Quân sự",
    "Đại học Công nghệ - ĐHQG Hà Nội",
    "Đại học Giao thông Vận tải",
    "Đại học Công nghiệp Hà Nội",
    "Đại học Công nghiệp TP.HCM",
    "Đại học Thủy lợi",
    "Đại học Kiến trúc Hà Nội",
    "Đại học Kiến trúc TP.HCM",
    "Đại học Mở Hà Nội",
    "Đại học Mở TP.HCM",
    "Đại học Văn Lang",
    "Đại học Tôn Đức Thắng",
    "Đại học Hoa Sen",
    "Đại học FPT",
    "Đại học RMIT Việt Nam",
  ];

  return universities[Math.floor(Math.random() * universities.length)];
}

function randomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVY";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
function randomUniversitiesCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVY";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function createUsersAndUniversities() {
  try {
    const users = [];
    const universities = [];
    const admins = [];
    for (let i = 0; i < 100; i++) {
      const created_at = new Date();
      const day = String(created_at.getDate()).padStart(2, "0");
      const month = String(created_at.getMonth() + 1).padStart(2, "0");
      const year = created_at.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync("Thien@1234", salt);
      const user = {
        id: `user${i + 1}`,
        id_card: `056204004${randomInt(100, 999)}`,
        username: `nguyen${i + 1}@edu.student`,
        password: hashedPassword,
        created_at: formattedDate,
        fullname: `Nguyễn ${randomName()} ${randomName()}`,
        gender: randomBoolean() ? "male" : "female",
        dob: randomDOB(),
        examcode: randomString(8),
        role: "student",
        literature: randomFloat(3, 10),
        math: randomFloat(4, 10),
        english: randomFloat(5, 10),
        graduation_year: randomInt(2019, 2023),
        highschool_result: randomFloat(6, 10),
      };
      users.push(user);
    }

    for (let i = 0; i < 4; i++) {
      const created_at = new Date();
      const day = String(created_at.getDate()).padStart(2, "0");
      const month = String(created_at.getMonth() + 1).padStart(2, "0");
      const year = created_at.getFullYear();
      const formattedDate = `${year}-${month}-${day}`;
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync("Thien@1234", salt);
      const admin = {
        id: `ad${i + 1}`,
        id_card: `056204004${randomInt(100, 999)}`,
        username: `nguyen${i + 1}@edu.admin`,
        password: hashedPassword,
        created_at: formattedDate,
        fullname: `Nguyễn ${randomName()} ${randomName()}`,
        gender: randomBoolean() ? "male" : "female",
        dob: randomDOB(),
        examcode: randomString(8),
        role: randomBoolean() ? "admin" : "superadmin",
        literature: 0,
        math: 0,
        english: 0,
        graduation_year: 0,
        highschool_result: 0,
      };
      admins.push(admin);
    }
    for (let i = 0; i < 20; i++) {
      const id = randomUniversitiesCode(3);
      const entranceNumber = Math.floor(Math.random() * 11) * 10 + 200;
      const university = {
        id: id,
        entranceNumber: entranceNumber,
        name: `${randomUniversity()}`,
        address: randomAddress(),
        admissionCutoffScore: randomFloat(4.5, 9),
        studentsRegistered: [],
      };
      universities.push(university);
    }

    for (let i = 0; i < users.length; i++) {
      await set(ref(database, `users/${users[i].id}`), users[i]);
    }
    for (let i = 0; i < universities.length; i++) {
      await set(
        ref(database, `universities/${universities[i].id}`),
        universities[i]
      );
    }
    for (let i = 0; i < admins.length; i++) {
      await set(ref(database, `admin/${admins[i].id}`), admins[i]);
    }
  } catch (error) {}
}

createUsersAndUniversities();
