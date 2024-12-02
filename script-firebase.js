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
  });
}

// Función para votar publicaciones
async function votar(postId, voto) {
  try {
    const docRef = await addDoc(collection(db, "votos_politica"), {
      postId: postId,
      voto: voto,
      fecha: new Date(),
    });
    console.log("Voto añadido con ID: ", docRef.id);
  } catch (e) {
    console.error("Error al agregar voto: ", e);
  }
}
