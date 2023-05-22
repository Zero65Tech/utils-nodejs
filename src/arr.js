exports.toString = (arr) => {

  if(!arr.length)
    return null;

  let str = '';
  for(let item of arr)
    str += ', ' + item;

  return str.substring(2);
  
}

exports.pushUnique = (arr, item) => {
  if(arr.indexOf(item) == -1)
    arr.push(item);
}