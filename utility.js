/**
 * レスポンスヘッダ_テンプレート
 */
module.exports.responceTemplate = {
  // CORS有効化
  headers: {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  },
};

/**
 * 0埋め
 * @param {*} num
 * @param {*} len
 * @returns
 */
module.exports.zeroPadding = (num, len) => {
  return (Array(len).join('0') + num).slice(-len);
};

/**
 * Date型をYYYYMMDDの形式に変換
 * @param {Date} dt
 * @returns
 */
module.exports.formatYYYYMMDD = (dt) => {
  const y = this.zeroPadding(dt.getFullYear(), 4);
  const m = this.zeroPadding(dt.getMonth() + 1, 2);
  const d = this.zeroPadding(dt.getDate(), 2);
  return y + m + d;
};

/**
 * DBから取得した日付型を文字列型として返す
 * @returns
 */
module.exports.createDateString = (dt) => {
  if (!dt) return null;
  const tmp_dt = new Date(dt);
  const y = tmp_dt.getFullYear();
  const m = tmp_dt.getMonth() + 1;
  const d = tmp_dt.getDate();
  const h = tmp_dt.getHours();
  const mm = tmp_dt.getMinutes();
  const s = tmp_dt.getSeconds();
  return `'${y}-${m}-${d} ${h}:${mm}:${s}'`;
};

/**
 * YYYYMMDDをDate型にする
 * @param {*} str
 * @returns
 */
module.exports.formatDate = (str) => {
  const y = str.substr(0, 4);
  const m = str.substr(4, 2);
  const d = str.substr(6, 2);
  return new Date(`${y}/${m}/${d}`);
};

/**
 * 日本時間を取得
 */
module.exports.createDateJp = () => {
  return new Date(
    Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000
  ).getHours();
};
