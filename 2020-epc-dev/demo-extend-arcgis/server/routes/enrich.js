const express = require('express');
const router = express.Router();
const { isAuthorizedJWT } = require('../middleware/is-authorized');

module.exports = function({getOptions, enrich}){
  // all routes should be protected
  router.use(isAuthorizedJWT);

  // get enrichment options
  router.get('/options', async function(req, res){
    const t = await getOptions();
    res.json(t);
  });

  // todo add validation on geometry type, spatial reference...
  router.post('/', async function(req, res){
    const fs = req.body['feature-set'];
    const category = req.body['category'];
    const resultFeatureSet = await enrich(fs, category);
    res.json(resultFeatureSet);
  })
  return router;
}