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

// Mensaje de bienvenida en la consola
console.log("Bienvenido a TuVoz. ¡Explora, opina y participa!");
