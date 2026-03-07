fetch('http://localhost:3000') // talks to your backend
  .then(res => res.text())
  .then(data => console.log(data)); // prints “Hello from backend!” in console