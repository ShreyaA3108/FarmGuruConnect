// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyCS343LplQMazSMZL6kh0Iqj7z9He5dPyc",
//     authDomain: "farmguruconnect.firebaseapp.com",
//     projectId: "farmguruconnect",
//     storageBucket: "farmguruconnect.appspot.com",
//     messagingSenderId: "302353836766",
//     appId: "1:302353836766:web:066e603224b33ac258704f"
//   };
// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = getAuth();

// const signUpFormEl = document.getElementById('signUpForm');

// signUpFormEl.addEventListener('submit', function(event) {
//     event.preventDefault();
//     let email = document.getElementById('email').value;
//     let password = document.getElementById('password').value;
//     console.log(email);

//     localStorage.setItem('userEmail', email);
//     createUserWithEmailAndPassword(auth,email, password)
//         .then((userCredential) => {
//             // Signed up
//             const user = userCredential.user;
//             console.log('User signed up:', user);
//         })
//         .catch((error) => {
//             const errorCode = error.code;
//             const errorMessage = error.message;
//             console.error('Error signing up:', errorCode, errorMessage);
//         });
// });

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

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
const storage = getStorage(app);

document.getElementById('dpPreview').addEventListener('click', () => {
    document.getElementById('dpUpload').click();
});

document.getElementById('dpUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('dpPreview').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('signUpForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phoneNo = document.getElementById('phoneNo').value;
    const farmLocation = document.getElementById('farmLocation').value;
    const dpFile = document.getElementById('dpUpload').files[0];

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Upload profile picture to Firebase Storage
        const storageRef = ref(storage, `profile_pictures/${user.uid}/${dpFile.name}`);
        await uploadBytes(storageRef, dpFile);
        const dpURL = await getDownloadURL(storageRef);

        // Update user's profile with display name and photo URL
        await updateProfile(user, {
            photoURL: dpURL
        });

        // Store additional user data in a JSON file in Firebase Storage
        const userData = {
            firstName: firstName,
            lastName: lastName,
            phoneNo: phoneNo,
            farmLocation: farmLocation,
            photoURL: dpURL,
            email: email
        };
        const userDataRef = ref(storage, `user_data/${user.uid}/data.json`);
        await uploadBytes(userDataRef, new Blob([JSON.stringify(userData)], { type: 'application/json' }));

        alert('Signup successful and profile picture uploaded!');
    } catch (error) {
        alert(error.message);
    }
});