const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './images')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })

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
    port : process.env.DB_PORT
})

DB.connect()

// Create Inital Tables upon start updated another update

const initialQuery = `CREATE TABLE IF NOT EXISTS ${DB_TABLE} (
    id INT PRIMARY KEY UNIQUE AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    paragraph_one TEXT NOT NULL,
    paragraph_two TEXT NOT NULL,
    tech_used VARCHAR(255) NOT NULL,
    project_live BOOLEAN NOT NULL,
    project_link VARCHAR(255),
    github_live BOOLEAN NOT NULL,
    github_link VARCHAR(255),
    image1_path VARCHAR(255) NOT NULL,
    image2_path VARCHAR(255) NOT NULL,
    image3_path VARCHAR(255) NOT NULL,
    carousel BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`
DB.query(initialQuery, (err) => {
    if (err) throw err;
    console.log("Created inital table")
});

app.use('/images', express.static(__dirname + 'api/images'));

app.get('/pastproject/:id', (req, res) => {
    QUERY = `SELECT * FROM ${DB_TABLE} WHERE id = ${req.params.id}`
    DB.query(QUERY, (err, result) => {
        if (err) throw err;

        res.send(result)
    })
});

app.put('/pastproject/:id', upload.array('images', 3), (req, res) => {
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

app.post('/create', upload.array('images', 3), (req, res) => {
    const qr = `INSERT INTO ${DB_TABLE} SET ?`
    console.log("Server is here")
    if (req.body.carousel == 'true') {
        var carousel = 1
    } else {
        var carousel = 0
    }

    var set = {
        title : req.body.title,
        github_link : req.body.github_link,
        image1_path : req.files[0].path,
        carousel : carousel
    }

    DB.query(qr, set, (err, result) => {
        if (err) throw err;
        console.log(result)
    });

    res.send(set)

})

app.post('/pastprojects/create', upload.array('images', 3), (req, res) => {
    var fileCount = req.body.fileCount
    console.log(fileCount)
    if (fileCount == 3){

        if (req.body.carousel == 'true') {
            var carousel = 1
        } else {
            var carousel = 0
        }

        if (req.body.project_live == 'true') {
            var project_live = 1
        } else {
            var project_live = 0
        }

        if (req.body.github_live == 'true') {
            var github_live = 1
        } else {
            var github_live = 0
        }

        var input = {
            title : req.body.title,
            paragraph_one : req.body.paragraph_one,
            paragraph_two : req.body.paragraph_two,
            tech_used : req.body.tech_used,
            project_live : project_live,
            project_link : req.body.project_link,
            github_live : github_live,
            github_link : req.body.github_link,
            image1_path : req.files[0].path,
            image2_path : req.files[1].path,
            image3_path : req.files[2].path,
            carousel : carousel,
            ID : 0
        }

    } if (fileCount == 2){

        if (req.body.carousel == 'true') {
            var carousel = 1
        } else {
            var carousel = 0
        }

        if (req.body.project_live == 'true') {
            var project_live = 1
        } else {
            var project_live = 0
        }

        if (req.body.github_live == 'true') {
            var github_live = 1
        } else {
            var github_live = 0
        }

        var input = {
            title : req.body.title,
            paragraph_one : req.body.paragraph_one,
            paragraph_two : req.body.paragraph_two,
            tech_used : req.body.tech_used,
            project_live : project_live,
            project_link : req.body.project_link,
            github_live : github_live,
            github_link : req.body.github_link,
            image1_path : req.files[0].path,
            image2_path : req.files[1].path,
            carousel : carousel,
            ID : 0
        }

    } if (fileCount == 1) {

        if (req.body.carousel == 'true') {
            var carousel = 1
        } else {
            var carousel = 0
        }

        if (req.body.project_live == 'true') {
            var project_live = 1
        } else {
            var project_live = 0
        }

        if (req.body.github_live == 'true') {
            var github_live = 1
        } else {
            var github_live = 0
        }

        var input = {
            title : req.body.title,
            paragraph_one : req.body.paragraph_one,
            paragraph_two : req.body.paragraph_two,
            tech_used : req.body.tech_used,
            project_live : project_live,
            project_link : req.body.project_link,
            github_live : github_live,
            github_link : req.body.github_link,
            image1_path : req.files[0].path,
            carousel : carousel,
            ID : 0
        }

    }


    const QUERY = `INSERT INTO ${DB_TABLE} SET ?`
    
    DB.query(QUERY, input, (err, row) => {
        if (err) throw err;

        var ID = row.insertId
        input["ID"] = ID
        res.send(input)
    })
})

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port : ${process.env.SERVER_PORT}`)
});
