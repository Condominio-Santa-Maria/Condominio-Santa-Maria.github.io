const url = "https://ruddypazd.com";

const pintarBauleras= async()=>{
    let bauleras = await getBauleras();
    let cuerpo = "";
    Object.values(bauleras).map((baulera)=>{
        cuerpo+=cardBaulera(baulera);
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

const getBauleras=()=>{
    let obj = {
        component:"baulera",
        type:"getAll",
    };
    return new Promise(resolve => {
        fetch(url, {
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
    pintarBauleras();
});

