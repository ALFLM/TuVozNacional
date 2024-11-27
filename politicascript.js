document.addEventListener("DOMContentLoaded", () => {
    // API Key y URL para obtener noticias de política en España
    const API_KEY = "PJ-hY4UPPKZSQbHi3HG7TzrruKLv-Z8fUix0dnXUbGbO-6Jg";
    
    // Aquí estamos ajustando la búsqueda para intentar filtrar más específicamente por 'politica españa'
    const API_URL = `https://api.currentsapi.services/v1/search?keywords=españa&language=es&apiKey=${API_KEY}`;
  
    const listaNoticias = document.getElementById("lista-noticias");
  
    // Obtener noticias de la API de Currents
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Respuesta completa de la API:", data); // Verificamos toda la respuesta
  
        // Verificamos si hay noticias en la respuesta
        const noticias = data.news ? data.news.slice(0, 5) : []; // Extraemos las primeras 5 noticias, si hay alguna
  
        if (noticias.length === 0) {
          listaNoticias.innerHTML = "<li>No hay noticias disponibles en este momento.</li>";
          return;
        }
  
        noticias.forEach((noticia) => {
          const noticiaElement = document.createElement("div");
          noticiaElement.classList.add("noticia");
  
          // Obtenemos la fuente de la noticia
          const fuente = noticia.author ? noticia.author : 'Fuente no disponible';
          const fecha = noticia.published ? new Date(noticia.published).toLocaleDateString() : 'Fecha no disponible';
  
          noticiaElement.innerHTML = `
            <h3>${noticia.title}</h3>
            <p class="fuente">Fuente: ${fuente}</p>
            <p class="fecha">${fecha}</p>
            <a href="${noticia.url}" class="leer-mas" target="_blank">Leer más</a>
          `;
  
          listaNoticias.appendChild(noticiaElement);
        });
      })
      .catch((error) => {
        console.error("Error al obtener noticias:", error);
        listaNoticias.innerHTML = "<li>Error al cargar las noticias. Inténtalo más tarde.</li>";
      });
  
    // Manejar publicaciones
    const formPublicaciones = document.getElementById("form-publicaciones");
    const listaPublicaciones = document.getElementById("lista-publicaciones");
  
    formPublicaciones.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const texto = formPublicaciones.querySelector("textarea").value;
      if (!texto.trim()) return;
  
      const publicacion = document.createElement("div");
      publicacion.classList.add("publicacion");
  
      publicacion.innerHTML = `
        <p>${texto}</p>
        <div class="acciones">
          <button class="like">👍 0</button>
          <button class="dislike">👎 0</button>
        </div>
      `;
  
      // Manejar likes y dislikes únicos por usuario
      let userVote = null; // Variable para rastrear el voto del usuario en esta publicación
  
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
      formPublicaciones.reset();
    });
  });
  