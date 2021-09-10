const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const port = 5000;
const dbName = "electroUser";
const dbPass = "DPZk6w8yqqqOLe9T";
const { MongoClient } = require("mongodb");
const fileUpload = require("express-fileupload");
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y25ks.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// need to initialize the file upload
app.use(express.static("articleImg"));
app.use(fileUpload());

client.connect((err) => {
	const categoryName = client.db("newsportal").collection("category");
	const ArticleDB = client.db("newsportal").collection("news");
	const AdminDB = client.db("newsportal").collection("admin");

	app.post("/addCategory", (req, res) => {
		const categoryItem = req.body;
		categoryName
			.insertOne(categoryItem)
			.then((result) => {
				res.send(result.insertedCount > 0);
			})
			.then((err) => {
				console.log(err);
			});
	});

	app.post("/addAdmin", (req, res) => {
		const admin = req.body;
		AdminDB.insertOne(admin)
			.then((result) => {
				res.send(result.insertedCount > 0);
			})
			.then((err) => {
				console.log(err);
			});
	});

	app.post("/addArticle", (req, res) => {
		let number = Math.random() * 10000000000;
		let floorNumber = Math.floor(number);

		const imgFile = req.files.articleImg;
		const category = req.body.category;
		const article = req.body.article;
		const details = req.body.details;
		const key = `${category}_${floorNumber}`;
		const image = `${category}_${imgFile.name}`;

		imgFile.mv(`${__dirname}/articleImg/${category}_${imgFile.name}`);

		ArticleDB.insertOne({
			key,
			category,
			article,
			details,
			image,
		})
			.then((result) => {
				res.send(result.insertedCount > 0);
			})
			.then((err) => {
				console.log(err);
			});
	});

	app.get("/category", (req, res) => {
		categoryName.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

  app.get("/article", (req, res) => {
		ArticleDB.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

  app.get('/article/:key',(req, res) => {
		ArticleDB.find({key: req.params.key}).toArray((err, documents) => {
			res.send(documents);
		});
	})
  app.get('/category/:name',(req, res) => {
		ArticleDB.find({category: req.params.name}).toArray((err, documents) => {
			res.send(documents);
		});
	})

	app.get('/admin/:email',(req, res) => {
		AdminDB.find({admin: req.params.email}).toArray((err, documents) => {
			res.send(documents);
		});
	})

  

	console.log("database connected");
});

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(process.env.PORT || port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
