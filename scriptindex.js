// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-analytics.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYLtf51vBg0NmXoEMD64KbNcU1Izhoc6M",
  authDomain: "tuvoz-dae95.firebaseapp.com",
  databaseURL: "https://tuvoz-dae95-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tuvoz-dae95",
  storageBucket: "tuvoz-dae95.firebasestorage.app",
  messagingSenderId: "21285165787",
  appId: "1:21285165787:web:d7f84940999df2935e4afe",
  measurementId: "G-2STQP38QYH",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const publicacionesRef = collection(db, "publicaciones");

// Función para resaltar la sección activa en el menú
function resaltarSeccionActiva() {
  const secciones = document.querySelectorAll("section");
  const enlacesMenu = document.querySelectorAll("nav ul li a");
  let indexActivo = -1;

  secciones.forEach((seccion, index) => {
    const rect = seccion.getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= window.innerHeight / 3) {
      indexActivo = index;
    }
  });

  enlacesMenu.forEach((enlace, index) => {
    if (index === indexActivo) {
      enlace.classList.add("activo");
    } else {
      enlace.classList.remove("activo");
    }
  });
}

// Función para manejar clics en enlaces de navegación
function manejarNavegacion() {
  document.querySelectorAll("nav ul li a").forEach((enlace) => {
    enlace.addEventListener("click", (event) => {
      const href = enlace.getAttribute("href");
      if (href.startsWith("#")) {
        event.preventDefault();
        const id = href.substring(1);
        const destino = document.getElementById(id);

        if (destino) {
          destino.scrollIntoView({ behavior: "smooth" });
          logEvent(analytics, "section_visited", {
            section_name: id,
            timestamp: new Date().toISOString(),
          });
          console.log(`Sección visitada: ${id}`);
        }
      }
    });
  });
}

// Función para aplicar animaciones al cargar la página
function aplicarAnimaciones() {
  const elementos = document.querySelectorAll("section, header, nav");
  elementos.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
  });

  let delay = 0;
  elementos.forEach((el) => {
    setTimeout(() => {
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, delay);
    delay += 100;
  });
}

// Función para cargar el ranking de publicaciones mejor valoradas
async function loadTopPublications() {
  const rankingList = document.getElementById("ranking-list");
  rankingList.innerHTML = "<li>Cargando publicaciones...</li>";

  try {
    const q = query(publicacionesRef, orderBy("likes", "desc"), limit(3));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      rankingList.innerHTML = "<li>No hay publicaciones destacadas aún.</li>";
      return;
    }

    const publicaciones = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const puntaje = (data.likes || 0) - (data.dislikes || 0);
      publicaciones.push({ ...data, puntaje });
    });

    publicaciones.sort((a, b) => b.puntaje - a.puntaje);

    rankingList.innerHTML = "";
    publicaciones.forEach((pub) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <span>${pub.usuario || "Usuario desconocido"}:</span>
        <span>${pub.texto || "Sin texto"}</span>
        <span>Puntaje: ${pub.puntaje}</span>
      `;
      rankingList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error al cargar las publicaciones:", error);
    rankingList.innerHTML = "<li>Error al cargar las publicaciones.</li>";
  }
}

// Eventos iniciales al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  resaltarSeccionActiva();
  manejarNavegacion();
  aplicarAnimaciones();
  loadTopPublications();
});

// Registrar scroll para actualizar el menú activo
document.addEventListener("scroll", resaltarSeccionActiva);

// Mensaje de bienvenida en la consola
console.log("Bienvenido a TuVoz. ¡Explora, opina y participa!");
