const { db } = require("../util/admin");

exports.getAllBlubs = (req, res) => {
  db.collection("blubs")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let blubs = [];
      data.forEach(doc => {
        blubs.push({
          blubId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(blubs);
    })
    .catch(err => console.error(err));
};

exports.postOneBlub = (req, res) => {
  //BECAUSE OF THE FBAuth middleware, by the time we reach the line below, the user has already been authenticated by the FBAuth function
  if (req.body.body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty" });
  }

  const newBlub = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString()
  };

  db.collection("blubs")
    .add(newBlub)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong, pal" });
      console.error(err);
    });
};
