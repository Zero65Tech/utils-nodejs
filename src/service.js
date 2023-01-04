const File = require('./file.js');
const http = require('./http.js');
const { GoogleAuth } = require('google-auth-library');
var idToken = null;



const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/userinfo.email'
});

const SERVICES = {
  "market": {
    "test": { "host": "market.zero65.in", "prefix": "/api" },
    "prod": { "host": "market-ci6dfndpjq-as.a.run.app" }
  },
  "amc": {
    "test": { "host": "amc.zero65.in", "prefix": "/api" },
    "prod": { "host": "amc-ci6dfndpjq-as.a.run.app" }
  },
  "zerodha": {
    "test": { "host": "zerodha.zero65.in", "prefix": "/api" },
    "prod": { "host": "zerodha-ci6dfndpjq-as.a.run.app" }
  },
  "invest": {
    "test": { "host": "invest.zero65.in", "prefix": "/api" },
    "prod": { "host": "invest-ci6dfndpjq-as.a.run.app" }
  },
  "paisa": {
    "test": { "host": "paisa.zero65.in", "prefix": "/api" },
    "prod": { "host": "paisa-ci6dfndpjq-as.a.run.app" }
  }
};



async function doRequest(name, api, method, headers = {}, data = {}, throwError = true) {

  if(idToken == null)
    idToken = (await File.read('.auth') || '').trim();

  if(!SERVICES[name])
    if(throwError)
      throw new Error(`Service "${ name }" not found.`);
    else
      return { status: 404, data: 'Service not found !' };

  if(!SERVICES[name][process.env.ENV])
    if(throwError)
      throw new Error(`Host not found for service "${ name }".`);
    else
      return { status: 404, data: 'Service not found !' };

  let { host, prefix } = SERVICES[name][process.env.ENV];
  prefix = prefix || '';

  headers['User-Agent'] = process.env.ENV + '/' + (process.env.K_REVISION || process.env.USER || process.env.HOSTNAME);
  // Google Cloud Build
  if(idToken)
    headers['Authorization'] = 'Bearer ' + idToken;
  // Google Cloud Run
  else if(process.env.ENV == 'prod')
    headers['Authorization'] = 'Bearer ' + (await http.doGet(
      'metadata.google.internal:80',
      '/computeMetadata/v1/instance/service-accounts/default/identity',
      { 'Metadata-Flavor': 'Google' },
      { 'audience': 'https://' + host }
    )).data;
  // Test Environment
  else
   headers['Authorization'] = 'Bearer ' + await auth.getAccessToken();

  let res;
  if(method == 'GET')
    res = await http.doGet(host, prefix + api, headers, data);
  else if(method == 'POST')
    res = await http.doPost(host, prefix + api, headers, data);

  if(!throwError)
    return res;

  if(res.status == 200)
    return res.data;

  throw new Error(`HTTP ${ res.status } from ${ name }${ api } ${ res.data }`);

}

exports.doGet = async (name, api, headers = {}, query = {}, throwError = true) => {
  return await doRequest(name, api, 'GET', headers, query, throwError);
}

exports.doPost = async (name, api, headers = {}, body = {}, throwError = true) => {
  return await doRequest(name, api, 'POST', headers, body, throwError);
}
