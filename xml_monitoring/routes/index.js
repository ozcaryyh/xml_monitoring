
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
  
  console.log('inside index');
};

exports.j = function(req, res){
  res.render('index', { title: 'jExpress' });
  
  console.log('inside j');
};
