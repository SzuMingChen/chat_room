const express = require("express");
const router = express.Router();
const user_ctrl = require("../controller/user_ctrl");
// const list_ctrl = require('../controller/list_ctrl');
const page = require('./page');


module.exports =

//* user_account
router.post("/login", user_ctrl.login_account);
router.post("/create", user_ctrl.create_account);
router.post('/password', user_ctrl.set_password)
router.post("/edit", user_ctrl.edit_account);
router.post('/logout', user_ctrl.logout);

//* chart_room
// router.post("/remove", list_ctrl.remove_my_list);
// router.post("/change", list_ctrl.edit_my_list);

router.post('/info', page.info);
router.get('/home', page.home);
router.get('/chart', page.chart);
router.get('/register', page.register);
router.get('/forgot', page.forgot);

