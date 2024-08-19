const express = require('express')
const app = express()

const searchRoute = require('./routes/search');
const episodesListRoute = require('./routes/episodesList');
const serversListRoute = require('./routes/serversList');
const sourceRoute = require('./routes/source');
app.use(searchRoute);
app.use(episodesListRoute);
app.use(serversListRoute);
app.use(sourceRoute);

app.get('/', (req, res) =>{
    res.send("Api is on service !");
});

app.listen(3000)