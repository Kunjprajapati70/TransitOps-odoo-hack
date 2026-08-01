const { Parser } = require('json2csv');

exports.jsonToCsv = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (err) {
    console.error('CSV Generation Error:', err.message);
    throw new Error('CSV Generation failure');
  }
};
