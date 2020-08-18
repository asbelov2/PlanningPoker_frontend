class API {
    apiURL = 'https://localhost:44356/api/';
    async request(path, method, parameters) {
        let argumentString = '';
        let data;
        if (Object.keys(parameters).length > 0) {
            for (var key in parameters) {
                argumentString = argumentString.concat(key, '=', parameters[key], '&');
            }
            argumentString = argumentString.slice(0, argumentString.length - 1)
        }
        await fetch(this.apiURL + ((Object.keys(parameters).length > 0) ? `${path}?${argumentString}` : `${path}`), {
                method: method,
            })
            .then(async response => {
                if (!response.ok) {
                    throw new Error(`HTTP status ${response.status}`);
                }
                if (method == 'GET')
                    data = await response.json();
            })
            .catch(err => {
                throw (err);
            });
        if (method == 'GET')
            return data;
    }

    async requestWithID(path, method, parameters, id, pathAfterId = '') {
        let argumentString = '';
        let data;
        if (Object.keys(parameters).length > 0) {
            for (var key in parameters) {
                argumentString = argumentString.concat(key, '=', parameters[key], '&');
            }
            argumentString = argumentString.slice(0, argumentString.length - 1);
        }
        let url = '';
        url = url.concat(
            this.apiURL, 
            `${path}/${id}`, 
            (pathAfterId == '') ? '' : `/${pathAfterId}`, 
            ((Object.keys(parameters).length > 0) ? `?${argumentString}` : ''));
        console.log(url);
        await fetch(url, {
                method: method,
            })
            .then(async response => {
                if (!response.ok) {
                    throw new Error(`HTTP status ${response.status}`);
                }
                console.log(response);
                if (method == 'GET')
                    data = await response.json();
            })
            .catch(err => {
                throw (err);
            });
        if (method == 'GET')
            return data;
    }
}

export default API;