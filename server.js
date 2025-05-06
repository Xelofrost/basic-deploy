require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const exec = require('child_process').exec;

const app = express();
const PORT = 3000;

// Configuración
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.use(session({
  secret: process.env.SESSION_SECRET || 'secretoSuperSeguro',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// Estrategia GitHub
passport.use(new GitHubStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://172.233.109.222:3000/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    profile.username === 'Xelofrost' ? done(null, profile) : done(null, false);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Middleware de autenticación
const ensureAuth = (req, res, next) => {
  req.isAuthenticated() ? next() : res.send('Acceso restringido. <a href="/auth/github">Iniciar sesión</a>');
};

// Rutas
app.get('/', (req, res) => {
  res.send('Quiero dos cafés<br>'
    + '<a href="/run-script">Ejecutar script</a><br>'
    + '<a href="/auth/github">Login</a>');
});

app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => res.redirect('/welcome')
);

// Nueva ruta de bienvenida
app.get('/welcome', ensureAuth, (req, res) => {
  res.send(`Bienvenido ${req.user.username}<br>`
    + '<a href="/run-script">Ejecutar script</a><br>'
    + '<a href="/">Inicio</a>');
});

// Ruta protegida modificada
app.get("/run-script", ensureAuth, (req, res) => {
  exec("touch test", (error, stdout, stderr) => {
    const output = error ? `Error: ${error}` : `Éxito: ${stdout || 'Comando ejecutado'}`;
    res.send(`Hola ${req.user.username}!<br>${output}<br>`
      + '<a href="/welcome">Volver</a>');
  });
});

// Ruta recon (sin cambios)
app.post("/recon", ensureAuth, (req, res) => {
  const { domain, APIKEY } = req.body;
  
  if (APIKEY !== "123456") return res.send('APIKEY inválida<br><a href="/">Inicio</a>');
  if (!domain) return res.send('Dominio requerido<br><a href="/">Inicio</a>');

  exec(`./recon.sh ${domain} > resultados`, (error, stdout, stderr) => {
    const output = error ? `Error: ${error}` : `Resultado: ${stdout || 'Completado'}`;
    res.send(`${output}<br><a href="/welcome">Volver</a>`);
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.send('Error interno <br><a href="/">Inicio</a>');
});

app.listen(PORT, () => console.log(`Servidor activo: http://localhost:${PORT}`));