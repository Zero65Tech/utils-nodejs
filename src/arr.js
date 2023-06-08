exports.toString = (arr) => {

  if(!arr.length)
    return null;

  let str = '';
  for(let item of arr)
    str += ', ' + item;

  return str.substring(2);
  
}

exports.toObj = (arr, heads) => {
  let obj = {};
  for(let i = 0; i < heads.length; i++)
    obj[heads[i]] = arr[i];
  return obj;
}

exports.pushUnique = (arr, item) => {
  if(arr.indexOf(item) == -1)
    arr.push(item);
}

exports.sortByIndices = (arr, indices) => {
  arr.sort((a, b) => {
    for(let i of indices)
      if(a[i] != b[i])
        return a[i] < b[i] ? -1 : 1;
    return 0;
  });
}

exports.sortByKeys = (arr, keys) => {
  arr.sort((a, b) => {
    for(let key of keys)
      if(a[key] != b[key])
        return a[key] < b[key] ? -1 : 1;
    return 0;
  });
}