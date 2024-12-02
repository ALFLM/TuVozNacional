import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYLtf51vBg0NmXoEMD64KbNcU1Izhoc6M",
  authDomain: "tuvoz-dae95.firebaseapp.com",
  databaseURL: "https://tuvoz-dae95-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tuvoz-dae95",
  storageBucket: "tuvoz-dae95.firebasestorage.app",
  messagingSenderId: "21285165787",
  appId: "1:21285165787:web:d7f84940999df2935e4afe"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

    // Guardar voto en Firebase Firestore
    addDoc(collection(db, "votos"), {
      usuario: usuario,
      partido: partido,
      voto: voto,
      fecha: Timestamp.now()
    })
    .then(() => {
      console.log("Voto guardado correctamente");
    })
    .catch((error) => {
      console.error("Error al guardar el voto: ", error);
    });
  }
});
