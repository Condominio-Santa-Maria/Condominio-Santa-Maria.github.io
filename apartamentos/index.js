import { agregarDocumento, leerDocumentos } from '../js/firebaseConfig.js';



const pintarDeptos= async()=>{
    //for (let i = 1; i<=10; i++) {
    //    for(let j=1; j<=4; j++){
    //        await agregarDocumento("aptos", i+"0"+j, {descripcion:i+"0"+j, mora:0, propietario:""});
    //    }
    //    
    //}
    let deptos = await leerDocumentos("aptos");

    let cuerpo = "";
    deptos.forEach((doc) => {
        cuerpo+=cardDepto(doc.data());
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

