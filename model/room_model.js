const mysql = require("../config/mysql");


//! 查
exports.check_chart = async (user_account) => {
  const transaction = await mysql.getConnection();
  try {
    await transaction.beginTransaction();
    //* 併表查詢
    const target = `SELECT *
    FROM chart_room.user_account
    JOIN chart_room.chart_table ON chart_room.user_account.user_account = chart_room.chart_table.user_account
    WHERE  chart_room.chart_table.status = 1 ;
    `;

    const [result] = await mysql.execute(target);

    // console.log("---model_check_list--->", result);

    await transaction.commit();
    transaction.release();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//! 增
exports.create_chart = async (user_account, body, name) => {
  const transaction = await mysql.getConnection();
  try {
    await transaction.beginTransaction();
    const target = `INSERT INTO chart_table (user_account,  body, name, status) VALUES ('${user_account}', '${body}', '${name}', 1);
      `;

    const result = await mysql.execute(target);

    // console.log("---model_create_list--->", result);
    await transaction.commit();
    transaction.release();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//! 刪
exports.remove_chart = async (room_id) => {
  const transaction = await mysql.getConnection();
  try {
    await transaction.beginTransaction();
    const target = `UPDATE chart_table SET status = '0', room_update_time = NOW() WHERE (id = '${room_id}');
      `;

    const result = await mysql.execute(target);

    console.log("---model_remove_list--->", result);
    await transaction.commit();
    transaction.release();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

//! 改
exports.edit_chart = async (value, room_id) => {
  const transaction = await mysql.getConnection();
  try {
    await transaction.beginTransaction();
    const target = `UPDATE chart_table SET body = '${value}', room_update_time = NOW() WHERE (id = '${room_id}');
      `;
    const result = await mysql.execute(target);

    console.log("---model_edit_list--->", result);
    await transaction.commit();
    transaction.release();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};