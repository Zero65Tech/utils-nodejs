exports.lru = (size) => {

  let queue = [];
  let map = {};

  self.get = (key) => {
    return map[key];
  };

  self.put = (key, val) => {

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
