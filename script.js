document.addEventListener("DOMContentLoaded", () => {
  const partidos = [
    { nombre: "PSOE", escaños: 120 },
    { nombre: "PP", escaños: 137 },
    { nombre: "VOX", escaños: 33 },
    { nombre: "SUMAR", escaños: 27 },
  ];

  const contenedorPartidos = document.getElementById("partidos");

  // Generar tarjetas de partidos
  partidos.sort((a, b) => b.escaños - a.escaños).forEach((partido, index) => {
    const div = document.createElement("div");
    div.classList.add("partido");
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

  // Inicializar votos
  const votos = partidos.map(() => ({ Bien: 0, Neutral: 0, Mal: 0 }));
  contenedorPartidos.addEventListener("click", (e) => {
    const button = e.target;
    if (button.tagName === "BUTTON") {
      const partidoIndex = button.dataset.partido;
      const voto = button.dataset.voto;

      // Asegurar que solo se pueda votar una vez por partido
      if (votos[partidoIndex][voto] === 0) {
        votos[partidoIndex][voto]++;
        document.getElementById(`votos-${partidoIndex}`).innerText =
          `Votos: Bien (${votos[partidoIndex].Bien}), Neutral (${votos[partidoIndex].Neutral}), Mal (${votos[partidoIndex].Mal})`;
      }
    }
  });

  // Manejar comentarios
  const comentariosForm = document.getElementById("comentarios-form");
  const comentariosLista = document.getElementById("comentarios-lista");

  comentariosForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const comentario = e.target.querySelector("textarea").value;
    const p = document.createElement("p");
    p.textContent = comentario;
    comentariosLista.appendChild(p);
    comentariosForm.reset();
  });
});
