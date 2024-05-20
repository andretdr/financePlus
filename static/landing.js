/** shows the login form on the landing page, hides login button */
function showlogin(){
    html =  `
            <form id="loginform">
                <div>
                    <input autocomplete='off' autofocus 'type='text' name='username' placeholder='Username' />
                </div>
                <div id="loginnamestatus">

                </div>
                <div>
                    <input autocomplete='off' autofocus 'type='text' name='password' placeholder='Password' />
                </div>
                <div id="loginpasswordstatus">

                </div>
                <button>Submit</button>
            </form>
            `
    document.querySelector('#landingitemlogin').innerHTML = html;
    
    addEL_loginform();
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


/** hides the login form on the landing page, shows the login button */
function hidelogin(){
    html =  `
            <button class="btn btn-primary" id="loginstart">Login</button>

            `
    document.querySelector('#landingitemlogin').innerHTML = html;

    let button = document.querySelector("#loginstart");
    button.addEventListener('click', function(){
        showlogin();
        hideregister();
    });
}



/** shows the register form on the landing page, hides register button */
function showregister(){
html =  `
            <form id="registerform">
                <div>
                    <input autocomplete='off' autofocus type='text' name='username' placeholder='Username' />
                </div>
                <div id="registernamestatus">

                </div>
                <div>
                    <input autocomplete='off' autofocus type='text' name='password' placeholder='Password' />
                </div>
                <div id="registerpasswordstatus">

                </div>
                <div>
                    <input autocomplete='off' autofocus type='text' name='confirmation' placeholder='Reconfirm Password' />
                </div>
                <div id="registerconfirmationstatus">

                </div>

                <button>Submit</button>
            </form>
            `
    document.querySelector('#landingitemregister').innerHTML = html;

    addEL_registerform();
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


/** hides the register form on the landing page, shows the register button */
function hideregister(){
html =  `
            <button class="btn btn-primary" id="registerstart">Create Account</button>

            `
    document.querySelector('#landingitemregister').innerHTML = html;

    let button = document.querySelector("#registerstart");
    button.addEventListener('click', function(){
        showregister();
        hidelogin();
    });
}
