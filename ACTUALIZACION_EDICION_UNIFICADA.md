# SIGESTEC — Edición unificada y vistas previas

## Contenido

- Frontend: renombrado «Registrar ATS» y «Registrar informe técnico»; rutas de edición que reutilizan el formulario de registro en Solicitudes, Cotizaciones, Compras, ATS, Ejecuciones e Informes. En Clientes, Tipos de servicio, Personal, Materiales y Herramientas se ofrece un editor completo reutilizable con campos permitidos y campos bloqueados.
- Adjuntos: vista previa y apertura segura (a través de peticiones autenticadas) antes de guardar y sobre archivos registrados, posibilidad de quitar un archivo recién seleccionado, y reemplazar/desvincular PDF previo en correcciones permitidas.
- Backend: endpoint `PUT /api/v1/gestion/{modulo}/{id}/documento` para actualizar campos autorizados y un PDF en una transacción (Solicitudes, ATS, Informes y Compras). Cotizaciones admite `quitarPdf` en su `PUT` multipart.
- Se mantienen las autorizaciones, restricciones de estados y validaciones del backend. No se ha cambiado el modelo ni las tablas de Oracle.
- Corregido en los ZIP: `tsconfig.app.json`, tipado en `compras.ts`, detección de cambios de consultas RUC/DNI y constructor de `ConsultaDniService`.

## Instalación segura

1. **Haz una copia** de las carpetas actuales de frontend y backend antes de reemplazarlas. El frontend local ya contiene cambios manuales hechos durante las pruebas; no sobrescribas sin respaldo.
2. Extrae el ZIP de frontend y abre `sigestec-frontend` en VS Code. Usa la misma configuración de `environment` que utilizabas.
3. Extrae el ZIP de backend y abre `sigestec-backend` en IntelliJ IDEA. Conserva tus variables de entorno, perfiles Oracle, tokens de SUNAT/DNI, SMTP y credenciales Drive. No aparecen claves reales en estos ZIP.
4. Primero detén las aplicaciones, después inicia Spring Boot y Angular. Para el frontend ejecuta `npm install` y `npm start`.
5. Verifica: inicio de sesión, consultas RUC/DNI, carga de solicitudes, edición de registros PENDIENTE, vista previa de PDF antes de guardar, PDF ya guardado, quitar PDF opcional y reemplazar PDF de OC.

## Límites y seguridad

- En Compras no se puede quitar el PDF sin reemplazo: es un documento obligatorio.
- ATS aprobado, conformidades, aprobaciones y movimientos históricos no pueden modificarse libremente. Se conservan las evidencias por trazabilidad.
- «Quitar archivo anterior» desvincula su referencia de ese registro **al confirmar Guardar cambios**. No elimina físicamente el objeto histórico de la carpeta o Drive; esa eliminación debe seguir una política de retención y auditoría.
- Las fotografías de evidencias ya guardadas pueden verse, pero no se eliminan desde la edición de textos: son parte del historial técnico. Sí se pueden quitar fotos todavía no guardadas.
- La implementación no ha sido probada aquí contra una instancia real de Oracle ni con las claves externas. La instalación de las dependencias de Angular no finalizó en este entorno porque la versión disponible de Node es 22.16.0 (Angular 22.2 requiere una versión posterior), de modo que **la compilación y pruebas de extremo a extremo quedan pendientes en tu computadora**. Se validó sintaxis TypeScript de todos los archivos.
