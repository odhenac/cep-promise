(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.cep = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var CepPromiseError = function (_Error) {
  inherits(CepPromiseError, _Error);

  function CepPromiseError() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        message = _ref.message,
        type = _ref.type,
        errors = _ref.errors;

    classCallCheck(this, CepPromiseError);

    var _this = possibleConstructorReturn(this, (CepPromiseError.__proto__ || Object.getPrototypeOf(CepPromiseError)).call(this));

    _this.name = 'CepPromiseError';
    _this.message = message;
    _this.type = type;
    _this.errors = errors;
    return _this;
  }

  return CepPromiseError;
}(Error);

var index = typeof fetch == 'function' ? fetch.bind() : function (url, options) {
	options = options || {};
	return new Promise(function (resolve, reject) {
		var request = new XMLHttpRequest();

		request.open(options.method || 'get', url, true);

		for (var i in options.headers) {
			request.setRequestHeader(i, options.headers[i]);
		}

		request.withCredentials = options.credentials == 'include';

		request.onload = function () {
			resolve(response());
		};

		request.onerror = reject;

		request.send(options.body || null);

		function response() {
			var _keys = [],
			    all = [],
			    headers = {},
			    header;

			request.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, function (m, key, value) {
				_keys.push(key = key.toLowerCase());
				all.push([key, value]);
				header = headers[key];
				headers[key] = header ? header + "," + value : value;
			});

			return {
				ok: (request.status / 100 | 0) == 2, // 200-299
				status: request.status,
				statusText: request.statusText,
				url: request.responseURL,
				clone: response,
				text: function text() {
					return Promise.resolve(request.responseText);
				},
				json: function json() {
					return Promise.resolve(request.responseText).then(JSON.parse);
				},
				blob: function blob() {
					return Promise.resolve(new Blob([request.response]));
				},
				headers: {
					keys: function keys() {
						return _keys;
					},
					entries: function entries() {
						return all;
					},
					get: function get(n) {
						return headers[n.toLowerCase()];
					},
					has: function has(n) {
						return n.toLowerCase() in headers;
					}
				}
			};
		}
	});
};


var unfetch_es = Object.freeze({
	default: index
});

var require$$0 = ( unfetch_es && index ) || unfetch_es;

var browser = window.fetch || (window.fetch = require$$0.default || require$$0);

var ServiceError = function (_Error) {
  inherits(ServiceError, _Error);

  function ServiceError() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        message = _ref.message,
        service = _ref.service;

    classCallCheck(this, ServiceError);

    var _this = possibleConstructorReturn(this, (ServiceError.__proto__ || Object.getPrototypeOf(ServiceError)).call(this));

    _this.name = 'ServiceError';
    _this.message = message;
    _this.service = service;
    return _this;
  }

  return ServiceError;
}(Error);

function fetchViaCepService(cepWithLeftPad) {
  var url = 'https://viacep.com.br/ws/' + cepWithLeftPad + '/json/';
  var options = {
    method: 'GET',
    mode: 'cors',
    headers: {
      'content-type': 'application/json;charset=utf-8'
    }
  };

  return browser(url, options).then(analyzeAndParseResponse$2).then(checkForViaCepError$1).then(extractCepValuesFromResponse$1).catch(throwApplicationError$2);
}

function analyzeAndParseResponse$2(response) {
  if (response.ok) {
    return response.json();
  }

  throw Error('Erro ao se conectar com o serviço ViaCEP.');
}

function checkForViaCepError$1(responseObject) {
  if (responseObject.erro === true) {
    throw new Error('CEP não encontrado na base do ViaCEP.');
  }

  return responseObject;
}

function extractCepValuesFromResponse$1(responseObject) {
  return {
    cep: responseObject.cep.replace('-', ''),
    state: responseObject.uf,
    city: responseObject.localidade,
    neighborhood: responseObject.bairro,
    street: responseObject.logradouro
  };
}

function throwApplicationError$2(error) {
  var serviceError = new ServiceError({
    message: error.message,
    service: 'viacep'
  });

  if (error.name === 'FetchError') {
    serviceError.message = 'Erro ao se conectar com o serviço ViaCEP.';
  }

  throw serviceError;
}

function fetchCepAbertoService$1(cepWithLeftPad) {
  var proxyURL = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var url = proxyURL + 'https://api.postmon.com.br/v1/cep/' + cepWithLeftPad;
  var options = {
    method: 'GET',
    mode: 'cors'
  };

  return browser(url, options).then(analyzeAndParseResponse$3).then(checkForPostmonError).then(extractCepValuesFromResponse$2).catch(throwApplicationError$3);
}

function analyzeAndParseResponse$3(response) {
  if (response.ok) {
    return response.json();
  }
  throw Error('Erro ao se conectar com o serviço do Postmon.');
}

function checkForPostmonError(responseObject) {
  if (!Object.keys(responseObject).length) {
    throw new Error('CEP não encontrado na base do Postmon.');
  }
  return responseObject;
}

function extractCepValuesFromResponse$2(responseObject) {
  return {
    cep: responseObject.cep,
    state: responseObject.estado,
    city: responseObject.cidade,
    neighborhood: responseObject.bairro,
    street: responseObject.logradouro
  };
}

function throwApplicationError$3(error) {
  var serviceError = new ServiceError({
    message: error.message,
    service: 'postmon'
  });

  if (error.name === 'FetchError') {
    serviceError.message = 'Erro ao se conectar com o serviço do Postmon.';
  }

  throw serviceError;
}

var ViaCepService = fetchViaCepService;
var PostmonService = fetchCepAbertoService$1;

var reverse = function reverse(promise) {
  return new Promise(function (resolve, reject) {
    return Promise.resolve(promise).then(reject, resolve);
  });
};

Promise.any = function (iterable) {
  return reverse(Promise.all([].concat(toConsumableArray(iterable)).map(reverse)));
};

var CEP_SIZE = 8;

function cepPromise (cepRawValue) {
  return Promise.resolve(cepRawValue).then(validateInputType).then(removeSpecialCharacters).then(validateInputLength).then(leftPadWithZeros).then(fetchCepFromServices).catch(handleServicesError);
}

function validateInputType(cepRawValue) {
  var cepTypeOf = typeof cepRawValue === 'undefined' ? 'undefined' : _typeof(cepRawValue);

  if (cepTypeOf === 'number' || cepTypeOf === 'string') {
    return cepRawValue;
  }

  throw new CepPromiseError({
    message: 'Erro ao inicializar a instância do CepPromise.',
    type: 'validation_error',
    errors: [{
      message: 'Você deve chamar o construtor utilizando uma String ou um Number.',
      service: 'cep_validation'
    }]
  });
}

function removeSpecialCharacters(cepRawValue) {
  return cepRawValue.toString().replace(/\D+/g, '');
}

function leftPadWithZeros(cepCleanValue) {
  return '0'.repeat(CEP_SIZE - cepCleanValue.length) + cepCleanValue;
}

function validateInputLength(cepWithLeftPad) {
  if (cepWithLeftPad.length <= CEP_SIZE) {
    return cepWithLeftPad;
  }

  throw new CepPromiseError({
    message: 'CEP deve conter exatamente ' + CEP_SIZE + ' caracteres.',
    type: 'validation_error',
    errors: [{
      message: 'CEP informado possui mais do que ' + CEP_SIZE + ' caracteres.',
      service: 'cep_validation'
    }]
  });
}

function fetchCepFromServices(cepWithLeftPad) {
  return ViaCepService(cepWithLeftPad).catch(function () {
    return PostmonService(cepWithLeftPad);
  });
}

function handleServicesError(aggregatedErrors) {
  throw new CepPromiseError({
    message: 'Todos os serviços de CEP retornaram erro.',
    type: 'service_error',
    errors: aggregatedErrors
  });
}

return cepPromise;

})));
