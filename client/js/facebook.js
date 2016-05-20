///////////////////////////////////////////////////////////////////////////////////////////
//  COPIED FROM EXAMPLE HERE: https://developers.facebook.com/docs/facebook-login/web/   //
///////////////////////////////////////////////////////////////////////////////////////////

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        testAPI(response.authResponse.accessToken);
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
    } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
    }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it
function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '560290390817084',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.5' // use graph api version 2.5
    });

    // Now that we've initialized the JavaScript SDK, we call
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });

};

// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI(accessToken) {
    console.log('Welcome!  Fetching your information.... ');
    var userName;
    var email;

    FB.api('/me?fields=id,email,name', function(response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('status').innerHTML =
            'Thanks for logging in, ' + response.name + '!';

        if (response.email) {
            userName = response.email;
            email = response.email;
        }
        else {
            userName = response.id;
        }

        if (userName) {
            var social;
            App42.initialize("2559ceb55813fb7db00085300d299b7adbcaffadc1986c903c13cdf8ab6fc600","f6f6a30be4c827d0823bbf1da705b64b161cf86d69ea88c7475de337e095a25e");
            var socialService  = new App42Social();

            // link social user
            socialService.linkUserFacebookAccount(userName, accessToken, {
                success: function(object) {
                    var response = JSON.parse(object);
                    social = response.app42.response.social;
                    console.log("userName is " + social.userName);
                    console.log("fb Access Token is " + social.facebookAccessToken)
                },
                error: function(error) {
                    console.log("Error linking facebook account: ", error);
                }
            });

            // create app42 user
            if (email) {
                var pwd = Math.random().toString(36).slice(-8);
                var result;
                var userService  = new App42User();
                userService.createUser(response.id, pwd, email,{
                    success: function(object)
                    {
                        var userObj = JSON.parse(object);
                        result = userObj.app42.response.users.user;
                        console.log("user created");
                        console.log("userName is " + result.userName);
                        console.log("emailId is " + result.email)
                    },
                    error: function(error) {
                        console.log("error creating user: ", error);
                    }
                });

                userService.getUser(response.id, {
                    success: function(object)
                    {
                        var userObj = JSON.parse(object);
                        result = userObj.app42.response.users.user;
                        console.log("got userName is " + result.userName);
                        console.log("emailId is " + result.email)
                    },
                    error: function(error) {
                        console.log("error getting user: ", error);
                    }
                });
            }
        }
    });


}
