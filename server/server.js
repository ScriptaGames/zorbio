#!/bin/env node

// initialize sentry error capturing
var Raven = require('raven');
var raven = new Raven.Client('https://1c4c71e0f3874af3a6ac2893d6531db5:8b37517edbeb46eab534ba15f35c0713@app.getsentry.com/94116');
raven.patchGlobal();

//  Sample Node.js WebSocket Client-Server application
var http            = require('http');
var express         = require('express');
var WebSocketServer = require('ws').Server;
var AppServer       = require('./AppServer.js');
var config          = require('../common/config.js');
var packageJson     = require('../package.json');

// Patch console.x methods in order to add timestamp information
require("console-stamp")(console, {pattern: "mm/dd/yyyy HH:MM:ss.l"});

/**
 *  Define the sample server.
 */
var MainServer = function () {

    //  Scope
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.port = process.env.PORT || config.PORT;
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('Received %s - terminating sample server ...', sig);
            process.exit(1);
        }
        console.log('Node server stopped.');
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(0); });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function () {
        self.app = express();
        self.httpServer = http.Server(self.app);

        // Set up WebSocket Server
        var options = {
            server: self.httpServer
        };
        options.verifyClient = function wssVerifyClient(info, callback) {
            if (info.origin === config.ORIGIN) {
                callback(true);
                return true;
            }
            callback(false);
            return false;
        };
        self.wss = new WebSocketServer(options);

        // Set up express static content root
        self.app.use(express.static(__dirname + '/../' + (process.argv[2] || 'client')));

        // The app server contains all the logic and state of the WebSocket app
        self.appServer = new AppServer(self.wss, self.app);
    };


    /**
     *  Initializes the server
     */
    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.httpServer.listen(self.port, function () {
            console.log("Zorbio v" + packageJson.version + "-" + packageJson.build + " is listening on http://localhost:" + self.port);
        });
    };
};


/**
 *  main():  Main code.
 */
var mainServer = new MainServer();
mainServer.initialize();
mainServer.start();

