# SIGESTEC — Frontend

Interfaz web de SIGESTEC para los procesos comerciales, operativos y técnicos de ACOIEL SAC.

## Tecnologías

Angular 22, TypeScript, HTML5, CSS modular y Bootstrap 5.3 (hoja de estilos distribuida localmente, sin plugins JS). El frontend consume la API de Spring Boot; nunca se conecta directamente a Oracle ni almacena las claves de SUNAT o Google Drive.

## Ejecutar

```bash
npm install
npm start
```

Abrir http://localhost:4200 . El backend debe estar disponible en http://localhost:8080 y conectado a Oracle con el perfil `oracle-dev`.

## Módulos

Login y recuperación de contraseña; clientes y tipos de servicio; solicitudes, cotizaciones y órdenes de compra; órdenes de trabajo, asignaciones y programación; ATS y aprobaciones; ejecuciones, informes, conformidades y almacén.

Las listas respetan el diseño de Figma: acciones principales de **ver** (ojo) y **editar** (lápiz), cuando el estado y el rol lo permiten. Los registros relacionados conservan las validaciones de integridad implementadas en el backend.

## Consultar clientes

En **Clientes**, la caja «Buscar empresa en el padrón SUNAT» acepta RUC o razón social. Selecciona la empresa encontrada para completar RUC y razón social; confirma los datos antes de guardar. Necesita `SUNAT_API_TOKEN` en el backend.

## Consulta DNI en registro de personal

En **Personal de servicios**, introduce un DNI de ocho dígitos y pulsa **Consultar DNI**. El backend realiza la búsqueda mediante endpoint.pe (datos declarados como provenientes de RENIEC) y completa **Nombres** y **Apellidos**. Confirma la información antes de registrar. Si la consulta no funciona o no hay credenciales, puedes ingresar los datos manualmente.

Esta funcionalidad requiere `IDENTIDAD_API_TOKEN` o, si ya se usa el proveedor para RUC, `SUNAT_API_TOKEN`, configurada **solo en Spring Boot**. El DNI, si se consigna, se guarda en Oracle y se comprueba que no esté duplicado.

## Adjuntos PDF de cotizaciones y órdenes

Los detalles de cotización se ingresan manualmente. En órdenes de compra se cargan desde la cotización aceptada y pueden revisarse o corregirse. Adjuntar un PDF **no modifica** los detalles del formulario; el archivo solo se conserva como documento.

## Adjuntos en Drive

Las cargas y descargas siguen utilizando las mismas pantallas. El backend gestiona el almacenamiento privado en Google Drive cuando sus credenciales OAuth están configuradas. El frontend no necesita conocer esas claves.

## Estructura de estilos

Los estilos globales están divididos en `src/styles/` por responsabilidad: base, autenticación, layout, tablas, formularios, dashboard y menú. `src/assets/vendor/bootstrap.min.css` contiene Bootstrap 5.3.6 bajo licencia MIT; se carga antes de los estilos de SIGESTEC.

## Seguridad

Autenticación JWT y autorización por roles. El correo de recuperación usa un enlace temporal de un solo uso; el token nunca se imprime en la interfaz de listados ni se guarda en el frontend.

Repositorio de backend: https://github.com/Pari820/SigestecBackend

Proyecto académico de Ingeniería de Sistemas — SIGESTEC.


## Numeracion de actas de conformidad

El numero de acta ya no se ingresa manualmente. El backend asigna `ACTA-AAAA-001` al guardar, usando el año de la fecha de conformidad. El formulario muestra que el codigo se generara automaticamente.
