import { InstanceOptions, IOContext, JanusClient, RequestTracingConfig, ExternalClient, RequestConfig } from '@vtex/api'
import { statusToError } from '../utils/statusError'
const tracing_1 = require("../utils/tracing");
const routes = {
  listOrders: `/api/oms/pvt/orders`,
  listTransactions: `/api/payments/pvt/admin/transactions`,
  order: (orderId: string) => `/api/oms/pvt/orders/${orderId}`,
  interactions: (transactionId: string) => `/api/payments/pvt/transactions/${transactionId}/interactions`,
  cancelTransaction: (transactionId: string) => `api/pvt/transactions/${transactionId}/cancellation-request`
};

export default class PayPalUtils extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, options)
  }

  listOrders(params: any, authToken: string, tracingConfig?: RequestTracingConfig): Promise<any> {
    const metric = 'oms-list-orders';
    return this.http.get(routes.listOrders, {
      params,
      headers: authToken
        ? {
          VtexIdclientAutCookie: authToken
        }
        : {},
      metric,
      tracing: tracing_1.createTracing(metric, tracingConfig)
    })
  }

  async orderDetail(orderId: string, authToken: string, tracingConfig?: RequestTracingConfig): Promise<any> {
    const metric = 'oms-order';
    const lol = await this.http.get(routes.order(orderId), {
      headers: authToken
        ? {
          VtexIdclientAutCookie: authToken
        }
        : {},
      metric,
      tracing: tracing_1.createTracing(metric, tracingConfig)
    })
    return lol
  }

  paymentInteractions(transactionId: string, authToken: string, tracingConfig?: RequestTracingConfig): Promise<any> {
    const metric = 'payments-interactions';
    return this.http.get(routes.interactions(transactionId), {
      headers: authToken
        ? {
          VtexIdclientAutCookie: authToken
        }
        : {},
      metric,
      tracing: tracing_1.createTracing(metric, tracingConfig)
    })
  }
}

export class GatewayClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://${ctx.account}.vtexpayments.com.br`, ctx, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdClientAutCookie: ctx.authToken,
      },
    })
  }

  public cancelTransactions = (transactionId: string, value: number) => {
    return this.post(routes.cancelTransaction(transactionId), {
      value
    }, {
      metric: 'payment-systems'
    })
  }

  protected post = <T>(url: string, data: any, config: RequestConfig = {}) =>
    this.http.post<T>(url, data, config).catch(statusToError)
}

export class AdminTransactions extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://${ctx.account}.myvtex.com`, ctx, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdClientAutCookie: ctx.authToken,
      },
    })
  }

  public listTransactions = (params: any) => {
    return this.get(routes.listTransactions, {
      headers: {
        'rest-range': 'resources=0-199'
      },
      params,
      metric: 'payment-systems'
    })
  }

  protected get = <T>(url: string, data: any) =>
    this.http.get<T>(url, data).catch(statusToError)
}