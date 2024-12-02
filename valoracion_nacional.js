document.addEventListener("DOMContentLoaded", () => {
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
    div.classList.add("partido", partido.clase); // Añadimos la clase correspondiente de color
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

  // **Firebase setup**
  const db = firebase.firestore();

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

      // Guarda el voto en Firestore
      guardarVoto(partidos[partidoIndex].nombre, voto);

      // Actualiza la visualización de los votos
      document.getElementById(`votos-${partidoIndex}`).textContent = `Votos: Bien (${votos[partidoIndex].Bien}), Neutral (${votos[partidoIndex].Neutral}), Mal (${votos[partidoIndex].Mal})`;
    }
  });

  // **Funciones Firebase para guardar votos**
  function guardarVoto(partido, voto) {
    const usuario = "nombre_de_usuario"; // Usa el nombre del usuario actual

    db.collection("votos").add({
      usuario: usuario,
      partido: partido,
      voto: voto,
      fecha: firebase.firestore.Timestamp.now()
    })
    .then(() => {
      console.log("Voto guardado correctamente");
    })
    .catch((error) => {
      console.error("Error al guardar el voto: ", error);
    });
  }
});
