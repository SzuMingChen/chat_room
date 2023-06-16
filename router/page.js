const { clog } = require('../config/utils');

//! 起始頁面
exports.home = async (req, res) => {
  clog('首頁的session');
  console.log(req.session);
  res.render('home', { title: '首頁' });
};

//! 聊天室頁面
exports.chart = async (req, res) => {
  const user_info = req.session.user.name;
  //* 成功就跳轉至聊天室頁面，並傳送使用者資訊
  return res.render('chat', { user_info: user_info });
};

//! 個人資訊頁面
exports.info = async (req, res) => {
  const user_info = req.session.user;
  res.render('info', { user_info: user_info });
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