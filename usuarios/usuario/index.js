const init= async()=>{
    let usuarios = await getUsuarios();
    let cuerpo = "";
    cuerpo += "<div>Bienvenido a Santa maria 1</div>";

    cuerpo += "<div>Registra usuario</div>";
    cuerpo += "<div>Registra usuario</div>";
    

    document.getElementById("app").innerHTML = cuerpo;
};

const card=(usuario)=>{
    let cuerpo = "<div style='pading:10px; margin:10px; border:1px solid; border-radius:10px;'>";
    cuerpo+="<div>"+usuario.telefono+"</div>";
    cuerpo+="<div>"+usuario.user+"</div>";
    cuerpo+="</div>";
    return cuerpo;
};

const getUsuarios=()=>{
    return new Promise(resolve=>{
        fetch("https://ged579f8ad0fdcf-santamaria.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/usuario/").then(res => res.json()).then(obj => {
            resolve(obj.items);
        });
    })
};

init();