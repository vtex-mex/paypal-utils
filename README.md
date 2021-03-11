## Installation

`vtex install vtex.paypal-utils`

## Use

Using some service like ***Cloud Schedule*** send a request to activate the process each N minutes

`https://{{account}}.myvtex.com/_v/payPal2?cancel=true`

![Screen Shot 2021-03-11 at 12 49 55](https://user-images.githubusercontent.com/65255533/110838782-7c62ee00-8268-11eb-8a41-71cb5ae1927b.png)

## Recomendation

Use a a unix cron to do so like this for each 5 to 10 minutes depending on the volume of PayPal orders recived

`*/10 * * * *`
