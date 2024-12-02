import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", async () => {
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

  // Cargar y manejar los votos
  const votosRef = collection(db, "votos");
  const querySnapshot = await getDocs(votosRef);

  const votos = new Array(partidos.length).fill({ Bien: 0, Neutral: 0, Mal: 0 });

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.partidoIndex !== undefined) {
      votos[data.partidoIndex] = data.votos;
    }
  });

  // Mostrar los votos
  function actualizarVotos() {
    partidos.forEach((partido, index) => {
      document.getElementById(`votos-${index}`).innerText = `Votos: Bien (${votos[index].Bien}), Neutral (${votos[index].Neutral}), Mal (${votos[index].Mal})`;
    });
  }

  actualizarVotos();

  const votosRealizados = new Array(partidos.length).fill(null);

  contenedorPartidos.addEventListener("click", async (e) => {
    const button = e.target;
    if (button.tagName === "BUTTON") {
      const partidoIndex = button.dataset.partido;
      const voto = button.dataset.voto;

      // Eliminar el voto anterior si lo hay
      if (votosRealizados[partidoIndex] !== null) {
        votos[partidoIndex][votosRealizados[partidoIndex]]--;
      }

      // Añadir el nuevo voto
      votos[partidoIndex][voto]++;
      votosRealizados[partidoIndex] = voto;

      // Guardar los votos en Firestore
      await updateDoc(doc(db, "votos", partidoIndex.toString()), {
        votos: votos[partidoIndex]
      });

      actualizarVotos();
    }
  });
});
