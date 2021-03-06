/**
 * @module WP
 * @submodule WPRequest
 * @beta
 */

/*jshint -W079 */// Suppress warning about redefiniton of `Promise`
const Promise = require( 'bluebird' );
const agent = require( 'superagent' );

/**
 * WPRequest is the base API request object constructor
 *
 * @class WPRequest
 * @constructor
 * @param {Object} options A hash of options for the WPRequest instance
 * @param {String} options.endpoint The endpoint URI for the invoking WP instance
 * @param {String} [options.username] A username for authenticating API requests
 * @param {String} [options.password] A password for authenticating API requests
 */
function WPRequest( options ) {
	/**
	 * Configuration options for the request such as the endpoint for the invoking WP instance
	 * @property _options
	 * @type Object
	 * @default {}
	 */
	this._options = options || {};

	/**
	 * Methods supported by this API request instance:
	 * Individual endpoint handlers specify their own subset of supported methods
	 * @property _supportedMethods
	 * @type Array
	 * @default [ 'head', 'get', 'put', 'post', 'patch', 'delete' ]
	 */
	this._supportedMethods = [ 'head', 'get', 'put', 'post', 'patch', 'delete' ];
}

// Helpers
// =======

/**
 * No-op function for use within ensureFunction()
 *
 * @private
 */
function noop() {}

/**
 * Identity function for use within invokeAndPromisify()
 *
 * @private
 */
function identity( value ) {
	return value;
}

/**
 * If fn is a function, return it; else, return a no-op function
 *
 * @private
 *
 * @param {Function|undefined} fn A WPRequest request callback
 * @return {Function} The provided callback function or a no-op
 */
function ensureFunction( fn ) {
	return ( typeof fn === 'function' ) ? fn : noop;
}

/**
 * Submit the provided superagent request object, invoke a callback (if it was
 * provided), and return a promise to the response from the HTTP request.
 *
 * @private
 *
 * @param {Object} request A superagent request object
 * @param {Function} callback A callback function (optional)
 * @param {Function} transform A function to transform the result data (optional)
 * @return {Promise} A promise to the superagent request
 */
function invokeAndPromisify( request, callback, transform ) {
	callback = ensureFunction( callback );
	transform = transform || identity;

	return new Promise(function( resolve, reject ) {
		// Fire off the result
		request.end(function( err, result ) {

			// Invoke the callback (if provided), to conform to standard Node pattern
			callback( err, transform( result ) );

			// Return the results as a promise
			if ( err || result.error ) {
				reject( err || result.error );
			} else {
				resolve( transform( result ) );
			}
		});
	});
}

/**
 * Extract and return the body property from a superagent response object
 *
 * @private
 *
 * @param {Object} result The results from the HTTP request
 * @return {Object} The "body" property of the result
 */
function returnBody( result ) {
	return result.body;
}

/**
 * Extract and return the headers property from a superagent response object
 *
 * @private
 *
 * @param {Object} result The results from the HTTP request
 * @return {Object} The "headers" property of the result
 */
function returnHeaders( result ) {
	return result.headers;
}

// Prototype Methods
// =================

/**
 * @method _checkMethodSupport
 * @param {String} method An HTTP method to check ('get', 'post', etc)
 * @return true iff the method is within this._supportedMethods
 */
WPRequest.prototype._checkMethodSupport = function( method ) {
	if ( this._supportedMethods.indexOf( method.toLowerCase() ) === -1 ) {
		throw new Error(
			'Unsupported method; supported methods are: ' +
			this._supportedMethods.join( ', ' )
		);
	}

	return true;
};

/**
 * Generate the URI for the HTTP request (overridden in the modules for
 * handling individual endpoints)
 *
 * @protected
 *
 * @method generateRequestUri
 * @return {String} The URI target for the HTTP request
 */
WPRequest.prototype.generateRequestUri = function() {
	return this._options.endpoint;
};

// HTTP Methods
// ============

/**
 * @method get
 * @async
 * @param {Function} [callback] A callback to invoke with the results of the GET request
 * @param {Error|Object} callback.err Any errors encountered during the request
 * @param {Object} callback.result The body of the server response
 * @return {Promise} A promise to the results of the HTTP request
 */
WPRequest.prototype.get = function( callback ) {
	this._checkMethodSupport( 'get' );
	var url = this.generateRequestUri();

	return invokeAndPromisify( agent.get( url ), callback, returnBody );
};

/**
 * @method post
 * @async
 * @param {Object} data The data for the POST request
 * @param {Function} [callback] A callback to invoke with the results of the POST request
 * @param {Error|Object} callback.err Any errors encountered during the request
 * @param {Object} callback.result The body of the server response
 * @return {Promise} A promise to the results of the HTTP request
 */
WPRequest.prototype.post = function( data, callback ) {
	this._checkMethodSupport( 'post' );
	var url = this.generateRequestUri();
	var auth = this._options.username + ':' + this._options.password;
	data = data || {};

	var request = agent.post( url )
		.set( 'Authorization', auth )
		.send( data );

	return invokeAndPromisify( request, callback, returnBody );
};

/**
 * @method put
 * @async
 * @param {Object} data The data for the PUT request
 * @param {Function} [callback] A callback to invoke with the results of the PUT request
 * @param {Error|Object} callback.err Any errors encountered during the request
 * @param {Object} callback.result The body of the server response
 * @return {Promise} A promise to the results of the HTTP request
 */
WPRequest.prototype.put = function( data, callback ) {
	this._checkMethodSupport( 'put' );
	var url = this.generateRequestUri();
	var auth = this._options.username + ':' + this._options.password;
	data = data || {};

	var request = agent.put( url )
		.set( 'Authorization', auth )
		.send( data );

	return invokeAndPromisify( request, callback, returnBody );
};

/**
 * @method patch
 * @async
 * @param {Function} [callback] A callback to invoke with the results of the PATCH request
 * @param {Error|Object} callback.err Any errors encountered during the request
 * @param {Object} callback.result The body of the server response
 * @return {Promise} A promise to the results of the HTTP request
 */
WPRequest.prototype.patch = function( callback ) {
	this._checkMethodSupport( 'patch' );
	// var url = this.generateRequestUri();
	callback = ensureFunction( callback );
	// todo: no idea what this method is supposed to do but it's documented in the WP-API docs.
};

/**
 * @method delete
 * @async
 * @param {Function} [callback] A callback to invoke with the results of the DELETE request
 * @param {Error|Object} callback.err Any errors encountered during the request
 * @param {Object} callback.result The body of the server response
 * @return {Promise} A promise to the results of the HTTP request
 */
WPRequest.prototype.delete = function( callback ) {
	this._checkMethodSupport( 'delete' );
	var url = this.generateRequestUri();
	var auth = this._options.username + ':' + this._options.password;
	var request = agent.del( url ).set( 'Authorization', auth );

	return invokeAndPromisify( request, callback, returnBody );
};

/**
 * @method head
 * @async
 * @param {Function} [callback] A callback to invoke with the results of the HEAD request
 * @param {Error|Object} callback.err Any errors encountered during the request
 * @param {Object} callback.result The headers from the server response
 * @return {Promise} A promise to the header results of the HTTP request
 */
WPRequest.prototype.head = function( callback ) {
	this._checkMethodSupport( 'head' );
	var url = this.generateRequestUri();

	return invokeAndPromisify( agent.head( url ), callback, returnHeaders );
};

/**
 * Calling .then on a query chain will invoke it as a GET and return a promise
 *
 * @method then
 * @async
 * @param {Function} [callback] A callback to invoke with the results of the GET request
 * @param {Object} callback.results The body of the server response
 * @return {Promise} A promise to the results of the HTTP request
 */
WPRequest.prototype.then = function( callback ) {
	return this.get().then( callback );
};

module.exports = WPRequest;
