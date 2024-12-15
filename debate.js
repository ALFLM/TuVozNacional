// Importar las funciones necesarias de Firebase
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

// Configuración de Firebase
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

// Referencias de Firestore
const temasRef = doc(db, "debate", "tema-semanal");
const comentariosRef = collection(db, "comentarios-debate");

// Función para cargar el tema de debate semanal
async function loadTemaDebate() {
  const temaActual = document.getElementById("tema-actual");

  try {
    const temaSnapshot = await getDoc(temasRef);
    if (temaSnapshot.exists()) {
      temaActual.textContent = temaSnapshot.data().tema || "Sin tema definido.";
    } else {
      temaActual.textContent = "Sin tema definido.";
    }
  } catch (error) {
    console.error("Error al cargar el tema de debate:", error);
    temaActual.textContent = "Error al cargar el tema.";
  }
}

// Función para cargar comentarios
async function loadComentarios() {
  const comentariosList = document.getElementById("comentarios-debate");
  comentariosList.innerHTML = "<li>Cargando comentarios...</li>";

  try {
    const querySnapshot = await getDocs(comentariosRef);
    comentariosList.innerHTML = ""; // Limpia la lista antes de añadir comentarios

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <strong>${data.usuario || "Anónimo"}:</strong>
        <span>${data.texto}</span>
        <small>${new Date(data.fecha).toLocaleString()}</small>
      `;
      comentariosList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error al cargar los comentarios:", error);
    comentariosList.innerHTML = "<li>Error al cargar los comentarios.</li>";
  }
}

// Guardar un nuevo comentario
async function saveComentario(usuario, texto) {
  try {
    const nuevoComentario = {
      usuario,
      texto,
      fecha: new Date().toISOString(),
    };
    await addDoc(comentariosRef, nuevoComentario);
    console.log("Comentario guardado correctamente.");
    loadComentarios();
  } catch (error) {
    console.error("Error al guardar el comentario:", error);
  }
}

// Manejo del formulario de comentarios
document.getElementById("form-debate").addEventListener("submit", (event) => {
  event.preventDefault();
  const comentarioInput = document.getElementById("comentario");
  const comentarioTexto = comentarioInput.value.trim();

  if (comentarioTexto) {
    saveComentario("Usuario Prueba", comentarioTexto); // Cambiar "Usuario Prueba" por el nombre real del usuario
    comentarioInput.value = ""; // Limpiar el campo de texto
  } else {
    alert("El comentario no puede estar vacío.");
  }
});

// Cargar tema y comentarios al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadTemaDebate();
  loadComentarios();
});
