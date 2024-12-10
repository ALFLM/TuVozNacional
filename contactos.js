import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js"; // Asegúrate de importar tu configuración

const db = getFirestore();

document.addEventListener("DOMContentLoaded", () => {
  const buscarInput = document.getElementById("buscar-input");
  const buscarBtn = document.getElementById("buscar-btn");
  const listaUsuarios = document.getElementById("lista-usuarios");
  const perfilUsuario = document.getElementById("perfil-usuario");
  const nombrePerfil = document.getElementById("nombre-perfil");
  const interesesPerfil = document.getElementById("intereses-perfil");
  const fotoPerfil = document.getElementById("foto-perfil");
  const listaPublicaciones = document.getElementById("lista-publicaciones");

  // Buscar usuarios
  buscarBtn.addEventListener("click", async () => {
    const searchTerm = buscarInput.value.trim();
    if (!searchTerm) return alert("Por favor, ingresa un término de búsqueda.");

    listaUsuarios.innerHTML = "Buscando...";
    const q = query(collection(db, "usuarios"), where("nombre", ">=", searchTerm), where("nombre", "<=", searchTerm + "\uf8ff"));
    const querySnapshot = await getDocs(q);

    listaUsuarios.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `${data.nombre} - ${data.intereses.join(", ")}`;
      li.dataset.uid = doc.id;
      listaUsuarios.appendChild(li);
    });

    if (listaUsuarios.innerHTML === "") {
      listaUsuarios.innerHTML = "No se encontraron usuarios.";
    }
  });

  // Mostrar perfil de usuario
  listaUsuarios.addEventListener("click", async (e) => {
    if (e.target.tagName === "LI") {
      const uid = e.target.dataset.uid;
      const userRef = collection(db, "usuarios");
      const userDoc = await getDocs(query(userRef, where("uid", "==", uid)));
      const userData = userDoc.docs[0]?.data();

      if (userData) {
        nombrePerfil.textContent = userData.nombre;
        interesesPerfil.textContent = userData.intereses.join(", ");
        fotoPerfil.src = userData.foto || "default.png";

        const publicacionesRef = collection(db, "publicaciones");
        const publicacionesQuery = query(publicacionesRef, where("uid", "==", uid));
        const publicacionesSnapshot = await getDocs(publicacionesQuery);

        listaPublicaciones.innerHTML = "";
        publicacionesSnapshot.forEach((pubDoc) => {
          const pubData = pubDoc.data();
          const li = document.createElement("li");
          li.textContent = pubData.texto;
          listaPublicaciones.appendChild(li);
        });
      }
    }
  });
});
