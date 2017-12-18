	
	var autoCloseTime=0;
	var autoCloseFunction;
	var temp;
	var callSucc=true;
	var loggedIn=false;
	var autoEnable=false;
	var status;
	var storage = window.localStorage;
	var savedToken=storage.getItem("token")
	document.getElementById("open").hidden=true;
	document.getElementById("nav_home").addEventListener("click",nav_home);
    document.getElementById("nav_temperature").addEventListener("click",nav_temperature);
    document.getElementById("logout_button").addEventListener("click",logout);
    document.getElementById("nav_login").addEventListener("click",nav_login);
    document.getElementById("customized").addEventListener("click",nav_setting);
    document.getElementById("open").addEventListener("click",openDoor);
    document.getElementById("setBuzz").addEventListener("click",setBuzz);
    document.getElementById("locked").addEventListener("change",lockChecked);
    document.getElementById("setTemp").addEventListener("click",setTemp);

    var particle = new Particle();
	var deviceId = '270033000651353530373132';  
	init();
	var spinner=document.getElementById("spinner");
	particle.getEventStream({ deviceId: deviceId, name: 'Update', auth: savedToken }).then(function(stream) {
	  	stream.on('event', function(data) {
	   		console.log("Event: ", data);
	    	updateStatus(data.data);
	  	});
	});
	//Update the current door status
	function updateStatus(s){
		status=s;
		console.log("updateStatus"+s);
		document.getElementById("status").innerHTML="Mouse Trap is "+s;
		if(s=="open"){
			document.getElementById("open").hidden=true;
		}
		else if(s=="closed"){
			document.getElementById("open").hidden=false;
			document.getElementById("open").innerHTML="Open";
		}
		spinner.hidden=true;
	}
	function callSuccess(data) {
		callSucc=true
	    console.log('Function called succesfully:', data);
	    spinner.hidden=true;
	    particle.getEventStream({ deviceId: deviceId, name: 'Update', auth: savedToken }).then(function(stream) {
	  	stream.on('event', function(data) {
	   		console.log("Event: ", data);
	    	updateStatus(data.data);
	  	});
		});
	}
	function callFailure(error) {
		callSucc=false
	    console.log('An error occurred:', error);
    	document.getElementById("login").hidden=true;
    	document.getElementById("door").hidden=true;
    	document.getElementById("temp").hidden=true;
    	document.getElementById("setting").hidden=true;

	}
	//logout function set the other divs to hidden
	function logout(){
		document.getElementById("logout_button").hidden=true;
	    document.getElementById("login").hidden=false;
	    document.getElementById("door").hidden=true;
	    document.getElementById("setting").hidden=true;
	    document.getElementById("temp").hidden=true;
	    storage.setItem("token", "")
	    storage.setItem("tokenExpirationTime", 0)
	    var elements = document.getElementsByTagName("input");
		for (var i=0; i < elements.length; i++) {
		    elements[i].value = "";
		}
		document.getElementById("username").value=storage.getItem("email");
		document.getElementById("pwd").value=storage.getItem("password");
		loggedIn=false;
	}
	//Set the navigation bar current style
	function nav_setting(){
		if(loggedIn){
			document.getElementById("logout_button").hidden=true;
			document.getElementById("door").style.right = "60%";
			document.getElementById("setting").style.left = "60%";	
		    document.getElementById("login").hidden=true;
		    document.getElementById("door").hidden=false;
		    document.getElementById("setting").hidden=false;
		    document.getElementById("logout_button").hidden=false;
		    document.getElementById("temp").hidden=true;
		}
	}
	//Initial the sebpage to log in
	function init() {
		var tokenExpiration=Number(new Date(storage.getItem("tokenExpirationTime")).getTime())
		var now=Number(new Date ( Date.now() ).getTime())
		var diff=tokenExpiration-now
		d1 = new Date ( Date.now() );
		console.log (d1.toString() );
		console.log("difference"+diff)
		if(diff/ 1000<=0){
			logout()
		}
		else{
			loggedIn=true;
			document.getElementById("logout_button").hidden=false;
		    document.getElementById("login").hidden=true;
		    document.getElementById("door").hidden=false;
		    document.getElementById("setting").hidden=true;
		    document.getElementById("temp").hidden=true;
		    document.getElementById("setting").hidden=true;
		    console.log(storage.getItem("token"))
		    var savedToken=storage.getItem("token")
		    deviceId='270033000651353530373132'
		    console.log(deviceId)
		    particle.getVariable({ deviceId: deviceId, name: 'status', auth: savedToken }).then(function(data) {
				console.log('Device variable retrieved successfully:', data);  
				state=data.body.result;
				console.log(state);
				document.getElementById("status").innerHTML="Mouse trap is "+state;
				if(state=="open"){
					document.getElementById("open").innerHTML="Close";
				}
				else if(state=="closed"){
					document.getElementById("open").hidden=false;
					document.getElementById("open").innerHTML="Open";
				}
				spinner.hidden=true;
			},callFailure);		    	
		}
	}
    //login function to take in account and password and do particle log in
	function nav_login() {
		spinner.hidden=false;
		
		console.log(new Date(storage.getItem("tokenExpirationTime")).getTime())
	
		particle.login({username: document.getElementById("username").value, password: document.getElementById("pwd").value}).then(
			function(data) {
			  	storage.setItem("email", document.getElementById("username").value)
				storage.setItem("password", document.getElementById("pwd").value)
				document.getElementById("logout_button").hidden=false;
				console.log(username)
				console.log(document.getElementById("pwd").value)
			    token = data.body.access_token;
				storage.setItem("token", token)
				console.log(token)
			    console.log(storage.getItem("token"))
			    d2 = new Date ( Date.now() );
			    console.log (d2.toString() );
				d2.setTime(d2.getTime()+50000);
				console.log(d2 );
			    storage.setItem("tokenExpirationTime", d2)
				loggedIn=true;
		    	document.getElementById("login").hidden=true;
		    	document.getElementById("door").hidden=false;
		    	document.getElementById("logout_button").hidden=false;
		    	document.getElementById("temp").hidden=true;
		    	document.getElementById("setting").hidden=true;
		    	
		    	particle.getVariable({ deviceId: deviceId, name: 'status', auth: token }).then(function(data) {
					console.log('Device variable retrieved successfully:', data);  
					state=data.body.result;
					console.log(state);
					document.getElementById("status").innerHTML="Mouse trap is "+state;
					if(state=="open"){
						document.getElementById("open").hidden=true;
					}
					else if(state=="closed"){
						updateStatus(state);
						console.log("state is closed");
						document.getElementById("open").hidden=false;
						document.getElementById("open").innerHTML="Open";
					}
					spinner.hidden=true;
				},callFailure);
			  },
			  function (err) {
			    console.log('Could not log in.', err);
			    alert("Wrong username/password");
		    	spinner.hidden=true;
			  }
			);
		}
	//Navigate to home page where only door status is displayed.
	function nav_home(){
		var savedToken=storage.getItem("token")
		if(callSucc){
			if(loggedIn==true){
				particle.getVariable({ deviceId: deviceId, name: 'status', auth: savedToken }).then(function(data) {
					console.log('Device variable retrieved successfully:', data);  
					state=data.body.result;
					console.log(state);
					document.getElementById("status").innerHTML="Mouse trap is "+state;
					if(state=="open"){
						document.getElementById("open").hidden=true;
					}
					else if(state=="closed"){
						updateStatus(state);
						console.log("state is closed");
						document.getElementById("open").hidden=false;
						document.getElementById("open").innerHTML="Open";
					}
				},callFailure);
			    document.getElementById("login").hidden=true;
			    document.getElementById("door").hidden=false;
			    document.getElementById("logout_button").hidden=false;
			    document.getElementById("setting").hidden=true;
			    document.getElementById("door").style.right = "40%";
			    document.getElementById("temp").hidden=true;
			}
		}
	}

	function nav_temperature() {
		if(callSucc){
			if(loggedIn==true){
		    	document.getElementById("login").hidden=true;
		    	document.getElementById("door").style.right = "60%";
				document.getElementById("temp").style.left = "60%";	
		    	document.getElementById("door").hidden=false;
		    	document.getElementById("logout_button").hidden=false;
		    	document.getElementById("setting").hidden=true;
		    	document.getElementById("temp").hidden=false;
		    }
		}
	}

	//Open mouse trap door
	function openDoor(){
		particle.getVariable({ deviceId: deviceId, name: 'status', auth: savedToken }).then(function(data) {
		console.log('Device variable retrieved successfully:', data);  
			var state=data.body.result;
			console.log(state);
			if(state=="closed"){
				particle.callFunction({ deviceId: deviceId, name: 'opendoor', argument:'opening', auth: savedToken }).then(
				callSuccess,callFailure);
				document.getElementById("open").hidden=false;
			}
		},callFailure);
	}
	
	function setTemp(){
		temp=document.getElementById("tempInput").value;
		alert("Temperature Set to "+temp+" F");
		storage.setItem("temp",temp);
		document.getElementById("tempDis").innerHTML="Temperature Set to "+storage.getItem("temp")+" F";
	}
	//Child mode function to lock the trap door
	function lock(){
		particle.callFunction({ deviceId: deviceId, name: 'lock', argument:'gg', auth: savedToken }).then(
			callSuccess,callFailure);
	}
	//Unlock the trap door when child mode is disabled
	function unlock(){
		particle.callFunction({ deviceId: deviceId, name: 'unlock', argument:'gg', auth: savedToken }).then(
			callSuccess,callFailure);
	}
	//Check if child mode is enabled.
	function lockChecked(){
		if(document.getElementById("locked").checked){
			lock();
		}
		else{
			unlock();
		}
		
	}
	//Set buzzer time interval
	function setBuzz(){
		console.log(document.getElementById("buzz").value.toString());
		var buzzTime=document.getElementById("buzz").value.toString();
		particle.callFunction({ deviceId: deviceId, name: 'setBuzzer', argument:buzzTime, auth: savedToken }).then(
			callSuccess,callFailure);
	}