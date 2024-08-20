const init= async()=>{
    
    let cuerpo = "";
    cuerpo += "<div>Bienvenido a Santa maria 1</div>";
    cuerpo += "<ul>";
    cuerpo += "<li><a href='./usuarios/'>Usuarios</a></li>";
    cuerpo += "<li><a href='./aptos/'>Departamentos</a></li>";
    cuerpo += "<li><a href='./pintado/'>Departamentos</a></li>";
    cuerpo += "</ul>";
    document.getElementById("app").innerHTML = cuerpo;
};


init();