const fs = require('fs');
const http = require('http');
const https = require('https');
const querystring = require('querystring');
const unzipper = require('unzipper');

const httpAgent = new http.Agent({
  keepAlive: true, 
  maxSockets: Infinity
});

const httpsAgent = new https.Agent({
  keepAlive: true, 
  maxSockets: Infinity
});



exports.download = (host, path, headers = {}, message = {}, downloadPath) => {

  return new Promise((resolve, reject) => {

    const options = {
      hostname: host,
      port: 443,
      path: Object.keys(message).length ? path + '?' + querystring.stringify(message) : path,
      method: 'GET',
      headers: {},
      agent: httpsAgent
    };

    const req = https.request(options, (res) => {

      if(res.statusCode == 200) {

        let i = downloadPath.lastIndexOf('/');
        if(i != -1) {
          let downloadDir = downloadPath.substring(0, i);
          if(!fs.existsSync(downloadDir))
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        let file = fs.createWriteStream(downloadPath);
        file.on('finish', () => resolve({ status: res.statusCode, headers: res.headers }) );
        res.pipe(file);
        
      } else {
        resolve({ status: res.statusCode, headers: res.headers });
      }

    });

    req.on('error', (e) => resolve({ status: 0, error: e }) );

    req.end();

  });

}

exports.downloadAndUnzip = (host, path, headers = {}, message = {}, downloadPath) => {

  return new Promise((resolve, reject) => {

    const options = {
      hostname: host,
      port: 443,
      path: Object.keys(message).length ? path + '?' + querystring.stringify(message) : path,
      method: 'GET',
      headers: headers,
      agent: httpsAgent
    };

    const req = https.request(options, (res) => {

      if(res.statusCode == 200) {
        res.pipe(unzipper.Extract({ path: downloadPath }))
          .on('close', () => resolve({ status: res.statusCode, headers: res.headers }))
          .on('error', e  => resolve({ status: 0, error: e }));
      } else {
        resolve({ status: res.statusCode, headers: res.headers });
      }

    });

    req.on('error', (e) => { resolve({ status: 0, error: e }); });

    req.end();

  });

}



function processRes(res, data) {

  let contentType = res.headers['content-type'] ? res.headers['content-type'].split(';') : [];

  if(data && contentType.indexOf('application/json') != -1)
    return {
      status: res.statusCode,
      headers: res.headers,
      data: JSON.parse(data)
    };

  return {
    status: res.statusCode,
    headers: res.headers,
    data: data
  };

}

exports.doGet = (host, path, headers = {}, query = {}) => {

  let port = 443;

  let i = host.indexOf(':');
  if(i != -1) {
    port = parseInt(host.substring(i + 1));
    host = host.substring(0, i);
  }

  if(Object.keys(query).length) {
    Object.entries(query).forEach(entry => {
      let [ key, value ] = entry;
      if(value instanceof Array) {
        delete query[key];
        query[key + '[]'] = value;
      }
    });
    path += '?' + querystring.stringify(query).replace(/%5B%5D/g,'[]');
  }

  return new Promise((resolve, reject) => {

    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      headers: headers,
      agent: port == 443 ? httpsAgent : httpAgent,
    };

    const req = (port == 443 ? https : http).request(options, (res) => {

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(processRes(res, data));
      });

    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();

  });

}

exports.doPost = (host, path, headers = {}, body = {}) => {

  let port = 443;

  let i = host.indexOf(':');
  if(i != -1) {
    port = parseInt(host.substring(i + 1));
    host = host.substring(0, i);
  }

  headers['content-type'] = headers['content-type'] || 'application/json';
  if(headers['content-type'] == 'application/json')
    body = JSON.stringify(body);
  else if(headers['content-type'] == 'application/x-www-form-urlencoded')
    body = querystring.stringify(body);
  headers['content-length'] = body.length;

  return new Promise((resolve, reject) => {

    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'POST',
      headers: headers,
      agent: 443 ? httpsAgent : httpAgent
    };

    const req = (port == 443 ? https : http).request(options, (res) => {

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(processRes(res, data));
      });

    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(body);
    req.end();

  });

}

exports.close = () => {
  httpAgent.destroy();
  httpsAgent.destroy();
}