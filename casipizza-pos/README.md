# CasiPizza POS

App de toma de órdenes para CasiPizza, con historial y desglose por
método de pago para la contabilidad.

## Desplegar en Vercel

1. Subí esta carpeta a un repo de GitHub (o arrastrá los archivos
   directo a Vercel si preferís no usar GitHub — Vercel te deja
   importar una carpeta local).
2. En [vercel.com](https://vercel.com), importá el proyecto.
3. **Antes o después del primer deploy**, andá a la pestaña
   **Storage** del proyecto en Vercel → **Create Database** →
   elegí **KV** → conectala a este proyecto.
   Esto agrega automáticamente las variables de entorno
   `KV_REST_API_URL` y `KV_REST_API_TOKEN` — no hay que copiar
   nada a mano.
4. Volvé a desplegar (Vercel lo hace solo si conectás el KV
   después del primer deploy, o dale "Redeploy" desde el dashboard).
5. Abrí la URL que te da Vercel en el iPad, desde Safari.
6. Para que se sienta como app nativa: en Safari tocá **Compartir**
   → **Agregar a pantalla de inicio**. Va a quedar como un ícono
   más, y abre a pantalla completa sin la barra del navegador.

## Probar en tu compu antes de desplegar (opcional)

```bash
npm install
npm run dev
```

Para probar localmente necesitás igual una base de KV conectada
(Vercel te deja "pull-ear" las variables de entorno con
`vercel env pull` una vez que la conectaste en el dashboard).

## Editar el menú

Abrí `app/components/CasiPizzaPOS.js` y modificá el arreglo `MENU`
al inicio del archivo — ahí están todos los nombres y precios.

## Nota sobre acceso

Esta URL, una vez desplegada, es pública — cualquiera con el link
puede abrir el POS y ver el historial de órdenes. Si te preocupa
que alguien más la encuentre, avisame y le agregamos un código de
acceso simple antes de que la compartás con más gente.
