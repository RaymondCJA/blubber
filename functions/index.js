const functions = require('firebase-functions');
// our function getBlubs() needs access to the database, using adven sdk
const admin = require('firebase-admin'); // to use this admin, we need to initalise our appliation as below
admin.initializeApp(); // usually for the method we will pass an appliciation into it, but this project already knows that .firebaserc has the project id inside it

const express = require('express');
const app = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hi Pal!");
});

// try to fetch blubs from database to here
exports.getBlubs = functions.https.onRequest((req, res) => {
  admin.firestore().collection('blubs').get()
      .then(data => {
        let blubs = [];
        data.forEach(doc => {
          blubs.push(doc.data());
        });
        return res.json(blubs);
      })
      .catch(err => console.error(err));
});

// now we create another function that creates documents (THIS DOES NOT WORK)
exports.createBlub = functions.https.onRequest((req, res) => {
    if(req.method !== 'POST') {
      return res.status(400).json({ error: 'Method not allowed' });
    }
    const newBlub = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin
      .firestore()
      .collection('blubs')
      .add(newBlub)
      .then((doc) => {
        res.json({ message: `document ${doc.id} created successfully` });
      })
      .catch((err) => {
        res.status(500).json({ error: 'something went wrong, pal' });
        console.error(err);
      });
});