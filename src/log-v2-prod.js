// https://cloud.google.com/logging/docs/structured-logging#special-payload-fields
// https://cloud.google.com/error-reporting/docs/formatting-error-messages

module.exports = function(name) {

  let self = this;

  self.space    = () => {};
  self.progress = () => {};

  function log(severity, data) {
    if(typeof data == 'object' && data instanceof 'Error')
      console.log(JSON.stringify({ message: data, severity }));
    else
      console.log(JSON.stringify({ message: data.message, stack_trace: data.stack }));
  }

  self.info   = (data) => log('INFO',    data);
  self.notice = (data) => log('NOTICE',  data);
  self.warn   = (data) => log('WARNING', data);
  self.error  = (data) => log('ERROR',   data);

}
