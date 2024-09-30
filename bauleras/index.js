import { leerDocumentos } from '../js/firebaseConfig.js';

const pintarBauleras= async()=>{

    let querySnapshot = await leerDocumentos("baulera");
    let cuerpo = "";
    let bauleras = [];
    querySnapshot.forEach((doc) => {
        bauleras.push({ id: doc.id, data: doc.data() });
    });

    bauleras.sort((a, b) => parseInt(a.id)>parseInt(b.id));

    bauleras.forEach((doc) => {
        cuerpo+=cardBaulera(doc.data);
    });
    document.getElementById("departamentos").innerHTML = cuerpo;
    let heigth = document.getElementById("departamentos").clientHeight;
    document.getElementById("contenido_").style.height=(heigth+500)+"px";
};

const cardBaulera=(baulera)=>{
    let cuerpo = "";
    cuerpo += "<div class='border1 button btnprimary-alt' style='margin: 5px; width:130px;'>";
    cuerpo += "<div class='top10'># "+baulera.descripcion+"</div>";
    cuerpo += "<div class='top10'>"+(baulera.propietario || "Sin identificar")+"</div>";
    cuerpo += "<div class='top10'>"+(baulera.mora || "Bs. 0,00")+"</div>";
    cuerpo += "</div>";
    return cuerpo;
};

document.addEventListener("DOMContentLoaded", function(event) { 
    pintarBauleras();
});

