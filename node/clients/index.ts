import { IOClients } from '@vtex/api'

import Status from './status'
import PayPalUtils, { GatewayClient } from './PayPalUtils'


// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get status() {
    return this.getOrSet('status', Status)
  }

  public get paypal() {
    return this.getOrSet('paypal', PayPalUtils)
  }

  public get gateway() {
    return this.getOrSet('gateway', GatewayClient)
  }
}
