const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.set ('view engine', 'ejs');

//conexión a la bases de datos
async function getConnection() {
  //creary configurar la conexion
  const connection = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.PASS,
    database: process.env.DATABASE,
  });

  connection.connect();
  return connection;
}

const port = 3001;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get('/listprojects', async (req, res) => {
  const conn = await getConnection();
  const queryProject =
    'SELECT * FROM projects INNER JOIN autor ON autor.idAutor = projects.fk_autor';
  const [result] = await conn.query(queryProject);
  conn.end();
  res.json({
    msj: 'todo OK hechicera',
    data: result,
  });
});

app.post('/createproject', async (req, res) => {
  const body = req.body;
  const queryAutor = `INSERT INTO autor (nameAutor, jobAutor, imageAutor) VALUES (?, ?, ?);`;
  const queryProject = `INSERT INTO projects (nameProject, sloganProject, urlGit, urlDemo, techProject, descProject, imageProject,fk_autor) VALUES (?,?,?,?,?,?,?,?);`;
  const conn = await getConnection();
  const [result] = await conn.query(queryAutor, [
    body.autor,
    body.job,
    body.image,
  ]);
  const idAutor = result.insertId;

  let idProject = '';
  let result2 = [];
  if (idAutor) {
    result2 = await conn.query(queryProject, [
      body.name,
      body.slogan,
      body.repo,
      body.demo,
      body.technologies,
      body.desc,
      body.photo,
      idAutor,
    ]);
    console.log(result2[0]);
  }
  idProject = result2[0].insertId;
  res.json({
    cardURL: 'http://localhost:3001/project/' + idProject,
    success:true
  });
  conn.end();
});

app.get('/project/:idProject', async (req, res) => {
  const id = req.params.idProject;
  const selectProject =
    'SELECT * FROM projects INNER JOIN autor ON autor.idAutor = projects.fk_autor WHERE idProject =?';
    const conn =await getConnection();
    const [results] = await conn.query(selectProject, [id]);
    if (results.length === 0){
      res.render('notFound');
    }else{
      res.render('detailProject',{
        project: results [0]

      });
    }
    console.log(results[0])
    conn.end();
});

const staticServerPath = './srcc/public-react/';
app.use(express.static(staticServerPath));

const pathServerPublicStyles = './srcc/public-css';
app.use(express.static(pathServerPublicStyles));
