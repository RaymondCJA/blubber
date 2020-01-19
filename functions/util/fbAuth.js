const { admin, db } = require('./admin');

// tip for express: we can pass a second argument to any route, a function which does something, that intercepts the request and then does smth depending on what the request has, and decides whether to proceed to our handler
// or to stop there and send a response (aka a middleware),
// so just add the method as middleware for every protected route we use
module.exports = (req, res, next) => { //  next: if we return it and call it as a function, its gonna proceed to our handler. we can chain as many middleware as we need
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
      console.error('No token found.')
      return res.status(403).json({ error: 'Unauthorized request, pal.'});
    }
  
    admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db.collection('users')
      .where('userId', '==', req.user.uid)
      .limit(1)
      .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      req.user.imageUrl = data.docs[0].data().imageUrl;
      return next();
    })
    .catch(err => {
      console.error('Error while verifying token', err);
      return res.status(403).json(err)
  ;  })
  }
  