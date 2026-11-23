# SIGESTEC — corrección de iconos y vistas previas

## Cambios del frontend
- Solo iconos de ojo y lápiz, sin marcos ni iconos extra en las acciones de tabla.
- Retirado el botón de flecha hacia abajo de descarga PDF en la tabla de órdenes de compra.
- Se conserva el componente que muestra imágenes y PDF cuando sus referencias son válidas.

## Cambios del backend
- `ArchivoController` presenta documentos como `inline` en lugar de forzar su descarga.
- `ArchivoStorageLocalService` busca archivos antiguos en la carpeta actual y, opcionalmente, en una carpeta anterior configurable.
- Se añade `SIGESTEC_STORAGE_DIR_ANTERIOR` (opcional). No modifica ni borra datos de Oracle ni archivos de Drive.

## Cómo comprobar las tres imágenes de EJE-1

En Oracle, primero ejecuta:

```sql
SELECT ID_EVIDENCIA_EJECUCION, ETAPA, NOMBRE_ARCHIVO, URL_ARCHIVO
FROM EVIDENCIA_EJECUCION
WHERE ID_EJECUCION_SERVICIO = 1
ORDER BY ID_EVIDENCIA_EJECUCION;
```

- Si `URL_ARCHIVO` contiene `/archivos/gdrive-...jpg`, verifica que ese ID de archivo exista en Drive y sea accesible a la cuenta OAuth.
- Si `URL_ARCHIVO` contiene `/archivos/<uuid>.jpg` o `.png`, es un archivo antiguo almacenado localmente. Google Drive no lo tendrá salvo que se haya migrado.
- Busca la carpeta `archivos-sigestec` del backend original donde registraste la ejecución. Si está en otro lugar, sin mover nada, agrega en IntelliJ (Run > Edit Configurations > Environment variables):

  `SIGESTEC_STORAGE_DIR_ANTERIOR=C:\ruta\del\proyecto\anterior\archivos-sigestec`

  Mantén `SIGESTEC_STORAGE_PROVIDER=drive` para subir los nuevos adjuntos a Drive.
- Reinicia Spring Boot. La descarga de los originales se buscará primero en `SIGESTEC_STORAGE_DIR` y después en `SIGESTEC_STORAGE_DIR_ANTERIOR`.
- Si conservas solo las fotos originales de WhatsApp y no los archivos con UUID, no basta con mover las fotos sin más: tendrás que asociar cada imagen a su referencia exacta (etapa y UUID), con una copia de seguridad antes de cambiar nada.
- Si las fotos originales fueron eliminadas y no hay copia, **ningún cambio de frontend puede recuperarlas**.

## Instalación
1. Haz una copia de los proyectos actuales.
2. Usa el ZIP frontend corregido como reemplazo de la carpeta del frontend o aplica el parche manteniendo las rutas originales.
3. Reinicia Angular (`npm install` y `npm start`) y recarga con Ctrl+Shift+R.
4. Usa el ZIP backend corregido o aplica los 3 archivos del parche; reinicia Spring Boot.
5. Abre `/conformidades` y `/compras` para revisar ojo/lápiz y ausencia de flecha; abre `/ejecuciones/ver/1` para revisar la vista previa.

## Límites de verificación
El código fue inspeccionado y los ZIP comprobados, pero no se ejecutó contra la base de datos Oracle ni el Google Drive privado del usuario.
