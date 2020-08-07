class API{
    get(path, parameters){
        let argumentString;
        for(var key in Object.keys(parameters)){
            argumentString=key;
            argumentString.concat(parameters[key]);
            argumentString.concat('&');
        }
        argumentString.slice(0,argumentString.length-2)
        await fetch(`${path}?${argumentString}`, {
            method: 'GET',
        })
        .then(async response => {
            if (parseInt(response.status/100)!==2)
                console.log(`Looks like there was a problem. Status Code: ${response.status}`);
            console.log(response);
            return await response.json();
        })
        .then(data => {
            user = data;
        })
        .catch(err => {
            throw (err);
        });
    }
}

export default API;