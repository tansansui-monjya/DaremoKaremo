var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

/* GET home page. */
router.get('/alien', function(req, res, next) {
  res.render('index', { title: 'alien' });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('HP', { title: 'HP' });
});

router.get('/waiting', function(req, res, next) {
  res.render('Waiting', { title: 'wait' });
});

module.exports = router;
