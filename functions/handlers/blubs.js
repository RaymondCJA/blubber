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
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };

  db.collection("blubs")
    .add(newBlub)
    .then(doc => {
      const resBlub = newBlub;
      resBlub.blubId = doc.id;
      res.json(resBlub);
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong, pal" });
      console.error(err);
    });
};

exports.getBlub = (req, res) => {
  let blubData = {};
  db.doc(`/blubs/${req.params.blubId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Blub not found" });
      }
      blubData = doc.data();
      blubData.blubId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("blubId", "==", req.params.blubId)
        .get();
    })
    .then(data => {
      blubData.comments = [];
      data.forEach(doc => {
        blubData.comments.push(doc.data());
      });
      return res.json(blubData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Comment on a blub
exports.commentOnBlub = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ error: "Must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    blubId: req.params.blubId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/blubs/${req.params.blubId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Blub not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 }); //THIS ADDS 1 INSTEAD OF ADDING 1
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "something went wrong" });
    });
};

exports.likeBlub = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("blubId", "==", req.params.blubId)
    .limit(1);

  const blubDocument = db.doc(`/blubs/${req.params.blubId}`);

  let blubData;

  blubDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        blubData = doc.data();
        blubData.blubId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Blub not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            blubId: req.params.blubId,
            userHandle: req.user.handle
          })
          .then(() => {
            blubData.likeCount++;
            return blubDocument.update({ likeCount: blubData.likeCount });
          })
          .then(() => {
            return res.json(blubData);
          });
      } else {
        return res.status(400).json({ error: "Blub already liked" });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeBlub = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("blubId", "==", req.params.blubId)
    .limit(1);

  const blubDocument = db.doc(`/blubs/${req.params.blubId}`);

  let blubData;

  blubDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        blubData = doc.data();
        blubData.blubId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Blub not found" });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: "Blub not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            blubData.likeCount--;
            return blubDocument.update({ likeCount: blubData.likeCount });
          })
          .then(() => {
            res.json(blubData);
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// delete a blub
exports.deleteBlub = (req, res) => {
  const document = db.doc(`/blubs/${req.params.blubId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Blub not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorised" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "Blub deleted successfully" });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
