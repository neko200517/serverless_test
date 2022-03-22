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
module.exports.formatStringToDate = (str) => {
  const y = str.substr(0, 4);
  const m = str.substr(4, 2);
  const d = str.substr(6, 2);
  return new Date(`${y}/${m}/${d}`);
};

/**
 * 日付をフォーマット
 * @param {*} date   // 日付オブジェクト
 * @param {*} format //書式フォーマット
 * @returns
 */
module.exports.formatDate = (date, format) => {
  format = format.replace(/yyyy/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
  format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
  return format;
};

/**
 * 日本時間を取得
 */
module.exports.createDateJp = () => {
  const dt = new Date(
    Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000
  );
  return this.formatDate(dt, 'yyyy/MM/dd HH:mm:ss.SSS');
};
