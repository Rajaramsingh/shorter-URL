const express = require("express");
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser')

const { connectToMongoDB } = require("./connection");
const {restrictToLoggedinUserOnly} = require('./middlewares/auth')
const URL = require('./models/url');

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter')
const userRoute = require('./routes/user')


const PORT = 8001;

connectToMongoDB('mongodb://localhost:27017/short-url')
    .then(() => console.log('mongoDB connected'));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());

app.use(express.urlencoded({extended:false}))
app.use(cookieParser());

app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/",staticRoute)
app.use("/user",userRoute);

app.get('/url/:shortId', async (req, res) => {
    try {
        const shortId = req.params.shortId;
        const entry = await URL.findOneAndUpdate(
            { shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now(),
                    },
                },
            },
             
        );

        if (!entry) {
            return res.status(404).send('URL not found');
        }

        if (!entry.redirectURL) {
            return res.status(500).send('Redirect URL not found');
        }

        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => console.log(`server started at PORT:${PORT}`));
