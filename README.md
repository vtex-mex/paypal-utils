<div id="top"></div>

# Paypal Service utils

![vtex-version][vtexio-shield]
![maintained-status][maintained-shield]
## <g-emoji class="g-emoji" alias="warning" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/26a0.png">⚠️ </g-emoji>DISCLAIMER<g-emoji class="g-emoji" alias="warning" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/26a0.png"> ⚠️</g-emoji>

* The code is supplied as-is and is not maintained by VTEX.
* The maintanance and development of new functionalities is responsability of whomever installs it on their store.
* This code is not property of VTEX.

<!-- TABLE OF CONTENTS -->
<details>
  <summary><h3>Table of Contents</h3></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#app-installation">Installation</a></li>
        <li><a href="#usage">Usage</a></li>
      </ul>
    </li>
    <li>
      <a href="#how-does-this-service-work">How to</a>
      <ul>
        <li><a href="#manifest.json">Manifest</a></li>
        <li><a href="#middlewares">Middlewares</a></li>
        <li><a href="#clients">Clients</a></li>
        <li><a href="#index.ts">index.ts</a></li>
      </ul>
    </li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

This code is provided as is, use it and customize it at your risk and convenience.

The objective of this app is to manage the cancelation of Paypal incomplete orders with a custom frequency.

![Service Example Architecture][arquitecture-screenshot]

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### App installation

- Use the following VTEX CLI command to install the service in your store  
`vtex install vtex.paypal-utils`

### Usage

1. Setup a cron job to request the activation of the app with a suggested frequency of 5 to 10 mins, depending on your store's order volume.

   - URL: `https://{{account}}.myvtex.com/_v/payPal2?cancel=true`
   
   - Frequency: `*/10****`  


  <g-emoji class="g-emoji" alias="warning" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/26a0.png">⚠️ </g-emoji>
  <strong>If you don't have a dedicated server to run your cron jobs, then we suggest using **_Google Cloud Scheduler_**, however you can use the service of your choice.</strong></p></blockquote>

   ![Google Scheduler Screen][scheduler-screenshot]


<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ARQUITECTURE -->

## How does this service work?

### manifest.json
  
   The manifest.json file has specific access policies, in this specific case, we have the outbound for the vtex portal account.

  <img src="https://user-images.githubusercontent.com/105675260/172765222-10483ca8-5f66-449d-8a33-984127a2e0aa.png" alt="drawing" width="600"/>  

  For more on the manifest configuration please click <a href="https://developers.vtex.com/vtex-developer-docs/docs/vtex-io-documentation-manifest">here</a>  

  <p align="right">(<a href="#top">back to top</a>)</p>

### Middlewares

The middlewares for this service are _PayPal2.ts_ and _PayPalOrders.ts_

- ### PayPal2.ts  
  This middleware has the following functions:  
  - #### listTransactions  
     This function will iterate over all the payments on your VTEX store and filter the paypal transactions with status _authorizing_ within a time period.  

    <img src="https://user-images.githubusercontent.com/105675260/174364976-b5fc777b-2965-4dcd-98fe-d85f2a1e1bd2.png" alt="drawing" width="600"/>

    For more on the API, click <a href="https://developers.vtex.com/vtex-rest-api/reference/getpaymenttransaction">here</a>

  - #### interactions 
    This function will iterate over the transactionList given by listTransactions and will filter all the paypal paymentInteractions in order to get the id and authToken  

    <img src="https://user-images.githubusercontent.com/105675260/174387522-eca7fd39-f62f-4e85-9579-d93fca63cfdd.png" alt="drawing" width="600"/>  

    For more on the API, click <a href="https://developers.vtex.com/vtex-rest-api/reference/getpaymenttransaction">here</a>  

  - #### cancel  
    This function will iterate over the interactions and impact Paypal's API sending the TransactionId and value of the order to cancel.  

    <img src="https://user-images.githubusercontent.com/105675260/174387305-3c116940-a40f-4624-a722-8c3db09e0f00.png" alt="drawing" width="600"/>

    For more on the API, click <a href="https://developers.vtex.com/vtex-rest-api/reference/getpaymenttransaction">here</a>  

<p align="right">(<a href="#top">back to top</a>)</p>  

- ### PayPalOrders.ts  
  This middleware has the following functions:

  - #### listOrders  
    This function will iterate over all the orders given to it which are paid with paypal in which the incompleteOrders status is _true_ and within a time period.  

    <img src="https://user-images.githubusercontent.com/105675260/174396605-d98c3124-18be-469b-b7ea-85ea73548734.png" alt="drawing" width="600"/>

    For more on the API, click <a href="https://developers.vtex.com/vtex-rest-api/reference/getpaymenttransaction">here</a>  

  - #### listTransactions  
    This function will iterate over all the payments on your VTEX store and filter the paypal transactions with status _authorizing_ within a time period.  

    <img src="https://user-images.githubusercontent.com/105675260/174396674-97f2f2d0-cb16-41ec-b369-0c9ef4b91b08.png" alt="drawing" width="600"/>  

    For more on the API, click <a href="https://developers.vtex.com/vtex-rest-api/reference/getpaymenttransaction">here</a>
  - #### listOrdersDetail  
    This function will list the details of all the orders given to it based on the orderId given and the vtex authToken.

    <img src="https://user-images.githubusercontent.com/105675260/174396739-71a942ac-4461-4109-b7b2-95ccee623286.png" alt="drawing" width="600"/>  

    For more on the API, click <a href="https://developers.vtex.com/vtex-rest-api/reference/listorders">here</a>

  - #### paymentInteractions  
    This function has three steps,  
    - it will first push to the _transactionsList_ array all the orders with their details.  
    - Then, it will map _transactionsList_ in order to loop over the specific interactions of the order to check if it's canceled or not and push it to the _i_ array.  
    - Then it will check if the order is in fact waiting to be canceled based on the messege.  
    
    <img src="https://user-images.githubusercontent.com/105675260/174398158-c8d27202-1256-4944-bfdb-e692049c351c.png" alt="drawing" width="600"/>  

    For more on the API, click <a href="https://developers.vtex.com/vtex-rest-api/reference/listorders">here</a>

  - #### cancelTransaction  
    This function will cancel all the interactions given to it by passing the cancelation interaction to the gateway give.  

    <img src="https://user-images.githubusercontent.com/105675260/174398676-351997c9-d9fe-4b9b-8382-ae40062891fa.png" alt="drawing" width="600"/>  

    For more on the API, click <a href="https://developers.vtex.com/vtex-rest-api/reference/listorders">here</a>
  
### Clients  
The client for this service is _PayPalUtils.ts_  

- ### PayPalUtils.ts  
  This client will be explained in parts:  

  - _Imports_ from the @vtex/api and _routes_ which will be used to access the payments, orders and transactions APIs which we will use with the functions in our middlewares.  

    <img src="https://user-images.githubusercontent.com/105675260/174402504-5afe2dbb-6288-49fd-9555-b8f76ca53aa0.png" alt="drawing" width="600"/>  
    <br /><br />  

  - PayPalUtils Class will extend Janus Client to access the core commerce apis in vtex io, in order to use the listOrders, orderDetail and paymentInteractions functions in our middlewares and send the routes the orders and transactions information via API.

    <img src="https://user-images.githubusercontent.com/105675260/174403092-cf87cf15-2e3b-4b6d-a426-07ccac2059c0.png" alt="drawing" width="600" />

    For more on the API, click <a href="https://developers.vtex.com/vtex-developer-docs/docs/how-to-connect-with-vtex-core-commerce-apis-using-vtex-io">here</a>

  - GatewayClient extends ExternalClient in order to use the specified client to cancel the transaction.  

    <img src="https://user-images.githubusercontent.com/105675260/174403815-f0affe49-40c4-4041-a5df-3de64b54d89d.png" alt="drawing" width="600" />

    For more on the API, click <a href="https://developers.vtex.com/vtex-developer-docs/docs/vtex-io-documentation-how-to-create-and-use-clients">here</a>

  - AdminTransactions extends ExternalClient in order get the transactions of the specified account.  

    <img src="https://user-images.githubusercontent.com/105675260/174403815-f0affe49-40c4-4041-a5df-3de64b54d89d.png" alt="drawing" width="600" />

    For more on the API, click <a href="https://developers.vtex.com/vtex-developer-docs/docs/vtex-io-documentation-how-to-create-and-use-clients">here</a>

### index.ts
 This file will export the service object and will import necessary methods to use that are in vtex API, middlewares and clients.  

<img src="https://user-images.githubusercontent.com/105675260/174406468-cfb707d5-0b19-4b16-ba8c-659b5c15b63c.png" slt="drawing" width="600" />

### utils

  These are utilitarian methods used through out the service, please read through them carefully

- authToken.js
- cachedContext.ts
- seller.js
- statusError.ts
- tracing.js

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- Rodrigo Olivera

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[vtexio-shield]: https://img.shields.io/badge/VTEX-%20IO-%23ff69b4
[maintained-shield]: https://img.shields.io/badge/MANTAINED-%20NO-%23ff0000
[arquitecture-screenshot]: https://user-images.githubusercontent.com/18706156/77381360-72489680-6d5c-11ea-9da8-f4f03b6c5f4c.jpg
[scheduler-screenshot]: https://user-images.githubusercontent.com/65255533/110838782-7c62ee00-8268-11eb-8a41-71cb5ae1927b.png
[manifest-screenshot]: /blob/code.png
