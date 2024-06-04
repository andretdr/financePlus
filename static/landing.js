/** shows the login form on the landing page, hides login button */
function showlogin(){

    document.getElementById("landing-container__login-form-hideme").style.display = "flex";
    document.getElementById("landing-container__register-form-hideme").style.display = "none";

    document.getElementById("landing-container__buttonlogin").style.display = "none";
    document.getElementById("landing-container__buttonregister").style.display = "flex";
    
}


/** toggle show password */
function togglePW(param_id, param_cb){
    let element = document.getElementById(param_id);
    let checkbox = document.getElementById(param_cb)
    if (element.type === 'password'){
        element.type = 'text';
        checkbox.checked = true;
    }
    else {
        element.type = 'password';
        checkbox.checked = false;
    }
}


/** adds eventlistener to the login form */
function addEL_loginform(){
    let formEl = document.querySelector('#loginform');
    formEl.addEventListener("submit", async function(event) {
        event.preventDefault();

        const data = returnData(formEl);

        // validation check
        let statusarr = [];
        statusarr[0] = validatename(data['username']);
        statusarr[1] = validatepassword(data['password']);

        // print any errors from clientside check
        loginprintstatus(statusarr);

        // if fail validation check, dont proceed
        if (!(isvalid(statusarr)))
            return;

        // Post to server
        let response = await fetch('/login', {
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify(data)
        });

        let responset = await response.text();
        let responseobj = JSON.parse(responset);
       
        // print any errors from serverside check
        loginprintstatus(addmessage(responseobj));

        // if login sucessful
        if (isvalid(responseobj)){
            console.log(responseobj)
            window.location.href = "/";
        }

    });
}


/** given array of statuses, prints to correct location using 'input' of the status dict */
function loginprintstatus(argstatusarr){
    for (let i = 0; i < argstatusarr.length; i++){
        if (argstatusarr[i]['input'] == 'name')
            printstatus('#loginnamestatus', argstatusarr[i]);
        if (argstatusarr[i]['input'] == 'password')
            printstatus('#loginpasswordstatus', argstatusarr[i]);
    }
}


/** shows the register form on the landing page, hides register button */
function showregister(){

    document.getElementById("landing-container__login-form-hideme").style.display = "none";
    document.getElementById("landing-container__register-form-hideme").style.display = "flex";

    document.getElementById("landing-container__buttonlogin").style.display = "flex";
    document.getElementById("landing-container__buttonregister").style.display = "none";

}


/** adds eventlistener to the register form */
function addEL_registerform(){
    let formEl = document.querySelector('#registerform');
    formEl.addEventListener("submit", async function(event) {
        event.preventDefault();

        const data = returnData(formEl);

        // validation check
        let statusarr = [];
        statusarr[0] = validatename(data['username']);
        statusarr[1] = validatepassword(data['password']);
        statusarr[2] = validateconfirmation(data['password'], data['confirmation']);

        // print any errors from clientside check
        registerprintstatus(statusarr);
        
        // if fail validation check, dont proceed
        if (!(isvalid(statusarr)))
            return;

        // Post to server
        let response = await fetch('/register', {
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify(data)
        });

        let responset = await response.text();
        let responseobj = JSON.parse(responset);
       
        // print any errors from serverside check
        registerprintstatus(addmessage(responseobj));

        if (isvalid(responseobj)){
            console.log(responseobj)
            window.location.href = "/";
        }

    });
}

/** given array of statuses, prints to correct location using 'input' of the status dict */
function registerprintstatus(argstatusarr){
    for (let i = 0; i < argstatusarr.length; i++){
        // handles register status
        if (argstatusarr[i]['input'] == 'name')
            printstatus('#registernamestatus', argstatusarr[i]);
        if (argstatusarr[i]['input'] == 'password')
            printstatus('#registerpasswordstatus', argstatusarr[i]);
        if (argstatusarr[i]['input'] == 'confirmation')
            printstatus('#registerconfirmationstatus', argstatusarr[i]);
    }
}
