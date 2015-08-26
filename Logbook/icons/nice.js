var filename = process.argv[process.argv.length - 1];

var exec = require('child_process').exec;
var cmd = 'swfextract ' + filename;

exec(cmd, function(error, stdout, stderr) {
  console.log(stderr);
  var pos1 = stdout.indexOf("[-p]");
  var pos2 = stdout.indexOf("[-f]");
  var s1 = stdout.slice(pos1 + 4, pos2);
  s1 = s1.replace(" ", '');
  s1 = s1.replace("\n", '');
  var comp = s1.split("ID(s)");
  var ids = comp[1].split(',');
  for (var i = 0; i < ids.length; i++) {
    var idn = parseInt(ids[i]);
    var ecmd = "swfextract " + filename + ' -p ' + idn + ' -o ' + idn + '.png';
    exec(ecmd);
    console.log(ecmd);
  }
});
