const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");
const adminAth = require("../middlewares/adminAuth");

router.get("/admin/users",adminAth, (req, res) => {
    if(req.session.user == undefined) {
        res.redirect("/login");
    }
    User.findAll({ raw: true }).then(users => {
        res.render("admin/users/index", { users });
    });

});

router.get("/admin/users/create", adminAth, (req, res) => {
    res.render("admin/users/create");
});

router.post("/users/create", adminAth, (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    User.findOne({ where: { email }}).then(user => {
        if(user == undefined){
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password, salt)
            // res.json({email, hash});
            User.create({
                email,
                password: hash
            }).then(() => {
                res.redirect("/admin/users");
            }).catch(err => {
                console.log(err);
                res.redirect("/")
            })
        }else {
            res.redirect("/admin/users/create");
        }
    })
});

router.get("/admin/users/edit/:id", adminAth, (req, res) => {
    let id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/users/edit");
    } else {
        User.findByPk(id).then(user => {
            if(user != undefined) {
                res.render("admin/users/edit", { user });
            } else {
                res.redirect("/admin/users");
            }
        }).catch(err => {
            console.log(err);
            res.redirect("/admin/users");
        })
    }
});

router.post("/users/update", adminAth, (req, res) => {
    let id = req.body.id;
    let email = req.body.email;
    let password = req.body.password;
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt)
    User.update({ email: email, password: hash }, {
        where: { id: id }
    }).then(() => {
        res.redirect("/admin/users");
    }).catch(err => {
        console.log(err);
        res.redirect("/");
    })
});

router.post("/users/delete", adminAth, (req, res) => {
    let id = req.body.id;
    if(id != undefined) {
        if(!isNaN(id)) {
            User.destroy({
                where: { id: id }
            }).then(() => {
                res.redirect("/admin/users");
            }).catch(err => {
                console.log(err);
            })
        } else { // SE ID não for um numero
            res.redirect("/admin/users");
        }
    } else { // Se ID form null
        res.redirect("/admin/users");
    }
});

router.get("/login", (req, res) => {
    res.render("admin/users/login");
});

router.post("/authenticate", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    User.findOne({ where: { email: email }}).then(user => {
        if(user != undefined) { // se existe um usuario com esse email
            // validar a senha
            let correct = bcrypt.compareSync(password, user.password);
            if(correct) {
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("/admin/articles");
            } else {
                res.redirect("/login");
            }

        } else {
            res.redirect("/login");
        }
    });
});

router.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/");
});


module.exports = router;