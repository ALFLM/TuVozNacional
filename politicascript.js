document.addEventListener("DOMContentLoaded", () => {
  // Noticias relacionadas con la política (ejemplo)
  const noticias = [
    "El Congreso aprueba nuevas reformas fiscales.",
    "El líder del partido X presenta su dimisión.",
    "España firma un acuerdo de cooperación con la UE.",
    "Nuevas encuestas muestran cambios en la intención de voto.",
  ];

  const listaNoticias = document.getElementById("lista-noticias");

  // Agregar noticias a la página
  noticias.forEach((noticia) => {
    const li = document.createElement("li");
    li.textContent = noticia;
    listaNoticias.appendChild(li);
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

    // Manejar likes y dislikes
    const likeButton = publicacion.querySelector(".like");
    const dislikeButton = publicacion.querySelector(".dislike");

    likeButton.addEventListener("click", () => {
      const count = parseInt(likeButton.textContent.split(" ")[1], 10);
      likeButton.textContent = `👍 ${count + 1}`;
    });

    dislikeButton.addEventListener("click", () => {
      const count = parseInt(dislikeButton.textContent.split(" ")[1], 10);
      dislikeButton.textContent = `👎 ${count + 1}`;
    });

    listaPublicaciones.appendChild(publicacion);
    formPublicaciones.reset();
  });
});
