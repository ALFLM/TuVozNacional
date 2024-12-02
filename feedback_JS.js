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

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Obtiene los valores del formulario
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  const successMessage = document.getElementById('messageSuccess');
  const errorMessage = document.getElementById('messageError');

  // Limpia los mensajes anteriores
  successMessage.style.display = 'none';
  errorMessage.style.display = 'none';

  try {
    // Aquí guardamos los datos en Firestore
    const feedbackData = {
      name: name,
      email: email || "No proporcionado",  // Si no se proporciona correo, se guarda un valor por defecto
      message: message,
      date: new Date()
    };

    // Guardar el mensaje en Firestore
    await db.collection('feedback').add(feedbackData);

    // Mostrar mensaje de éxito con texto de agradecimiento
    successMessage.textContent = '¡Gracias por tus recomendaciones! Te responderemos pronto.';
    successMessage.style.display = 'block';

    // Limpiar el formulario
    document.getElementById('contactForm').reset();
  } catch (error) {
    // Si hay un error, muestra un mensaje de error
    errorMessage.textContent = 'Hubo un error al enviar tu mensaje. Por favor, inténtalo nuevamente.';
    errorMessage.style.display = 'block';
  }
});
