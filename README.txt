1. Creamos el repositorio local.

```bash
git init
git add .
git commit -m "build"
```

2. Subimos el repo a github

```bash
gh repo create
gh repo list
```

3. Creamos una app para desplegar

```bash
npm i express
npm install express
```

```js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Hola mundo");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
```

4. Añadimos `node_modules` al `.gitignore`
5. Testeamos si la app funciona

```bash
node server.js
curl localhost:3000
```

6. Lanzamos nuestros VPS y creamos los secretos de github

```
SSH_HOST=ip
SSH_USER=usuario
SSH_PASSWORD=contraseña
```

7. Clonamos el repo en el VPS

```bash
git clone <URL>
```

8. Actualizamos el VPS y descargamos las dependencias

```bash
apt update
apt install nodejs npm -y
npm install -g pm2
```

9. Instalamos dependencias de npm y probamos a lanzar la app

```bash
cd <repo>
npm install
node server.js
curl <ip>:3000
```

10. Usamos `pm2` para lanzar la app en segundo plano

```bash
pm2 start server.js --name <nombre>
```

11. Comenzamos a crear el deploy, creamos la carpeta `.github` y dentro otra carpeta llamada `workflows`, por ultimo, dentro, creamos `deploy.yml`

```bash
.github/
└── workflows
    └── deploy.yml
```
