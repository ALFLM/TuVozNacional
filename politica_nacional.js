import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", async () => {
  const formPublicaciones = document.getElementById("form-publicaciones");
  const listaPublicaciones = document.getElementById("lista-publicaciones");

  // Cargar publicaciones desde Firebase
  const publicacionesRef = collection(db, "publicaciones");
  const q = query(publicacionesRef, orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    crearPublicacion(data.texto, data.timestamp, doc.id, data.usuario, data.likes, data.dislikes);
  });

  // Crear nueva publicación
  formPublicaciones.addEventListener("submit", async (e) => {
    e.preventDefault();

    const texto = formPublicaciones.querySelector("textarea").value;
    const usuario = formPublicaciones.querySelector("#usuario").value;  // Añadir input para nombre de usuario
    if (!texto.trim()) return;

    // Crear publicación en Firebase
    const docRef = await addDoc(collection(db, "publicaciones"), {
      texto: texto,
      timestamp: Timestamp.fromDate(new Date()),
      usuario: usuario,  // Guardar el nombre de usuario
      likes: 0,  // Contador de likes
      dislikes: 0  // Contador de dislikes
    });

    // Crear visualmente la publicación
    crearPublicacion(texto, docRef.timestamp, docRef.id, usuario, 0, 0);
    
    formPublicaciones.reset();
  });

  function crearPublicacion(texto, timestamp, id, usuario, likes, dislikes) {
    const publicacion = document.createElement("div");
    publicacion.classList.add("publicacion");
    publicacion.id = id;

    publicacion.innerHTML = `
      <p><strong>${usuario}</strong>: ${texto}</p>
      <div class="acciones">
        <button class="like">👍 ${likes}</button>
        <button class="dislike">👎 ${dislikes}</button>
      </div>
    `;

    let userVote = null;

    const likeButton = publicacion.querySelector(".like");
    const dislikeButton = publicacion.querySelector(".dislike");

    likeButton.addEventListener("click", async () => {
      if (userVote === "like") {
        likeButton.textContent = `👍 ${likes - 1}`;
        userVote = null;
        likes--;
      } else {
        if (userVote === "dislike") {
          dislikeButton.textContent = `👎 ${dislikes - 1}`;
          dislikes--;
        }
        likeButton.textContent = `👍 ${likes + 1}`;
        userVote = "like";
        likes++;
      }

      // Actualizar en Firestore
      await updateDoc(doc(db, "publicaciones", id), { likes: likes, dislikes: dislikes });
    });

    dislikeButton.addEventListener("click", async () => {
      if (userVote === "dislike") {
        dislikeButton.textContent = `👎 ${dislikes - 1}`;
        userVote = null;
        dislikes--;
      } else {
        if (userVote === "like") {
          likeButton.textContent = `👍 ${likes - 1}`;
          likes--;
        }
        dislikeButton.textContent = `👎 ${dislikes + 1}`;
        userVote = "dislike";
        dislikes++;
      }

      // Actualizar en Firestore
      await updateDoc(doc(db, "publicaciones", id), { likes: likes, dislikes: dislikes });
    });

    listaPublicaciones.appendChild(publicacion);
  }
});
