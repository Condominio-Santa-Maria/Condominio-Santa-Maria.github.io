import { leerDocumentos } from '../js/firebaseConfig.js';

const pintarBauleras= async()=>{
    let querySnapshot = await leerDocumentos("parqueo");
    let cuerpo = "";
    let parqueos = [];
    querySnapshot.forEach((doc) => {
        parqueos.push({ id: doc.id, data: doc.data() });
    });

    parqueos.sort((a, b) => parseInt(a.id)>parseInt(b.id));

    parqueos.forEach((doc) => {
        cuerpo+=cardPArqueo(doc.data);
    });
    document.getElementById("departamentos").innerHTML = cuerpo;
    let heigth = document.getElementById("departamentos").clientHeight;
    document.getElementById("contenido_").style.height=(heigth+500)+"px";
};

const cardPArqueo=(baulera)=>{
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

