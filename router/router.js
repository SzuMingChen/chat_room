const express = require("express");
const router = express.Router();
const user_ctrl = require("../controller/user_ctrl");
// const list_ctrl = require('../controller/list_ctrl');
const page = require('./page');


module.exports =

//* user_account
// router.post("/login", user_ctrl.login_account);
router.post("/create", user_ctrl.create_account);
// router.post("/edit", user_ctrl.edit_account);
// router.get("/logout", user_ctrl.logout_account); 

//* chart_room
// router.get("/todo_list", list_ctrl.home);
// router.post("/write", list_ctrl.write_new_list);
// router.post("/remove", list_ctrl.remove_my_list);
// router.post("/change", list_ctrl.edit_my_list);

router.get('/home', page.home);
router.get('/register', page.register);
router.get('/forgot', page.forgot);
router.get('/logout', page.logout);
