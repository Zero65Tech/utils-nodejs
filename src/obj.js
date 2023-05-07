const Js = require('./js.js');



exports.get = (obj, keys) => {

  for(let i = 0; obj && i < keys.length; i++)
    obj = obj[keys[i]];

  return obj;

}

exports.set = (obj, keys, val) => {

  let i = 0;
  for( ; i < keys.length - 1; i++) {
    obj[keys[i]] = obj[keys[i]] || {};
    obj = obj[keys[i]];
  }

  obj[keys[i]] = val;
  
}

exports.add = (obj, keys, val) => {

  let i = 0;
  for( ; i < keys.length - 1; i++) {
    obj[keys[i]] = obj[keys[i]] || {};
    obj = obj[keys[i]];
  }

  if(typeof val == 'number')
    obj[keys[i]] = (obj[keys[i]] || 0) + val;
  else if(typeof val == 'object')
    obj[keys[i]] = Js.addObjects(obj[keys[i]] || {}, val);
  
}

exports.push = (obj, keys, val) => {

  let i = 0;
  for( ; i < keys.length - 1; i++) {
    obj[keys[i]] = obj[keys[i]] || {};
    obj = obj[keys[i]];
  }

  obj[keys[i]] = obj[keys[i]] || [];
  obj[keys[i]].push(val);

}

exports.update = (obj, keys, fn) => {

  let i = 0;
  for( ; i < keys.length - 1; i++) {
    obj[keys[i]] = obj[keys[i]] || {};
    obj = obj[keys[i]];
  }

  obj[keys[i]] = fn(obj[keys[i]]);

}



exports.clone = (obj) => {

  if(obj instanceof Array) {

    return obj.map(value => {
      if(value === undefined || value === null
          || typeof value == 'number' || typeof value == 'string'
          || typeof value == 'function')
        return value;
      else
        return exports.clone(value);
    });

  } else {

    let clone = {};
    for(let entry of Object.entries(obj)) {

      let [ key, value ] = entry;

      if(value === undefined || value === null
          || typeof value == 'number' || typeof value == 'string'
          || typeof value == 'function')
        clone[key] = value;
      else
        clone[key] = exports.clone(value);

    }
    return clone;

  }

}



exports.filter = (obj, key, filter) => {
  
  let entries = Object.entries(obj);

  if(typeof filter == 'function') {
    if(key == '__key')
      entries = entries.filter(entry => filter(entry[0]));
    else
      entries = entries.filter(entry => filter(entry[1][key]));
  
  } else if(filter instanceof Array) {
    if(key == '__key')
      entries = entries.filter(entry => filter.indexOf(entry[0]) != -1);
    else
      entries = entries.filter(entry => entry[1][key] ? filter.indexOf(entry[1][key]) != -1 : false);
  
  } else if(filter != undefined) {
    if(key == '__key')
      entries = entries.filter(entry => entry[0] == filter);
    else
      entries = entries.filter(entry => entry[1][key] == filter);
  
  } else {
    if(key == '__key')
      entries = entries;
    else
      entries = entries.filter(entry => entry[1][key] != undefined);
  }

  portfolio = {};
  for(entry of entries)
    portfolio[entry[0]] = entry[1];

  return portfolio;

}



exports.itr = (obj, level, fn, ...vals) => {
  if(level) {
    if(typeof obj == 'object')
      Object.keys(obj).forEach(key => exports.itr(obj[key], level - 1, fn, ...vals, key));
  } else {
    fn(...vals, obj);
  }
}

exports.nav = (obj, keys, fn, ...vals) => {
  
  if(!keys.length)
    return fn(...vals, obj);
  
  if(typeof obj != 'object')
    return;

  Object.keys(obj).forEach(key => {
    if(key.match(keys[0]))
      exports.nav(obj[key], keys.slice(1), fn, ...vals, key);
  });

}

exports.fn = async (obj, fns, ...vals) => {
  if(fns.length) {
    let keys = Object.keys(obj);
    for(let i = 0; i < keys.length; i++)
      obj[keys[i]] = fns[0]
          ? (await fns[0](await exports.fn(obj[keys[i]], fns.slice(1), ...vals, keys[i]), ...vals, keys[i])) || obj[keys[i]]
          : await exports.fn(obj[keys[i]], fns.slice(1), ...vals, keys[i]);
  }
  return obj;
}
