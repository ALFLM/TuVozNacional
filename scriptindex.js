// Importar las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

// Configuración de Firebase
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

// Resaltar la sección activa en el menú al hacer scroll
document.addEventListener("scroll", () => {
  const secciones = document.querySelectorAll("section");
  const enlacesMenu = document.querySelectorAll("nav ul li a");

  let indexActivo = -1;

  secciones.forEach((seccion, index) => {
    const rect = seccion.getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
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
});

// Manejo de clics en enlaces de navegación para scroll suave
document.querySelectorAll("nav ul li a").forEach((enlace) => {
  enlace.addEventListener("click", (event) => {
    event.preventDefault();
    const id = enlace.getAttribute("href").substring(1);
    const destino = document.getElementById(id);

    if (destino) {
      destino.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Animaciones simples al cargar la página
window.addEventListener("load", () => {
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
    delay += 100; // Aumenta el retraso para cada elemento
  });
});

// Función para cargar el ranking de las publicaciones mejor valoradas
async function loadTopPublications() {
  const rankingList = document.getElementById("ranking-list");
  rankingList.innerHTML = "<li>Cargando publicaciones...</li>";

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "publicaciones"),
      orderBy("valoraciones", "desc"),
      limit(3)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      rankingList.innerHTML = "<li>No hay publicaciones destacadas hoy.</li>";
      return;
    }

    rankingList.innerHTML = ""; // Limpia el contenido antes de añadir nuevos datos

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <span>${data.titulo}</span>
        <span>${data.valoraciones} votos</span>
      `;
      rankingList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error al cargar las publicaciones:", error);
    rankingList.innerHTML = "<li>Error al cargar las publicaciones.</li>";
  }
}

// Cargar publicaciones cuando se cargue la página
document.addEventListener("DOMContentLoaded", () => {
  loadTopPublications();
});

// Mensaje de bienvenida en la consola
console.log("Bienvenido a TuVoz. ¡Explora, opina y participa!");
