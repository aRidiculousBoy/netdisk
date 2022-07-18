import wRequest from './request'

const LoginAPIS = {
  AccountLoginAPI: '/api/user/login/0',
  RememberLoginAPI: '/api/user/login/1'
}

export function accountLoginRequest(account) {
  return wRequest.post({
    url: LoginAPIS.AccountLoginAPI,
    data: account
  })
}

export function rememberLoginRequest(account) {
  return wRequest.post({
    url: LoginAPIS.RememberLoginAPI,
    data: account
  })
}
