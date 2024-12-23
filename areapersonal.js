import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Inicializa Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYLtf51vBg0NmXoEMD64KbNcU1Izhoc6M",
  authDomain: "tuvoz-dae95.firebaseapp.com",
  projectId: "tuvoz-dae95",
  storageBucket: "tuvoz-dae95.firebasestorage.app",
  messagingSenderId: "21285165787",
  appId: "1:21285165787:web:d7f84940999df2935e4afe"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuario registrado:", user.email);
    loadUserProfile(user.uid);
  } else {
    console.log("No hay usuario registrado");
  }
});

// Cargar datos de perfil
async function loadUserProfile(uid) {
  try {
    const userDoc = doc(db, "usuarios", uid);
    const docSnap = await getDoc(userDoc);
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById("nombre").value = data.nombre || '';
      document.getElementById("intereses").value = data.intereses || '';
      document.getElementById("vision").value = data.vision || '';
      document.getElementById("cambios").value = data.cambios || '';
      document.getElementById("accion").value = data.accion || '';
    } else {
      console.log("No se encontró el perfil del usuario");
    }
  } catch (error) {
    console.error("Error al cargar el perfil del usuario:", error);
  }
}

// Guardar datos del perfil
async function saveUserProfile(uid) {
  const nombre = document.getElementById("nombre").value;
  const intereses = document.getElementById("intereses").value;
  const vision = document.getElementById("vision").value;
  const cambios = document.getElementById("cambios").value;
  const accion = document.getElementById("accion").value;

  try {
    await setDoc(doc(db, "usuarios", uid), {
      nombre,
      intereses,
      vision,
      cambios,
      accion
    }, { merge: true });
    alert("Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error al guardar el perfil:", error);
  }
}

// Evento del formulario
const formPerfil = document.getElementById("form-perfil");
formPerfil.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (user) {
    saveUserProfile(user.uid);
  } else {
    alert("Debes estar registrado para actualizar tu perfil.");
  }
});
