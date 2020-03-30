const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const adminAth = require("../middlewares/adminAuth");

router.get('/admin/articles', adminAth, (req, res) => {
    Article.findAll({
        include: [{ model: Category }]
    }).then(articles => {
        res.render("admin/articles/index", { articles });
    });
});

router.get('/admin/articles/new', adminAth, (req, res) => {
    Category.findAll({ raw: true }).then(categories => {
        res.render("admin/articles/new", { categories })
    })
});

router.post("/articles/salve", adminAth, (req, res) => {
    let title = req.body.title;
    let body = req.body.body;
    let categoryId = req.body.category;
    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: categoryId
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch(err => {
        console.log(err);
        res.redirect("/admin/articles");
    })
});

router.post("/articles/delete", adminAth, (req, res) => {
    let id = req.body.id;
    if(id != undefined) {
        if(!isNaN(id)) {
            Article.destroy({
                where: { id: id }
            }).then(() => {
                res.redirect("/admin/articles");
            }).catch(err => {
                console.log(err);
            })
        } else { // SE ID não for um numero
            res.redirect("/admin/articles");
        }
    } else { // Se ID form null
        res.redirect("/admin/articles");
    }
});

router.get("/admin/article/edit/:id", adminAth, (req, res) => {
    let id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/categories/edit");
    } else {
        Article.findByPk(id).then(article => {
            if(article != undefined) {
                Category.findAll({ raw: true}).then(categories => {
                    res.render("admin/articles/edit", { article, categories });
                })
            } else {
                res.redirect("/admin/article");
            }
        }).catch(err => {
            console.log(err);
            res.redirect("/admin/article");
        })
    }
});

router.post("/articles/update", adminAth, (req, res) => {
    let id = req.body.id;
    let title = req.body.title;
    let body = req.body.body;
    let category = req.body.category;
    Article.update({ title: title, body: body, categoryId: category, slug: slugify(title) }, {
        where: { id: id }
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    })
});

router.get("/articles/page/:num", (req, res) => {
    let page = req.params.num;
    let offset = 0;
    if(isNaN(page) || page <= 1){
        offset = 0;
    } else {
        offset = (parseInt(page) * 4) - 4;
    }
    Article.findAndCountAll({
        limit: 4,
        offset: offset,
        order: [ ['id', 'DESC'] ]
    }).then(articles => {
        let next;
        if(offset + 4 >= articles.count) {
            next = false;
        } else {
            next = true;
        }
        let result = {
            page: parseInt(page),
            next: next,
            articles: articles,
        }
        Category.findAll().then(categories => {
            res.render("admin/articles/page", { result, categories })
        })
    })
});

module.exports = router;