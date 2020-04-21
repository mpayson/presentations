// looks for a token in the incoming request
function getJWTForRequest(req){
  let token;
  if (req && req.query && req.query.token) token = req.query.token;
  if (req && req.headers && req.headers.authorization) token = req.headers['authorization'];
  return token;
}

// convert colloquial field types to esri named field types
function fieldTypeToEsriType(fieldType){
  const types = {
    string: 'esriFieldTypeString',
    double: 'esriFieldTypeDouble',
    integer: 'esriFieldTypeInteger',
    date: 'esriFieldTypeDate'
  }
  const lwrType = fieldType.toLowerCase();
  return types[lwrType];
}




module.exports = {
  getJWTForRequest,
  fieldTypeToEsriType
}