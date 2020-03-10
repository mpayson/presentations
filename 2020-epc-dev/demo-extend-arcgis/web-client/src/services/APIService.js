// make a request and handle errors
async function _request(url, params, token){
  const addlParams = params ? params : {};
  if(addlParams.headers && token){
    addlParams.headers['authorization'] = token;
  } else if(token){
    addlParams.headers = {authorization: token};
  }

  const response = await fetch(url, {...addlParams});
  const data = await response.json();
  if(!response.ok) {
    throw new Error(data.message);
  }

  return data;
}

// post data
async function _post(url, data, token=null){
  const params = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  }
  if(data) params.body = JSON.stringify(data);
  return await _request(url, params, token);
}

// get url
async function _get(url, token=null){
  return await _request(url, null, token);
}

export async function exchangeSessionForAPIToken(agsSession){
  const credential = agsSession.toCredential();
  const {token} = await _post('/auth/authorize', credential);
  return token;
}

export async function getOptions(apiToken){
  return _get('/enrich/options', apiToken);
}

export async function enrich(fs, category, apiToken){
  console.log(fs, fs.toJSON());
  return _post('/enrich', {
    'feature-set': fs.toJSON(),
    'category': category
  }, apiToken)
}