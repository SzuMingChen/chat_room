const user_model = require("../model/user_model");
const room_model = require('../model/room_model');
const crypto = require("crypto");
const { clog } = require('../config/utils');

// 儲存遊戲狀態
let gameState = [
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
];

// 儲存當前玩家
let currentPlayer = 'X';

// 驗證移動是否合法
function isValidMove(row, col) {
  return gameState[row][col] === '';
}

// 檢查遊戲是否獲勝
function checkWin() {
  const winningPatterns = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];

  for (let pattern of winningPatterns) {
    const [a, b, c] = pattern;
    const [rowA, colA] = a;
    const [rowB, colB] = b;
    const [rowC, colC] = c;

    if (
      gameState[rowA][colA] !== '' &&
      gameState[rowA][colA] === gameState[rowB][colB] &&
      gameState[rowA][colA] === gameState[rowC][colC]
    ) {
      return true;
    }
  }

  return false;
}

// 檢查遊戲是否平局
function checkDraw() {
  for (let row of gameState) {
    for (let cell of row) {
      if (cell === '') {
        return false;
      }
    }
  }

  return true;
}

// 重設遊戲狀態
function resetGame() {
  gameState = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];

  currentPlayer = 'X';
}

//! socket 須拆出來到獨立區域才不會有重複請求同一個路由的問題
let user_list; // 用戶資訊
let user_body; // 歷史紀錄
exports.connect = (io) => {
  // io 連接伺服器
  io.on('connection', (socket) => {
    clog('用戶已連接!');
    // 向前端發送歷史紀錄至聊天室
    io.emit('user-body', user_body);
    // 向前端發送事件，通知角色已加入聊天室
    io.emit('user joined', user_list.name);


    // 處理 get connected clients 事件
    socket.on('get connected clients', () => {
      // 取得當前連線的人數
      const connectedClients = io.sockets.server.engine.clientsCount;
      // 將 connectedClients 資訊傳送給前端
      socket.emit('connected clients', connectedClients);
    });

    // 發送聊天訊息事件
    socket.on('chat message', async (message) => {
      clog('收到訊息 ' + message);
      // 訊息記錄至資料庫
      const result = await room_model.create_chart(user_list.user_account, message, user_list.name);
      // 廣播訊息給所有客戶端
      io.emit('chat message', message);
    });



    // --------------------------------------------------------------------------------------------

    console.log('A user connected');

    // 發送遊戲狀態給連接的客戶端
    socket.emit('gameState', gameState);


    // 監聽下棋事件
    socket.on('move', (move) => {
      const { row, col, player } = move;

      // 檢查當前玩家是否可以下棋
      // if (currentPlayer === player && isValidMove(row, col)) {
      gameState[row][col] = currentPlayer;
      io.emit('move', { row, col, player: currentPlayer });

      // 檢查遊戲是否結束
      if (checkWin()) {
        io.emit('message', `玩家 ${currentPlayer} 獲勝！`);
        resetGame();
      } else if (checkDraw()) {
        io.emit('message', '遊戲平局！');
        resetGame();
      } else {
        // 切換到下一個玩家
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      }
      // }
    });

    // 監聽重新開始事件
    socket.on('restart', () => {
      resetGame();
      io.emit('restart');
    });

    // 當客戶端斷開連接時
    socket.on('disconnect', (connectedClients) => {
      clog('用戶連接中斷!' + connectedClients);
      // 向前端發送事件，通知角色已離開聊天室
      io.emit('user left', user_list.name);
    });
  });
}

//! 登入
exports.login_account = async (req, res) => {
  //* 在登入成功後，將使用者資料存儲到 Session 中
  const { user_account, password } = req.body;
  req.session.info.logined = true;
  if (!req.session.info.logined) {
    return res.render("home", { title: '不明原因導致登入失敗!!' });
  } else {
    console.log('登入成功!!!');
    console.log(req.session);
    //* 加密
    const hash = crypto.createHash("md5");
    const password_ans = hash.update(password).digest("hex");
    //* 查找現有帳號確認有無註冊 
    const [check_account] = await user_model.check_account(user_account);
    // console.log('----ctrl回---->', check_account);
    if (!check_account) return res.render("home", { title: '帳號密碼輸入錯誤!!' });
    //* 判斷密碼有無輸入錯誤
    if (check_account.password !== password_ans) return res.render("home", { title: '帳號密碼輸入錯誤!!' });
    //* 在登入成功後，將使用者資料存儲到 Session 中
    req.session.user = { user_account: check_account.user_account, name: check_account.name };
    //! 帶入使用者登入資訊至socket
    user_list = req.session.user;
    //! 找出原始訊息 並印出
    const result = await room_model.check_chart(user_list.user_account);
    const result_ans = result.map((data) => {
      return data.body
    })
    user_body = result_ans;
    //* 成功就跳轉至聊天室頁面
    return res.redirect("/api/chart")
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


//! 登出
exports.logout = async (req, res) => {
  // 清除session
  req.session.destroy();
  return res.redirect('/');
};
