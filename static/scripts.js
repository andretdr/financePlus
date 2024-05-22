const validationstatus = [  "<p></p><p></p>",
                            "Username must be alphanumeric",
                            "Password must be more then 8 characters",
                            "Password and confirmation do not match",
                            "Username exists",
                            "Incorrect Password or username",
                            "<p></p>",
                            "<p></p>",
                            "<p></p>",
                            "Holdings data entry not found", // Holdings data entry not found
                            "Symbol not found"
                        ];


/** Given a formElement object, returns the data in a set of dictionary values */
function returnData(argformEl){
    const formdata = new FormData(argformEl);  // write function for this
    const data = Object.fromEntries(formdata);
    return data;
}

/** validate name to be alpha numeric ONLY, given the string argname */
function validatename(argname){
    let pattern = /^[0-9a-zA-Z]+$/;
    if (!pattern.test(argname))
        return returnstatus(1, 'name');
    return returnstatus(0, 'name');
}

/** validate password to have atleast 8 characters, given the string argname */
function validatepassword(argpassword){
    if (argpassword.length < 8)
        return returnstatus(2, 'password');
    return returnstatus(0, 'password');
}

/** validate confirmation to have atleast 8 characters, given the string argname */
function validateconfirmation(argpassword, argconfirmation){
    if (argpassword != argconfirmation)
        return returnstatus(3, 'confirmation');
    return returnstatus(0, 'confirmation');
}

/** returns True if no status error, False if yes */
function isvalid(argstatusarr){
    let noerror = true;
    for (let thisstatus of argstatusarr)
        if (thisstatus['status'] != 0){
            noerror = false;
            return noerror;
        }
    return noerror;
}

/** add the correct messages to each of the status numbers in the argstatusarr, using the CONST valisationstatus */
function addmessage(argstatusarr, argvalidstat=validationstatus){
    let newstatusarr = [];
    let i = 0;
    for (let thisstatus of argstatusarr){
        newstatusarr[i] = thisstatus;
        newstatusarr[i]['message'] = argvalidstat[thisstatus['status']]
        i++;
    }
    return newstatusarr;
}

/** return status from CONST validationstatus, given the status number argn and what input, name or pw etc */
function returnstatus(argn, arginput, argvalidstat=validationstatus){
    return {"status":argn,"input":arginput,"message":argvalidstat[argn]};
}

/** print status given the selector and the status dictonary of the form {'status':n, 'message':txt}. 
 *  if argstatus is not provided, it prints '' */
function printstatus(argselector, argstatus={'message':''}){
    document.querySelector(argselector).innerHTML = argstatus['message'];
    document.querySelector(argselector).style.color = 'red';  
}


/** async fetch function, returns the obj */
async function fetcher(argroute, argmethod, argbody){
    let response = await fetch(argroute, {
        method: argmethod,
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify(argbody)
    });

    let responset = await response.text();
    let responseobj = JSON.parse(responset);

    return responseobj;
}





