exports.length = (val, length, char = ' ') => {
  val = val + '';
  while(val.length < length)
    val = char + val;
  return val;
};

exports.currency = (amount, d = 2) => {
  let f = exports.number(Math.abs(amount), d);
  if(f === null)
    return null;
  return amount < 0 ? ('- ₹' + f) : ('₹' + f);
}

exports.number = (number, d = 0) => {

  if(!number || Math.abs(number) < 0.0001)
    return null;

  number = Math.round(number * Math.pow(10, d));

  let numberStr = Math.abs(number) + '';
  let l = numberStr.length;
  for(; l < d; l++)
    numberStr = '0' + numberStr;

  if(l == d)
    numberStr = '0.' + numberStr;
  else if(l <= 3 + d)
    numberStr = numberStr.substring(0, l - d) + (d ? '.' + numberStr.substring(l - d) : '');
  else if(l <= 5 + d)
    numberStr = numberStr.substring(0, l - 3 - d) + ',' + numberStr.substring(l - 3 - d, l - d) + (d ? '.' + numberStr.substring(l - d) : '')
  else
    numberStr = numberStr.substring(0, l - 5 - d) + ',' + numberStr.substring(l - 5 - d, l - 3 - d) + ',' + numberStr.substring(l - 3 - d, l - d) + (d ? '.' + numberStr.substring(l - d) : '');
  
  return (number < 0 ? '- ' : '') + numberStr;

};