var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

/* GET home page. */
router.get('/index', function(req, res, next) {
  res.render('index', { title: 'index' });
});

/* GET users listing. */
router.get('/HP', function(req, res, next) {
  res.render('HP', { title: 'HP' });
});

module.exports = router;
