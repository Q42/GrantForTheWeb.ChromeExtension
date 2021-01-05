# Enhanced Web Monetization Mocker

This chrome extension mocks extra features into the Web Monetization API. It should be used with "proof of concept" prototype found [here](https://github.com/Q42/GrantForTheWeb.MicrioConcepts). For the Proof of Concept we need functionality that currently is not present in browsers or through the Web Monetization API.

## Why

For viable implementation for our concept, we wanted fine grained control over the price of content and the ability to react on this. Currently (december '20) it is not possible to influence the price of content, as this is set at a fixed rate by the Coil browser plugin/integration.

## What

This extension includes the following "features":

- It gives users the possibility to set a maximum rate per hour.
- If redirect the user to a confirmation page when exceeding that limit.
- It uses extra `monetization:asset` meta tags to set up the payment stream.
- It listens to the `monetizationprogress` event, calculates how much is paid over time and stops the payment when the maximum price is reached.

### Setting maximum rate

We think that the user should be able to set a maximum price for any content based on costs per hour. Currently Coil pays about €0,30 / hour in multiple `ticks` per second through the `monetizationprogress` event. This setting lets users take control of how much they want to pay.

If any websites exceeds this amount, the user will be redirect to a different page, effectively stopping the website from setting up the payment. On this page the user will see an overview of the actual price and the rate limit set in the browser. A user can either choose to continue and whitelist the page for this visit, or return to the page where they came from.

## Installation

In order to install the extension you need to do the following:

- Browse to `chrome://extensions`
- Enable developer mode
- Click `load unpacked` and select the `chrome-extension` directory.

## Usage

This will set-up the chrome-extension in your browser. By default it has a default maximum allowed `rate` of 0.30 / hour. The extension gets all values from the different
meta tags and uses those values to calculate the different values.

```html
<meta name="monetization:asset:amount" content="125" />
```

The `amount` tag defines the price per hour in the currency calculated by the `code` and `scale` tag. This replaces the fixed rate set in the current implementation.

```html
<meta name="monetization:asset:max_amount" content="250" />
```

One of the most important changes would be to add an extra `monetization:asset:max_amount` or "price" meta-tag that hooks into the `monetizationprogress`. The value of the `content` attribute should be a numeric value which corresponds with the price of that web-page. When that specific value is reached, the monetization stream should stop automatically.

```html
<meta name="monetization:asset:scale" content="4" />
```

The `scale` tag defines the scale of the payment. The scale divides the `amount` and `max_amount` by 10 to the power of the value (e.g. `amount / 10 ^ scale`).

```html
<meta name="monetization:asset:code" content="EUR" />
```

The `code` tag defines the currency in which the payment should be done. In the current state it can be either euro (`EUR`) or US Dollar (`USD`).

## Development

Make sure to press the reload icon when actively developing this extension, otherwise changes will not be known to Google Chrome.

## Notes

- This extension can not access the `document.monetization` API that is added by the Coil extension, extra event listeners are/should be added as separate events into the document instead.
