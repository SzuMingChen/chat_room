const user_model = require("../model/user_model");
const crypto = require("crypto");

//! 登入
exports.login_account = async (req, res) => {
  console.log('----進ctrl---->', req.body);
  const { user_account, password } = req.body;
  //* 加密
  const hash = crypto.createHash("md5");
  const password_ans = hash.update(password).digest("hex");
  //* 查找現有帳號確認有無註冊 
  const [check_account] = await user_model.check_account(user_account);
  console.log('----ctrl回---->', check_account);
  if (!check_account) return res.render("login", { title: '帳號密碼輸入錯誤!!' });
  //* 判斷密碼有無輸入錯誤
  if (check_account.password !== password_ans) return res.render("login", { title: '帳號密碼輸入錯誤!!' });

  //todo 在登入成功後，將使用者資料存儲到 Session 中
  req.session.user = { user_account: check_account.user_account, name: check_account.name };

  if (req.session.user) {
    //* 成功就跳轉至todo_list頁面
    return res.redirect('/api/todo_list');
  } else {
    //* 登入失敗，跳回主頁
    return res.redirect('/api/home');
  }
};

//! 創建
exports.create_account = async (req, res) => {
  console.log('@@', req.body);
  const { nick_name, user_account, password, check_password } = req.body;
  //* 帳號密碼不能一致
  if (user_account === password)
    return res.send('帳號密碼需不同!!');
  //* 阻擋密碼輸入不一致
  if (password !== check_password)
    return res.send('密碼不一致!!');
  //* 查找現有的帳號及暱稱 
  const check_account = await user_model.search_account();
  //* 確認帳號及暱稱有無重複註冊
  for (let i = 0; i < check_account.length; i++) {
    if (user_account === check_account[i].user_account) {
      return res.send('帳號已被註冊!!');
    }
    if (nick_name === check_account[i].name) {
      return res.send('暱稱已被註冊!!');
    }
  }
  //* 存入密碼前加密
  const hash = crypto.createHash("md5");
  const password_ans = hash.update(password).digest("hex");
  //* 以上確認完成後寫入執行註冊 
  const result = await user_model.create_account(
    user_account,
    password_ans,
    nick_name
  );
  console.log('----ctrl回---->', result);
  if (result) {
    return res.render('return', { title: `恭喜${nick_name}!註冊成功!，準備跳轉回登入頁...` });
  }
  return res.send('不明原因導致註冊失敗!!');
};

//! 修改密碼
exports.edit_account = async (req, res) => {
  console.log('----進ctrl---->', req.body);
  const { user_account, new_password, check_new_password } = req.body;
  //* 暫定只能修改密碼
  if (new_password !== check_new_password) {
    return res.render("forgot", { title: '密碼不一致!!' });
  }
  //* 目前暫定只能修改密碼 加密新數值
  const hash = crypto.createHash("md5");
  const new_password_ans = hash.update(new_password).digest("hex");

  //* 撈舊帳號，比對有無輸入錯誤
  const check = await user_model.check_account(user_account);
  console.log("----ctrl回---->", check);
  if (!check) {
    return res.render("forgot", { title: '帳號錯誤，忘記帳號請洽客服！' });
  }
  //* 更新密碼
  const result = await user_model.edit_account(new_password_ans, user_account);
  if (!result) {
    return res.render("forgot", { title: '更新失敗!!' });
  }
  return res.render("login", { title: '更新成功!! 請直接登入' });
};

//! 登出
exports.logout_account = async (req, res) => {

  // 清除數據
  req.session.destroy(err => {
    if (err) {
      console.log('session 清除失敗:', err);
    } else {
      res.redirect('/api/home');
    }
  });

};



