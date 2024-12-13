// Configuración inicial de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCYLtf51vBg0NmXoEMD64KbNcU1Izhoc6M",
    authDomain: "tuvoz-dae95.firebaseapp.com",
    projectId: "tuvoz-dae95",
    storageBucket: "tuvoz-dae95.appspot.com",
    messagingSenderId: "21285165787",
    appId: "1:21285165787:web:d7f84940999df2935e4afe"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Función para registrar usuarios
document.getElementById('registerBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert('Usuario registrado exitosamente');
    } catch (error) {
        console.error('Error al registrar:', error);
        alert('No se pudo registrar al usuario.');
    }
});

// Función para iniciar sesión
document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
        alert('Inicio de sesión exitoso');
        cargarPublicaciones();
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('No se pudo iniciar sesión.');
    }
});

// Cargar publicaciones
async function cargarPublicaciones() {
    const publicacionesDiv = document.getElementById('publicaciones');
    publicacionesDiv.innerHTML = '';

    try {
        const snapshot = await db.collection('publicaciones').get();
        snapshot.forEach(doc => {
            const data = doc.data();
            publicacionesDiv.innerHTML += `
                <div class="publicacion">
                    <h3>${data.usuario}</h3>
                    <p>${data.texto}</p>
                    <button onclick="evaluarPublicacion('${doc.id}', 'bien')">Bien</button>
                    <button onclick="evaluarPublicacion('${doc.id}', 'neutral')">Neutral</button>
                    <button onclick="evaluarPublicacion('${doc.id}', 'mal')">Mal</button>
                    <p>Evaluaciones: Bien (${data.bien || 0}), Neutral (${data.neutral || 0}), Mal (${data.mal || 0})</p>
                </div>`;
        });
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
    }
}

// Publicar nuevo contenido
document.getElementById('publicarBtn').addEventListener('click', async () => {
    const texto = document.getElementById('textoPublicacion').value;
    const usuario = auth.currentUser.email;

    if (!texto) {
        alert('No puedes publicar un texto vacío.');
        return;
    }

    try {
        await db.collection('publicaciones').add({
            texto,
            usuario,
            bien: 0,
            neutral: 0,
            mal: 0,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('Publicación exitosa');
        cargarPublicaciones();
    } catch (error) {
        console.error('Error al publicar:', error);
        alert('No se pudo publicar el contenido.');
    }
});

// Evaluar una publicación
async function evaluarPublicacion(id, evaluacion) {
    try {
        const docRef = db.collection('publicaciones').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            alert('La publicación no existe.');
            return;
        }

        const data = doc.data();
        const nuevoValor = (data[evaluacion] || 0) + 1;
        await docRef.update({ [evaluacion]: nuevoValor });
        cargarPublicaciones();
    } catch (error) {
        console.error('Error al evaluar publicación:', error);
        alert('No se pudo evaluar la publicación.');
    }
}

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        alert('Sesión cerrada');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('No se pudo cerrar sesión.');
    }
});
