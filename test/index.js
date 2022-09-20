const mockData = require('./mock.json')
const request = require('request')

const options = {
  'method': 'POST',
  'url': 'http://127.0.0.1:3040/auto/carsome/c2b-upload',
  'headers': {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(mockData)

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
