const { Pool } = require('pg');

const dev = true;
let username;
let password;
let host;
let port;
let dbname;
if (dev) {
  username = 'admin';
  password = 'admin';
  host = 'localhost';
  port = '5432';
  dbname = 'lib';
} else {
  username = 'postgres';
  password = 'postgres';
  host = 'lib-dev-test.c9bt76lwtglh.ap-northeast-1.rds.amazonaws.com';
  port = '5432';
  dbname = 'postgres';
}
const connectionString = `postgresql://${username}:${password}@${host}:${port}/${dbname}`;
const pool = new Pool({ connectionString });

/**
 * Postgresクラス
 */
class Postgres {
  /**
   * Poolからclientを取得
   * @return {Promise<void>}
   */
  async init() {
    this.client = await pool.connect();
  }

  /**
   * SQLを実行
   * @param query
   * @param params
   * @return {Promise<*>}
   */
  async execute(query, params = []) {
    return (await this.client.query(query, params)).rows;
  }

  /**
   * 取得したクライアントを解放してPoolに戻す
   * @return {Promise<void>}
   */
  async release() {
    await this.client.release(true);
  }

  /**
   * Transaction Begin
   * @return {Promise<void>}
   */
  async begin() {
    await this.client.query('BEGIN');
  }

  /**
   * Transaction Commit
   * @return {Promise<void>}
   */
  async commit() {
    await this.client.query('COMMIT');
  }

  /**
   * Transaction Rollback
   * @return {Promise<void>}
   */
  async rollback() {
    await this.client.query('ROLLBACK');
  }
}

/**
 * Postgresのインスタンスを返却
 * @return {Promise<Postgres>}
 */
const getClient = async () => {
  const postgres = new Postgres();
  await postgres.init();
  return postgres;
};

module.exports.getPostgresClient = getClient;
