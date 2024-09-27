
const pintarDeptos= async()=>{
    let deptos = await getDeptos();
    let cuerpo = "";
    Object.values(deptos).map((depto)=>{
        cuerpo+=cardDepto(depto);
    });
    document.getElementById("departamentos").innerHTML = cuerpo;
    
    let heigth = document.getElementById("departamentos").clientHeight;
    
    document.getElementById("contenido_").style.height=(heigth+500)+"px";
};

const cardDepto=(depto)=>{
    let cuerpo = "";
    cuerpo += "<div class='border1 button btnprimary-alt' style='margin: 5px; width:140px;'>";
    cuerpo += "<div class='top10'># "+depto.descripcion+"</div>";
    cuerpo += "<div class='top10'>"+(depto.propietario || "Sin identificar")+"</div>";
    cuerpo += "<div class='top10'>"+(depto.mora || "Bs. 0,00")+"</div>";
    cuerpo += "</div>";
    return cuerpo;
};

const getDeptos=()=>{
    let obj = {
        component:"apartamento",
        type:"getAll",
    };
    return new Promise(resolve => {
        fetch("https://santamaria.ruddypazd.com", {
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: JSON.stringify(obj)
        })
            .then(res => res.json()).then(obj => {
                if (obj["estado"] === "exito") {
                    resolve(obj["data"]);
                }
                if (obj["estado"] === "error") {
                    AlertMessenge(obj["error"], 3);
                    resolve(false);
                }
            }).catch(err => {
                console.log("");
            });
    });
};
document.addEventListener("DOMContentLoaded", function(event) { 
    pintarDeptos();
});

