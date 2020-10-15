const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileupload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ovcmn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());

app.use(express.static('orderImg'));
app.use(fileupload());

const port = 4000;

app.get('/', (req, res) => {
  res.send('db working')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("creativeAgency").collection("services");
  const OrderCollection = client.db("creativeAgency").collection("OrderInfo");
  const customarReviewCollection = client.db("creativeAgency").collection("customarReview");


  // add services fakedata to database
  app.post("/addServicesData", (req, res) => {
    const services = req.body;
    servicesCollection.insertMany(services)
      .then(result => {
        res.send(result.insertedCount)
      })
  })

  // all data recive
  app.get('/allServicesData', (req, res) => {
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // placed order info
  app.post("/PlecedOrderInfo", (req, res) => {
    const order = req.body;
    OrderCollection.insertOne(order)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })



  // personal or exact order info
  app.get('/exactUserOrder', (req, res) => {
    OrderCollection.find({ email: req.query.email })
      .toArray((err, document) => {
        res.send(document);
      })
  })



  // add clients/review fakedata to database
  app.post("/addClicntData", (req, res) => {
    const client = req.body;
    customarReviewCollection.insertMany(client)
      .then(result => {
        res.send(result.insertedCount)
      })
  })


  //  customar review and img upload db
  app.post('/customarReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const surName = req.body.surName;
    const discription = req.body.discription;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
    customarReviewCollection.insertOne({ name, surName, discription, image })
      .then(result => {
        res.send(result.insertedCount > 0)

      })
  })



  // customar review recive
  app.get('/reviewApprove', (req, res) => {
    customarReviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })



  // all services user data recive
  app.get('/servicesUserList', (req, res) => {
    OrderCollection.find({})
      .toArray((err, document) => {
        res.send(document);
      })
  })


  // insert service
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const discription = req.body.discription;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    servicesCollection.insertOne({ title, discription, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  // add new admin
  app.post("/addAdmin", (req, res) => {
    const admin = req.body;
    servicesCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })



});


app.listen(process.env.PORT || port);