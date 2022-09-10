# Blubber

## What is it?
Blubber is intended to be a clone of Twitter (with a limited subset of features). I took up this personal project to try to apply my knowledge of backend and frontend
technologies together to build a full stack web application, and to also explore how cloud backend services (Firebase in this case) worked.

This repo is the backend of the app. I have built it mostly using Node.js, Express but also made use of features from Firebase for some functionality in the app.
The frontend repo of the app can be found at: https://github.com/RaymondCJA/blubber-react

## Installation

### Requirements/dependencies

`blubber` requires npm version 8.x to install and run any further dependencies

### Installation steps

Fork/clone to your project directory, set up a firebase account and set your config details into the config file and deploy your app to firebase:

```sh
git clone `forkedRepoName`
```
- set up a Firebase account: https://firebase.google.com/
- Create a Firebase project
- Go to project settings and get the config snippet, and put it into `config.js`

## Usage

Run the app after installing and setting it up with:

```
npm install --save firebase
node index.js
firebase serve
```
A firebase url should be generated for you to access the APIs you have made.

### Note as of August 2022: 
- Firebase no longer offers a free tier and as such, you will be required to set up and account and include a credit card to use Firebase functions.
- The version of busboy in this repo no longer works with the API implemented, and will require you to use the latest version of busboy

## Licensing/Can I use this project?
Please go ahead, the code is entirely open source.