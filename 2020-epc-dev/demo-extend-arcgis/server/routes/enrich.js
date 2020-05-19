const express = require('express');
const router = express.Router();
const { isAuthorizedJWT } = require('../middleware/is-authorized');

module.exports = function({getOptionsForField, enrich}){
  // all routes should be protected
  router.use(isAuthorizedJWT);

  const whereField = 'Certainty';

  // get enrichment options
  router.get('/options', async function(req, res){
    const categoryOptions = await getOptionsForField(whereField);
    res.json({'categories': categoryOptions});
  });

  // todo add validation on geometry type, spatial reference...
  router.post('/', async function(req, res){
    const fs = req.body['feature-set'];
    const category = req.body['category'];
    const where = `${whereField} = '${category}'`;
    const resultFeatureSet = await enrich(fs, where);
    res.json(resultFeatureSet);
  });

  return router;
}