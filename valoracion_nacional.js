import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", async () => {
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");
  const userInfo = document.getElementById("user-info");

  let currentUser = null;

  // Gestionar estado de autenticación
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      userInfo.textContent = `Conectado como: ${user.displayName || user.email}`;
      loginButton.style.display = "none";
      logoutButton.style.display = "block";
    } else {
      currentUser = null;
      userInfo.textContent = "No conectado";
      loginButton.style.display = "block";
      logoutButton.style.display = "none";
    }
  });

  loginButton.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  });

  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  });

  // Inicializar la sección de partidos
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
        <button data-partido="${index}" data-voto="Bien" disabled>Bien</button>
        <button data-partido="${index}" data-voto="Neutral" disabled>Neutral</button>
        <button data-partido="${index}" data-voto="Mal" disabled>Mal</button>
      </div>
      <p id="votos-${index}">Votos: Bien (0), Neutral (0), Mal (0)</p>
    `;
    contenedorPartidos.appendChild(div);
  });

  const partidosRef = collection(db, "partidos");
  const votos = new Array(partidos.length).fill(null).map(() => ({ Bien: 0, Neutral: 0, Mal: 0 }));
  const votosRealizados = {};

  // Cargar votos desde Firestore
  const querySnapshot = await getDocs(partidosRef);
  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const partidoIndex = partidos.findIndex((p) => p.nombre === docSnapshot.id);
    if (partidoIndex >= 0) {
      votos[partidoIndex] = data.votos;
    }
  });

  // Mostrar los votos
  function actualizarVotos() {
    partidos.forEach((_, index) => {
      const { Bien, Neutral, Mal } = votos[index];
      document.getElementById(`votos-${index}`).innerText = `Votos: Bien (${Bien}), Neutral (${Neutral}), Mal (${Mal})`;
    });
  }
  actualizarVotos();

  // Activar botones si hay usuario
  function activarBotones() {
    const botones = contenedorPartidos.querySelectorAll("button");
    botones.forEach((boton) => (boton.disabled = !currentUser));
  }

  contenedorPartidos.addEventListener("click", async (e) => {
    const button = e.target;
    if (!currentUser) {
      alert("Debes estar registrado para votar.");
      return;
    }

    if (button.tagName === "BUTTON") {
      const partidoIndex = parseInt(button.dataset.partido);
      const voto = button.dataset.voto;

      if (isNaN(partidoIndex) || !voto) return;

      const userId = currentUser.uid;

      if (!votosRealizados[userId]) {
        votosRealizados[userId] = {};
      }

      if (votosRealizados[userId][partidoIndex]) {
        votos[partidoIndex][votosRealizados[userId][partidoIndex]]--;
      }

      votos[partidoIndex][voto]++;
      votosRealizados[userId][partidoIndex] = voto;

      const partidoDoc = doc(db, "partidos", partidos[partidoIndex].nombre);
      await updateDoc(partidoDoc, { votos: votos[partidoIndex] });

      actualizarVotos();
    }
  });

  activarBotones();
});
