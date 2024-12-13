// Importaciones necesarias de Firebase
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    updateDoc,
    setDoc,
    addDoc,
    query,
    orderBy,
    Timestamp,
    arrayUnion,
    doc,
  } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
  
  const db = getFirestore();
  const publicacionesRef = collection(db, "publicaciones");
  const formPublicaciones = document.getElementById("formPublicaciones");
  const publicacionesContainer = document.getElementById("publicacionesContainer");
  const currentUser = usuarioAutenticado ? usuarioAutenticado.uid : null;
  
  if (!currentUser) {
    alert("Debes iniciar sesión para interactuar.");
  }
  
  // Crear una nueva publicación
  async function agregarPublicacion(texto) {
    try {
      const nuevaPublicacion = {
        texto,
        usuario: currentUser,
        timestamp: Timestamp.now(),
        likes: 0,
        dislikes: 0,
        votos: {},
        respuestas: [],
      };
  
      await addDoc(publicacionesRef, nuevaPublicacion);
      cargarPublicaciones();
    } catch (error) {
      console.error("Error al agregar publicación:", error);
    }
  }
  
  // Cargar publicaciones existentes
  async function cargarPublicaciones() {
    publicacionesContainer.innerHTML = "";
    try {
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
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    }
  }
  
  // Crear elementos de publicación
  function crearPublicacion(texto, timestamp, id, usuario, likes, dislikes, respuestas, votos) {
    const publicacion = document.createElement("div");
    publicacion.classList.add("publicacion");
  
    publicacion.innerHTML = `
      <p>${texto}</p>
      <p>Usuario: ${usuario}</p>
      <p>Fecha: ${new Date(timestamp.seconds * 1000).toLocaleString()}</p>
      <button class="btn-like">👍 ${likes}</button>
      <button class="btn-dislike">👎 ${dislikes}</button>
      <button class="btn-responder">Responder</button>
      <div class="respuestas-container"></div>
    `;
  
    const btnLike = publicacion.querySelector(".btn-like");
    const btnDislike = publicacion.querySelector(".btn-dislike");
    const btnResponder = publicacion.querySelector(".btn-responder");
    const respuestasContainer = publicacion.querySelector(".respuestas-container");
  
    btnLike.addEventListener("click", async () => {
      const { likes: nuevosLikes, dislikes: nuevosDislikes } = await manejarVoto(
        "like",
        id,
        votos,
        likes,
        dislikes
      );
      btnLike.textContent = `👍 ${nuevosLikes}`;
      btnDislike.textContent = `👎 ${nuevosDislikes}`;
    });
  
    btnDislike.addEventListener("click", async () => {
      const { likes: nuevosLikes, dislikes: nuevosDislikes } = await manejarVoto(
        "dislike",
        id,
        votos,
        likes,
        dislikes
      );
      btnLike.textContent = `👍 ${nuevosLikes}`;
      btnDislike.textContent = `👎 ${nuevosDislikes}`;
    });
  
    btnResponder.addEventListener("click", () => {
      const respuestaInput = document.createElement("textarea");
      const btnEnviarRespuesta = document.createElement("button");
      btnEnviarRespuesta.textContent = "Enviar Respuesta";
  
      respuestasContainer.appendChild(respuestaInput);
      respuestasContainer.appendChild(btnEnviarRespuesta);
  
      btnEnviarRespuesta.addEventListener("click", async () => {
        const respuestaTexto = respuestaInput.value;
        if (respuestaTexto.trim() === "") return;
  
        await agregarRespuesta(id, respuestaTexto);
        respuestaInput.remove();
        btnEnviarRespuesta.remove();
        cargarPublicaciones();
      });
    });
  
    respuestas.forEach((respuesta) => {
      const respuestaElemento = document.createElement("p");
      respuestaElemento.textContent = respuesta;
      respuestasContainer.appendChild(respuestaElemento);
    });
  
    publicacionesContainer.appendChild(publicacion);
  }
  
  // Manejar votos de publicaciones
  async function manejarVoto(tipo, id, votos, likes, dislikes) {
    if (votos[currentUser] === tipo) {
      tipo === "like" ? likes-- : dislikes--;
      delete votos[currentUser];
    } else {
      if (votos[currentUser] === "like") likes--;
      if (votos[currentUser] === "dislike") dislikes--;
      tipo === "like" ? likes++ : dislikes++;
      votos[currentUser] = tipo;
    }
  
    await updateDoc(doc(db, "publicaciones", id), { likes, dislikes, votos });
    return { likes, dislikes };
  }
  
  // Agregar respuesta a una publicación
  async function agregarRespuesta(id, texto) {
    const docRef = doc(db, "publicaciones", id);
    const publicacion = await getDoc(docRef);
  
    if (publicacion.exists()) {
      const data = publicacion.data();
      const nuevasRespuestas = [...(data.respuestas || []), texto];
      await updateDoc(docRef, { respuestas: nuevasRespuestas });
    }
  }
  
  // Evento para agregar nuevas publicaciones
  formPublicaciones.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = formPublicaciones["texto"].value;
    if (texto.trim() === "") return;
    agregarPublicacion(texto);
    formPublicaciones.reset();
  });
  
  // Cargar publicaciones al inicio
  cargarPublicaciones();
  