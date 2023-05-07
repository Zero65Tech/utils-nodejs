const Obj = require('./obj.js');



exports.ttl = function(ttl = 5 * 60) {

  let map = {};
  ttl = Math.max(ttl, 60);

  this.get = (key) => {

    let obj = map[key];
    if(obj === undefined)
      return undefined;

    let val = obj.value;
    if(val === null)
      return null;
    if(typeof val == 'object')
      return Obj.clone(val);
    return val;

  };

  this.put = (key, val) => {

    if(val === undefined)
      return;

    map[key] = {
      value: val,
      expiry: Math.ceil(Date.now() / (ttl * 1000)) * ttl * 1000
    };

  };

  setInterval(() => {
    Object.entries(map).forEach(entry => {
      if(entry[1].expiry < Date.now())
        delete map[entry[0]];
    });
  }, 60 * 1000);

}

exports.lru = function(size) {

  let queue = [];
  let map = {};

  this.get = (key) => {
    let val = map[key];
    if(val === undefined)
      return undefined;
    if(val === null)
      return null;
    if(typeof val == 'object')
      return Obj.clone(val);
    return val;
  };

  this.put = (key, val) => {

    if(val === undefined)
      return;

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
