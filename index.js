const init= async()=>{
    let usuarios = await getUsuarios();
    let cuerpo = "";
    cuerpo += "<div>Bienvenido a Santa maria 1</div>";
    cuerpo += "<div>"+JSON.stringify(usuarios)+"</div>";
    document.getElementById("app").innerHTML = cuerpo;
};

const getUsuarios=()=>{
    return new Promise(resolve=>{
        fetch("https://ged579f8ad0fdcf-santamaria.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/usuario/").then(res => res.json()).then(obj => {
            resolve(obj.data);
        });
    })
};

init();