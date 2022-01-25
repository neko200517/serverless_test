'use strict';

const { getPostgresClient } = require('./postgres');
const { responceTemplate } = require('./utility.js');
const crypto = require('crypto');

/**
 * get
 * @param {*} event
 * @returns
 */
module.exports.get = async (event) => {
  let res;
  const db = await getPostgresClient();
  const username = event.queryStringParameters.pool_username;
  try {
    const sql = `SELECT * FROM licenses WHERE pool_username = '${username}'`;
    res = await db.execute(sql);
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
  let res;
  const db = await getPostgresClient();
  const body = JSON.parse(JSON.parse(JSON.stringify(event.body)));

  try {
    const username = body.username;
    const license_key = crypto
      .createHash('sha1')
      .update(new Date().toString(), 'utf8')
      .digest('hex')
      .substr(0, 20);
    const enabled = true;
    let sql = `INSERT INTO licenses(pool_username, license_key, is_enabled, updated_at, created_at) VALUES ('${username}', '${license_key}', ${enabled}, now(), now())`;
    await db.begin();
    res = await db.execute(sql);
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

/**
 * delete
 * @param {*} event
 * @returns
 */
module.exports.delete = async (event) => {
  let res;
  const db = await getPostgresClient();
  const body = JSON.parse(JSON.parse(JSON.stringify(event.body)));

  try {
    const username = body.username;
    let sql = `DELETE from licenses WHERE pool_username = '${username}'`;
    await db.begin();
    res = await db.execute(sql);
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
