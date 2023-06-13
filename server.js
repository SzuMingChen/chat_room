// socket起手式
// npm i express, socket.io, cors
// 引入http, server, io, cors
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const server = require('http').createServer(app);
const cors = require('cors');
const { clog } = require('./utils');
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


const io = require("socket.io")(server, {
  cors: {
    origin: "*",//! 允許來源，也可以為網域 "*"為允許所有來源 
    method: ["GET", "POST"],//! 設置只允許這兩種請求方式
    credentials: true //! 可允許攜帶身分憑證 ex:cookie
  }
});

app.use(session({
  secret: 'your_secret_key', //! 用於簽署和加密 Session 的 Cookie，請將其替換為你自己的密鑰。
  resave: false, //! 設置是否在每次請求時強制重新保存 Session，設為 false 表示僅在 Session 有更改時才保存。
  saveUninitialized: false, //! 設置是否在初始化期間保存未修改的 Session，設為 false 表示僅在 Session 有修改時才保存。
  cookie: { //! 設定 Session 的 Cookie 選項，例如安全性、有效期等。
    secure: false, //! 用於指定是否僅在使用安全連接（HTTPS）時才傳送 Cookie。
    maxAge: 100000 //! Session 的有效日期。
  }
}));

// middleware
app.use((req, res, next) => {
  if (!req.session.info) {
    req.session.info = {
      logined: false
    };
  }
  next();
});

// router
app.get('/', (req, res) => {
  clog('首頁的session');
  console.log(req.session);
  res.sendFile(__dirname + '/views/home.html');
});

app.post('/login', (req, res) => {
  req.session.info.logined = true;
  if (req.session.info.logined === false) {
    res.sendFile(__dirname + '/views/home.html');
  } else {
    req.session.info.logined = true;
    clog('登入中');
    console.log(req.session);
   
    //
    io.on('connection', (socket) => {
      clog('用戶已連接!');

      // 發送聊天訊息事件
      socket.on('chat message', (message) => {
        clog('收到訊息:' + message);
        io.emit('chat message', message); // 廣播訊息給所有客戶端
      });

      // 當客戶端斷開連接時
      socket.on('disconnect', () => {
        clog('用戶連接中斷!');
      });
    });
  }
  res.sendFile(__dirname + '/views/chat.html');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  console.log(req.session);
  res.send('您成功登出');
});



server.listen(port, () => {
  console.log(`伺服器運行::http://localhost:${port}/`);
});
