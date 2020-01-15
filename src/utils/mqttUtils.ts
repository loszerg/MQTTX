import { IClientOptions } from 'mqtt'
import { getSSLFile } from '@/utils/getFiles'
import { ConnectionModel, SSLPath, SSLContent } from '@/views/connections/types'

const setMQTT5Properties = (
  option: IClientOptions['properties'],
): IClientOptions['properties'] | undefined => {
  if (option === undefined) {
    return undefined
  }
  const properties: IClientOptions['properties'] = {}
  if (option.sessionExpiryInterval ||
    option.sessionExpiryInterval === 0) {
    properties.sessionExpiryInterval = option.sessionExpiryInterval
  }
  if (option.receiveMaximum ||
    option.sessionExpiryInterval === 0) {
    properties.receiveMaximum = option.receiveMaximum
  }
  return properties
}

export const getClientOptions = (
  record: ConnectionModel,
): IClientOptions => {
  const mqttVersionDict = {
    '3.1.1': 4,
    '5.0': 5,
  }
  const {
    clientId, username, password, keepalive, clean, connectTimeout,
    ssl, certType, mqttVersion, reconnect,
  } = record
  // reconnectPeriod = 0 disabled automatic reconnection in the client
  const reconnectPeriod = reconnect ? 4000 : 0
  const protocolVersion = mqttVersionDict[mqttVersion]
  const options: IClientOptions  = {
    clientId,
    keepalive,
    clean,
    connectTimeout,
    reconnectPeriod,
    protocolVersion,
  }
  if (username !== '') {
    options.username = username
  }
  if (password !== '') {
    options.password = password
  }
  if (protocolVersion === 5) {
    const { sessionExpiryInterval, receiveMaximum } = record
    const properties = setMQTT5Properties({
      sessionExpiryInterval,
      receiveMaximum,
    })
    if (properties && Object.keys(properties).length > 0) {
      options.properties =  properties
    }
  }
  if (ssl && certType === 'self') {
    const filePath: SSLPath = {
      ca: record.ca,
      cert: record.cert,
      key: record.key,
    }
    const sslRes: SSLContent | undefined = getSSLFile(filePath)
    if (sslRes) {
      options.rejectUnauthorized = false
      options.ca = sslRes.ca
      options.cert = sslRes.cert
      options.key = sslRes.key
    }
  }
  return options
}

export default {}