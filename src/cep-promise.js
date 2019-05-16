'use strict'

import CepPromiseError from './errors/cep-promise.js'
import { ViaCepService, PostmonService } from './services/index.js'
import Promise from './utils/promise-any.js'

const CEP_SIZE = 8

export default function (cepRawValue) {
  return Promise.resolve(cepRawValue)
    .then(validateInputType)
    .then(removeSpecialCharacters)
    .then(validateInputLength)
    .then(leftPadWithZeros)
    .then(fetchCepFromServices)
    .catch(handleServicesError)
}

function validateInputType (cepRawValue) {
  const cepTypeOf = typeof cepRawValue

  if (cepTypeOf === 'number' || cepTypeOf === 'string') {
    return cepRawValue
  }

  throw new CepPromiseError({
    message: 'Erro ao inicializar a instância do CepPromise.',
    type: 'validation_error',
    errors: [{
      message: 'Você deve chamar o construtor utilizando uma String ou um Number.',
      service: 'cep_validation'
    }]
  })
}

function removeSpecialCharacters (cepRawValue) {
  return cepRawValue.toString().replace(/\D+/g, '')
}

function leftPadWithZeros (cepCleanValue) {
  return '0'.repeat(CEP_SIZE - cepCleanValue.length) + cepCleanValue
}

function validateInputLength (cepWithLeftPad) {
  if (cepWithLeftPad.length <= CEP_SIZE) {
    return cepWithLeftPad
  }

  throw new CepPromiseError({
    message: `CEP deve conter exatamente ${CEP_SIZE} caracteres.`,
    type: 'validation_error',
    errors: [{
      message: `CEP informado possui mais do que ${CEP_SIZE} caracteres.`,
      service: 'cep_validation'
    }]
  })
}

async function fetchCepFromServices (cepWithLeftPad) {
  try {
    return await PostmonService(cepWithLeftPad);
  } catch (e) {
    return await ViaCepService(cepWithLeftPad);
  }
}

function handleServicesError (aggregatedErrors) {
  throw new CepPromiseError({
    message: 'Todos os serviços de CEP retornaram erro.',
    type: 'service_error',
    errors: aggregatedErrors
  })
}
