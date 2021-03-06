const chai = require( 'chai' );
const expect = chai.expect;
const sinon = require( 'sinon' );
const sandbox = require( 'sandboxed-module' );

const UsersRequest = require( '../../lib/users' );

describe( 'wp.users', function() {

	describe( 'constructor', function() {

		it( 'should create a UsersRequest instance', function() {
			var query1 = new UsersRequest();
			expect( query1 instanceof UsersRequest ).to.be.true;
		});

		it( 'should set any passed-in options', function() {
			var users = new UsersRequest({
				booleanProp: true,
				strProp: 'Some string'
			});
			expect( users._options.booleanProp ).to.be.true;
			expect( users._options.strProp ).to.equal( 'Some string' );
		});

		it( 'should default _options to {}', function() {
			var users = new UsersRequest();
			expect( users._options ).to.deep.equal( {} );
		});

		it( 'should intitialize instance properties', function() {
			var users = new UsersRequest();
			expect( users._id ).to.be.null;
			var _supportedMethods = users._supportedMethods.sort().join( '|' );
			expect( _supportedMethods ).to.equal( 'get|head|post' );
		});

		it( 'should inherit UsersRequest from WPRequest using util.inherits', function() {

			var utilInherits = sinon.spy();
			sandbox.load( '../../lib/users', {
				requires: {
					'./WPRequest': 'WPRequestMock',
					'util': {
						inherits: utilInherits
					}
				}
			});

			// [ 0 ][ 1 ]: Call #1, Argument #2 should be our request mock
			expect( utilInherits.args[ 0 ][ 1 ] ).to.equal( 'WPRequestMock' );
		});

	});

	describe( 'prototype.generateRequestUri', function() {

		var users;

		beforeEach(function() {
			users = new UsersRequest();
			users._options = {
				endpoint: '/wp-json/'
			};
		});

		it( 'should create the URL for retrieving all users', function() {
			var url = users.generateRequestUri();
			expect( url ).to.equal( '/wp-json/users' );
		});

		it( 'should create the URL for retrieving the current user', function() {
			var url = users.me().generateRequestUri();
			expect( url ).to.equal( '/wp-json/users/me' );
		});

		it( 'should create the URL for retrieving a specific user by ID', function() {
			var url = users.id( 1337 ).generateRequestUri();
			expect( url ).to.equal( '/wp-json/users/1337' );
		});

	});

});
