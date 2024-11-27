document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = "d735f99b524847128f76cb8072fdbd6f";
    const API_URL = `https://newsapi.org/v2/everything?q=política españa&language=es&sortBy=publishedAt&apiKey=${API_KEY}`;

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
            console.log("Respuesta completa de la API:", data);

            const noticias = data.articles.slice(0, 5);

            if (noticias.length === 0) {
                listaNoticias.innerHTML = "<li>No hay noticias disponibles en este momento.</li>";
                return;
            }

            noticias.forEach((noticia) => {
                const noticiaElement = document.createElement("div");
                noticiaElement.classList.add("noticia");

                const fuente = noticia.source.name || "Fuente no disponible";
                const fecha = noticia.publishedAt
                    ? new Date(noticia.publishedAt).toLocaleDateString()
                    : "Fecha no disponible";

                noticiaElement.innerHTML = `
                    <h3>${noticia.title}</h3>
                    <p>${noticia.description || "Sin descripción disponible"}</p>
                    <p class="fuente">Fuente: ${fuente}</p>
                    <p class="fecha">Fecha: ${fecha}</p>
                    <a href="${noticia.url}" class="leer-mas" target="_blank">Leer más</a>
                `;

                listaNoticias.appendChild(noticiaElement);
            });
        })
        .catch((error) => {
            console.error("Error al obtener noticias:", error);
            listaNoticias.innerHTML = "<li>Error al cargar las noticias. Inténtalo más tarde.</li>";
        });
});
