exports.length = (val, length, char = ' ') => {
  val = val + '';
  while(val.length < length)
    val = char + val;
  return val;
};