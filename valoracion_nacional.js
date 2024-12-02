import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYLtf51vBg0NmXoEMD64KbNcU1Izhoc6M",
  authDomain: "tuvoz-dae95.firebaseapp.com",
  databaseURL: "https://tuvoz-dae95-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tuvoz-dae95",
  storageBucket: "tuvoz-dae95.firebasestorage.app",
  messagingSenderId: "21285165787",
  appId: "1:21285165787:web:d7f84940999df2935e4afe",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", async () => {
  const partidos = [
    { nombre: "PSOE", escaños: 120, clase: "psoe" },
    { nombre: "PP", escaños: 137, clase: "pp" },
    { nombre: "VOX", escaños: 33, clase: "vox" },
    { nombre: "SUMAR", escaños: 27, clase: "sumar" },
  ];

  const contenedorPartidos = document.getElementById("partidos");
  let usuarioAutenticado = null;

  // Verificar si el usuario está autenticado
  onAuthStateChanged(auth, (user) => {
    usuarioAutenticado = user;
    if (usuarioAutenticado) {
      document.getElementById("loginBtn").style.display = "none";
      document.getElementById("logoutBtn").style.display = "block";

      // Procesar voto pendiente si existe
      const votoPendiente = localStorage.getItem("votoPendiente");
      if (votoPendiente) {
        const { partidoIndex, voto } = JSON.parse(votoPendiente);
        localStorage.removeItem("votoPendiente");
        realizarVoto(partidoIndex, voto);
      }
    } else {
      document.getElementById("loginBtn").style.display = "block";
      document.getElementById("logoutBtn").style.display = "none";
    }
  });

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

  // Inicializar votos en Firestore
  const votos = partidos.map(() => ({ Bien: 0, Neutral: 0, Mal: 0 }));
  const partidosRef = collection(db, "partidos");
  const querySnapshot = await getDocs(partidosRef);

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const partidoIndex = partidos.findIndex((p) => p.nombre === docSnapshot.id);
    if (partidoIndex >= 0) {
      votos[partidoIndex] = data.votos;
    }
  });

  // Asegurar la existencia de todos los documentos en Firestore
  await Promise.all(
    partidos.map(async (partido, index) => {
      const docRef = doc(db, "partidos", partido.nombre);
      const docSnapshot = querySnapshot.docs.find((doc) => doc.id === partido.nombre);
      if (!docSnapshot) {
        await setDoc(docRef, { votos: votos[index] });
      }
    })
  );

  // Actualizar visualización de votos
  function actualizarVotos(partidoIndex) {
    const { Bien, Neutral, Mal } = votos[partidoIndex];
    document.getElementById(`votos-${partidoIndex}`).innerText = `Votos: Bien (${Bien}), Neutral (${Neutral}), Mal (${Mal})`;
  }

  partidos.forEach((_, index) => actualizarVotos(index));

  // Manejo de votos de usuarios
  const votosRealizados = new Array(partidos.length).fill(null);

  async function realizarVoto(partidoIndex, voto) {
    if (!usuarioAutenticado) return;

    const partidoDoc = doc(db, "partidos", partidos[partidoIndex].nombre);

    // Ajustar votos locales y remotos
    if (votosRealizados[partidoIndex]) {
      votos[partidoIndex][votosRealizados[partidoIndex]]--;
      await updateDoc(partidoDoc, {
        [`votos.${votosRealizados[partidoIndex]}`]: increment(-1),
      });
    }

    votos[partidoIndex][voto]++;
    votosRealizados[partidoIndex] = voto;

    await updateDoc(partidoDoc, {
      [`votos.${voto}`]: increment(1),
    });

    actualizarVotos(partidoIndex);
  }

  contenedorPartidos.addEventListener("click", (e) => {
    const button = e.target;
    if (button.tagName === "BUTTON") {
      const partidoIndex = parseInt(button.dataset.partido);
      const voto = button.dataset.voto;

      if (isNaN(partidoIndex) || !voto) return;

      if (!usuarioAutenticado) {
        localStorage.setItem("votoPendiente", JSON.stringify({ partidoIndex, voto }));
        alert("Debes estar registrado para votar. Serás redirigido a la página de registro.");
        window.location.href = "register.html";
        return;
      }

      realizarVoto(partidoIndex, voto);
    }
  });
});
