document.addEventListener("DOMContentLoaded", () => {
  // Inicializar Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyCYLtf51vBg0NmXoEMD64KbNcU1Izhoc6M",
    authDomain: "tuvoz-dae95.firebaseapp.com",
    projectId: "tuvoz-dae95",
    storageBucket: "tuvoz-dae95.appspot.com",
    messagingSenderId: "21285165787",
    appId: "1:21285165787:web:d7f84940999df2935e4afe"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const listaNoticias = document.getElementById("lista-noticias");
  const formPublicaciones = document.getElementById("form-publicaciones");
  const listaPublicaciones = document.getElementById("lista-publicaciones");

  // Obtener noticias de The Guardian
  const API_KEY = "bfb01d6d-5084-4278-b417-ac240072f5f4";
  const API_URL = `https://content.guardianapis.com/search?q=econom%C3%ADa&api-key=${API_KEY}`;

  listaNoticias.innerHTML = "<li>Esperando mientras cargamos todas las noticias...</li>";

  fetch(API_URL)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      listaNoticias.innerHTML = "";
      const noticias = data.response.results || [];
      if (noticias.length === 0) {
        listaNoticias.innerHTML = "<li>No hay noticias disponibles en este momento.</li>";
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
      listaNoticias.innerHTML = "<li>Error al cargar las noticias. Inténtalo más tarde.</li>";
    });

  // Manejar envío de nuevas publicaciones
  formPublicaciones.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = formPublicaciones.querySelector("#usuario").value.trim();
    const texto = formPublicaciones.querySelector("#contenido").value.trim();

    if (!usuario || !texto) {
      alert("Por favor, completa todos los campos antes de publicar.");
      return;
    }

    const nuevaPublicacion = {
      usuario,
      texto,
      likes: 0,
      dislikes: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("publicaciones").add(nuevaPublicacion)
      .then(() => {
        formPublicaciones.reset();
      })
      .catch(error => {
        console.error("Error al guardar la publicación:", error);
        alert("Hubo un problema al guardar tu publicación. Inténtalo más tarde.");
      });
  });

  // Cargar publicaciones existentes
  db.collection("publicaciones").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    listaPublicaciones.innerHTML = "";
    snapshot.forEach(doc => {
      const publicacion = doc.data();
      const publicacionElement = document.createElement("div");
      publicacionElement.classList.add("publicacion");

      publicacionElement.innerHTML = `
        <strong>${publicacion.usuario}</strong>
        <p>${publicacion.texto}</p>
        <div class="acciones">
          <button class="like">👍 ${publicacion.likes}</button>
          <button class="dislike">👎 ${publicacion.dislikes}</button>
        </div>
      `;

      const likeButton = publicacionElement.querySelector(".like");
      const dislikeButton = publicacionElement.querySelector(".dislike");

      likeButton.addEventListener("click", () => {
        db.collection("publicaciones").doc(doc.id).update({
          likes: publicacion.likes + 1
        });
      });

      dislikeButton.addEventListener("click", () => {
        db.collection("publicaciones").doc(doc.id).update({
          dislikes: publicacion.dislikes + 1
        });
      });

      listaPublicaciones.appendChild(publicacionElement);
    });
  });
});
