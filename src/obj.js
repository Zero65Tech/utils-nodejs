const Js = require('./js.js');



exports.toTable = (obj, sortRow, sortCol) => {

  let rowNames = Object.keys(obj);
  obj = this.transpose(obj);
  let colNames = Object.keys(obj);

  if(typeof sortRow == 'function') {
    rowNames.sort(sortRow);
  } else if(typeof sortRow == 'object' && sortRow instanceof Array) {
    rowNames.sort((a, b) => Js.sortByOrderFn(a, b, sortRow));
  }

  if(typeof sortCol == 'function') {
    colNames.sort(sortCol);
  } else if(typeof sortCol == 'object' && sortCol instanceof Array) {
    colNames.sort((a, b) => Js.sortByOrderFn(a, b, sortCol));
  }

  let rows = [];
  for(let i = 0; i < rowNames.length; i++) {
    rows[i] = [];
    for(let j = 0; j < colNames.length; j++)
      rows[i][j] = obj[colNames[j]][rowNames[i]];
    rows[i].unshift(rowNames[i]);
  }

  colNames.unshift(null);
  rows.unshift(colNames);
  return rows;

}



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

exports.pushUnique = (obj, keys, val) => {

  let i = 0;
  for( ; i < keys.length - 1; i++) {
    obj[keys[i]] = obj[keys[i]] || {};
    obj = obj[keys[i]];
  }

  obj[keys[i]] = obj[keys[i]] || [];
  if(obj[keys[i]].indexOf(val) == -1)
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

exports.delete = (obj, keys) => {

  let last = keys.pop();

  for(let key of keys) {
    if(!obj[key])
      return;
    obj = obj[key];
  }

  delete obj[last];

}



exports.clean = (obj) => {
  for(let [ key, value ] of Object.entries(obj)) {

    if(typeof value != 'object') {

      if(value === undefined || value === null || value === '' || value === 0)
        delete obj[key];

    } else if(value instanceof Array) {

      if(value.length == 0)
        delete obj[key];

    } else {

      this.clean(obj[key]);

      if(Object.keys(value).length == 0)
        delete obj[key];

    }

  }
}

exports.round = (obj, roundFn) => {
  Object.keys(obj).forEach(key => {

    if(typeof obj[key] == 'number') {
      obj[key] = roundFn(obj[key]);

    } else if(typeof obj[key] == 'object') {
      this.round(obj[key], roundFn);
      
    } else {
      // Do Nothing

    }
  
  });
}

exports.sort = (obj, sortOrder) => {

  let keys = Object.keys(obj);

  if(sortOrder)
    keys.sort((a, b) => Js.sortByOrderFn(a, b, sortOrder));
  else
    keys.sort();

  let ret = {};
  for(let key of keys)
    ret[key] = obj[key];

  return ret;

}

exports.sortDeep = (obj, ...sortOrders) => {

  let sortOrder = sortOrders[0];
  sortOrders = sortOrders.slice(1);

  let keys = Object.keys(obj);
  if(sortOrder == null)
    keys.sort();
  else
    keys.sort((a, b) => Js.sortByOrderFn(a, b, sortOrder));

  let ret = {};
  for(let key of keys) {
    if(typeof obj[key] == 'object' && sortOrders.length)
      ret[key] = exports.sortDeep(obj[key], ...sortOrders);
    else
      ret[key] = obj[key];
  }

  return ret;

}



exports.transpose = (obj) => {
  let trans = {};
  for(let key1 in obj) {
    for(let key2 in obj[key1]) {
      trans[key2] = trans[key2] || {};
      trans[key2][key1] = obj[key1][key2];
    }
  }
  return trans;
}

exports.clone = (obj) => {

  if(obj instanceof Array) {

    return obj.map(value => {
      if(value === undefined || value === null
          || typeof value == 'boolean'
          || typeof value == 'number'
          || typeof value == 'string'
          || typeof value == 'function')
        return value;
      else
        return exports.clone(value);
    });

  } else {

    let clone = {};
    for(let [ key, value ] of Object.entries(obj)) {
      if(value === undefined || value === null
          || typeof value == 'boolean'
          || typeof value == 'number'
          || typeof value == 'string'
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
