const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');

const imageStorage = multer.diskStorage({
    // Destination to store image     
    destination: './images', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
            // file.fieldname is name of the field (image)
            // path.extname get the uploaded file extension
    }
});

const imageUpload = multer({
    storage: imageStorage,
    limits: {
      fileSize: 1000000 // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg)$/)) { 
         // upload only png and jpg format
         return cb(new Error('Please upload a Image'))
       }
     cb(undefined, true)
  }
}) 

const app = express();

app.use(express.json());
app.use(cors({ credentials: true }))


require('dotenv').config();

const DB_TABLE = process.env.DB_TABLE_NAME


const DB = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    port : 3306
})

DB.connect()

// Create Inital Tables upon start updated another update

const initialQuery = `CREATE TABLE IF NOT EXISTS ${DB_TABLE} (
    id INT PRIMARY KEY UNIQUE AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL
)`
DB.query(initialQuery, (err) => {
    if (err) throw err;
    console.log("Created inital table")
});

app.use('/images', express.static(__dirname + '/images'));

app.get('/pastproject/:id', (req, res) => {
    QUERY = `SELECT * FROM ${DB_TABLE} WHERE id = ${req.params.id}`
    DB.query(QUERY, (err, result) => {
        if (err) throw err;

        res.send(result)
    })
});

app.put('/pastproject/:id', imageUpload.array('images', 3), (req, res) => {
    const update = {
        title : req.body.title, 
        path : req.files[0].path 
    }
    QUERY = `UPDATE ${DB_TABLE} SET ? WHERE id = ${req.params.id}`
    DB.query(QUERY, update, (err, result) => {
        if (err) throw err;
        res.send(result)
    });
});

app.delete('/pastproject/:id', (req, res) => {
    QUERY = `DELETE FROM ${DB_TABLE} WHERE id = ${req.params.id}`
    DB.query(QUERY, (err, result) => {
        if (err) throw err;
        res.send(result)
    })
});

app.get('/pastprojects/all', (req, res) => {
    const QUERY = `SELECT * FROM ${DB_TABLE}`
    DB.query(QUERY, (err, result) => {
        if (err) throw err;
        res.send(result)
    });
});

app.post('/pastprojects/create', imageUpload.array('images', 3), (req, res) => {

    const upload = {
        title : req.body.text,
        path : "http://localhost:4000/" + req.files[0].path + ".png"
    }

    const QUERY = `INSERT INTO ${DB_TABLE} SET ?`
    
    DB.query(QUERY, upload, (err, row) => {
        if (err) throw err;

        console.log(row)

        res.send(row)
    })

    res.send(upload)
})

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port : ${process.env.SERVER_PORT}`)
});
