import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
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

// Obtener el estado de autenticación del usuario
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuario registrado:", user.email);
    loadUserProfile(user.uid); // Cargar el perfil del usuario si está autenticado
  } else {
    console.log("No hay usuario registrado");
  }
});

// Función para cargar los datos del perfil si el usuario está autenticado
async function loadUserProfile(uid) {
  const userDoc = doc(db, "usuarios", uid);
  const docSnap = await getDoc(userDoc);
  if (docSnap.exists()) {
    const data = docSnap.data();
    // Prellena los campos con los datos almacenados en Firestore
    document.getElementById("nombre").value = data.nombre || '';
    document.getElementById("foto").value = data.foto || '';
    document.getElementById("intereses").value = data.intereses || '';
    document.getElementById("habilidades").value = data.habilidades || '';
    document.getElementById("vision").value = data.vision || '';
    document.getElementById("cambios").value = data.cambios || '';
    document.getElementById("accion").value = data.accion || '';
  } else {
    console.log("No se encontró el perfil del usuario");
  }
}

// Función para guardar o actualizar los datos del perfil
async function saveUserProfile(uid) {
  const nombre = document.getElementById("nombre").value;
  const foto = document.getElementById("foto").files[0]?.name || "No se seleccionó foto";
  const intereses = document.getElementById("intereses").value;
  const habilidades = document.getElementById("habilidades").value;
  const vision = document.getElementById("vision").value;
  const cambios = document.getElementById("cambios").value;
  const accion = document.getElementById("accion").value;

  try {
    await setDoc(doc(db, "usuarios", uid), {
      nombre,
      foto,
      intereses,
      habilidades,
      vision,
      cambios,
      accion
    });
    alert("Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error al guardar el perfil:", error);
  }
}

// Formulario de perfil
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

// Mundo ideal
const formMundoIdeal = document.getElementById("form-mundo-ideal");
formMundoIdeal.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (user) {
    const vision = document.getElementById("vision").value;
    const cambios = document.getElementById("cambios").value;

    // Actualiza los datos en Firestore
    saveUserProfile(user.uid);
    alert(`Mundo ideal y cambios guardados:\nMundo ideal: ${vision}\nCambios necesarios: ${cambios}`);
  } else {
    alert("Debes estar registrado para guardar tus respuestas.");
  }
});

// Acciones ciudadanas
const formAcciones = document.getElementById("form-acciones");
formAcciones.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (user) {
    const accion = document.getElementById("accion").value;

    // Guardar o actualizar las acciones del usuario
    const userActionsRef = doc(db, "usuarios", user.uid);
    setDoc(userActionsRef, { accion: accion }, { merge: true });

    alert(`Acción ciudadana guardada: ${accion}`);
  } else {
    alert("Debes estar registrado para guardar tus acciones.");
  }
});