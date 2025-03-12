const express = require('express');
const exec = require('child_process').exec;
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Quiero dos cafés');
});

app.get("/run-script", (req, res) => {
  exec("touch test", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.send("Script executed");
  });
});

app.post("/recon", (req, res) => {
  console.log("Received request to /recon");
  const domain = req.body.domain || req.query.domain;
  const APIKEY = req.body.APIKEY || req.query.APIKEY;
  if (APIKEY !== "123456") {
    return res.status(401).send("Unauthorized");
  }
  exec(`./recon.sh ${domain} > resultados`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.send("Script executed");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
