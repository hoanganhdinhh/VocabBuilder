const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
global.Vocab = require('./api/models/vocabModel');
require('./api/models/userModel');
const vocabRoutes = require('./api/routes/vocabRoutes');
const userRoutes = require('./api/routes/userRoutes');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://userid:userid@fgwweb2.7tpqwou.mongodb.net/?appName=FGWWeb2',
  { useNewUrlParser: true }
);

const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

vocabRoutes(app);
userRoutes(app);
app.listen(port);
app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

console.log(`Server started on port ${port}`);