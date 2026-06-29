# Catálogo J&Co

Las nueve imágenes se generan con DALL-E 3 para el fondo fotográfico y Sharp para aplicar el overlay institucional y exportar PNG de 1080 x 1080 px.

## Regenerar

Desde la raíz del repositorio:

```powershell
npm install
$env:OPENAI_API_KEY = "tu-api-key"
npm run catalogo
```

En macOS o Linux, configura la clave con `export OPENAI_API_KEY="tu-api-key"`.

El script omite los PNG que ya existen. Para regenerar una tarjeta concreta, elimina únicamente ese archivo y vuelve a ejecutar `npm run catalogo`.

La clave se lee exclusivamente desde la variable de entorno `OPENAI_API_KEY`; no se guarda en el repositorio.
