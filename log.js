'use strict';

const { getPostgresClient } = require('./postgres');
const { responceTemplate } = require('./utility.js');

const table = 'logs';

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
      SELECT DISTINCT
      ON
        (users.pool_username) users.pool_username,
        users.interview_started_at,
        logs.staff_pool_username,
        logs.exported_at
      FROM
        users
        LEFT OUTER JOIN logs ON
          (
            users.pool_username = logs.user_pool_username
          )
      WHERE
        users.pool_username LIKE $1
      ORDER BY
        users.pool_username,
        logs.exported_at DESC
      ;`;

    params = [username + '%'];
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
 * set
 * @param {*} event
 * @returns
 */
module.exports.set = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const body = JSON.parse(JSON.parse(JSON.stringify(event.body)));

  try {
    const user_username = body.user_username;
    const staff_username = body.staff_username;
    sql = `
      INSERT INTO logs(
        user_pool_username,
        staff_pool_username,
        exported_at,
        updated_at,
        created_at
      )
      VALUES(
        $1,
        $2,
        now(),
        now(),
        now()
      )
    `;

    await db.begin();
    params = [user_username, staff_username];
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
