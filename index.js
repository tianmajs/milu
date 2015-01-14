module.exports = function wrap(fn) {
	var children = [];
	
	fn = fn || function (next, done) {
		next(done);
	};
	
	function wrapper(context, callback) {
		var deep = false,
		
			next = function (callback) {
				var len = children.length,
					i = 0;
			
				deep = true;
				
				(function next(err, deep) {
					if (err || deep || i >= len) {
						callback.call(context, err);
					} else {
						children[i++](context, next);
					}
				}());
			},
			
			done = function (err) {
				callback && callback(err, deep);
			};
		
		fn.call(context, next, done);
	}
	
	wrapper.pipe = function (fn) {
		var child = wrap(fn);
		
		children.push(child);
		
		return child;
	};
	
	return wrapper;
};
