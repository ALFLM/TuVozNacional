import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, Timestamp, updateDoc, doc, limit, arrayUnion } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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
  // API Key y URL para obtener noticias de economía
  const API_KEY = "bfb01d6d-5084-4278-b417-ac240072f5f4";

  // URL de la API con un término de búsqueda relacionado con política
  const API_URL = `https://content.guardianapis.com/search?q=política&api-key=${API_KEY}`;
  const listaNoticias = document.getElementById("lista-noticias");

  // Mostrar mensaje de carga mientras se obtienen las noticias
  listaNoticias.innerHTML = "<li>Esperando mientras cargamos todas las noticias...</li>";

  // Obtener noticias de la API de The Guardian
  fetch(API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      listaNoticias.innerHTML = ""; // Limpiar mensaje de carga

      const noticias = data.response.results || [];
      if (noticias.length === 0) {
        listaNoticias.innerHTML = "<li>No hay noticias disponibles en este momento.</li>";
        return;
      }

      noticias.slice(0, 5).forEach((noticia) => {
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
    .catch((error) => {
      console.error("Error al obtener noticias:", error);
      listaNoticias.innerHTML = "<li>Error al cargar las noticias. Inténtalo más tarde.</li>";
    });

  const formPublicaciones = document.getElementById("form-publicaciones");
  const listaPublicaciones = document.getElementById("lista-publicaciones");

   // Cargar publicaciones desde Firebase
   const publicacionesRef = collection(db, "publicaciones");
   const q = query(publicacionesRef, orderBy("timestamp", "desc"));
   const querySnapshot = await getDocs(q);
 
   querySnapshot.forEach((doc) => {
     const data = doc.data();
     crearPublicacion(
       data.texto,
       data.timestamp,
       doc.id,
       data.usuario,
       data.likes,
       data.dislikes,
       data.respuestas || [],
       data.votos || {}
     );
   });
 
   // Crear nueva publicación
   formPublicaciones.addEventListener("submit", async (e) => {
     e.preventDefault();
 
     const texto = formPublicaciones.querySelector("textarea").value;
     const usuario = formPublicaciones.querySelector("#usuario").value;
     if (!texto.trim()) return;
 
     // Crear publicación en Firebase
     const docRef = await addDoc(collection(db, "publicaciones"), {
       texto: texto,
       timestamp: Timestamp.fromDate(new Date()),
       usuario: usuario,
       likes: 0,
       dislikes: 0,
       respuestas: [],
       votos: {} // Inicializamos votos como un objeto vacío
     });
 
     crearPublicacion(texto, Timestamp.now(), docRef.id, usuario, 0, 0, [], {});
     formPublicaciones.reset();
   });
 
   function crearPublicacion(texto, timestamp, id, usuario, likes, dislikes, respuestas, votos) {
     const publicacion = document.createElement("div");
     publicacion.classList.add("publicacion");
     publicacion.id = id;
 
     publicacion.innerHTML = `
       <p><strong>${usuario}</strong>: ${texto}</p>
       <div class="acciones">
         <button class="like">👍 ${likes}</button>
         <button class="dislike">👎 ${dislikes}</button>
       </div>
       <div class="respuestas">
         <h4>Respuestas:</h4>
         <div class="lista-respuestas"></div>
         <form class="form-respuesta">
           <input type="text" class="usuario-respuesta" placeholder="Tu nombre" required>
           <textarea class="texto-respuesta" placeholder="Escribe tu respuesta..." required></textarea>
           <button type="submit">Responder</button>
         </form>
       </div>
     `;
 
     const listaRespuestas = publicacion.querySelector(".lista-respuestas");
     respuestas.forEach((respuesta) => {
       const respuestaElement = document.createElement("p");
       respuestaElement.innerHTML = `<strong>${respuesta.usuario}</strong>: ${respuesta.texto}`;
       listaRespuestas.appendChild(respuestaElement);
     });
 
     const formRespuesta = publicacion.querySelector(".form-respuesta");
     formRespuesta.addEventListener("submit", async (e) => {
       e.preventDefault();
 
       const usuarioRespuesta = formRespuesta.querySelector(".usuario-respuesta").value;
       const textoRespuesta = formRespuesta.querySelector(".texto-respuesta").value;
       if (!textoRespuesta.trim()) return;
 
       const nuevaRespuesta = { usuario: usuarioRespuesta, texto: textoRespuesta };
       await updateDoc(doc(db, "publicaciones", id), {
         respuestas: arrayUnion(nuevaRespuesta)
       });
 
       const respuestaElement = document.createElement("p");
       respuestaElement.innerHTML = `<strong>${usuarioRespuesta}</strong>: ${textoRespuesta}`;
       listaRespuestas.appendChild(respuestaElement);
 
       formRespuesta.reset();
     });
 
     const likeButton = publicacion.querySelector(".like");
     const dislikeButton = publicacion.querySelector(".dislike");
 
     likeButton.addEventListener("click", async () => {
       const currentUser = "user"; // Cambiar por el usuario real
       if (votos[currentUser] === "like") {
         likes--;
         delete votos[currentUser];
       } else {
         if (votos[currentUser] === "dislike") dislikes--;
         likes++;
         votos[currentUser] = "like";
       }
 
       await updateDoc(doc(db, "publicaciones", id), { likes, dislikes, votos });
       likeButton.textContent = `👍 ${likes}`;
       dislikeButton.textContent = `👎 ${dislikes}`;
     });
 
     dislikeButton.addEventListener("click", async () => {
       const currentUser = "user"; // Cambiar por el usuario real
       if (votos[currentUser] === "dislike") {
         dislikes--;
         delete votos[currentUser];
       } else {
         if (votos[currentUser] === "like") likes--;
         dislikes++;
         votos[currentUser] = "dislike";
       }
 
       await updateDoc(doc(db, "publicaciones", id), { likes, dislikes, votos });
       likeButton.textContent = `👍 ${likes}`;
       dislikeButton.textContent = `👎 ${dislikes}`;
     });
 
     listaPublicaciones.appendChild(publicacion);
   }
 });