module.exports = {

  Js     : require('./src/js.js'),
  Arr    : require('./src/arr.js'),
  Obj    : require('./src/obj.js'),
  DtStr  : require('./src/date-str.js'),
  Format : require('./src/format.js'),
  Cache  : require('./src/cache.js'),

  File   : require('./src/file.js'),
  Http   : require('./src/http.js'), // Deprecated

  LogV2  : process.env.ENV == 'test'
      ? require('./src/log-v2-chalk.js')
      : (process.env.PROJECT ? require('./src/log-v2-gcp.js') : require('./src/log-v2.js')),

}