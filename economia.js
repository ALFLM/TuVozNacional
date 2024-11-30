document.addEventListener("DOMContentLoaded", () => {
  // API Key y URL para obtener noticias de economía
  const API_KEY = "bfb01d6d-5084-4278-b417-ac240072f5f4";
  
  // URL de la API con un término de búsqueda relacionado con economía
  const API_URL = `https://content.guardianapis.com/search?q=economía&api-key=${API_KEY}`;

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
      // Limpiar mensaje de carga una vez que se reciben las noticias
      listaNoticias.innerHTML = "";

      // Verificamos si hay noticias en la respuesta
      const noticias = data.response.results || []; // Accedemos a los resultados correctamente

      if (noticias.length === 0) {
        listaNoticias.innerHTML = "<li>No hay noticias disponibles en este momento.</li>";
        return;
      }

      // Limitamos a las primeras 5 noticias
      const noticiasLimitadas = noticias.slice(0, 5); // Solo tomamos las primeras 5 noticias

      noticiasLimitadas.forEach((noticia) => {
        const noticiaElement = document.createElement("div");
        noticiaElement.classList.add("noticia");

        // Obtenemos la fecha de la noticia
        const fecha = noticia.webPublicationDate ? new Date(noticia.webPublicationDate).toLocaleDateString() : 'Fecha no disponible';

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
