const express = require("express");
const router = express.Router();
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, '.env') });
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "CMSC335DB", collection: "dogShelter"};

const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const app = express(); 

app.use(express.static("public"));

router.get("/", (req, res) => {
    const variables = {
        form: `http://localhost:5000/adopt/processAdoption`
    }

    res.render("adopt", variables);
});

router.post("/processAdoption", async (req, res) => {
    await client.connect();

    const variables = {
        name: req.body.name,
        breed: req.body.preference,
        photoUrl: req.body.photoUrl
    }

    await insertAdoptionApplication(client, databaseAndCollection, variables);
    res.render("processAdoption", variables);
})

async function insertAdoptionApplication(client, databaseAndCollection, newApplication) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newApplication);
}

module.exports = router;