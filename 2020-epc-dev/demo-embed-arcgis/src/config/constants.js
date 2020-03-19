const mapOptions = {basemap: 'gray-vector'};
const viewOptions = {
  center: [-71.105, 42.37],
  zoom: 14,
  highlightOptions: {color: '#AA35F6', fillOpacity: 0.2}
};

const statusPopupTemplate = {
  title: 'Currently, a bug'
}

const statusRenderer = {
  type: 'unique-value',
  field: 'maintpriority',
  legendOptions: {title: 'Priority'},
  uniqueValueInfos: [{
  //   value: 'none',
  //   label: 'None',
  //   symbol: {
  //     color: '#7f7f7f',
  //     type: 'simple-marker',
  //     style: 'diamond',
  //     size: '20px',
  //     outline: {
  //       color: '#2b2b2b',
  //       width: '1.5px'
  //     }
  //   }
  // }, {
    value: 'low',
    label: 'Low',
    symbol: {
      color: '#50e991',
      type: 'simple-marker',
      style: 'diamond',
      size: '20px',
      outline: {
        color: '#2b2b2b',
        width: '1.5px'
      }
    }
  }, {
    value: 'medium',
    label: 'Medium',
    symbol: {
      color: '#0bb4ff',
      type: 'simple-marker',
      style: 'diamond',
      size: '20px',
      outline: {
        color: '#2b2b2b',
        width: '1.5px'
      }

    }
  }, {
    value: 'high',
    label: 'High',
    symbol: {
      color: '#e60049',
      type: 'simple-marker',
      style: 'diamond',
      size: '20px',
      outline: {
        color: '#2b2b2b',
        width: '1.5px'
      }
    }
  }]
}

const assigneeRenderer = {
  type: 'unique-value',
  legendOptions: {title: 'Assigned to'},
  valueExpression: "IIf(IsEmpty($feature.assignee) || $feature.assignee == 'none', 'Not assigned', 'Assigned')",
  uniqueValueInfos: [{
    value: 'Not assigned',
    symbol: {
      color: '#ed5151',
      type: 'simple-marker',
      size: '20px',
      outline: {
        color: '#2b2b2b',
        width: '1.5px'
      }
    }
  }, {
    value: 'Assigned',
    symbol: {
      color: '#0bb4ff',
      type: 'simple-marker',
      size: '20px',
      outline: {
        color: '#2b2b2b',
        width: '1.5px'
      }

    }
  }]
}

const needsMaintDefExp = "NOT maintpriority = 'none'";

const colorsByPriority = {
  'low': '#50e991',
  'medium': '#0bb4ff',
  'high': '#e60049'
}

export {
  mapOptions,
  viewOptions,
  statusRenderer,
  statusPopupTemplate,
  needsMaintDefExp,
  colorsByPriority,
  assigneeRenderer
}