document.addEventListener("DOMContentLoaded", () => {
    // API Key y URL para obtener noticias específicas de política en España
    const API_KEY = "d735f99b524847128f76cb8072fdbd6f"; // NewsAPI
    const API_URL = `https://cors-anywhere.herokuapp.com/https://newsapi.org/v2/everything?q=política españa&language=es&apiKey=${API_KEY}`;
  
    const listaNoticias = document.getElementById("lista-noticias");
  
    // Obtener noticias de la API
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Datos recibidos:", data); // Verificar la estructura de los datos
  
        const noticias = data.response.results.slice(0, 5); // Solo las primeras 5 noticias
  
        if (noticias.length === 0) {
          listaNoticias.innerHTML = "<li>No hay noticias disponibles en este momento.</li>";
          return;
        }
  
        noticias.forEach((noticia) => {
          const noticiaElement = document.createElement("div");
          noticiaElement.classList.add("noticia");
  
          // Obtenemos la fuente de la noticia
          const fuente = noticia.source ? noticia.source : 'Fuente no disponible';
          const fecha = noticia.webPublicationDate ? new Date(noticia.webPublicationDate).toLocaleDateString() : 'Fecha no disponible';
  
          noticiaElement.innerHTML = `
            <h3>${noticia.webTitle}</h3>
            <p class="fuente">Fuente: ${fuente}</p>
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
  