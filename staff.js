'use strict';

const { getPostgresClient } = require('./postgres');
const { responceTemplate, createDateString } = require('./utility.js');

const table = 'staffs';

/**
 * get
 * @param {*} event
 * @returns
 */
module.exports.get = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const username = event.queryStringParameters.username;
  try {
    sql = `
      SELECT
        *
      FROM
        ${table}
      WHERE
        pool_username = $1
    `;

    params = [username];
    res = await db.execute(sql, params);
  } catch (e) {
    throw e;
  } finally {
    await db.release();
  }

  return {
    statusCode: 200,
    headers: responceTemplate.headers,
    body: JSON.stringify(
      {
        status: 200,
        results: res,
      },
      null,
      2
    ),
  };
};

/**
 * regist_user
 * @param {*} event
 * @returns
 */
module.exports.regist_user = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const body = JSON.parse(JSON.parse(JSON.stringify(event.body)));
  const username = body.username;
  const confirm = false;

  // 存在確認
  try {
    sql = `
      SELECT
        *
      FROM
        ${table}
      WHERE
        pool_username = $1
    `;

    params = [username];
    res = await db.execute(sql, params);
    res = res.length > 0 ? 'user already existed.' : null;
  } catch (e) {
    throw e;
  }

  if (!res) {
    try {
      sql = `
        INSERT INTO ${table}(
          pool_username,
          is_confirm,
          updated_at,
          created_at
        )
        VALUES(
          $1,
          $2,
          now(),
          now()
        )
      `;

      await db.begin();
      params = [username, confirm];
      res = await db.execute(sql, params);
      await db.commit();
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      await db.release();
    }
  }

  return {
    statusCode: 201,
    headers: responceTemplate.headers,
    body: JSON.stringify(
      {
        status: 201,
        results: res,
      },
      null,
      2
    ),
  };
};

/**
 * update_confirm
 * @param {*} event
 * @returns
 */
module.exports.update_confirm = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const body = JSON.parse(JSON.parse(JSON.stringify(event.body)));

  try {
    const username = body.username;
    const confirm = body.confirm;
    const interview_started_at = body.interview_started_at;

    if (confirm) {
      sql = `
        UPDATE
          ${table}
        SET
          is_confirm = $1,
          confirmed_at = now(),
          updated_at = now()
        WHERE
          pool_username = $2
      `;

      params = [confirm, username];
    } else if (interview_started_at) {
      const dt = new Date(interview_started_at);
      const strDt = createDateString(dt);
      sql = `
        UPDATE
          ${table}
        SET
          interview_started_at = $1,
          updated_at = now()
        WHERE
          pool_username = $2
      `;

      params = [strDt, username];
    }

    await db.begin();
    res = await db.execute(sql, params);
    await db.commit();
  } catch (e) {
    await db.rollback();
    throw e;
  } finally {
    await db.release();
  }

  return {
    statusCode: 201,
    headers: responceTemplate.headers,
    body: JSON.stringify(
      {
        status: 201,
        results: res,
      },
      null,
      2
    ),
  };
};
