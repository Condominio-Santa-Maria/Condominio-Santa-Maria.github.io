const url = "https://ruddypazd.com";

const pintarHabitantes= async()=>{
    let habitantes = await getHabitantes();
    let cuerpo = "";

    document.getElementById("cant_habitantes").innerText = Object.keys(habitantes).length;

    Object.values(habitantes).map((habitante)=>{
        cuerpo+=cardHabitante(habitante);
    });
    document.getElementById("habitantes").innerHTML = cuerpo;
    
    let heigth = document.getElementById("habitantes").clientHeight;
    
    document.getElementById("contenido_").style.height=(heigth+500)+"px";
};

const cardHabitante=(habitante)=>{
    let cuerpo = "";
    cuerpo += "<div class='border1 button btnprimary-alt' style='margin: 5px; width:140px;'>";
    cuerpo += "<div class='top10'># "+habitante.descripcion+"</div>";
    cuerpo += "<div class='top10'>"+(habitante.propietario || "Sin identificar")+"</div>";
    cuerpo += "<div class='top10'>"+(habitante.mora || "Bs. 0,00")+"</div>";
    cuerpo += "</div>";
    return cuerpo;
};

const getHabitantes=()=>{
    let obj = {
        component:"usuario",
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

