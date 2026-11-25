# AutoAlerta: Sistema Automatizado de Mantenimiento Preventivo Vehicular

## Descripción General
Aplicación web profesional diseñada para la gestión integral de flotas vehiculares y talleres mecánicos. Automatiza el seguimiento del desgaste de componentes críticos (aceite, frenos, neumáticos, refrigerante), calcula el kilometraje restante para el servicio e implementa un diseño visual profesional con alertas de semáforo para prevenir averías costosas.

## Tecnologías y Librerías Utilizadas
* **HTML5:** Estructuración semántica del Dashboard de control y formularios de flotas.
* **CSS3:** Diseño responsivo con paleta corporativa e indicadores visuales dinámicos de salud vehicular.
* **JavaScript (ES6+):** Motor de cálculo en tiempo real, validación estricta de placas con expresiones regulares y gestión de eventos.
* **JSON / LocalStorage:** Catálogo de marcas/modelos y persistencia local de datos en el navegador.

## Estructura del Repositorio
* `index.html`: Interfaz visual principal y panel de control del sistema.
* `styles.css`: Estilos visuales, diseño responsivo y clases del semáforo de alertas.
* `app.js`: Lógica de negocio, control de odómetros y procesamiento de múltiples partes de mantenimiento.
* `data.json`: Base de datos local con el catálogo de vehículos y umbrales de desgaste.

## Guía Rápida de Uso
1. Abre el proyecto en **Visual Studio Code** utilizando la extensión **Live Server**.
2. Registra un vehículo indicando su placa, marca, modelo y kilometraje actual.
3. Visualiza de inmediato las tarjetas de estado y el semáforo indicativo del desgaste de cada componente preventivo.