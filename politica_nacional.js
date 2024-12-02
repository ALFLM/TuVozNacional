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
    crearPublicacion(data.texto, data.timestamp);
  });

  // Crear nueva publicación
  formPublicaciones.addEventListener("submit", async (e) => {
    e.preventDefault();

    const texto = formPublicaciones.querySelector("textarea").value;
    if (!texto.trim()) return;

    // Crear publicación en Firebase
    const docRef = await addDoc(collection(db, "publicaciones"), {
      texto: texto,
      timestamp: Timestamp.fromDate(new Date())
    });

    // Crear visualmente la publicación
    crearPublicacion(texto, docRef.id);
    
    formPublicaciones.reset();
  });

  function crearPublicacion(texto, id) {
    const publicacion = document.createElement("div");
    publicacion.classList.add("publicacion");
    publicacion.id = id;

    publicacion.innerHTML = `
      <p>${texto}</p>
      <div class="acciones">
        <button class="like">👍 0</button>
        <button class="dislike">👎 0</button>
      </div>
    `;

    let userVote = null;

    const likeButton = publicacion.querySelector(".like");
    const dislikeButton = publicacion.querySelector(".dislike");

    likeButton.addEventListener("click", () => {
      if (userVote === "like") {
        likeButton.textContent = `👍 ${parseInt(likeButton.textContent.split(" ")[1]) - 1}`;
        userVote = null;
      } else {
        if (userVote === "dislike") {
          dislikeButton.textContent = `👎 ${parseInt(dislikeButton.textContent.split(" ")[1]) - 1}`;
        }
        likeButton.textContent = `👍 ${parseInt(likeButton.textContent.split(" ")[1]) + 1}`;
        userVote = "like";
      }
    });

    dislikeButton.addEventListener("click", () => {
      if (userVote === "dislike") {
        dislikeButton.textContent = `👎 ${parseInt(dislikeButton.textContent.split(" ")[1]) - 1}`;
        userVote = null;
      } else {
        if (userVote === "like") {
          likeButton.textContent = `👍 ${parseInt(likeButton.textContent.split(" ")[1]) - 1}`;
        }
        dislikeButton.textContent = `👎 ${parseInt(dislikeButton.textContent.split(" ")[1]) + 1}`;
        userVote = "dislike";
      }
    });

    listaPublicaciones.appendChild(publicacion);
  }
});
