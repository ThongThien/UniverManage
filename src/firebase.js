import { initializeApp } from "firebase/app";
import { getDatabase, child, ref, get } from "firebase/database";
import { getAuth, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

export const fetchUserData = async (userType) => {
  try {
    const snapshot = await get(child(ref(database), userType));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const users = Object.values(userData).map((item) => item);
      return users;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};

export { 
  auth, 
  db, 
  FacebookAuthProvider, 
  signInWithPopup,
  app,
  database
};

