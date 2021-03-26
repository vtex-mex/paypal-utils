export async function listTransactions(ctx: Context, next: () => Promise<any>) {
  const { clients: { transactions: transactionsClient, status: statusClient }, } = ctx

  const params = {
    'payments.paymentSystemName': 'paypal',
    '_sort': 'startDate',
    'status': 'authorizing',
    'startDate': '[now-72h TO now-2h]'
  }

  ctx.state.transactionsList = await transactionsClient.listTransactions(params)

  const {
    headers,
  } = await statusClient.getStatusWithHeaders(200)

  ctx.body = ctx.state.transactionsList
  ctx.status = 200
  ctx.set('Cache-Control', headers['cache-control'])

  await next()
}

export async function interactions(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { paypal, status: statusClient },
  } = ctx

  if (ctx.state.transactionsList?.length) {
    console.log('transactionsList', ctx.state.transactionsList?.length)

    const orders: any[] = await Promise.all(ctx.state.transactionsList.map(async ({ id, status, value, referenceKey }: any) =>
      ({ id, referenceKey, status, value, interactions: await paypal.paymentInteractions(id, ctx.vtex.authToken) })))

    const i: any[] = []
    orders.forEach((order) => {
      const l = (order.interactions.find(({ Message }: any) =>
        Message.includes('Usuario precisa ter se autenticado no Paypal para prosseguir com a transação.') ||
        Message.includes('User must be logged in to PayPal to proceed with payment.'))
      )
      const o = order.interactions.find(({ Message }: any) => Message.includes('Transaction cancelation has finished for Id'))
      if (!o && l) i.push(order)
    })

    ctx.state.interactions = i.map(({ referenceKey, status, value, interactions }) => (
      {
        referenceKey,
        status,
        value,
        interaction: (interactions.find(({ Message }: any) =>
          Message === 'Usuario precisa ter se autenticado no Paypal para prosseguir com a transação.') ||
          interactions.find(({ Message }: any) =>
            Message === 'User must be logged in to PayPal to proceed with payment.'))
      }
    )).filter(({ interaction }) => {
      return interaction != null;
    });
  }

  const {
    headers,
  } = await statusClient.getStatusWithHeaders(200)

  ctx.body = ctx.state.interactions
  ctx.status = 200
  ctx.set('Cache-Control', headers['cache-control'])

  await next()
}

export async function cancel(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { gateway, status: statusClient },
  } = ctx

  if (ctx.state.interactions?.length) {
    console.log('interactions', ctx.state.interactions?.length)

    if (ctx.request.query.cancel) {
      const cancelation: any[] = await Promise.all(ctx.state.interactions.map(async ({ interaction: { TransactionId }, value, referenceKey }: any) =>
        ({ referenceKey, TransactionId, value, cancelation: await gateway.cancelTransactions(TransactionId, value) })))
      ctx.body = cancelation
    } else {
      ctx.body = ctx.state.interactions
    }
  }

  const {
    headers,
  } = await statusClient.getStatusWithHeaders(200)

  ctx.status = 200
  ctx.set('Cache-Control', headers['cache-control'])

  await next()
}