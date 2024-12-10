// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYLtf51vBg0NmXoEMD64KbNcU1Izhoc6M",
  authDomain: "tuvoz-dae95.firebaseapp.com",
  projectId: "tuvoz-dae95",
  storageBucket: "tuvoz-dae95.firebasestorage.app",
  messagingSenderId: "21285165787",
  appId: "1:21285165787:web:d7f84940999df2935e4afe",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const publicacionesRef = collection(db, "publicaciones");

// Load top publications
async function loadTopPublications() {
  const rankingList = document.getElementById("ranking-list");
  rankingList.textContent = "Cargando publicaciones...";

  try {
    const q = query(publicacionesRef, orderBy("likes", "desc"), limit(3));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      rankingList.innerHTML = "<li>No hay publicaciones destacadas aún.</li>";
      return;
    }

    rankingList.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const { usuario = "Anónimo", texto = "Sin texto", likes = 0, dislikes = 0 } = doc.data();
      const puntaje = likes - dislikes;

      rankingList.innerHTML += `
        <li>
          <span>${usuario}:</span>
          <span>${texto}</span>
          <span>Puntaje: ${puntaje}</span>
        </li>`;
    });
  } catch (error) {
    console.error("Error al cargar las publicaciones:", error);
    rankingList.innerHTML = "<li>Error al cargar las publicaciones.</li>";
  }
}

// Highlight active section
function highlightActiveSection() {
  const sections = document.querySelectorAll("section");
  const links = document.querySelectorAll("nav ul li a");

  let activeIndex = -1;
  sections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= window.innerHeight / 2) activeIndex = i;
  });

  links.forEach((link, i) => link.classList.toggle("activo", i === activeIndex));
}

// Scroll smoothly
function setupSmoothScroll() {
  document.querySelectorAll("nav ul li a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// Animate on load
function animateOnLoad() {
  const elements = document.querySelectorAll("section, header, nav");
  elements.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    setTimeout(() => {
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, i * 100);
  });
}

// Initialize functions
document.addEventListener("DOMContentLoaded", () => {
  loadTopPublications();
  setupSmoothScroll();
  animateOnLoad();
  document.addEventListener("scroll", highlightActiveSection);
});
