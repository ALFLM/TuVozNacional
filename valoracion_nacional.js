import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";

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
      document.getElementById("loginBtn").style.display = "none";  // Ocultar botón de login
      document.getElementById("logoutBtn").style.display = "block"; // Mostrar botón de logout
    } else {
      document.getElementById("loginBtn").style.display = "block"; // Mostrar botón de login
      document.getElementById("logoutBtn").style.display = "none"; // Ocultar botón de logout
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
  const partidosRef = collection(db, "partidos");
  const votos = new Array(partidos.length).fill(null).map(() => ({ Bien: 0, Neutral: 0, Mal: 0 }));

  const querySnapshot = await getDocs(partidosRef);

  querySnapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const partidoIndex = partidos.findIndex((p) => p.nombre === docSnapshot.id);
    if (partidoIndex >= 0) {
      votos[partidoIndex] = data.votos;
    }
  });

  // Asegurarse de que todos los documentos existen en Firestore
  await Promise.all(
    partidos.map(async (partido, index) => {
      const docRef = doc(db, "partidos", partido.nombre);
      const docSnapshot = querySnapshot.docs.find((doc) => doc.id === partido.nombre);
      if (!docSnapshot) {
        await setDoc(docRef, { votos: votos[index] });
      }
    })
  );

  // Mostrar los votos
  function actualizarVotos() {
    partidos.forEach((_, index) => {
      const { Bien, Neutral, Mal } = votos[index];
      document.getElementById(`votos-${index}`).innerText = `Votos: Bien (${Bien}), Neutral (${Neutral}), Mal (${Mal})`;
    });
  }

  actualizarVotos();

  // Manejar los votos de los usuarios
  const votosRealizados = new Array(partidos.length).fill(null);

  contenedorPartidos.addEventListener("click", async (e) => {
    const button = e.target;
    if (button.tagName === "BUTTON") {
      const partidoIndex = parseInt(button.dataset.partido);
      const voto = button.dataset.voto;

      if (isNaN(partidoIndex) || !voto) return;

      // Si el usuario no está autenticado, redirigir al registro
      if (!usuarioAutenticado) {
        alert("Debes estar registrado para votar. Serás redirigido a la página de registro.");
        window.location.href = "register.html";  // Redirigir a la página de registro
        return;
      }

      // Una vez autenticado, registrar el voto
      if (usuarioAutenticado) {
        // Eliminar el voto anterior si existe
        if (votosRealizados[partidoIndex]) {
          votos[partidoIndex][votosRealizados[partidoIndex]]--;
        }

        // Registrar el nuevo voto
        votos[partidoIndex][voto]++;
        votosRealizados[partidoIndex] = voto;

        // Actualizar Firestore
        const partidoDoc = doc(db, "partidos", partidos[partidoIndex].nombre);
        await updateDoc(partidoDoc, { votos: votos[partidoIndex] });

        actualizarVotos();
      }
    }
  });
});
