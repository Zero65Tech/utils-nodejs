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