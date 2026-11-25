const INTERVALO_CAMBIO_ACEITE_KM = 5000;
const INTERVALO_REVISION_FRENOS_KM = 10000;
const AVISO_MANTENIMIENTO_PORCENTAJE = 0.8;
const STORAGE_KEY = "vehiculos";
const LEGACY_STORAGE_KEY = "autoalerta-vehiculos";
const ESTADOS_MANTENIMIENTO = ["En buen estado", "Revisar pronto", "Pendiente"];
const DATOS_PREDETERMINADOS = {
  marcas: {
    Toyota: ["Corolla", "Hilux", "Yaris"],
    Honda: ["Civic", "CR-V", "Fit"],
    Nissan: ["Sentra", "Versa", "Frontier"],
    Chevrolet: ["Aveo", "Onix", "S10"],
    Volkswagen: ["Jetta", "Tiguan", "Polo"]
  },
  vehiculos: [
    {
      placa: "ABC123",
      marca: "Toyota",
      modelo: "Corolla",
      kilometrajeActual: 45000,
      ultimoMantenimientoKm: 40000,
      piezas: { aceite: "Pendiente", frenos: "En buen estado" }
    },
    {
      placa: "DEF456",
      marca: "Honda",
      modelo: "Civic",
      kilometrajeActual: 28000,
      ultimoMantenimientoKm: 20000,
      piezas: { aceite: "En buen estado", frenos: "Revisar pronto" }
    },
    {
      placa: "GHI789",
      marca: "Nissan",
      modelo: "Versa",
      kilometrajeActual: 12000,
      ultimoMantenimientoKm: 10000,
      piezas: { aceite: "En buen estado", frenos: "En buen estado" }
    }
  ]
};

const listaVehiculos = document.querySelector("#lista-vehiculos");
const formulario = document.querySelector("#formulario-vehiculo");
const selectorMarca = document.querySelector("#marca");
const selectorModelo = document.querySelector("#modelo");
const entradaPlaca = document.querySelector("#placa");
const mensaje = document.querySelector("#mensaje");
const botonRegistrar = document.querySelector("#registrar");

let catalogoMarcas = DATOS_PREDETERMINADOS.marcas;
let vehiculos = [];

function obtenerKilometrajeActual(vehiculo) {
  return Number(vehiculo.kilometraje ?? vehiculo.kilometrajeActual);
}

function validarOdometro(kilometraje, exigirEntero = false) {
  // El formulario exige enteros; los datos históricos pueden conservar decimales.
  return (
    Number.isFinite(kilometraje) &&
    kilometraje >= 0 &&
    (!exigirEntero || Number.isInteger(kilometraje))
  );
}

function calcularDesgasteComponente(kilometrajeActual, tipo) {
  const intervalo =
    tipo === "aceite"
      ? INTERVALO_CAMBIO_ACEITE_KM
      : INTERVALO_REVISION_FRENOS_KM;
  if (!validarOdometro(kilometrajeActual)) {
    return {
      clase: "estado-rojo",
      texto: "Kilometraje no válido",
      kilometrosRestantes: 0,
      porcentajeVidaRestante: 0
    };
  }

  const kilometrosEnCiclo = kilometrajeActual % intervalo;
  // Cada intervalo representa un nuevo ciclo de mantenimiento.
  const mantenimientoVencido =
    kilometrajeActual > 0 && kilometrosEnCiclo === 0;
  const kilometrosRestantes = mantenimientoVencido
    ? 0
    : intervalo - kilometrosEnCiclo;
  const porcentajeVidaRestante = (kilometrosRestantes / intervalo) * 100;

  if (mantenimientoVencido) {
    return {
      clase: "estado-rojo",
      texto:
        tipo === "aceite"
          ? "¡Cambio de aceite requerido!"
          : "¡Revisión de frenos requerida!",
      kilometrosRestantes,
      porcentajeVidaRestante
    };
  }

  if (kilometrosEnCiclo >= intervalo * AVISO_MANTENIMIENTO_PORCENTAJE) {
    return {
      clase: "estado-amarillo",
      texto: "Mantenimiento próximo",
      kilometrosRestantes,
      porcentajeVidaRestante
    };
  }

  return {
    clase: "estado-verde",
    texto: "En buen estado",
    kilometrosRestantes,
    porcentajeVidaRestante
  };
}

function calcularDesgasteComponentes(vehiculo) {
  const kilometrajeActual = obtenerKilometrajeActual(vehiculo);
  return {
    aceite: calcularDesgasteComponente(kilometrajeActual, "aceite"),
    frenos: calcularDesgasteComponente(kilometrajeActual, "frenos")
  };
}

function crearElemento(tag, texto, className) {
  const elemento = document.createElement(tag);
  elemento.textContent = texto;
  if (className) elemento.className = className;
  return elemento;
}

function renderizarInterfaz() {
  listaVehiculos.replaceChildren();

  if (vehiculos.length === 0) {
    listaVehiculos.append(
      crearElemento("p", "Todavía no hay vehículos registrados.", "vacio")
    );
    return;
  }

  const tabla = document.createElement("table");
  tabla.className = "tabla-vehiculos";
  const caption = crearElemento("caption", "Estado de mantenimiento de los vehículos");
  const encabezado = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");
  ["Placa", "Vehículo", "Kilometraje actual", "Aceite", "Frenos"].forEach(
    (texto) => {
      const celdaEncabezado = crearElemento("th", texto);
      celdaEncabezado.scope = "col";
      filaEncabezado.append(celdaEncabezado);
    }
  );
  encabezado.append(filaEncabezado);

  const cuerpo = document.createElement("tbody");
  vehiculos.forEach((vehiculo) => {
    const fila = document.createElement("tr");
    const desgaste = calcularDesgasteComponentes(vehiculo);
    const kilometrajeActual = obtenerKilometrajeActual(vehiculo);

    fila.append(
      crearElemento("td", vehiculo.placa),
      crearElemento("td", `${vehiculo.marca} ${vehiculo.modelo}`),
      crearElemento(
        "td",
        validarOdometro(kilometrajeActual)
          ? `${kilometrajeActual.toLocaleString("es-MX")} km`
          : "No disponible"
      ),
      crearCeldaEstado(desgaste.aceite, INTERVALO_CAMBIO_ACEITE_KM),
      crearCeldaEstado(desgaste.frenos, INTERVALO_REVISION_FRENOS_KM)
    );
    cuerpo.append(fila);
  });

  tabla.append(caption, encabezado, cuerpo);
  listaVehiculos.append(tabla);
}

function crearCeldaEstado(estado, intervalo) {
  const celda = document.createElement("td");
  const etiqueta = crearElemento("span", estado.texto, `etiqueta-estado ${estado.clase}`);
  const detalle = crearElemento(
    "small",
    `${estado.kilometrosRestantes.toLocaleString("es-MX")} / ${intervalo.toLocaleString("es-MX")} km restantes · ${estado.porcentajeVidaRestante.toLocaleString("es-MX", { maximumFractionDigits: 2 })}% de vida útil`
  );
  celda.append(etiqueta, detalle);
  return celda;
}

function actualizarModelos() {
  const modelos = catalogoMarcas[selectorMarca.value] || [];
  selectorModelo.replaceChildren(new Option("Selecciona un modelo", ""));
  modelos.forEach((modelo) => selectorModelo.add(new Option(modelo, modelo)));
  selectorModelo.disabled = modelos.length === 0;
}

function actualizarMarcas() {
  const marcaSeleccionada = selectorMarca.value;
  selectorMarca.replaceChildren(new Option("Selecciona una marca", ""));
  Object.keys(catalogoMarcas).forEach((marca) =>
    selectorMarca.add(new Option(marca, marca))
  );
  if (Object.hasOwn(catalogoMarcas, marcaSeleccionada)) {
    selectorMarca.value = marcaSeleccionada;
  }
  actualizarModelos();
}

function mostrarMensaje(texto, tipo = "error") {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

function guardarVehiculos(vehiculosPorGuardar) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehiculosPorGuardar));
  } catch (error) {
    mostrarMensaje(`No se pudieron guardar los vehículos: ${error.message}`);
    return false;
  }
  return true;
}

function cargarVehiculosGuardados(vehiculosIniciales) {
  const guardados =
    localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
  if (guardados === null) return vehiculosIniciales;

  const datos = JSON.parse(guardados);
  if (!Array.isArray(datos) || !datos.every(vehiculoValido)) {
    throw new Error("Los datos guardados de vehículos tienen un formato inválido.");
  }
  return datos;
}

function vehiculoValido(vehiculo) {
  if (
    !vehiculo ||
    typeof vehiculo !== "object" ||
    typeof vehiculo.placa !== "string" ||
    !vehiculo.placa.trim() ||
    typeof vehiculo.marca !== "string" ||
    !vehiculo.marca.trim() ||
    typeof vehiculo.modelo !== "string" ||
    !vehiculo.modelo.trim()
  ) {
    return false;
  }

  const kilometraje = vehiculo.kilometraje ?? vehiculo.kilometrajeActual;
  return (
    (typeof kilometraje === "number" || typeof kilometraje === "string") &&
    String(kilometraje).trim() !== "" &&
    validarOdometro(Number(kilometraje))
  );
}

function datosValidos(datos) {
  return (
    datos &&
    datos.marcas &&
    typeof datos.marcas === "object" &&
    !Array.isArray(datos.marcas) &&
    Object.keys(datos.marcas).length > 0 &&
    Object.values(datos.marcas).every(
      (modelos) =>
        Array.isArray(modelos) &&
        modelos.length > 0 &&
        modelos.every((modelo) => typeof modelo === "string" && modelo.trim())
    ) &&
    Array.isArray(datos.vehiculos) &&
    datos.vehiculos.every(vehiculoValido)
  );
}

function obtenerTextoFormulario(datos, nombre) {
  const valor = datos.get(nombre);
  return typeof valor === "string" ? valor.trim() : null;
}

function validarDatosVehiculo({ placa, marca, modelo, kilometrajeActual, aceite, frenos }) {
  if (!/^[A-Z0-9]{6,8}$/.test(placa)) {
    return "La placa debe tener entre 6 y 8 caracteres y solo contener letras mayúsculas y números.";
  }
  if (!catalogoMarcas[marca]?.includes(modelo)) {
    return "Selecciona una marca y un modelo válido para esa marca.";
  }
  if (!validarOdometro(kilometrajeActual, true)) {
    return "Ingresa un kilometraje entero válido, igual o mayor que cero.";
  }
  if (
    !ESTADOS_MANTENIMIENTO.includes(aceite) ||
    !ESTADOS_MANTENIMIENTO.includes(frenos)
  ) {
    return "Selecciona estados de mantenimiento válidos.";
  }
  if (vehiculos.some((vehiculo) => vehiculo.placa.toUpperCase() === placa)) {
    return "Ya existe un vehículo registrado con esa placa.";
  }
  return null;
}

function leerDatosRegistro() {
  const datos = new FormData(formulario);
  return {
    placa: obtenerTextoFormulario(datos, "placa"),
    marca: obtenerTextoFormulario(datos, "marca"),
    modelo: obtenerTextoFormulario(datos, "modelo"),
    kilometraje: obtenerTextoFormulario(datos, "kilometrajeActual"),
    aceite: obtenerTextoFormulario(datos, "aceite"),
    frenos: obtenerTextoFormulario(datos, "frenos")
  };
}

function guardarNuevoVehiculo(vehiculo) {
  vehiculos.push(vehiculo);
  if (guardarVehiculos(vehiculos)) return true;

  vehiculos.pop();
  return false;
}

function reiniciarFormularioRegistro() {
  formulario.reset();
  actualizarModelos();
  mostrarMensaje("Vehículo registrado correctamente.", "exito");
}

async function iniciarAplicacion() {
  catalogoMarcas = DATOS_PREDETERMINADOS.marcas;
  vehiculos = DATOS_PREDETERMINADOS.vehiculos;
  actualizarMarcas();
  renderizarInterfaz();
  botonRegistrar.disabled = false;

  try {
    vehiculos = cargarVehiculosGuardados(DATOS_PREDETERMINADOS.vehiculos);
  } catch (error) {
    vehiculos = DATOS_PREDETERMINADOS.vehiculos;
    mostrarMensaje(`No se pudieron leer los vehículos guardados: ${error.message}`);
  }
  renderizarInterfaz();

  try {
    const respuesta = await fetch("./data.json");
    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar data.json (HTTP ${respuesta.status}).`);
    }

    const datos = await respuesta.json();
    if (!datosValidos(datos)) {
      throw new Error("data.json no contiene el catálogo o la lista de vehículos esperados.");
    }

    catalogoMarcas = datos.marcas;
    try {
      vehiculos = cargarVehiculosGuardados(datos.vehiculos);
    } catch (error) {
      vehiculos = datos.vehiculos;
      mostrarMensaje(`No se pudieron leer los vehículos guardados: ${error.message}`);
    }
    actualizarMarcas();
    renderizarInterfaz();
  } catch (error) {
    actualizarMarcas();
    mostrarMensaje(
      `No se pudo cargar data.json; se usan los datos predeterminados. ${error.message}`,
      "error"
    );
  }
}

function procesarRegistroVehiculo(evento) {
  evento.preventDefault();
  const datosRegistro = leerDatosRegistro();

  if (
    Object.values(datosRegistro).some(
      (valor) => valor === null || valor === ""
    )
  ) {
    mostrarMensaje("Completa todos los campos con valores válidos.");
    return;
  }

  const datosVehiculo = {
    placa: datosRegistro.placa.toUpperCase(),
    marca: datosRegistro.marca,
    modelo: datosRegistro.modelo,
    kilometrajeActual: Number(datosRegistro.kilometraje),
    aceite: datosRegistro.aceite,
    frenos: datosRegistro.frenos
  };
  const errorValidacion = validarDatosVehiculo(datosVehiculo);

  if (errorValidacion) {
    mostrarMensaje(errorValidacion);
    if (!/^[A-Z0-9]{6,8}$/.test(datosVehiculo.placa)) entradaPlaca.focus();
    return;
  }

  const nuevoVehiculo = {
    placa: datosVehiculo.placa,
    marca: datosVehiculo.marca,
    modelo: datosVehiculo.modelo,
    kilometrajeActual: datosVehiculo.kilometrajeActual,
    piezas: { aceite: datosVehiculo.aceite, frenos: datosVehiculo.frenos }
  };

  if (!guardarNuevoVehiculo(nuevoVehiculo)) return;

  renderizarInterfaz();
  reiniciarFormularioRegistro();
}

selectorMarca.addEventListener("change", actualizarModelos);
entradaPlaca.addEventListener("input", () => {
  entradaPlaca.value = entradaPlaca.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
});

formulario.addEventListener("submit", procesarRegistroVehiculo);

iniciarAplicacion();