document.addEventListener("DOMContentLoaded", () => {
    // Configuración de la API de noticias
    const API_KEY = "PJ-hY4UPPKZSQbHi3HG7TzrruKLv-Z8fUix0dnXUbGbO-6Jg";
    const API_URL = `https://api.currentsapi.services/v1/search?keywords=españa&language=es&apiKey=${API_KEY}`;
  
    const listaNoticias = document.getElementById("lista-noticias");
    const mensajeCargando = document.getElementById("cargando-noticias");
  
    // Mostrar mensaje mientras se cargan las noticias
    mensajeCargando.style.display = "block";
  
    // Obtener noticias de la API de Currents
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const noticias = data.news ? data.news.slice(0, 5) : [];
        mensajeCargando.style.display = "none";
  
        if (noticias.length === 0) {
          listaNoticias.innerHTML = "<li>No hay noticias disponibles en este momento.</li>";
          return;
        }
  
        noticias.forEach((noticia) => {
          const noticiaElement = document.createElement("div");
          noticiaElement.classList.add("noticia");
  
          const fuente = noticia.author || "Fuente no disponible";
          const fecha = noticia.published
            ? new Date(noticia.published).toLocaleDateString()
            : "Fecha no disponible";
  
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
  
    // Partidos políticos
    const partidos = [
      { nombre: "PSOE", escaños: 120, clase: "psoe" },
      { nombre: "PP", escaños: 137, clase: "pp" },
      { nombre: "VOX", escaños: 33, clase: "vox" },
      { nombre: "SUMAR", escaños: 27, clase: "sumar" },
    ];
  
    const contenedorPartidos = document.getElementById("partidos");
  
    // Generar tarjetas de partidos
    partidos.sort((a, b) => b.escaños - a.escaños).forEach((partido, index) => {
      const div = document.createElement("div");
      div.classList.add("partido", partido.clase);
  
      div.innerHTML = `
        <h3>${partido.nombre} (${partido.escaños} escaños)</h3>
        <div>
          <button data-partido="${index}" data-voto="Bien">Bien</button>
          <button data-partido="${index}" data-voto="Neutral">Neutral</button>
          <button data-partido="${index}" data-voto="Mal">Mal</button>
        </div>
        <p id="votos-${index}">Votos: Bien (0), Neutral (0), Mal (0)</p>
      `;
  
      contenedorPartidos.appendChild(div);
    });
  
    const votos = partidos.map(() => ({ Bien: 0, Neutral: 0, Mal: 0 }));
    const votosRealizados = new Array(partidos.length).fill(null);
  
    contenedorPartidos.addEventListener("click", (e) => {
      const button = e.target;
      if (button.tagName === "BUTTON") {
        const partidoIndex = button.dataset.partido;
        const voto = button.dataset.voto;
  
        if (votosRealizados[partidoIndex] !== null) {
          votos[partidoIndex][votosRealizados[partidoIndex]]--;
        }
  
        votos[partidoIndex][voto]++;
        votosRealizados[partidoIndex] = voto;
  
        document.getElementById(`votos-${partidoIndex}`).innerText =
          `Votos: Bien (${votos[partidoIndex].Bien}), Neutral (${votos[partidoIndex].Neutral}), Mal (${votos[partidoIndex].Mal})`;
      }
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
  
      let userVote = null;
  
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
  