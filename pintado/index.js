const init= async()=>{
    let aptos = await getAptos();
    let cuerpo = "";
    cuerpo += "<div>Bienvenido a Santa maria 1</div>";

    cuerpo += "<div>Lista de departamentos.</div>";
    
    cuerpo += "<div>";
    cuerpo += "<table>";
    cuerpo += "<thead>";
    cuerpo += "<tr>";
    cuerpo += "<th>Apto</th>";
    cuerpo += "<th>#1</th>"; 
    cuerpo += "<th>#2</th>"; 
    cuerpo += "<th>#3</th>"; 
    cuerpo += "<th>#4</th>"; 
    cuerpo += "<th>#5</th>"; 
    cuerpo += "<th>#6</th>"; 
    cuerpo += "<th>#7</th>"; 
    cuerpo += "<th>#8</th>"; 
    cuerpo += "<th>#9</th>"; 
    cuerpo += "<th>#10</th>"; 
    cuerpo += "<th>#11</th>"; 
    cuerpo += "<th>#12</th>"; 
    cuerpo += "</tr>";
    cuerpo += "</thead>";
    cuerpo += "<tbody>";
    aptos.map(apto=>{
        cuerpo += "<tr>";
        cuerpo += "<td>"+apto.NUMERO+"</td>";
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "<td>❌</td>"; 
        cuerpo += "</tr>";
    });
    cuerpo += "</tbody>";
    cuerpo += "</table>";
    cuerpo += "</div>";
    
    

    document.getElementById("app").innerHTML = cuerpo;
};

const card=(usuario)=>{
    let cuerpo = "<div style='pading:10px; margin:10px; border:1px solid; border-radius:10px;'>";
    cuerpo+="<div>"+usuario.telefono+"</div>";
    cuerpo+="<div>"+usuario.user+"</div>";
    cuerpo+="</div>";
    return cuerpo;
};

const getAptos=()=>{
    return new Promise(resolve=>{
        fetch("https://ged579f8ad0fdcf-santamaria.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin/getaptos/").then(res => res.json()).then(obj => {
            
            resolve(JSON.parse(obj.items[0].json));
        });
    })
};

init();