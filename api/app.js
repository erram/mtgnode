/**
 * MTGNode Express Application
 * ============================
 *
 * Main application serving the REST API.
 */
var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    middlewares = require('./middlewares.js'),
    validate = middlewares.validate,
    compendium = require('./model/compendium.js'),
    users = new (require('./model/user.js'))(false)
    fs = require('fs');

/**
 * Application definition
 */
var app = express();
if (process.env.NODE_ENV !== 'test')
  app.use(morgan('dev'));

app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(cookieParser());
app.use(session({
  secret: 'shawarma',
  trustProxy: false,
  resave: true,
  saveUninitialized: true
}));

/**
 * Home & Static
 */
app.get('/', function(req, res) {
  fs.readFile(__dirname + '/../index.html', 'utf-8', function(err, data) {
    return res.status(200).send(data);
  });
});

app.use('/public', express.static(__dirname + '/../public'));


/**
 * Cards Router
 */
var cardRouter = express.Router();

// Retrieving a single card by id
cardRouter.get('/card/:id',
  validate({id: 'string'}),
  function(req, res) {
    var card = compendium.getCardById(+req.param('id'));

    if (!card)
      return res.status(404).send('Not Found');
    else
      return res.json(card);
  }
);

// Retrieving a batch of cards by id
cardRouter.post('/cards',
  validate({cards: 'array'}),
  function(req, res) {
    return res.json(compendium.getCardsById(req.param('cards')));
  }
);


/**
 * User Router
 */
var userRouter = express.Router();

// Creating a user
userRouter.post('/:name',
  validate({name: 'string'}),
  function(req, res) {
    users.create(req.param('name'), function(err, user) {
      return res.json(user);
    });
  }
);

// Getting a user
userRouter.get('/:name',
  validate({name: 'string'}),
  function(req, res) {
    var user = users.get(req.param('name'));

    if (!user)
      return res.status(400).send('Not Found');
    else
      return res.json(user);
  }
);

/**
 * Registrations
 */
app.use(cardRouter);
app.use('/user', userRouter);


/**
 * Exporting
 */
module.exports = app;