// js/firebaseConfig.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCdsRaUXTKhLrLtQyjDY_H2nWWN6gW4MCg",
    authDomain: "santamaria-dd1e9.firebaseapp.com",
    projectId: "santamaria-dd1e9",
    storageBucket: "santamaria-dd1e9.appspot.com",
    messagingSenderId: "694169051143",
    appId: "1:694169051143:web:abd5fc0cfb5e55f8704aa2",
    measurementId: "G-4YY9WKXQ9N"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Inicializa Firestore

// Función para agregar un documento a Firestore
const agregarDocumento = async (coleccion, idDocumento, datos) => {
    try {
        const docRef = doc(db, coleccion, idDocumento);  // Especifica el ID del documento
        await setDoc(docRef, datos);
        console.log("Documento agregado con ID:", idDocumento);
    } catch (error) {
        console.error("Error al agregar documento:", error);
    }
};

// Función para leer documentos de una colección en Firestore
const leerDocumentos = async (coleccion) => {
    try {
        const querySnapshot = await getDocs(collection(db, coleccion));
        if (querySnapshot.empty) {
            console.log("No se encontraron documentos en la colección.");
        } else {
            return querySnapshot;
        }
    } catch (error) {
        console.error("Error al leer documentos:", error);
    }
};

// Exportar las funciones para ser usadas en otros archivos
export { db, agregarDocumento, leerDocumentos };
