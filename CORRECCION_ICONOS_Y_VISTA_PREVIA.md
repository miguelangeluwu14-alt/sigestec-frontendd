# Corrección: icono de detalles y vistas previas de adjuntos

## Cambios incluidos

- Se limita el icono del ojo a 20 × 20 px y se aplica un estilo coherente de acción en las listas de Conformidades, Ejecuciones e Informes técnicos.
- Se incorpora etiqueta accesible «Ver detalles».
- Las imágenes JPEG/PNG se visualizan en una etiqueta `img` ajustada al ancho del contenedor, y los documentos PDF en `iframe`.
- Se mejora el mensaje mostrado ante HTTP 404, 403 y errores de almacenamiento.
- **El backend y Google Drive no se han modificado**; no se altera el flujo de subida que ya funcionaba.

## Aclaración fundamental sobre HTTP 404

HTTP 404 significa que el backend no encuentra el recurso solicitado. Este parche NO puede recuperar imágenes borradas o documentos locales que se perdieron al cambiar la carpeta de ejecución del backend.

Verifica la procedencia de las referencias en Oracle:

```sql
SELECT ID_EVIDENCIA_EJECUCION, ID_EJECUCION_SERVICIO, ETAPA, URL_ARCHIVO, NOMBRE_ARCHIVO
FROM EVIDENCIA_EJECUCION
WHERE ID_EJECUCION_SERVICIO = 1
ORDER BY ID_EVIDENCIA_EJECUCION;
```

- Si `URL_ARCHIVO` contiene `gdrive-...jpg/png`, revisa que el archivo exista en la cuenta de Drive autorizada y que no haya sido eliminado.
- Si contiene solo un UUID, por ejemplo `/api/v1/archivos/UUID.jpg`, se trata de un archivo **local anterior** y debe seguir existiendo en `./archivos-sigestec/` relativo al directorio desde el que se ejecuta Spring Boot. Si cambiaste de proyecto/carpeta, copia allí los archivos originales o migra los documentos de manera controlada.
- Si no existe el archivo original ni en Drive ni en la carpeta local anterior, no puede recuperarse solo modificando Angular. Será necesario volver a obtener la imagen desde el origen y registrarla correctamente.

## Instalación

Detén Angular, sustituye el proyecto por este frontend (o aplica el parche), ejecuta `npm install` y `npm start`. Mantén el backend `SIGESTEC-Backend-Edicion-Unificada` actual y recarga Chrome con Ctrl+Shift+R.
