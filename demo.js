const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://handicrafts:test123@cluster0.uohcfax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(uri);

    try {
        // Connect to the Mongodb cluster
        await client.connect();
        console.log("Connected to MongoDB");

        // Example of calling the finding function
        const exampleData = { username: "testuser" };
        const results = await finding(client, exampleData, 'user');
        console.log("Results:", results);

    } catch (e) {
        console.error("An error occurred in main:", e);
    } finally {
        // Close the connection to the Mongodb cluster
        await client.close();
        console.log("Connection closed");
    }
}

main().catch(console.error);

async function finding(client, data, coll) {
    try {
        console.log("Data passed to finding function:", data);
        const cursor = client.db("Medi").collection(coll).find(data);
        const results = await cursor.toArray();
        if (results.length > 0) {
            return results; // Return the results if found
        } else {
            console.log("No data found.");
            return null; // Explicitly return null when no data is found
        }
    } catch (error) {
        console.error("An error occurred in finding:", error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}
async function findall(client, coll) {
    try {
        const cursor = client.db("Medi").collection(coll).find({});
        const results = await cursor.toArray();
        if (results.length > 0) {
            return results; // Return the results if found
        } else {
            console.log("No data found.");
            return null; // Explicitly return null when no data is found
        }
    } catch (error) {
        console.error("An error occurred in finding:", error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}
async function deleting(client, alertId, coll) {
    try {
        const result = await client.db("Medi").collection(coll).deleteOne({ _id: new ObjectId(alertId) });
        if (result.deletedCount === 1) {
            console.log(`Successfully deleted alert with id: ${alertId}`);
            return true;
        } else {
            console.log(`No alert found with id: ${alertId}`);
            return false;
        }
    } catch (error) {
        console.error("An error occurred in deleting:", error);
        throw error; // Re-throw the error for handling in the calling function
    }
}

async function inserting(client, newListing, coll) {
    try {
        const result = await client.db("Medi").collection(coll).insertOne(newListing);
        console.log(`New User created with the following id: ${result.insertedId}`);
        return result.insertedId; // Optionally return the inserted ID
    } catch (error) {
        console.error("An error occurred in inserting:", error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

module.exports = { inserting, finding ,findall,deleting};
