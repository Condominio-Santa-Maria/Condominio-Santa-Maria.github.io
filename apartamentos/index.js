import { leerDocumentos } from '../js/firebaseConfig.js';


const pintarDeptos= async()=>{
    let querySnapshot = await leerDocumentos("aptos");
    let cuerpo = "";
    let deptos = [];
    querySnapshot.forEach((doc) => {
        deptos.push({ id: doc.id, data: doc.data() });
    });
    
    // Ordenar el array por el campo `id` de cada documento
    deptos.sort((a, b) => parseInt(a.id)>parseInt(b.id));

    deptos.forEach((doc) => {
        cuerpo+=cardDepto(doc.data);
    });
    document.getElementById("departamentos").innerHTML = cuerpo;
    let heigth = document.getElementById("departamentos").clientHeight;
    document.getElementById("contenido_").style.height=(heigth+500)+"px";
};

const cardDepto=(depto)=>{
    let cuerpo = "";
    cuerpo += "<div class='border1 button btnprimary-alt' style='margin: 5px; width:130px;'>";
    cuerpo += "<div class='top10'># "+depto.descripcion+"</div>";
    cuerpo += "<div class='top10'>"+(depto.propietario || "Sin identificar")+"</div>";
    cuerpo += "<div class='top10'>"+(depto.mora || "Bs. 0,00")+"</div>";
    cuerpo += "</div>";
    return cuerpo;
};

document.addEventListener("DOMContentLoaded", function(event) { 
    pintarDeptos();
});