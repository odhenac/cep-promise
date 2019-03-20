'use strict'

import fetch from 'isomorphic-unfetch'
import ServiceError from '../errors/service.js'

export default function fetchCepAbertoService (cepWithLeftPad, proxyURL = '') {
  const url = `${proxyURL}https://api.postmon.com.br/v1/cep/${cepWithLeftPad}`
  const options = {
    method: 'GET',
    mode: 'cors',
  }

  return fetch(url, options)
    .then(analyzeAndParseResponse)
    .then(checkForPostmonError)
    .then(extractCepValuesFromResponse)
    .catch(throwApplicationError)
}

function analyzeAndParseResponse (response) {
  if (response.ok) {
    return response.json()
  }
  throw Error('Erro ao se conectar com o serviço do Postmon.')
}

function checkForPostmonError (responseObject) {
  if (!Object.keys(responseObject).length) {
    throw new Error('CEP não encontrado na base do Postmon.')
  }
  return responseObject
}

function extractCepValuesFromResponse (responseObject) {
  return {
    cep: responseObject.cep,
    state: responseObject.estado,
    city: responseObject.cidade,
    neighborhood: responseObject.bairro,
    street: responseObject.logradouro
  }
}

function throwApplicationError (error) {
  const serviceError = new ServiceError({
    message: error.message,
    service: 'postmon'
  })

  if (error.name === 'FetchError') {
    serviceError.message = 'Erro ao se conectar com o serviço do Postmon.'
  }

  throw serviceError
}
