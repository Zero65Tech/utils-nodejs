exports.from = (date) => {
  date = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return date.getUTCFullYear()
    + ((date.getUTCMonth() < 9 ? '-0' : '-') + (date.getUTCMonth() + 1))
    + ((date.getUTCDate() < 10 ? '-0' : '-') + date.getUTCDate());
}



exports.shift = (date, days) => {

  if(!date || !days)
    return date;

  date = date.substring(0, 10) + ' GMT+530';
  date = new Date(date).getTime() + days * 24 * 60 * 60 * 1000;
  date = new Date(date);
  date = exports.from(date);

  return date;

}

exports.getDuration = (startDate, endDate) => {
  var dtStart = (startDate ? new Date(startDate.substring(0, 10) + ' GMT+530') : new Date()).getTime() + 5.5 * 60 * 60 * 1000;
  var dtEnd   = (endDate   ? new Date(  endDate.substring(0, 10) + ' GMT+530') : new Date()).getTime() + 5.5 * 60 * 60 * 1000;
  return Math.floor(dtEnd / 1000 / 60 / 60 / 24) - Math.floor(dtStart / 1000 / 60 / 60 / 24);
}



exports.today = () => {
  return exports.from(new Date());
}

exports.yesterday = () => {
  return exports.from(new Date(Date.now() - 24 * 60 * 60 * 1000));
}

exports.lastWeek = () => {
  return exports.from(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
}



exports.getFy = (dateStr = exports.today()) => {
  return 'fy' + (parseInt(dateStr.substring(2,4)) + (dateStr.substring(5,10) >= '04-01' ? 1 : 0));
}

exports.getFyMonth = (dateStr) => {
  return [ 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC' ][ dateStr.substring(5,7) - 1 ];
}

exports.getFyStart = (dateStr = exports.today()) => {
  return 2000 + parseInt(dateStr.substring(2,4)) + (dateStr.substring(5,10) >= '04-01' ? 0 : -1) + '-04-01';
}

exports.getFyEnd = (dateStr = exports.today()) => {
  return 2000 + parseInt(dateStr.substring(2,4)) + (dateStr.substring(5,10) >= '04-01' ? 1 : 0) + '-03-31';
}

exports.getQtr = (dateStr = exports.today()) => {
  let md = dateStr.substring(5,10);
  if(md >= '10-01')
    return 'q3'
  else if(md >= '07-01')
    return 'q2'
  else if(md >= '04-01')
    return 'q1'
  else
    return 'q4'
}

exports.getTaxQtr = (dateStr = exports.today()) => {
  let md = dateStr.substring(5,10);
  if(md >= '12-16')
    return 'q4'
  else if(md >= '09-16')
    return 'q3'
  else if(md >= '06-16')
    return 'q2'
  else if(md >= '04-01')
    return 'q1'
  else if(md >= '03-16')
    return 'q5'
  else
    return 'q4'
}

exports.getFyDuration = (dateStr = exports.today()) => {
  return exports.getDuration(
    2000 + parseInt(dateStr.substring(2,4)) + (dateStr.substring(5,10) >= '04-01' ? 0 : -1) + '-04-01',
    2000 + parseInt(dateStr.substring(2,4)) + (dateStr.substring(5,10) >= '04-01' ? 1 :  0) + '-03-31'
  ) + 1;
}
