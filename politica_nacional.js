import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, getDocs, orderBy, Timestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";


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
  const formPublicaciones = document.getElementById("form-publicaciones");
  const listaPublicaciones = document.getElementById("lista-publicaciones");

  // Manejar el submit del formulario
  formPublicaciones.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = formPublicaciones.querySelector("#usuario").value.trim();
    const texto = formPublicaciones.querySelector("#contenido").value.trim();

    if (!usuario || !texto) {
      alert("Por favor, completa todos los campos antes de publicar.");
      return;
    }

    // Guardar publicación en Firebase
    guardarPublicacion(usuario, texto);

    // Limpiar el formulario
    formPublicaciones.reset();
  });

  // **Firebase setup**

  // Función para guardar la publicación en Firestore
// Función para guardar la publicación en Firestore
function guardarPublicacion(usuario, texto) {
  const fecha = Timestamp.now();
  addDoc(collection(db, "publicaciones"), {
    usuario: usuario,
    contenido: texto,
    fecha: fecha,
    likes: 0,
    dislikes: 0
  })
  .then((docRef) => {
    console.log("Publicación guardada con ID:", docRef.id);
    obtenerPublicaciones(); // Recargar las publicaciones después de añadir una nueva
  })
  .catch((error) => {
    console.error("Error añadiendo el documento: ", error);
  });
}


  // Función para obtener las publicaciones desde Firestore
  function obtenerPublicaciones() {
    const publicacionesRef = collection(db, "publicaciones");
    const q = query(publicacionesRef, orderBy("fecha", "desc"));

    getDocs(q)
      .then((querySnapshot) => {
        listaPublicaciones.innerHTML = ""; // Limpiar la lista de publicaciones antes de renderizar
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const publicacion = document.createElement("div");
          publicacion.classList.add("publicacion");
          publicacion.setAttribute("data-id", doc.id); // Guardar el ID para usarlo en las acciones

          publicacion.innerHTML = `
            <strong>${data.usuario}</strong>
            <p>${data.contenido}</p>
            <div class="acciones">
              <button class="like">👍 ${data.likes}</button>
              <button class="dislike">👎 ${data.dislikes}</button>
            </div>
          `;

          // Agregar la publicación a la lista
          listaPublicaciones.appendChild(publicacion);

          // Manejar los botones de like y dislike
          const likeButton = publicacion.querySelector(".like");
          const dislikeButton = publicacion.querySelector(".dislike");

          likeButton.addEventListener("click", () => {
            actualizarVoto(doc.id, "likes");
          });

          dislikeButton.addEventListener("click", () => {
            actualizarVoto(doc.id, "dislikes");
          });
        });
      })
      .catch((error) => {
        console.error("Error al obtener las publicaciones: ", error);
      });
  }

// Función para actualizar el voto (like o dislike) en Firestore
function actualizarVoto(docId, tipo) {
  const docRef = doc(db, "publicaciones", docId);

  // Obtener el documento y actualizar el contador de votos
  getDoc(docRef).then((docSnap) => { // Cambia getDocs por getDoc
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const nuevosVotos = currentData[tipo] + 1; // Incrementar el conteo de votos

      // Actualizar la base de datos con el nuevo valor
      updateDoc(docRef, {
        [tipo]: nuevosVotos
      })
      .then(() => {
        obtenerPublicaciones(); // Volver a cargar las publicaciones con los votos actualizados
      })
      .catch((error) => {
        console.error("Error actualizando los votos: ", error);
      });
    }
  });
}


  // Llamada a obtener publicaciones al cargar la página
  obtenerPublicaciones();
});
