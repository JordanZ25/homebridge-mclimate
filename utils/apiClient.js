const axios = require('axios');

const instance = axios.create({
  baseURL: 'https://developer-api.seemelissa.com/v1/',
  timeout: 1000,
  headers: {'Content-Type': 'application/json',
			'Authorization': ''}
});