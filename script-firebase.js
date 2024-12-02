import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, getDocs, orderBy, limit, where, onSnapshot } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYLtf51vBg0NmXoEMD64KbNcU1Izhoc6M",
  authDomain: "tuvoz-dae95.firebaseapp.com",
  projectId: "tuvoz-dae95",
  storageBucket: "tuvoz-dae95.appspot.com",
  messagingSenderId: "21285165787",
  appId: "1:21285165787:web:d7f84940999df2935e4afe"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para agregar publicaciones
async function agregarPublicacion(titulo, contenido) {
  try {
    const docRef = await addDoc(collection(db, "politica"), {
      titulo: titulo,
      contenido: contenido,
      fecha: new Date(),
    });
    console.log("Publicación añadida con ID: ", docRef.id);
    mostrarPublicaciones();  // Actualiza la lista de publicaciones después de agregar una nueva
  } catch (e) {
    console.error("Error al agregar publicación: ", e);
  }
}

// Función para mostrar publicaciones desde Firestore
async function mostrarPublicaciones() {
  const q = query(collection(db, "politica"), orderBy("fecha", "desc"), limit(10)); // 10 publicaciones más recientes
  const querySnapshot = await getDocs(q);
  const listaPublicaciones = document.getElementById("lista-publicaciones");
  listaPublicaciones.innerHTML = ""; // Limpiar la lista antes de agregar los nuevos datos

  querySnapshot.forEach((doc) => {
    const post = doc.data();
    const div = document.createElement("div");
    div.classList.add("publicacion");
    div.innerHTML = `
      <h3>${post.titulo}</h3>
      <p>${post.contenido}</p>
      <small>${post.fecha.toDate().toLocaleString()}</small>
      <div class="acciones">
        <button onclick="votar('${doc.id}', 'bien')">👍 Bien</button>
        <button onclick="votar('${doc.id}', 'neutral')">🤔 Neutral</button>
        <button onclick="votar('${doc.id}', 'mal')">👎 Mal</button>
      </div>
      <p id="votos-${doc.id}">Votos: Bien (0), Neutral (0), Mal (0)</p>
    `;
    listaPublicaciones.appendChild(div);

    // Escuchar y mostrar votos para cada publicación
    escucharVotos(doc.id);
  });
}

// Función para escuchar los votos de una publicación
async function escucharVotos(postId) {
  const q = query(collection(db, "votos_politica"), where("postId", "==", postId));
  const querySnapshot = await getDocs(q);
  let votosBien = 0;
  let votosNeutral = 0;
  let votosMal = 0;

  querySnapshot.forEach((doc) => {
    const voto = doc.data().voto;
    if (voto === "bien") votosBien++;
    else if (voto === "neutral") votosNeutral++;
    else if (voto === "mal") votosMal++;
  });

  // Actualizar la interfaz con los votos
  const votosElement = document.getElementById(`votos-${postId}`);
  votosElement.innerHTML = `Votos: Bien (${votosBien}), Neutral (${votosNeutral}), Mal (${votosMal})`;
}

// Función para votar publicaciones
async function votar(postId, voto) {
  const usuarioId = "usuario123"; // Esto debe ser dinámico, posiblemente con el nombre de usuario
  const q = query(
    collection(db, "votos_politica"),
    where("postId", "==", postId),
    where("usuarioId", "==", usuarioId)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // Si el usuario no ha votado, agregar el voto
    try {
      await addDoc(collection(db, "votos_politica"), {
        postId: postId,
        voto: voto,
        usuarioId: usuarioId,  // Asume que cada usuario tiene un identificador único
        fecha: new Date(),
      });

      // Llamar a la función para actualizar los votos
      escucharVotos(postId);
    } catch (e) {
      console.error("Error al agregar voto: ", e);
    }
  } else {
    console.log("El usuario ya ha votado en esta publicación.");
  }
}

// Llamada inicial para cargar las publicaciones
mostrarPublicaciones();

