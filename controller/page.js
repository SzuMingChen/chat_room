
//! 起始頁面
exports.home = async (req, res) => {
  console.log('首頁的session');
  console.log(req.session);
  return res.render('home', { title: '首頁' });
};

//! 聊天室頁面
exports.chart = async (req, res) => {
  const user_info = req.session.user.name;
  //* 成功就跳轉至聊天室頁面，並傳送使用者資訊
  return res.render('index', { user_info: user_info });
};

//! 個人資訊頁面
exports.info = async (req, res) => {
  const user_info = req.session.user;
  return res.render('info', { user_info: user_info });
};

//! 註冊頁面
exports.register = async (req, res) => {
  return res.render('register', { title: '註冊頁' });
};

//! 忘記密碼頁面
exports.forgot = async (req, res) => {
  return res.render('forgot', { title: '忘記密碼' });
};

