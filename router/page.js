const { clog } = require('../config/utils');

//! 起始頁面
exports.home = async (req, res) => {
  clog('首頁的session');
  console.log(req.session);
  res.render('home', { title: '首頁' });
};

//! 註冊頁面
exports.register = async (req, res) => {
  res.render('register', { title: '註冊頁' });
};

//! 忘記密碼頁面
exports.forgot = async (req, res) => {
  res.render('forgot', { title: '忘記密碼' });
};

//! 登出
exports.logout = async (req, res) => {
  req.session.destroy();
  console.log(req.session);
  res.render('home', { title: '首頁' });
};