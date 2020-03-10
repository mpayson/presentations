'''
A simple Python toolbox that shows a potential UI/UX for a backend enrichment API.
This can be compared / contrasted with the web-client version.
Note, there seem to be two unknown issues:
  1. The ArcGIS tokens occasionally time out, even in Pro I'm unable to add layers (may be local issue)
  2. The script makes a surprising number of calls to /authenticate, not sure why or from where
     to be investigated after the devsummit sprint
'''

import arcpy
import json
import requests
import re
import os
import pandas as pd
from arcgis.features import GeoAccessor, GeoSeriesAccessor, FeatureSet

API_BASE_URL = 'http://MPayson3:5000'

def getAGSCredential():
    portal_url = arcpy.GetActivePortalURL()
    portal_info = arcpy.GetPortalDescription()
    token_info = arcpy.GetSigninToken()

    return  {
        'token': token_info['token'],
        'expires': token_info['expires'] * 1000, # should be in ms
        'userId': portal_info['user']['username'],
        'ssl': portal_info['allSSL'],
        'server': portal_url
    }

class Toolbox(object):
    def __init__(self):
        self.label = "Extend ArcGIS Demo"
        self.alias = "Extend ArcGIS Demo"
        self.tools = [Tool]

class Tool(object):
    def __init__(self):
        self.label = "Extend ArcGIS GP Tool"
        self.description = """
        A quick tool to demo extending ArcGIS via GP tool.
        The tool calls an external API to get risk information about selected locations.
        Requires the ArcGIS user to have access to the API on the backend.
        """
        self.canRunInBackground = False # simpler for now
        self.apitoken = None
    
    def getParameterInfo(self):
        p0 = arcpy.Parameter(
            displayName="Points or Areas of Interest",
            name="aoi_lyr",
            datatype="GPFeatureRecordSetLayer",
            parameterType="Required",
            direction="Input"
        )
        p1 = arcpy.Parameter(
            displayName="Certainty Category",
            name="risk",
            datatype="GPString",
            parameterType="Required",
            direction="Input"
        )
        p2 = arcpy.Parameter(
            displayName="Output Features",
            name="out_features",
            datatype="GPFeatureLayer",
            parameterType="Required",
            direction="Output"
        )

        # prefetch selection options from the API
        # and add the count to the label as a convenience
        token = self._getToken()
        headers = {'authorization': token}
        r = requests.get('{0}/enrich/options'.format(API_BASE_URL), headers=headers)
        if(not r.ok):
            p1.setWarningMessage('Could not get options, try reloading the tool')
            return [p0, p1, p2]
    
        data = r.json()
        p1.filter.type = "ValueList"
        p1.filter.list = [
            "{0} ({1})".format(c['category'], c['count'])
            for c in data['categories']
        ]

        # return the parameters
        return [p0, p1, p2]

    def _getToken(self):
        '''util function for getting API token'''

        if self.apitoken is not None:
            return self.apitoken

        agsCredential = getAGSCredential()
        r = requests.post('{0}/auth/authorize'.format(API_BASE_URL), json=agsCredential)
        if r.ok:
            r_json = r.json()
            self.apitoken = r_json['token']
            return self.apitoken
        
        arcpy.AddError('Could not get an access token, try reloading the tool')
        return None

    def isLicensed(self):
        '''checks if the user is licensed by verifying that the server gives a token
        note, didn't end up using this because it generates a lot of requests.
        instead, could just write error messages as the tool is running'''
        return True
        # token = self._getToken()
        # if token:
        #     return True
        # arcpy.AddError("Pro user does not have access to backend service")
        # return False

    def execute(self, parameters, messages):

        fc = parameters[0].value
        sdf = pd.DataFrame.spatial.from_featureclass(fc)

        # only work with the geometry and oid attribute if it exists
        # known issue desc.OIDFieldName may not exist even if
        # desc.hasOID is true -- which is strange, so avoid w try/except
        desc = arcpy.Describe(fc)
        try:
            oid_fieldname = desc.OIDFieldName
            sdf = sdf[['SHAPE', oid_fieldname]]
        except:
            sdf = sdf[['SHAPE']]

        # project to 4326 since this is what the backend uses
        sdf.spatial.project({'wkid': 4326})
        fs = sdf.spatial.to_featureset()

        # get the selected category
        # strip out the counts that were added to the label
        cat = parameters[1].value
        clean_cat = re.sub(r'\([^)]*\)', '', cat)
        clean_cat = clean_cat.strip()

        # call the enrich API!
        arcpy.AddMessage('Calling the API!')
        headers = {'authorization': self._getToken()}
        r = requests.post(
            '{0}/enrich'.format(API_BASE_URL),
            json={
                'feature-set': fs.to_dict(),
                'category': clean_cat
            },
            headers=headers,
        )

        # write the outputs to a feature class
        # dataframe has the to_featureclass API so need
        # to interop with that and the feature class
        out_lyr = parameters[2].valueAsText

        out_fs = FeatureSet.from_dict(r.json())
        out_sdf = out_fs.sdf
        out_sdf.spatial.to_featureclass(out_lyr)

        arcpy.AddMessage('Done!')

        return


