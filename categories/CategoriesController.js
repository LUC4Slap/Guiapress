const express = require("express");
const router = express.Router();
const Category = require("./Category");
const slugify = require("slugify");
const adminAth = require("../middlewares/adminAuth");

router.get("/admin/categories/new",adminAth, (req, res) => {
    res.render("admin/categories/new");
});

router.post("/categories/save",adminAth, (req, res) => {
    let title = req.body.title;
    if(title != undefined) {
        Category.create({
            title: title,
            slug: slugify(title)
        }).then(() => {
            res.redirect('/admin/categories');
        }).catch(err => {
            console.log(err)
        });
    } else {
        res.redirect("/admin/categories/new");
    }
});

router.get("/admin/categories",adminAth, (req, res) => {
    Category.findAll({ raw: true }).then(categories => {
        res.render("admin/categories/index", { categories: categories });
    });
});

router.post("/categories/delete",adminAth, (req, res) => {
    let id = req.body.id;
    if(id != undefined) {
        if(!isNaN(id)) {
            Category.destroy({
                where: { id: id }
            }).then(() => {
                res.redirect("/admin/categories");
            }).catch(err => {
                console.log(err);
            })
        } else { // SE ID não for um numero
            res.redirect("/admin/categories");
        }
    } else { // Se ID form null
        res.redirect("/admin/categories");
    }
});

router.get("/admin/categories/edit/:id",adminAth, (req, res) => {
    let id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/categories");
    } else {
        Category.findByPk(id).then(category => {
            if(category != undefined) {
                res.render("admin/categories/edit", { category })
            } else {
                res.redirect("/admin/categories");
            }
        }).catch(err => {
            console.log(err);
            res.redirect("/admin/categories");
        })
    }
});

router.post("/categories/update",adminAth, (req, res) => {
    let id = req.body.id;
    let title = req.body.title;
    Category.update({ 
        title: title,
        slug: slugify(title)
    }, {
        where: { id: id }
    }).then(() => {
        res.redirect("/admin/categories");
    }).catch(err => {
        console.log(err);
        res.redirect("/admin/categories");
    })
});

module.exports = router;