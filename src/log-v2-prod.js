// https://cloud.google.com/logging/docs/structured-logging#special-payload-fields
// https://cloud.google.com/error-reporting/docs/formatting-error-messages

module.exports = function(name) {

  let self = this;

  self.space    = () => {};
  self.progress = () => {};

  self.info   = (data) => console.log(JSON.stringify({ message: `${ data } (${ name })`, severity: 'INFO'   }));
  self.notice = (data) => console.log(JSON.stringify({ message: `${ data } (${ name })`, severity: 'NOTICE' }));

  function log(severity, data) {
    console.log(JSON.stringify({
      severity,
      message : `${ data } (${ name })`,
      "@type" : "type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent",
      serviceContext: { service: process.env.K_SERVICE, version: process.env.K_REVISION, resourceType: 'cloud_run_revision' }
    }));
  }

  self.warn   = (data) => log('WARNING', data);
  self.error  = (data) => log('ERROR',   data);

}
