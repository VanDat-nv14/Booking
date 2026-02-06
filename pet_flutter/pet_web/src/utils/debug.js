export const debugAxiosRequest = (config) => {
  console.log('REQUEST CONFIG:', {
    method: config.method,
    url: config.url,
    headers: config.headers,
    data: config.data
  });
  return config;
};

export const debugAxiosResponse = (response) => {
  console.log('RESPONSE SUCCESS:', {
    status: response.status,
    statusText: response.statusText,
    url: response.config.url,
    data: response.data
  });
  return response;
};

export const debugAxiosError = (error) => {
  console.error('REQUEST ERROR:', {
    message: error.message,
    code: error.code,
    url: error?.config?.url,
    method: error?.config?.method,
    response: error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : 'No response'
  });
  return Promise.reject(error);
}; 