'use strict';

const { getPostgresClient } = require('./postgres');
const {
  formatYYYYMMDD,
  formatDate,
  zeroPadding,
  createDateString,
  responceTemplate,
  createDateJp,
} = require('./utility.js');

/**
 * home
 * @param {*} event
 * @returns
 */
module.exports.condition = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const username = event.queryStringParameters.username;
  let startDate = event.queryStringParameters.startDate;
  const endDate = event.queryStringParameters.endDate;
  const orderBy = event.queryStringParameters.orderBy;

  try {
    // startDateの指定がなければ面談開始日からスタート
    if (!startDate) {
      sql = `
        SELECT
          interview_started_at
        FROM
          users
        WHERE
          pool_username = $1
      `;

      params = [username];
      const dRes = await db.execute(sql, params);
      let dt = new Date(dRes[0].interview_started_at);
      startDate = formatYYYYMMDD(dt);
    }

    sql = `
      SELECT
        *
      FROM
        conditions
      WHERE
        pool_username = $1 AND
        condition_date >= $2 AND
        condition_date <= $3
    `;

    params = [username, startDate, endDate];

    // optoinal
    if (orderBy) {
      sql += `ORDER BY $4`;
      params.push(orderBy);
    }

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
 * CSV用
 * @param {*} event
 * @returns
 */
module.exports.get_csv = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const username = event.queryStringParameters.username;

  try {
    // ユーザ履歴の最小と最大を取得
    sql = `
      SELECT
        MIN(condition_date) AS min,
        MAX(condition_date) AS max
      FROM
        conditions
      WHERE
        pool_username = $1
    `;

    params = [username];
    const datas = await db.execute(sql, params);

    let startDate = '';
    let endDate = '';
    if (datas.length > 0) {
      startDate = datas[0].min;
      endDate = datas[0].max;
    }

    sql = `
      SELECT
        *
      FROM
        conditions
      WHERE
        pool_username = $1 AND
        condition_date >= $2 AND
        condition_date <= $3
      ORDER BY
        condition_date
    `;

    params = [username, startDate, endDate];
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
 * save
 * @param {*} event
 * @returns
 */
module.exports.save = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const body = JSON.parse(JSON.parse(JSON.stringify(event.body)));

  try {
    sql = `
      SELECT
        interview_started_at
      FROM
        users
      WHERE
        pool_username = $1
    `;

    params = [body.username];
    const user = await db.execute(sql, params);
    let strDt = null;
    if (user.length > 0) {
      let dt = user[0].interview_started_at;
      if (dt) {
        strDt = createDateString(dt);
      }
    }

    sql = `
      SELECT
        *
      FROM
        conditions
      WHERE
        pool_username = $1 AND
        condition_date = $2
    `;

    params = [body.username, body.date];
    res = await db.execute(sql, params);

    if (res.length > 0) {
      const weight_date = body.weight
        ? 'now()'
        : createDateString(res[0].weight_updated_at);
      const bp1_date = body.bp1
        ? 'now()'
        : createDateString(res[0].bp1_updated_at);
      const bp2_date = body.bp2
        ? 'now()'
        : createDateString(res[0].bp2_updated_at);
      const bp3_date = body.bp3
        ? 'now()'
        : createDateString(res[0].bp3_updated_at);
      const bp4_date = body.bp4
        ? 'now()'
        : createDateString(res[0].bp4_updated_at);
      const step_date = body.step
        ? 'now()'
        : createDateString(res[0].step_updated_at);
      body.weight = body.weight ? body.weight : res[0].weight;
      body.bp1 = body.bp1 ? body.bp1 : res[0].bp1;
      body.bp2 = body.bp2 ? body.bp2 : res[0].bp2;
      body.bp3 = body.bp3 ? body.bp3 : res[0].bp3;
      body.bp4 = body.bp4 ? body.bp4 : res[0].bp4;
      body.step = body.step ? body.step : res[0].step;
      sql = `
        UPDATE
          conditions
        SET
          interview_started_at = $1,
          weight = $2,
          weight_updated_at = $3,
          bp1 = $4,
          bp1_updated_at = $5,
          bp2 = $6,
          bp2_updated_at = $7,
          bp3 = $8,
          bp3_updated_at = $9,
          bp4 = $10,
          bp4_updated_at = $11,
          step = $12,
          step_updated_at = $13,
          updated_at = now()
        WHERE
          pool_username = $14
        AND
          condition_date = $15
      `;

      params = [
        strDt,
        body.weight,
        weight_date,
        body.bp1,
        bp1_date,
        body.bp2,
        bp2_date,
        body.bp3,
        bp3_date,
        body.bp4,
        bp4_date,
        body.step,
        step_date,
        body.username,
        body.date,
      ];
    } else {
      const weight_date = body.weight ? 'now()' : null;
      const bp1_date = body.bp1 ? 'now()' : null;
      const bp2_date = body.bp2 ? 'now()' : null;
      const bp3_date = body.bp3 ? 'now()' : null;
      const bp4_date = body.bp4 ? 'now()' : null;
      const step_date = body.step ? 'now()' : null;
      body.weight = body.weight ? body.weight : null;
      body.bp1 = body.bp1 ? body.bp1 : null;
      body.bp2 = body.bp2 ? body.bp2 : null;
      body.bp3 = body.bp3 ? body.bp3 : null;
      body.bp4 = body.bp4 ? body.bp4 : null;
      body.step = body.step ? body.step : null;
      sql = `
        INSERT INTO conditions(
          condition_date,
          pool_username,
          interview_started_at,
          weight,
          weight_updated_at,
          bp1,
          bp1_updated_at,
          bp2,
          bp2_updated_at,
          bp3,
          bp3_updated_at,
          bp4,
          bp4_updated_at,
          step,
          step_updated_at,
          updated_at,
          created_at
        )
        VALUES(
          $1,
          $2,
          $3,
          $4, $5,
          $6, $7,
          $8, $9,
          $10, $11,
          $12, $13,
          $14, $15,
          now(),
          now()
        )
      `;

      params = [
        body.date,
        body.username,
        strDt,
        body.weight,
        weight_date,
        body.bp1,
        bp1_date,
        body.bp2,
        bp2_date,
        body.bp3,
        bp3_date,
        body.bp4,
        bp4_date,
        body.step,
        step_date,
      ];
    }
    await db.begin();
    res = await db.execute(sql, params);
    await db.commit();
  } catch (e) {
    await db.roleback();
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
 * graph_月集計
 * @param {*} graph
 * @returns
 */
module.exports.graph = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const username = event.queryStringParameters.username;
  const year = event.queryStringParameters.year;
  try {
    for (let i = 1; i <= 12; i++) {
      const zi = zeroPadding(i, 2);
      const startDate = year + zi + '01';
      const endDate = year + zi + '31';

      sql = `
        SELECT
          AVG(weight) AS weight,
          AVG(bp1)    AS bp1,
          AVG(bp2)    AS bp2,
          AVG(bp3)    AS bp3,
          AVG(bp4)    AS bp4,
          SUM(step)   AS step
        FROM
          conditions
        WHERE
          pool_username = $1 AND
          condition_date >= $2 AND
          condition_date <= $3
      `;

      params = [username, startDate, endDate];
      res.push(await db.execute(sql, params));
    }
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
 * 直近14日分のデータを取得
 * @param {*} graph_day
 * @returns
 */
module.exports.graph_day = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const username = event.queryStringParameters.username;
  const addDate = Number(event.queryStringParameters.addDate);
  const condition_date = event.queryStringParameters.condition_date;

  // n日前の日付
  const dt1 = condition_date ? formatDate(condition_date) : createDateJp();
  dt1.setDate(dt1.getDate() + addDate);
  const startDate = formatYYYYMMDD(dt1);

  // 本日の日付
  const dt2 = condition_date ? formatDate(condition_date) : createDateJp();
  const endDate = formatYYYYMMDD(dt2);

  try {
    sql = `
      SELECT
        condition_date,
        weight,
        bp1,
        bp2,
        bp3,
        bp4,
        step
      FROM
        conditions
      WHERE
        pool_username = $1 AND
        condition_date >= $2 AND
        condition_date <= $3
      ORDER BY
        condition_date
    `;

    params = [username, startDate, endDate];
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
 * graph_週集計
 * @param {*} graph_month
 * @returns
 */
module.exports.graph_month = async (event) => {
  let sql = '';
  let res = [];
  let params = [];
  const db = await getPostgresClient();
  const username = event.queryStringParameters.username;
  let index = event.queryStringParameters.index;
  let max = event.queryStringParameters.max;

  // default
  index = index ? index : 0;
  max = max ? max : 30;

  try {
    sql = `
      SELECT
        interview_started_at
      FROM
        users
      WHERE
        pool_username = $1
    `;

    params = [username];
    const dRes = await db.execute(sql, params);

    let dt = new Date(dRes[0].interview_started_at);
    dt.setDate(dt.getDate() + max * 8 * index);
    let endDt = new Date(dt); // bug fix.
    endDt.setDate(endDt.getDate() + 7);

    for (let i = 0; i < max; i++) {
      const y = dt.getFullYear();
      const m = zeroPadding(dt.getMonth() + 1, 2);
      const d = zeroPadding(dt.getDate(), 2);
      const startDate = `${y}${m}${d}`;

      const yy = endDt.getFullYear();
      const mm = zeroPadding(endDt.getMonth() + 1, 2);
      const dd = zeroPadding(endDt.getDate(), 2);
      const endDate = `${yy}${mm}${dd}`;

      sql = `
        SELECT
          AVG(weight) AS weight,
          AVG(bp1)    AS bp1,
          AVG(bp2)    AS bp2,
          AVG(bp3)    AS bp3,
          AVG(bp4)    AS bp4,
          AVG(step)   AS step
        FROM
          conditions
        WHERE
          pool_username = $1 AND
          condition_date >= $2 AND
          condition_date <= $3
      `;

      dt.setDate(dt.getDate() + 8);

      endDt = new Date(dt); // bug fix.
      endDt.setDate(endDt.getDate() + 7);

      params = [username, startDate, endDate];
      res.push(await db.execute(sql, params));
    }
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
