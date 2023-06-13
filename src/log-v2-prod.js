// https://cloud.google.com/logging/docs/structured-logging#special-payload-fields
// https://cloud.google.com/error-reporting/docs/formatting-error-messages

module.exports = function(name) {

  let self = this;

  self.space    = () => {};
  self.progress = () => {};

  function log(severity, data) {
    if(typeof data == 'object' && data instanceof 'Error')
      console.log(JSON.stringify({
        severity,
        message     : data.message,
        stack_trace : data.stack
      }));
    else
      console.log(JSON.stringify({
        severity,
        message : data,
        "@type" : "type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent",
        serviceContext: { service: process.env.K_SERVICE, version: process.env.K_REVISION, resourceType: 'cloud_run_revision' }
      }));
  }

  self.info   = (data) => console.log(JSON.stringify({ message: data, severity: 'INFO'    }));
  self.notice = (data) => console.log(JSON.stringify({ message: data, severity: 'NOTICE'  }));

  self.warn   = (data) => log('WARNING', data);
  self.error  = (data) => log('ERROR',   data);

}
