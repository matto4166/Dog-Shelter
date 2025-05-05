const express = require("express");
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");

require("dotenv").config({ path: path.resolve(__dirname, '.env') });
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "CMSC335DB", collection: "dogShelter"};

const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

const app = express(); 
const portNumber = 5000;

const adopt = require("./routes/adopt");

const webServer = http.createServer(app);
webServer.listen(portNumber);
console.log(`Web server is running at http://localhost:${portNumber}`);

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.use("/adopt", adopt);

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/pendingApplications", async (req, res) => {
    await client.connect();

    let applications = await lookUpManyApplications(client, databaseAndCollection);
    let result = "";

    if (applications.length === 0) {
        result = "No applications found";
    } else {
        applications.forEach(element => result += `Name: ${element.name}<br>Breed: ${element.breed}<br><img src=${element.photoUrl}><br><a href=${element.photoUrl}>${element.photoUrl}</a><br><br>`);
    }

    const variables = {
        string: result
    }

    res.render("pendingApplications", variables);
})

app.get("/gallery", (req, res) => {
    res.render("gallery");
})

app.get("/contact", (req, res) => {
    res.render("contact");
});

async function lookUpManyApplications(client, databaseAndCollection) {
    let filter = {};
    const cursor = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find(filter);
    const result = await cursor.toArray();
    return result;
}