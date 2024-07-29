import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, sendPasswordResetEmail,signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS343LplQMazSMZL6kh0Iqj7z9He5dPyc",
  authDomain: "farmguruconnect.firebaseapp.com",
  projectId: "farmguruconnect",
  storageBucket: "farmguruconnect.appspot.com",
  messagingSenderId: "302353836766",
  appId: "1:302353836766:web:066e603224b33ac258704f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('LoginForm').addEventListener('submit',async function(event){
    event.preventDefault(); 
    let email = $('#email').val();
    let password = $('#password').val();
    console.log(email);
    
    await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            alert('Login successful!');
            console.log(user);
            // ...
        })
        .catch((error) => {
            alert(error)
            const errorCode = error.code;
            const errorMessage = error.message;
        });

})

document.getElementById('forgotPassword').addEventListener('click',function(e){
    e.preventDefault();
    let email = $('#email').val();
    sendPasswordResetEmail(auth, email)
    .then(() => {
        alert('password reset link sent to your email');
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(error);
        // ..
    });
})
