import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, where } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjlOYmUvIPkIh2ZUKktnEyisug_siu1z0",
  authDomain: "couple-todo-306dd.firebaseapp.com",
  projectId: "couple-todo-306dd",
  storageBucket: "couple-todo-306dd.firebasestorage.app",
  messagingSenderId: "1099468628613",
  appId: "1:1099468628613:web:e2f784e37a93585700ffec",
  measurementId: "G-VKG14LWWM4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, where };
