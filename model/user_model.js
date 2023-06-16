const mysql = require("../config/mysql");


//! 全部查
exports.search_account = async (req, res) => {
  console.log('----進model_search---->');
  const transaction = await mysql.getConnection();
  try {
    //* 啟動
    await transaction.beginTransaction();
    const target = `SELECT * FROM user_account`;
    const [result] = await mysql.execute(target);
    console.log("----model_search回---->", result);
    //*
    await transaction.commit();
    transaction.release();
    return result;
  } catch (error) {
    if (!result || result == "") {
      return false;
    }
    //* 回逤
    await transaction.rollback();
    throw error;
  }
};

//! 查
exports.check_account = async (user_account) => {
  console.log('----進model---->', user_account);
  const transaction = await mysql.getConnection();
  try {
    //* 啟動
    await transaction.beginTransaction();
    const target = `SELECT * FROM user_account WHERE \`user_account\` = '${user_account}' AND \`status\` = '1'`;
    const [result] = await mysql.execute(target);
    console.log("----model回---->", result);
    //*
    await transaction.commit();
    transaction.release();
    return result;
  } catch (error) {
    if (!result || result == "") {
      return false;
    }
    //* 回逤
    await transaction.rollback();
    throw error;
  }
};

//! 增
exports.create_account = async (user_account, password, name) => {
  console.log('----進model---->', user_account);
  const transaction = await mysql.getConnection();
  try {
    await transaction.beginTransaction();
    const target = `INSERT INTO \`user_account\` (\`user_account\`, \`password\`, \`name\`, \`status\`) VALUES ('${user_account}', '${password}', '${name}', 1)`;
    const [result] = await mysql.execute(target);
    console.log("----model回---->", result);
    if (result.affectedRows === 1) {
      return true;
    }
    await transaction.commit();
    transaction.release();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//! 刪
exports.close_account = async (user_account) => {
  console.log('----進model---->', user_account);
  const transaction = await mysql.getConnection();
  try {
    const target = `UPDATE user_account SET status = 0, update_time = NOW()  WHERE (user_account = '${user_account}');`;
    const [result] = await mysql.execute(target);
    console.log("----model回---->", result);
    if (result.changedRows !== 0) {
      return true;
    }
    await transaction.commit();
    transaction.release();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//! 改
exports.edit_account = async (new_value, user_account) => {
  console.log('----進model---->', user_account);
  const transaction = await mysql.getConnection();
  try {
    const update = `UPDATE user_account SET \`password\` = '${new_value}', update_time = NOW()  WHERE (\`user_account\` = '${user_account}');`;
    const [result] = await mysql.execute(update);
    console.log("----model回---->", result);
    await transaction.commit();
    transaction.release();
    if (!result) {
      return false;
    }
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


