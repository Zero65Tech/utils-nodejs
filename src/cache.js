const Obj = require('./obj.js');



exports.ttl = function(ttl = 5 * 60) {

  ttl = Math.max(ttl, 60);

  let queue = [];
  let map = {};

  this.get = (key) => {
    return map[key].ttl < Date.now() ? Obj.clone(map[key].value) : null;
  };

  this.put = (key, val) => {
    map[key] = {
      value: val,
      expiry: Math.ceil(Date.now() / (ttl * 1000)) * ttl * 1000
    };
  };

  setInterval(() => {
    Object.entries(map).forEach(entry => {
      if(entry[1].ttl < Date.now())
        delete map[entry[0]];
    });
  }, ttl * 1000);

}

exports.lru = function(size) {

  let queue = [];
  let map = {};

  this.get = (key) => {
    return Obj.clone(map[key]) || null;
  };

  this.put = (key, val) => {

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
