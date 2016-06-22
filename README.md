# PingPongWebhook

A exemple of webhook

## How to

    $ git clone https://github.com/nealith/PingPongWebhook.git

    $ npm install
    $ node server.js
    $ node client.js

Open the ping.html in your favorite browser, open the console and use ping("message") to test the installation.

## How it work

1. Server.js launch two http server, one is for the webhook, the second is for socket.io.
2. The client.js launch its own http server and make a POST request to the webhook server. This request is for a subscription.
3. When the server recieve a message by socket.io (with ping("message") in your browser), it send a POST request to each client in subscription list.
4. Client recieve data and notify you with the default notification system of your operating system. The showed message shlould be the message send in your browser :)

## What is missing for a good webhook

- ssl encryption for data
- token / signature provide by client to be sure it the good webhook
