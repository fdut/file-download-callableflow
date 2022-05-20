import React, { useState } from 'react'

import './App.css'

function App() {
  // Environnment variable. Need to be updated with your environment
  // ---
  // API with Blob result
  // blobAPIEndpoint is the  url before '/api/v1' available in API Explorer of the UC1_APIRequestFileCallable flow
  const blobAPIEndpoint = 'https://xxxxxxxxxx.eu-gb.ace.ibm.com'
  // BasicAuthenticationHeader is the HTTPS basic authentication header available in the HTTPS basic authentication settings of the UC1_APIRequestFileCallable flow 
  const BasicAuthenticationHeader = 'Basic AAAAAAAAABBBBBBBBCCCCCC='
  // ---
  // API with encoded result
  // encodedAPIEnpoint is the  url before '/input/{ordernumber}/getencoded' available in API documentation link in AppConnect on Cloud
  // For example: https://service.eu.apiconnect.ibmcloud.com/gws/apigateway/api/b9009f16c1d17b560581327195d31a0ce101ab80b6557979a143d0811fcbb338/SsHJwI
  const encodedAPIEnpoint =
    'https://service.eu.apiconnect.ibmcloud.com/gws/apigateway/api/b923442222143d555555/AB2cv4p'
  // clientId is your APIkey you creaded in manage tab in AppConnect on Cloud
  const clientId = 'aaaaaaa-11111-22222-33a3-c3fd48a3a9c3'
  // ------------------------------------------------------------

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderNumber, setOrderNumber] = useState('299')
  const [result, setResult] = useState('')

  let content = '...'

  // function retrieve file with API returning Blob
  async function fetchBlobInvoiceHandler() {
    setError(null)
    setIsLoading(true)
    setResult('')
    try {
      const response = await fetch(
        `${blobAPIEndpoint}/api/v1/invoice?ordernumber=${orderNumber}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/pdf',
            Authorization: BasicAuthenticationHeader,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Something went wrong')
      }

      const blob = await response.blob()
      const blobtostring = await blob.text()

      setResult(blobtostring)

      const filename = response.headers.get('Content-Type').split('--')[2]

      const fileurl = window.URL.createObjectURL(new Blob([blob]))

      openReceivedFile(fileurl, filename)
    } catch (error) {
      console.log('Catch: ' + error.message)
      setError('Something went wrong')
    }
    setIsLoading(false)
  }

  // function retrieve file with API returning File encoded
  async function fetchEncodedbInvoiceHandler() {
    setError(null)
    setIsLoading(true)
    setResult('')
    try {
      const response = await fetch(
        `${encodedAPIEnpoint}/input/${orderNumber}/getencoded`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-ibm-client-id': clientId,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Something went wrong')
      } else {
        const data = await response.json()

        setResult(JSON.stringify(data))

        const base64Response = await fetch(
          `data:multipart/form-data;base64,${data.file}`,
        )

        const blob = await base64Response.blob()
        const fileurl = window.URL.createObjectURL(blob)

        openReceivedFile(fileurl, data.filename)
      }
    } catch (error) {
      console.log('Catch: ' + error.message)
      setError('Something went wrong')
    }
    setIsLoading(false)
  }

  const orderNumberChangeHandler = (event) => {
    setOrderNumber(event.target.value)
  }

  const openReceivedFile = (fileurl, filename) => {
    const mylink = document.createElement('a')
    mylink.href = fileurl
    mylink.setAttribute('download', filename)

    // Append to html link element page
    document.body.appendChild(mylink)

    // Start download
    mylink.click()

    // Clean up and remove the link
    mylink.parentNode.removeChild(mylink)
  }

  if (error) {
    content = <p>{error}</p>
  }

  if (isLoading) {
    content = 'Loading...'
  }

  return (
    <React.Fragment>
      <section>
        <label>Order Number</label>
        <input
          className="input"
          id="invoice"
          type="text"
          onChange={orderNumberChangeHandler}
          value={orderNumber}
        />
        <button onClick={fetchEncodedbInvoiceHandler}>
          Get Invoice file (Encoded)
        </button>
        <button onClick={fetchBlobInvoiceHandler}>
          Get Invoice file (Blob)
        </button>
      </section>
      <section>{content}</section>

      <section>
        <textarea value={result} readOnly />
      </section>
    </React.Fragment>
  )
}

export default App
