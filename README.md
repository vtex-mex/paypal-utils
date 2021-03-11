## Installation

`vtex install vtex.paypal-utils`

## Use

Using some service like ***Cloud Schedule*** send a request to activate the process each N minutes

`https://{{account}}.myvtex.com/_v/payPal2?cancel=true`

## Recomendation

Use a a unix cron to do so like this for each 5 to 10 minutes depending on the volume of PayPal orders recived

`*/10 * * * *`
