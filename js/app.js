// selectores 
const formulario = document.querySelector('#formulario');
const resultado = document.querySelector('#resultado');
const paginacionDiv = document.querySelector('#paginacion');

const registroPorPaginas = 40; // esta es la cantidad de imagenes que vamos a mostrar por pagina, para hacer la paginacion
let totalPaginas; // la declaramos global asi cuando hacemos diferentes consultas puede ir cambiando y al acenandose
let iterador; // iniciamos una variable donde despues le asignamos los valores de las paginas a mostrar
let paginaActual = 1; // la pagina que vamos a ir mostrando segun la cantidad de elementos encontrados, la primer pagina obvio es 1

window.onload = () => {
    formulario.addEventListener('submit', validarFormulario);
};

function validarFormulario(e) {
    e.preventDefault();

    const terminoBusqueda = document.querySelector('#termino').value;

    if(terminoBusqueda === '') {
        mostrarAlerta('Necesitamos un termino de busqueda...');
        return;
    };

    // pasamos la validacion, buscamos las imagenes en pixabay
    buscarImagenes(terminoBusqueda);
};

// generador que va a registrar la cantidad de elementos de acuerdo a las paginas
function *crearPaginador(total) {
    console.log(total);
    for(let i = 1; i <= total; i++) {
        yield i;
    };
};

function buscarImagenes() {

    const termino = document.querySelector('#termino').value;

    const APIkey = '31477724-d2f3f836d73f6fb7dbf2a7b4c';
    
    // al consultar la api le vamos pasando los difernetes parametros que solicita para poder traer correctamente la informacion
    const url = `https://pixabay.com/api/?key=${APIkey}&q=${termino}&per_page=${registroPorPaginas}&page=${paginaActual}`;

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => {
            // console.log(datos);

            // calculamos el total de paginas segun la cantidad de elementos que salen de la busqueda accediento a totalHits
            // llamamos a una funcion que devuelve un valor entero redondeado hacia arriba devidido por la cantidad de elementos por pagina que queremos mostrar
            totalPaginas = calcularPaginas(datos.totalHits);
            // console.log(totalPaginas);
            mostrarImagenes(datos.hits)
        });
};

// vamos a calcular la paginacion correcta para no dejar imagenes sin mostrar
// por ejemplo si de la busqueda obtenemos 35 imagnes y por cada pagina mostramos 10, nos quedarian 5 sin mostrar
function calcularPaginas(total) {
    return parseInt(Math.ceil(total / registroPorPaginas)); // Math.ceil() este redonde siempre para arriba
};

function mostrarImagenes(imagenes) {

    console.log(imagenes);
    
    limpiarHtml();

    // vamos a iterar sobre el arreglo que obtuvimos de imagenes y construimos el html
    imagenes.forEach(imagen => {
        const {previewURL, likes, views, largeImageURL} = imagen;
        resultado.innerHTML += `
            <div class="w-1/2 md:w-1/3 lg:w-1/4 p-3 mb-4">
                <div class="bg-white">
                    <img class="w-full" src="${previewURL}">
                    <div class="p-4">
                        <p class="font-bold">${likes} <span class="font-light">Me gusta</span></p>
                        <p class="font-bold">${views} <span class="font-light">Vistas</span></p>
                        <a 
                            class="block w-full bg-blue-800 hover:bg-blue-500 text-white uppercase font-bold text-center rounded mt-5 p-1"
                            href="${largeImageURL}" target="_blank" rel="noopener noreferrer"
                        >
                            Ver imagen
                        </a>
                    </div>
                </div>
            </div>
            
        `;
    });

    // limpiamos el paginador previo, con la busqueda anterior
    while(paginacionDiv.firstChild) {
        paginacionDiv.removeChild(paginacionDiv.firstChild);
    };

    // creamos una funcion para ir imprimiendo sobre el html
    impirmirPaginador();
    
};

function impirmirPaginador() {

    // una vez que mostramos todas las imagenes mandamos a llamar el generador, nos devuelve un objeto con las llaves de value y done
    iterador = crearPaginador(totalPaginas);
    
    while(true) { // un while infinito hasta el return

        // destructuring al iterador obtenido
        const {value, done} = iterador.next(); // despertamos el iterador

        // si done es true quiere decir que no hay mas iteraciones dentro del generador, con el return cortamos la funcion
        if(done) return;

        // pasado el done como false creamos un boton de paginas con este codigo
        const boton = document.createElement('A');
        boton.href = '#';
        boton.classList.add('siguient', 'bg-yellow-400', 'px-4', 'py-1', 'mr-2', 'font-bold', 'mb-5', 'rounded');
        boton.dataset.pagina = value;
        boton.textContent = value;

        // cuando apretamos sobre un boton de la paginacion a esta le asignamos una funcion que asigna el valor de la pagina actual y manda a llamar a la api con el valor de la pagina que queremos buscar, como le pedimos un numero por pagina y eso lo respetamos, y calculamos por ese numero
        boton.onclick = () => {
            paginaActual = value;
            // console.log(paginaActual);
            buscarImagenes();
        };

        paginacionDiv.appendChild(boton);
    };
};

function limpiarHtml() {
    while(resultado.firstChild) {
        resultado.removeChild(resultado.firstChild);
    };
};

function mostrarAlerta(mensaje) {

    const existeAlerta = document.querySelector('.text-red-700');

    if(!existeAlerta) {
        const alerta = document.createElement('P');
        alerta.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded', 'max-w-lg', 'mx-auto', 'mt-6', 'text-center');
        
        alerta.innerHTML = `
            <strong class="font-bold">ERROR</strong>
            <span class="block sm:inline">${mensaje}</span>
        `;
        formulario.appendChild(alerta);
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    };
};