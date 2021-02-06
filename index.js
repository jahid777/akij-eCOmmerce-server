const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectId;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7adfu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('products'));
app.use(fileUpload());

// const port = 8000;
const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("it is working");
});



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const shopCollection = client.db("rahimShop").collection("rahimProduct");

  //all fakedata
  app.post('/addProduct',(req,res)=> {
    const product = req.body;
    shopCollection.insertMany(product)
    .then(result =>{
        res.send(result.insertedCount)
    })
   })


  //add a product from createProduct page with image
  // app.post('/addAProduct',(req,res)=> {
  //   const file = req.files.file;
  //   const name= req.body.name;
  //   const date = req.body.date;
  //   const price = req.body.price;
  //   shopCollection.insertOne({file, name, date, price})
  //   .then((result) => {
  //     res.send(result.insertedCount > 0);
  //   });
  //   file.mv(`${__dirname}/products/${file.name}`,err =>{
  //     if(err){
  //       console.log(err)
  //       return res.status(500).send({msg:"can not upload"});
  //     }
  //     return res.send({name: file.name, path: `/${file.name}`})
  //   })  
  //  })


//this is for 64bit with image so that it can store in mongodb + it will go heroku comfortably 
  app.post('/addAProduct', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const date = req.body.date;
    const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    shopCollection.insertOne({ name, date, price,image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
})



   //sobgula data read korabo
   app.get('/getALlData',(req, res)=>{
     const search = req.query.search;
    shopCollection.find({name: {$regex: search}}).toLowerCase()
    // shopCollection.find({})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  });


  //allProductControl component ar jonno  sob ghula data read
  app.get('/getALlDataForUpdate',(req, res)=>{
   shopCollection.find({})
   .toArray((err,documents)=>{
     res.send(documents);
   })
 });




  //delete korer jonno allProductControl theke
  app.delete('/deleteProduct/:id', (req, res)=>{
    shopCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then( result =>{
      // console.log(result);
      (result.deletedCount > 0) 
    })
  });


  //single product read korer jonno jey card ar btn click krsi
  app.get('/singleProduct/:id',(req, res)=>{
    shopCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err,documents)=>{
      res.send(documents[0]);
    })
  })

  //update korer jonno product 
  app.patch('/update/:id',(req, res)=>{
    shopCollection.updateOne({_id: ObjectId(req.params.id)},
    {
      $set: {name:req.body.name, price: req.body.price, date: req.body.date}
    })
    .then(result=>{
      console.log(result);
    })
  })



  
});


app.listen( port,()=>console.log(`connected database server${port}`));
// app.listen(process.env.PORT || port);