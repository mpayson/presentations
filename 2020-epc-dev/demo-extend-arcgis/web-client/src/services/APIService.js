import { arrayToObjectByKey } from "../utils/utils";

/****************************************************
   * Internal utils for interacting with the backend
****************************************************/

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

// wraps the options endpoint
async function getOptions(apiToken){
  return _get('/enrich/options', apiToken);
}

// wraps the enrich endpoint
async function enrich(fs, category, apiToken){
  return _post('/enrich', {
    'feature-set': fs,
    'category': category
  }, apiToken)
}

// authenticates against the API using an existing ArcGIS session
// NOTE this is for demo purposes, please evaluate this approach
// in the context of your security posture
export async function exchangeSessionForAPIToken(agsSession){
  const credential = agsSession.toCredential();
  const {token} = await _post('/auth/authorize', credential);
  return token;
}

/****************************************************
   * Extensible functions. Question configs get passed
   * to RequestForm to govern the UI and the results from
   * user interactions get passed back to submit the request.
   * Note there can only be one 'layer' type question,
   * it has specific logic for interacting with the map
****************************************************/

// sync function to define question scaffolding
export function getSkeletonQuestionConfig(){
  return [{
    question: 'layer',
    type: 'layer'
  }, {
    question: 'category',
    type: 'select',
    options: []
  }];
}

// async function to get any question configs defined on the server
// TODO refactor to remove backend options and get the full config
export async function getQuestionConfig(apiToken){
  const options = await getOptions(apiToken);
  const { categories } = options;
  const defaultConfig = getSkeletonQuestionConfig();
  defaultConfig[1].options = categories;
  return defaultConfig;
}

// submit the form based on the selected values from the app
export function submitRequest(request, apiToken){
  const requestByQuestion = arrayToObjectByKey(request, 'question');
  const { category, layer } = requestByQuestion;
  return enrich(layer.value, category.value, apiToken);
}