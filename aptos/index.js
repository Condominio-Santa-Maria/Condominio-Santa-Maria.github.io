const init= async()=>{
    let aptos = await getAptos();
    let cuerpo = "";
    cuerpo += "<div>Bienvenido a Santa maria 1</div>";

    cuerpo += "<div>Lista de departamentos.</div>";
    
    aptos.map(apto=>{
        cuerpo+="<div>"+apto.NUMERO+"</div>";
    });
    

    document.getElementById("app").innerHTML = cuerpo;
};

const getAptos=()=>{
    return new Promise(resolve=>{
        fetch("https://ged579f8ad0fdcf-santamaria.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/getaptos/").then(res => res.json()).then(obj => {
            
            resolve(JSON.parse(obj.items[0].json));
        });
    })
};

init();