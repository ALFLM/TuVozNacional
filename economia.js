import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, onSnapshot, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos DOM
const listaNoticias = document.getElementById("lista-noticias");
const formPublicaciones = document.getElementById("form-publicaciones");
const listaPublicaciones = document.getElementById("lista-publicaciones");

// Obtener noticias de The Guardian
const API_KEY = "bfb01d6d-5084-4278-b417-ac240072f5f4";
const API_URL = `https://content.guardianapis.com/search?q=econom%C3%ADa&api-key=${API_KEY}`;

listaNoticias.innerHTML = "<li>Cargando noticias...</li>";

fetch(API_URL)
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    listaNoticias.innerHTML = "";
    const noticias = data.response.results || [];
    if (noticias.length === 0) {
      listaNoticias.innerHTML = "<li>No hay noticias disponibles.</li>";
      return;
    }

    noticias.slice(0, 5).forEach(noticia => {
      const noticiaElement = document.createElement("div");
      noticiaElement.classList.add("noticia");

      const fecha = noticia.webPublicationDate
        ? new Date(noticia.webPublicationDate).toLocaleDateString()
        : "Fecha no disponible";

      noticiaElement.innerHTML = `
        <h3>${noticia.webTitle}</h3>
        <p class="fecha">${fecha}</p>
        <a href="${noticia.webUrl}" class="leer-mas" target="_blank">Leer más</a>
      `;
      listaNoticias.appendChild(noticiaElement);
    });
  })
  .catch(error => {
    console.error("Error al obtener noticias:", error);
    listaNoticias.innerHTML = "<li>Error al cargar noticias.</li>";
  });

// Manejar envío de nuevas publicaciones
formPublicaciones.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = formPublicaciones.querySelector("#usuario").value.trim();
  const texto = formPublicaciones.querySelector("#contenido").value.trim();

  if (!usuario || !texto) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  const nuevaPublicacion = {
    usuario,
    texto,
    likes: 0,
    dislikes: 0,
    createdAt: new Date()
  };

  try {
    await addDoc(collection(db, "publicaciones"), nuevaPublicacion);
    formPublicaciones.reset();
  } catch (error) {
    console.error("Error al guardar la publicación:", error);
    alert("No se pudo guardar la publicación.");
  }
});

// Cargar publicaciones existentes
const publicacionesQuery = query(collection(db, "publicaciones"), orderBy("createdAt", "desc"));

onSnapshot(publicacionesQuery, (snapshot) => {
  listaPublicaciones.innerHTML = "";
  snapshot.forEach(doc => {
    const publicacion = doc.data();
    const publicacionElement = document.createElement("div");
    publicacionElement.classList.add("publicacion");

    publicacionElement.innerHTML = `
      <strong>${publicacion.usuario}</strong>
      <p>${publicacion.texto}</p>
      <div class="acciones">
        <button class="like" aria-label="Like">👍 ${publicacion.likes}</button>
        <button class="dislike" aria-label="Dislike">👎 ${publicacion.dislikes}</button>
      </div>
    `;

    const likeButton = publicacionElement.querySelector(".like");
    const dislikeButton = publicacionElement.querySelector(".dislike");

    likeButton.addEventListener("click", async () => {
      try {
        await updateDoc(doc(db, "publicaciones", doc.id), {
          likes: increment(1)
        });
      } catch (error) {
        console.error("Error al actualizar likes:", error);
      }
    });

    dislikeButton.addEventListener("click", async () => {
      try {
        await updateDoc(doc(db, "publicaciones", doc.id), {
          dislikes: increment(1)
        });
      } catch (error) {
        console.error("Error al actualizar dislikes:", error);
      }
    });

    listaPublicaciones.appendChild(publicacionElement);
  });
}, error => {
  console.error("Error al cargar publicaciones:", error);
});
