const Obj = require('./obj.js');



exports.cachefy = (fn, cache, keyFn) => {
  return async (...args) => {
    let key = keyFn(...args);
    let ret = cache.get(key);
    if(!ret) {
      ret = await fn(...args);
      cache.put(key, ret);
    }
    return ret;
  }
}

exports.ttl = function(ttl = 5 * 60, clone = true) {

  let map = {};
  ttl = Math.max(ttl, 60);

  this.get = (key) => {

    let obj = map[key];
    if(obj === undefined)
      return undefined;

    if(obj.expiry < Date.now())
      return undefined;

    let val = obj.value;

    if(clone && val !== null && typeof val == 'object')
      return Obj.clone(val);

    return val;

  };

  this.put = (key, val) => {

    if(val === undefined)
      return;

    if(clone && val !== null && typeof val == 'object')
      val = Obj.clone(val);

    map[key] = {
      value: val,
      expiry: Date.now() + Math.round(ttl * (1.05 - 0.1 * Math.random()) * 1000)
    };

  };

  this.delete = (key) => {
    delete map[key];
  };

  setInterval(() => {
    Object.entries(map).forEach(entry => {
      if(entry[1].expiry < Date.now())
        delete map[entry[0]];
    });
  }, 60 * 1000);

}

exports.lru = function(size, clone = true) {

  let queue = [];
  let map = {};

  this.get = (key) => {

    let val = map[key];

    if(val === undefined)
      return undefined;

    if(clone && val !== null && typeof val == 'object')
      return Obj.clone(val);

    return val;

  };

  this.put = (key, val) => {

    if(val === undefined)
      return;

    if(clone && val !== null && typeof val == 'object')
      val = Obj.clone(val);
    
    map[key] = val;

    let i = queue.indexOf(key);
    if(i == -1) {
      if(queue.length >= size) {
        key = queue.pop();
        delete map[key];
      }
    } else {
      queue.splice(i, 1);
    }

    queue.unshift(key);

  };

}
