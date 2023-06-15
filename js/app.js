let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const camposVacios = [ mesa, hora].some( campo => campo === ''); // Si almenos uno tiene un campo vacio
    if (camposVacios) {
        // Verificar si ya existe la alerta
        const existeAlerta = document.querySelector('.invalid-feedback');
        if(!existeAlerta) {
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);
            
            setTimeout( () => {
                alerta.remove();
            }, 3000); // Se eliminara la alerta despues de 3 segundos
        }
        return; // Gracias a este return nos ahorramos el else
    }

    // Asignar datos del formulario a cliente
    cliente = {...cliente, mesa, hora}

    // Ocultar el modal
    const modalFormulario = document.querySelector('#formulario');
    // obtenemos una instancia ds bootstrap para poder controlarlo y no solo sea html
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    // Usamos la instancia de bootstrap y escondemos el modal
    modalBootstrap.hide();

    mostrarSecciones();
    obtenerPlatillos();
}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    // Accedemos a cada clase de lso elemento sy eliminamos la clase para ocultarlos
    seccionesOcultas.forEach( seccion => seccion.classList.remove('d-none')); 
}

function obtenerPlatillos() {
    const url ='http://localhost:4000/platillos';

    fetch(url)
        .then( respuesta => respuesta.json())
        .then( resultado => mostrarPlatillos(resultado))
        .catch( error => console.log(error));
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach( platillo => {
        const row = document.createElement('DIV'); // Creamos una fila para el platillo
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('DIV'); // Creamos una columna que lleve el nombre
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;
        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;
        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria]; // Filtra la categorias dependiendo al numero

        const inputCantidad = document.createElement('INPUT'); // Creamos la informacion para la cantidad
        inputCantidad.type = 'number'; // De tipo number para que cree el input de tipo numerico de cantidad
        inputCantidad.min = 0; // El valor minimo que podra elegirse
        inputCantidad.value = 0; // Esto para que no aparezca vacio y empiece desde el 0
        inputCantidad.id = `producto-${platillo.id}`; // Le agregamos el id como atributo
        inputCantidad.classList.add('form-control');
        // Funcion que detecta la cantidad y el platillo que se esta agregando
        inputCantidad.onchange = function () {
            const cantidad = parseInt(inputCantidad.value); // Convertimos el numero de string a entero
            agregarPlatillo({...platillo, cantidad});
        }

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        // Agregamos los elementos al ROW
        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        // finalmente le agregamos la fila al contenido
        contenido.appendChild(row); 
    })
}

function agregarPlatillo(producto) {
    // Extraemos el pedido actual:
    let {pedido} = cliente;

    // Revisamos que la cantidad sea mayor a 0
    if(producto.cantidad > 0) {
        // Comprueba si el elemento ya existe en el Array
        if(pedido.some( articulo => articulo.id === producto.id)) {
            // El pedido ya existe, actualizar la cantidad
            const pedidoActualizado = pedido.map( articulo => { // Nos crea un nuevo arrat con el .map
                if(articulo.id === producto.id) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo; // retornamos el articulo para que lo vaya agregando al nuevo arrayActualizado
            });
            // Se le asigna el nuevo Array a cliente.pedido con la cantidad del producto actualizada
            cliente.pedido = [...pedidoActualizado];
        }else {
            // El articulo no existe, le agregamos al array el procto
            cliente.pedido = [...pedido, producto];
        }
    }else {
        const resultado = pedido.filter( articulo => articulo.id !== producto.id);
        cliente.pedido = resultado;
    }
    // Limpiar el HTML previo
    limpiarHTML();

    if(cliente.pedido.length) {
        // Mostrar el resumen
        actualizarResumen();
    }else {
        mensajePedidoVacio();
    }

}

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    // Informacion de la MESA
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');
    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    // Informacion de la HORA
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');
    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    // Agregar a los elementos padres
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    // Titulo de la seccion
    const heading = document.createElement('h3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center');

    // Iterar sobres los elementos
    const grupo = document.createElement('UL');
    grupo.classList.add('list.group');

    const {pedido} = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id} = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        // CANTIDAD del articulo
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';
        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;
        // Agregar valores a sus contenedores: 
        cantidadEl.appendChild(cantidadValor);

        // PRECIO del articulo
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';
        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;
        // Agregar valores a sus contenedores: 
        precioEl.appendChild(precioValor);

        // SUBTOTAL del articulo
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';
        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);
        // Agregar valores a sus contenedores: 
        subtotalEl.appendChild(subtotalValor);

        // BOTON PARA ELIMINAR
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar pedido';
        // Funcion para el boton para eliminar el pedido
        btnEliminar.onclick = function () {
            eliminarProducto(id);
        }

        // Agregar elementos al LI
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        // Agregar lista al grupo principal
        grupo.appendChild(lista);
    })

    // Agregar al resumen
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    // Finalmente lo agregamos al contenido 
    contenido.appendChild(resumen);

    // Mostrar formulario de propinas
    formularioPropinas();
}

function calcularSubtotal(precio, cantidad) {
    return `$${precio * cantidad}`;
}

function eliminarProducto(id) {
    const pedidoActualizado = cliente.pedido.filter( articulo => articulo.id !== id);
    cliente.pedido = [...pedidoActualizado];

    // Limpiar el HTML previo
    limpiarHTML();

    if(cliente.pedido.length) {
        // Mostrar el resumen
        actualizarResumen();
    }else {
        mensajePedidoVacio();
    }

    // El producto se elimino, por lo tanto se regresa la cantidad a 0 en el formulario
    const productoEliminado = document.querySelector(`#producto-${id}`);
    productoEliminado.value = 0;
}

function mensajePedidoVacio () {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade Productos al Pedido';

    contenido.appendChild(texto);
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    // Radio button 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    // Funcion para calcular Propina
    radio10.onclick = calcularPropina;
    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');
    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');
    // Agrgeamos al contenedor padre
    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    // Radio button 25%
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    // Funcion para calcular Propina
    radio25.onclick = calcularPropina;
    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');
    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');
    // Agrgeamos al contenedor padre
    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    // Radio button 50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    // Funcion para calcular Propina
    radio50.onclick = calcularPropina;
    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');
    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');
    // Agrgeamos al contenedor padre
    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    // Agregar al div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);
    // Agregar al formulario
    formulario.appendChild(divFormulario);
    // Agregar al contenido
    contenido.appendChild(formulario);

}

function calcularPropina() {
    const {pedido} = cliente;
    let subtotal = 0;

    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    })

    // Extraemos el value del radio que tenga el name propina y que este seleccionado
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    // Calcular propina
    const propina = ((subtotal * parseInt(propinaSeleccionada)) / 100);

    // Calcular total a pagar
    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina);
}

function mostrarTotalHTML(subtotal, total, propina) {
    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar', 'my-5');

    // SUBTOTAL
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';
    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;
    // Se agrega al contenedor padre
    subtotalParrafo.appendChild(subtotalSpan);

    // PROPINA
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina: ';
    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;
    // Se agrega al contenedor padre
    propinaParrafo.appendChild(propinaSpan);

    // TOTAL
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Total: ';
    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;
    // Se agrega al contenedor padre
    totalParrafo.appendChild(totalSpan);
    
    // Eliminar el ultimo resultado:
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv) {
        totalPagarDiv.remove();
    }

    // Se agrega al div 
    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');
    while(contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}