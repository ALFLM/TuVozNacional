document.addEventListener("DOMContentLoaded", () => {
    // API Key y URL para obtener noticias
    const API_KEY = "bfb01d6d-5084-4278-b417-ac240072f5f4";
    const API_URL = `https://content.guardianapis.com/search?q=politics&section=world&api-key=${API_KEY}`;
  
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
        const noticias = data.response.results; // Asegurarse de acceder correctamente a los datos
        if (noticias.length === 0) {
          listaNoticias.innerHTML = "<li>No hay noticias disponibles en este momento.</li>";
          return;
        }
        noticias.forEach((noticia) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <a href="${noticia.webUrl}" target="_blank" rel="noopener noreferrer">
              ${noticia.webTitle}
            </a>`;
          listaNoticias.appendChild(li);
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
  