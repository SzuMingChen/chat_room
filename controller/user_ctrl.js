const user_model = require("../model/user_model");
const crypto = require("crypto");

//! 登入
exports.login_account = async (req, res) => {
  //* 在登入成功後，將使用者資料存儲到 Session 中
  const { user_account, password } = req.body;
  req.session.info.logined = true;
  if (req.session.info.logined === false) {
    return res.render("home", { title: '不明原因導致登入失敗!!' });
  } else {
    req.session.info.logined = true;
    console.log('登入成功!!!');
    console.log(req.session);
    //* 加密
    const hash = crypto.createHash("md5");
    const password_ans = hash.update(password).digest("hex");
    //* 查找現有帳號確認有無註冊 
    const [check_account] = await user_model.check_account(user_account);
    console.log('----ctrl回---->', check_account);
    if (!check_account) return res.render("home", { title: '帳號密碼輸入錯誤!!' });
    //* 判斷密碼有無輸入錯誤
    if (check_account.password !== password_ans) return res.render("home", { title: '帳號密碼輸入錯誤!!' });
    //* 在登入成功後，將使用者資料存儲到 Session 中
    req.session.user = { user_account: check_account.user_account, name: check_account.name };
  }

  if (req.session.user) {
    const user_info = req.session.user.name;
    //* 成功就跳轉至聊天室頁面，並傳送使用者資訊
    return res.render('chat', { user_info: user_info });
  } else {
    //* 登入失敗，跳回主頁
    return res.render("home", { title: '不明原因導致登入失敗!!' });
  }
};

//! 創建
exports.create_account = async (req, res) => {
  const { nick_name, user_account, password, check_password } = req.body;
  //* 帳號密碼不能一致
  if (user_account === password)
    return res.render("register", { title: '帳號密碼需不同!!' });
  //* 阻擋密碼輸入不一致
  if (password !== check_password)
    return res.render("register", { title: '密碼不一致!!' });
  //* 查找現有的帳號及暱稱 
  const check_account = await user_model.search_account();
  //* 確認帳號及暱稱有無重複註冊
  for (let i = 0; i < check_account.length; i++) {
    if (user_account === check_account[i].user_account) {
      return res.render("register", { title: '帳號已被註冊!!' });
    }
    if (nick_name === check_account[i].name) {
      return res.render("register", { title: '暱稱已被註冊!!' });
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

  return res.render("register", { title: '不明原因導致註冊失敗!!' });
};

//! 修改密碼
exports.edit_account = async (req, res) => {
  console.log('----進ctrl---->', req.body);
  const { user_account, old_password, password, check_password } = req.body;
  //* 暫定只能修改密碼
  if (password !== check_password) {
    return res.send('<script>alert("密碼不一致!!");window.history.back();</script>');
  }
  //* 加密比對
  const hash = crypto.createHash("md5");
  const old_password_ans = hash.update(old_password).digest("hex");

  //* 撈舊帳號，比對有無輸入錯誤
  const [check] = await user_model.check_account(user_account);
  console.log("----ctrl回---->", check);
  if (check.user_account !== user_account) {
    return res.send('<script>alert("帳號有誤！請勿更改帳號！");window.history.back();</script>');
  }
  if (check.password !== old_password_ans) {
    return res.send('<script>alert("舊密碼輸入錯誤！");window.history.back();</script>');
  }

  //* 加密更新
  const new_hash = crypto.createHash("md5");
  const new_password_ans = new_hash.update(check_password).digest("hex");

  //* 更新密碼
  const result = await user_model.edit_account(new_password_ans, user_account);
  if (!result) {
    return res.send('<script>alert("更新失敗!!");window.history.back();</script>');
  }
  return res.render('home', { title: '更新成功!! 請重新登入' });
};

//! 拿預設密碼
exports.set_password = async (req, res) => {
  console.log('----進ctrl---->', req.body);
  const { name, user_account } = req.body;

  //* 撈舊帳號，比對有無輸入錯誤
  const [check] = await user_model.check_account(user_account);
  console.log("----ctrl回---->", check);
  if (check.name !== name || check.user_account !== user_account) {
    return res.render("forgot", { title: '帳號或暱稱錯誤，忘記帳號請洽客服！' });
  }
  //* 加密
  const hash = crypto.createHash("md5");
  const password_ans = hash.update("ABC123456").digest("hex");
  //* 更新密碼為預設密碼
  const result = await user_model.set_password(user_account, password_ans);
  if (!result) {
    return res.render("forgot", { title: '更新失敗!!' });
  }
  return res.render("home", { title: '預設密碼已變更為:ABC123456，請立即登入修改!!' });
};


