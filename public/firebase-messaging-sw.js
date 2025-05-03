// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA-zqv_edyop7NSWQg5pAlWfnHRw6hG5bE",
  authDomain: "fitness-tracker-438b9.firebaseapp.com",
  projectId: "fitness-tracker-438b9",
  storageBucket: "fitness-tracker-438b9.appspot.com",
  messagingSenderId: "366761065823",
  appId: "1:366761065823:web:83ae147bcfee2e3fb74aea",
  measurementId: "G-BYT42VVXBM",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: "/logo192.png", // Optional icon
  });
});
