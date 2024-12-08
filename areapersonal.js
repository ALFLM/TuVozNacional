import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYLtf51vBg0NmXoEMD64KbNcU1Izhoc6M",
  authDomain: "tuvoz-dae95.firebaseapp.com",
  databaseURL: "https://tuvoz-dae95-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tuvoz-dae95",
  storageBucket: "tuvoz-dae95.firebasestorage.app",
  messagingSenderId: "21285165787",
  appId: "1:21285165787:web:d7f84940999df2935e4afe"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  // Perfil básico
  const formPerfil = document.getElementById("form-perfil");
  formPerfil.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const foto = document.getElementById("foto").files[0]?.name || "No se seleccionó foto";
    const intereses = document.getElementById("intereses").value;
    const habilidades = document.getElementById("habilidades").value;

    // Guardar los datos del perfil en Firestore
    try {
      const userRef = doc(db, "usuarios", nombre);  // Usamos el nombre como ID del documento
      await setDoc(userRef, {
        foto: foto,
        intereses: intereses,
        habilidades: habilidades,
        actualizado: new Date()  // Fecha de última actualización
      });
      alert(`Perfil actualizado y guardado en Firestore:\nNombre: ${nombre}\nFoto: ${foto}\nIntereses: ${intereses}\nHabilidades: ${habilidades}`);
    } catch (error) {
      console.error("Error al guardar el perfil: ", error);
      alert("Hubo un error al guardar el perfil.");
    }
  });

  // Mundo ideal
  const formMundoIdeal = document.getElementById("form-mundo-ideal");
  formMundoIdeal.addEventListener("submit", async (e) => {
    e.preventDefault();
    const vision = document.getElementById("vision").value;
    const cambios = document.getElementById("cambios").value;

    // Guardar las respuestas sobre el mundo ideal en Firestore
    try {
      const mundoIdealRef = doc(db, "usuarios", "mundo-ideal");
      await setDoc(mundoIdealRef, {
        vision: vision,
        cambios: cambios,
        actualizado: new Date()
      });
      alert(`Respuestas guardadas en Firestore:\nMundo ideal: ${vision}\nCambios necesarios: ${cambios}`);
    } catch (error) {
      console.error("Error al guardar el mundo ideal: ", error);
      alert("Hubo un error al guardar las respuestas.");
    }
  });

  // Acciones ciudadanas
  const formAcciones = document.getElementById("form-acciones");
  const listaAcciones = document.getElementById("lista-acciones");

  formAcciones.addEventListener("submit", async (e) => {
    e.preventDefault();
    const accion = document.getElementById("accion").value;

    // Agregar la acción ciudadana a Firestore
    try {
      const accionesRef = collection(db, "acciones");
      await addDoc(accionesRef, {
        accion: accion,
        fecha: new Date()
      });

      const li = document.createElement("li");
      li.textContent = accion;
      listaAcciones.appendChild(li);

      formAcciones.reset();
    } catch (error) {
      console.error("Error al agregar la acción: ", error);
      alert("Hubo un error al agregar la acción.");
    }
  });

  // Reflexiones
  const formReflexiones = document.getElementById("form-reflexiones");
  const listaReflexiones = document.getElementById("lista-reflexiones");

  formReflexiones.addEventListener("submit", async (e) => {
    e.preventDefault();
    const reflexion = document.getElementById("reflexion").value;

    // Agregar la reflexión a Firestore
    try {
      const reflexionesRef = collection(db, "reflexiones");
      await addDoc(reflexionesRef, {
        reflexion: reflexion,
        fecha: new Date()
      });

      const li = document.createElement("li");
      li.textContent = reflexion;
      listaReflexiones.appendChild(li);

      formReflexiones.reset();
    } catch (error) {
      console.error("Error al agregar la reflexión: ", error);
      alert("Hubo un error al agregar la reflexión.");
    }
  });
});
