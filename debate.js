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
  setDoc, 
  updateDoc 
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

/**
* Carga el tema de debate semanal
*/
async function loadTemaDebate() {
  const temaActual = document.getElementById("tema-actual");
  try {
      const temaSnapshot = await getDoc(temasRef);
      temaActual.textContent = temaSnapshot.exists()
          ? temaSnapshot.data().tema || "Sin tema definido."
          : "Sin tema definido.";
  } catch (error) {
      console.error("Error al cargar el tema de debate:", error);
      temaActual.textContent = "Error al cargar el tema.";
  }
}

/**
* Carga y muestra los comentarios con botones de valoración
*/
async function loadComentarios() {
  const comentariosList = document.getElementById("comentarios-debate");
  comentariosList.innerHTML = "<li>Cargando comentarios...</li>";

  try {
      const querySnapshot = await getDocs(comentariosRef);
      comentariosList.innerHTML = ""; // Limpia la lista antes de añadir comentarios

      querySnapshot.forEach((doc) => {
          const data = doc.data();
          const listItem = crearComentarioElemento(doc.id, data);
          comentariosList.appendChild(listItem);
      });
  } catch (error) {
      console.error("Error al cargar los comentarios:", error);
      comentariosList.innerHTML = "<li>Error al cargar los comentarios.</li>";
  }
}

/**
* Crea un elemento HTML para un comentario
* @param {string} id - ID del comentario
* @param {object} data - Datos del comentario
* @returns {HTMLElement}
*/
function crearComentarioElemento(id, data) {
  const listItem = document.createElement("li");
  listItem.innerHTML = `
      <strong>${data.usuario || "Anónimo"}:</strong>
      <span>${data.texto}</span>
      <small>${new Date(data.fecha).toLocaleString()}</small>
      <div>
          <button class="like-btn" data-id="${id}">❤️ <span>${data.likes || 0}</span></button>
          <button class="dislike-btn" data-id="${id}">💔 <span>${data.dislikes || 0}</span></button>
      </div>
  `;

  listItem.querySelector(".like-btn").addEventListener("click", () => handleVote(id, "likes"));
  listItem.querySelector(".dislike-btn").addEventListener("click", () => handleVote(id, "dislikes"));

  return listItem;
}

/**
* Guarda un nuevo comentario en Firestore
* @param {string} usuario - Nombre del usuario
* @param {string} texto - Texto del comentario
*/
async function saveComentario(usuario, texto) {
  try {
      const nuevoComentario = {
          usuario: usuario || "Anónimo", // Si no se proporciona un nombre, usar "Anónimo"
          texto,
          fecha: new Date().toISOString(),
          likes: 0,
          dislikes: 0
      };
      await addDoc(comentariosRef, nuevoComentario);
      console.log("Comentario guardado correctamente.");
      loadComentarios();
  } catch (error) {
      console.error("Error al guardar el comentario:", error);
  }
}

/**
* Maneja los votos (like o dislike) para un comentario
* @param {string} commentId - ID del comentario
* @param {string} type - Tipo de voto ("likes" o "dislikes")
*/
async function handleVote(commentId, type) {
  const userId = "usuario-actual"; // Reemplazar con el ID único del usuario autenticado
  const commentRef = doc(comentariosRef, commentId);
  const userVoteRef = doc(collection(commentRef, "votos"), userId);

  try {
      const [commentSnapshot, userVoteSnapshot] = await Promise.all([
          getDoc(commentRef),
          getDoc(userVoteRef)
      ]);

      if (!commentSnapshot.exists()) {
          console.error("El comentario no existe.");
          return;
      }

      const commentData = commentSnapshot.data();
      const previousVote = userVoteSnapshot.exists() ? userVoteSnapshot.data().tipo : null;

      if (previousVote === type) {
          console.log("El usuario ya ha votado de esta manera.");
          return; // No hacer nada si el usuario ya emitió el mismo voto
      }

      const updateData = {};
      if (previousVote) {
          updateData[previousVote] = (commentData[previousVote] || 0) - 1;
      }

      updateData[type] = (commentData[type] || 0) + 1;

      await Promise.all([
          updateDoc(commentRef, updateData),
          setDoc(userVoteRef, { tipo: type })
      ]);

      console.log(`Voto actualizado: ${type} para el comentario ${commentId}.`);
      actualizarComentarioVisual(commentId, updateData);
  } catch (error) {
      console.error("Error al manejar el voto:", error);
  }
}

/**
* Actualiza visualmente un comentario después de un voto
* @param {string} commentId - ID del comentario
* @param {object} updateData - Datos actualizados del comentario
*/
function actualizarComentarioVisual(commentId, updateData) {
  const commentElement = document.querySelector(`button[data-id="${commentId}"]`).closest("li");
  if (commentElement) {
      Object.keys(updateData).forEach((key) => {
          const span = commentElement.querySelector(`.${key}-btn span`);
          if (span) span.textContent = updateData[key];
      });
  }
}

// Manejo del formulario de comentarios
document.getElementById("form-debate").addEventListener("submit", (event) => {
  event.preventDefault();
  const usuarioInput = document.getElementById("usuario");
  const comentarioInput = document.getElementById("comentario");

  const usuarioNombre = usuarioInput.value.trim();
  const comentarioTexto = comentarioInput.value.trim();

  if (comentarioTexto) {
      saveComentario(usuarioNombre, comentarioTexto);
      comentarioInput.value = ""; // Limpiar el campo de texto
      usuarioInput.value = ""; // Limpiar el campo del nombre
  } else {
      alert("El comentario no puede estar vacío.");
  }
});

// Cargar tema y comentarios al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadTemaDebate();
  loadComentarios();
});
