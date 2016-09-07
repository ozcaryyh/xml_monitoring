/**
 * http://usejsdoc.org/
 */
var chokidar = require('chokidar'),
	fs = require('fs'),
	xml2js = require('xml2js'),
	request = require('request');

function http_response(error, response, body) {
	if (error) {
		return console.error('Upload failed:', error);
	}
	console.log('Upload successful! Server responded with:', body);
}

function parse_xml(path, stats) {
	var parser = new xml2js.Parser({explicitArray: false});
	
	//console.log('path = ', path, ' stats = ', stats);
	
	fs.readFile(path, function(err, data) {
	    parser.parseString(data, function (err, result) {
	        //console.dir(result);
	    	//console.log('Length: ', result.sensors.sensor.length);
	        
	    	for(var i = 0; i < result.sensors.sensor.length; i++) {
	    		//console.log(result.sensors.sensor[i]);
	    		
	    		request({
		    		method: 'POST',
		    		preambleCRLF: true,
		    		postambleCRLF: true,
		    		uri: 'https://mastermind-sampsontan.c9users.io:8080/sensor',
		    		json: result.sensors.sensor[i]
		    	},
		    	http_response);
			}
	    	
	    	console.log('Done');
	    });
	});
}

module.exports = function fmon(root_path) {
	var log = console.log.bind(console);
	var work_path = '';

	if (!root_path) {
		work_path = '.';
	} else {
		work_path = root_path;	
	}
	
	log('work_path is', work_path);
	
	var watcher = chokidar.watch(work_path, {
	  ignored: /[\/\\]\./, persistent: true
	});
	
	watcher
	  //.on('add', function(path) { log('File', path, 'has been added'); })
	  .on('add', parse_xml)
	  .on('addDir', function(path) { log('Directory', path, 'has been added'); })
	  .on('change', function(path) { log('File', path, 'has been changed'); })
	  .on('unlink', function(path) { log('File', path, 'has been removed'); })
	  .on('unlinkDir', function(path) { log('Directory', path, 'has been removed'); })
	  .on('error', function(error) { log('Error happened', error); })
	  .on('ready', function() { log('Initial scan complete. Ready for changes.'); })
	  .on('raw', function(event, path, details) { log('Raw event info:', event, path, details); });
	
	// 'add', 'addDir' and 'change' events also receive stat() results as second
	// argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
	watcher.on('change', function(path, stats) {
	  if (stats) { console.log('File', path, 'changed size to', stats.size); }
	});
	
	// Watch new files.
	//watcher.add('new-file');
	//watcher.add(['new-file-2', 'new-file-3', '**/other-file*']);
	
	// Un-watch some files.
	//watcher.unwatch('new-file*');
	
	// Only needed if watching is `persistent: true`.
	//watcher.close();
	
	// One-liner
	//require('chokidar').watch('./in_xml/', {ignored: /[\/\\]\./}).on('all', function(event, path) {
	//  console.log(event, path);
	//});

};
