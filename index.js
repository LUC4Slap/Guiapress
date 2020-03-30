const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session
app.use(session({
    secret: "sndflknsafkskjqweijwliejr",
    cookie: {
        maxAge: 30000000
    }
}))

// Router Categories
const categoriesController = require("./categories/CategoriesController");
app.use("/",categoriesController);

// Router Articles
const articlesController = require("./articles/ArticlesController");
app.use("/", articlesController);

// Router Users
const UserController = require("./user/UsersController");
app.use("/", UserController);

// Models
const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./user/User");

// Conexão com o banco
const connection = require("./databases/database");

// View engine
app.set('view engine', 'ejs');

// Arquivos Staticos
app.use(express.static('public'));

// Database
connection
    .authenticate()
    .then(() => {
        console.log("Conexão estabelicida com sucesso: aquivo -> index.js");
    })
    .catch(err => {
        console.log(err);
    })


app.get('/', (req, res) => {
    Article.findAll({ raw: true, order: [ ['id', 'DESC'] ], limit: 4 }).then(articles => {
        Category.findAll().then(categories => {
            res.render('index', { articles, categories });
        })
    });
});

app.get("/:slug", (req, res) => {
    let slug = req.params.slug;
    Article.findOne({ where: { slug }}).then(article => {
        if(article != undefined) {
            Category.findAll().then(categories => {
                res.render("article", { article, categories });
            })
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    })
});

app.get("/category/:slug", (req, res) => {
    let slug = req.params.slug;
    Category.findOne({ where: { slug }, include: [{ model: Article }]}).then(category => {
        if(category != undefined) {
            Category.findAll().then(categories => {
                res.render("index", { articles: category.articles, categories });
            })
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    })
})

app.listen(8080, () => {
    console.log("Servidor ON!");
});