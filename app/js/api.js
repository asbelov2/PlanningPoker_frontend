class API {
  apiURL = 'https://localhost:44356/api/';
  async request(path, method, parameters) {
    let argumentString = '';
    let data;
    if (Object.keys(parameters).length > 0) {
      for (let key in parameters) {
        argumentString = argumentString.concat(key, '=', parameters[key], '&');
      }
      argumentString = argumentString.slice(0, argumentString.length - 1);
    }
    let url = '';
    url = url.concat(
      this.apiURL,
      `${path}`,
      ((Object.keys(parameters).length > 0) ? `?${argumentString}` : ''));
    await fetch(url, {
      method: method,
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        data = await response.json()
          .catch(() => {});
        return data;
      })
      .catch(err => {
        throw (err);
      });
    return data;
  }

  async requestWithID(path, method, parameters, id, pathAfterId = '') {
    let argumentString = '';
    let data;
    if (Object.keys(parameters).length > 0) {
      for (let key in parameters) {
        argumentString = argumentString.concat(key, '=', parameters[key], '&');
      }
      argumentString = argumentString.slice(0, argumentString.length - 1);
    }
    let url = '';
    url = url.concat(
      this.apiURL,
      `${path}/${id}`,
      (pathAfterId === '') ? '' : `/${pathAfterId}`,
      ((Object.keys(parameters).length > 0) ? `?${argumentString}` : ''));
    await fetch(url, {
      method: method,
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        data = await response.json()
          .catch(() => {});
        return data;
      })
      .catch(err => {
        throw (err);
      });
    return data;
  }
}

export default API;