// socket起手式
// npm i express, socket.io, cors
// 引入http, server, io, cors
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const server = require('http').createServer(app);
const cors = require('cors');
const { clog } = require('./config/utils');
const router = require('./router/router');
const port = 3000;

// socket io
const io = require("socket.io")(server, {
  cors: {
    origin: "*",//! 允許來源，也可以為網域 "*"為允許所有來源 
    method: ["GET", "POST"],//! 設置只允許這兩種請求方式
    credentials: true //! 可允許攜帶身分憑證 ex:cookie
  }
});
// 引入socket.js文件 並啟動
const socket = require('./controller/user_ctrl');
socket.connect(io);

//* 啟動ejs
const engine = require("ejs-locals");
app.engine("ejs", engine);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


// session
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

// 外網連接用
// app.get('/', (req, res) => {
//   clog('首頁的session');
//   console.log(req.session);
//   res.render('home', { title: '首頁' });
// });

// router
app.use('/api', router)


server.listen(port, () => {
  clog(`伺服器運行::http://localhost:${port}/api/home`);
});
