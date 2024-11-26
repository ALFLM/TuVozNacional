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

  // Manejar votos (permitir un solo voto por partido)
  const votos = partidos.map(() => ({ Bien: 0, Neutral: 0, Mal: 0 }));
  const votosRealizados = new Array(partidos.length).fill(null); // Array para rastrear el voto de cada usuario

  contenedorPartidos.addEventListener("click", (e) => {
    const button = e.target;
    if (button.tagName === "BUTTON") {
      const partidoIndex = button.dataset.partido;
      const voto = button.dataset.voto;

      // Si el usuario ya ha votado, elimina su voto anterior
      if (votosRealizados[partidoIndex] !== null) {
        votos[partidoIndex][votosRealizados[partidoIndex]]--;
      }

      // Asigna el nuevo voto
      votos[partidoIndex][voto]++;
      votosRealizados[partidoIndex] = voto; // Guarda el voto actual del usuario

      // Actualiza la visualización de los votos
      document.getElementById(`votos-${partidoIndex}`).innerText =
        `Votos: Bien (${votos[partidoIndex].Bien}), Neutral (${votos[partidoIndex].Neutral}), Mal (${votos[partidoIndex].Mal})`;
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