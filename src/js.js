exports.round = (val, d = 0) => {
  if(d <= 0)
    return Math.round(val);
  let m = Math.pow(10, d);
  return Math.round(val * m) / m;
}

// TODO: Deprecate
exports.roundQty = (val) => {
  return exports.round(val, 8);
}

// TODO: Deprecate
exports.roundPrice = (val) => {
  return exports.round(val, 8);
}

// TODO: Deprecate
exports.roundAmt = (val) => {
  return exports.round(val, 6);
}



exports.minStr = (str1, str2) => {

  if(str1 === undefined)
    return str2;
  if(str2 === undefined)
    return str1;

  if(str1 === null)
    return str2;
  if(str2 === null)
    return str1;

  return str1 <= str2 ? str1 : str2;

}

exports.maxStr = (str1, str2) => {

  if(str1 === undefined)
    return str2;
  if(str2 === undefined)
    return str1;

  if(str1 === null)
    return str2;
  if(str2 === null)
    return str1;

  return str1 >= str2 ? str1 : str2;

}



exports.concatArrayUnique = (arr1, arr2) => {
  let arr = [];
  arr1.forEach(val => {
    if(arr.indexOf(val) == -1)
      arr.push(val);
  });
  arr2.forEach(val => {
    if(arr.indexOf(val) == -1)
      arr.push(val);
  });
  return arr;
}



exports.sortByOrderFn = (a, b, sortOrder) => {
  if(a == b)
    return 0;  
  return sortOrder.indexOf(a) < sortOrder.indexOf(b) ? -1 : 1;
}

// TODO: Deprecate. Use sortByOrderFn.
exports.sortByEval = (sortOrder, a, b, i) => {
  if(i == undefined) {
    if(a != b)
      return sortOrder.indexOf(a) < sortOrder.indexOf(b) ? -1 : 1;
  } else {
    if(a[i] != b[i])
      return sortOrder.indexOf(a[i]) < sortOrder.indexOf(b[i]) ? -1 : 1;
  }
  return 0;
}

// TODO: Deprecate
exports.sortByEvals = (a, b, i, iSortOrder, j, jSortOrder) => {
  if(a[i] != b[i])
    return iSortOrder.indexOf(a[i]) < iSortOrder.indexOf(b[i]) ? -1 : 1;
  if(a[j] != b[j])
    return jSortOrder.indexOf(a[j]) < jSortOrder.indexOf(b[j]) ? -1 : 1;
  return 0;
}

// TODO: Deprecate
exports.sortObject = (obj, deep = false) => {
  return Object.keys(obj).sort().reduce((ret, key) => {
    ret[key] = deep && (typeof obj[key] == 'object') && !(obj[key] instanceof Array) ? exports.sortObject(obj[key], deep) : obj[key];
    return ret;
  }, {});
}

// TODO: Deprecate
exports.sortObjectByEval = (obj, sortOrder, deep = false) => {
  return Object.keys(obj).sort((a, b) => exports.sortByEval(sortOrder, a, b)).reduce((ret, key) => {
    ret[key] = deep && (typeof obj[key] == 'object') && !(obj[key] instanceof Array) ? exports.sortObjectByEval(obj[key], sortOrder, deep) : obj[key];
    return ret;
  }, {});
}



// TODO: Deprecate
exports.roundObject = (obj, roundFn, cleanUp) => {
  Object.keys(obj).forEach(key => {

    if(typeof obj[key] == 'number') {
      obj[key] = roundFn(obj[key]);
      if(cleanUp && obj[key] == 0)
        delete obj[key];

    } else if(obj[key] == '') {
      if(cleanUp)
        delete obj[key];

    } else if(typeof obj[key] == 'object') {
      this.roundObject(obj[key], roundFn, cleanUp);
      if(cleanUp && Object.keys(obj[key]).length == 0)
        delete obj[key];
      
    } else {
      // Do Nothing

    }
  
  });
  return obj;
}

exports.sumObject = (obj) => {
  let sum = 0;
  Object.keys(obj).forEach(key => {
    if(typeof obj[key] == 'number')
      sum += obj[key];
    else if(typeof obj[key] == 'object')
      sum += this.sumObject(obj[key]);
    // else
      // Do Nothing
  });
  return sum;
}

exports.addObjects = (obj1, obj2) => {
  let obj = {};
  let keys = this.concatArrayUnique(Object.keys(obj1), Object.keys(obj2));
  keys.forEach(key => {
    if(typeof obj1[key] == 'number' || typeof obj2[key] == 'number')
      obj[key] = (obj1[key] || 0) + (obj2[key] || 0);
    else if(typeof obj1[key] == 'string' || typeof obj2[key] == 'string')
      obj[key] = (obj1[key] || '') == (obj2[key] || '') ? (obj1[key] || '') : (obj1[key] || '') + (obj2[key] || '');
    else if(typeof obj1[key] == 'object' || typeof obj2[key] == 'object')
      obj[key] = this.addObjects(obj1[key] || {}, obj2[key] || {});
  });
  return obj;
}

exports.subtractObjects = (obj1, obj2) => {
  let obj = {};
  for(let key of this.concatArrayUnique(Object.keys(obj1), Object.keys(obj2))) {

    if(obj1[key] == null) {

      if(typeof obj2[key] == 'number')
        obj[key] = -obj2[key];

      else if(typeof obj2[key] == 'object')
        obj[key] = this.subtractObjects({}, obj2[key]);

      else
        obj[key] = NaN;

    } else if(obj2[key] == null) {

      if(typeof obj1[key] == 'number')
        obj[key] = obj1[key];

      else if(typeof obj1[key] == 'object')
        obj[key] = this.subtractObjects(obj1[key], {});

      else
        obj[key] = NaN;

    } else if(typeof obj1[key] == 'number' && typeof obj2[key] == 'number') {

      obj[key] = obj1[key] - obj2[key];

    } else if(typeof obj1[key] == 'object' && typeof obj2[key] == 'object') {

      obj[key] = this.subtractObjects(obj1[key], obj2[key]);
      
    } else {

      obj[key] = NaN;

    }

  }
  return obj;
}

exports.groupObjectKeys = (obj, keyFn) => {
  let ret = {};
  Object.keys(obj).forEach(key => {
    let newKey = keyFn(key);
    if(typeof obj[key] == 'object')
      ret[newKey] = exports.addObjects(ret[newKey] || {}, obj[key]);
    else
      ret[newKey] = (ret[newKey] || 0) + obj[key];
  });
  return ret;
}



// TODO: Deprecate
exports.getValueInObject = (obj, ...keys) => {
  for(let i = 0; i < keys.length; i++)
    if((obj = obj[keys[i]]) === undefined)
      return undefined;
  return obj;
}

// TODO: Deprecate
exports.addValueInObject = (val, obj, ...keys) => {
  let i = 0;
  for(; i < keys.length - 1; i++) {
    obj[keys[i]] = obj[keys[i]] || {};
    obj = obj[keys[i]];
  }
  obj[keys[i]] = (obj[keys[i]] || 0) + val;
}

// TODO: Deprecate
exports.pushValueInObject = (val, obj, ...keys) => {
  let i = 0;
  for(; i < keys.length - 1; i++) {
    obj[keys[i]] = obj[keys[i]] || {};
    obj = obj[keys[i]];
  }
  obj[keys[i]] = obj[keys[i]] || [];
  obj[keys[i]].push(val);
}

// TODO: Deprecate
exports.fnObject = (obj, keys, fn, def, ...params) => {

  let val = obj;
  for(let i = 0; i < keys.length; i++) {
    val = val[keys[i]];
    if(val == undefined) {
      val = def;
      break;
    }
  }

  let ret = fn(val, ...params);

  if(ret) {
    let i = 0;
    for(; i < keys.length - 1; i++) {
      obj[keys[i]] = obj[keys[i]] || {};
      obj = obj[keys[i]];
    }
    obj[keys[i]] = ret;
  }

}

// TODO: Deprecate
exports.nestFnObject = async (obj, ...fns) => {
  if(fns.length) {
    let keys = Object.keys(obj);
    for(let i = 0; i < keys.length; i++)
      obj[keys[i]] = await fns[0](keys[i], await exports.nestFnObject(obj[keys[i]], ...fns.slice(1)));
  }
  return obj;
}

// TODO: Deprecate
exports.nestSynFnObject = async (srcObj, dstObj, ...fns) => {
  if(fns.length) {
    let keys = Object.keys(srcObj);
    for(let i = 0; i < keys.length; i++) {
      let ret = await fns[0](keys[i], srcObj[keys[i]], await exports.nestSynFnObject(srcObj[keys[i]], dstObj ? dstObj[keys[i]] : undefined, ...fns.slice(1)));
      if(!ret)
        continue;
      dstObj = dstObj || {};
      dstObj[keys[i]] = ret;
    }
  }
  return dstObj;
}



exports.transposeObject = (obj) => {
  let trans = {};
  Object.keys(obj).forEach(key1 => {
    Object.keys(obj[key1]).forEach(key2 => {
      trans[key2] = trans[key2] || {};
      trans[key2][key1] = obj[key1][key2];
    });
  });
  return trans;
}

exports.objectToArray = (obj, name = '-', totalCol, totalRow, sortColFn, sortRowFn, addFn, totalRowOnTop) => {

  let heads = Object.keys(obj);
  if(sortColFn)
    heads.sort(sortColFn);

  let rowMap = {};
  heads.forEach((head, i) => {
    Object.keys(obj[head]).forEach(key => {
      if(!rowMap[key])
        rowMap[key] = Array(heads.length).fill(0);
      rowMap[key][i] = obj[head][key];
    });
  });

  let table = [];
  Object.entries(rowMap).forEach(entry => {
    if(totalCol)
      entry[1].push(entry[1].reduce(addFn ? (a,b) => addFn(a, b, entry[0]) : (a,b) => a + b, 0));
    entry[1].unshift(entry[0]);
    table.push(entry[1]);
  });

  if(sortRowFn)
    table.sort(sortRowFn);

  if(totalCol)
    heads.push(totalCol);
  heads.unshift(name);

  if(totalRow) {
    let totalArr = Array(heads.length).fill(0);
    totalArr[0] = totalRow;
    for(let i = 0; i < table.length; i++)
      for(let j = 1; j < heads.length; j++)
        totalArr[j] = addFn ? addFn(totalArr[j], table[i][j], heads[j]) : totalArr[j] + table[i][j];
    if(totalRowOnTop)
      table.unshift(totalArr);
    else
      table.push(totalArr);
  }

  table.unshift(heads);

  return table;

}

exports.objectToTable = (obj, name = '-', totalColName, totalRowName, sortColFn, sortRowFn, totalColFn, totalRowFn) => {

  // Total Row

  if(!totalRowName)
    totalRowFn = (totalRow, row) => { return { ...totalRow, ...row }; } 
  else if(!totalRowFn)
    totalRowFn = exports.addObjects;

  let totalRow = Object.values(obj).reduce(totalRowFn, {});

  // Column Names

  let colNames = Object.keys(totalRow);
  if(sortColFn)
    colNames.sort(sortColFn instanceof Array ? (a, b) => exports.sortByEval(sortColFn, a, b) : sortColFn);

  // Row Names

  let rowNames = Object.keys(obj);
  if(sortRowFn)
    rowNames.sort(sortRowFn instanceof Array ? (a, b) => exports.sortByEval(sortRowFn, a, b) : sortRowFn);

  // Appending Total Row

  if(totalRowName) {
    obj[totalRowName] = totalRow;
    rowNames.push(totalRowName);
  }

  // Appending Total Column

  if(totalColName) {
    if(!totalColFn)
      totalColFn = exports.sumObject;
    Object.values(obj).forEach(row => row[totalColName] = totalColFn(row));
    colNames.push(totalColName);
  }

  // Table

  let table = [ [ name ].concat(colNames) ];
  for(let rowName of rowNames) {
    let row = colNames.map(colName => obj[rowName][colName] || 0);
    row.unshift(rowName);
    table.push(row);
  }

  return table;

}



// TODO: Deprecate
exports.lru = (size) => {

  let queue = [];
  let map = {};

  return {

    get: (key) => {
      return map[key];
    },

    put: (key, val) => {

      map[key] = val;

      let i = queue.indexOf(key);
      if(i != -1)
        queue.splice(i, 1);
      queue.unshift(key);

      if(queue.length > size) {
        key = queue.pop();
        delete map[key];
      }

    }

  }

}
