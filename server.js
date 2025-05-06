require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const exec = require('child_process').exec;

const app = express();
const PORT = 3000;

// Configuración de variables de entorno
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretoSuperSeguro',
  resave: false,
  saveUninitialized: false
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// Configurar estrategia de GitHub
passport.use(new GitHubStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    if (profile.username === 'Xelofrost') {
      return done(null, profile);
    }
    return done(null, false);
  }
));

// Serialización del usuario
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Middleware de autenticación modificado
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.send('Acceso restringido. Por favor <a href="/auth/github">inicia sesión con GitHub</a>');
};

// Rutas de autenticación
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/run-script');
  });

// Ruta principal
app.get('/', (req, res) => {
  res.send('Quiero dos cafés<br><br>'
    + '<a href="/run-script">Ejecutar script</a><br>'
    + '<a href="/auth/github">Iniciar sesión con GitHub</a>');
});

// Ruta protegida: Ejecutar script
app.get("/run-script", ensureAuthenticated, (req, res) => {
  exec("touch test", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error de ejecución: ${error}`);
      return res.status(500).send(`
        Error ejecutando el script<br>
        <a href="/">Volver al inicio</a>
      `);
    }
    res.send(`
      Script ejecutado correctamente<br>
      <pre>${stdout || 'Completado sin salida'}</pre>
      <a href="/">Volver al inicio</a>
    `);
  });
});

// Ruta protegida: Reconocimiento
app.post("/recon", ensureAuthenticated, (req, res) => {
  const domain = req.body.domain || req.query.domain;
  const APIKEY = req.body.APIKEY || req.query.APIKEY;

  if (!APIKEY || APIKEY !== "123456") {
    return res.status(401).send(`
      APIKEY inválida<br>
      <a href="/">Volver al inicio</a>
    `);
  }

  if (!domain) {
    return res.status(400).send(`
      Dominio no especificado<br>
      <a href="/">Volver al inicio</a>
    `);
  }

  exec(`./recon.sh ${domain} > resultados`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error de reconocimiento: ${error}`);
      return res.status(500).send(`
        Error en el reconocimiento<br>
        <a href="/">Volver al inicio</a>
      `);
    }
    res.send(`
      Reconocimiento completado<br>
      <pre>${stdout || 'Proceso finalizado'}</pre>
      <a href="/">Volver al inicio</a>
    `);
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`
    ¡Error interno del servidor!<br>
    <a href="/">Volver al inicio</a>
  `);
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});