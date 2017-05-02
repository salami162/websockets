requirejs.config({
    baseUrl: 'scripts/app',
    paths: {
      vendor: '../vendor'
    }
});


// define window
define('window', function () {
  return window;
});


require([
  'vendor/jquery',
  'vendor/underscore'
], function (
  $,
  _
) {
  console.log(result, result1);
});

