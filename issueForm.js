//NOTTT WORKING
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, addDoc, updateDoc,setDoc, doc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCS343LplQMazSMZL6kh0Iqj7z9He5dPyc",
    authDomain: "farmguruconnect.firebaseapp.com",
    projectId: "farmguruconnect",
    storageBucket: "farmguruconnect.appspot.com",
    messagingSenderId: "302353836766",
    appId: "1:302353836766:web:066e603224b33ac258704f"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

document.getElementById('probUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('InsertImg').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('issueForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const issueDescription = document.getElementById('issueDescription').value;
    const probFile = document.getElementById('probUpload').files[0];

    try {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.uid;
                let probURL = "";

                // Upload problem image to Firebase Storage
                if (probFile) {
                    const storageRef = ref(storage, `issues/${userId}/${probFile.name}`);
                    await uploadBytes(storageRef, probFile);
                    probURL = await getDownloadURL(storageRef);
                }

                // Store issue data in Firestore under userId
                const issueData = {
                    issueDescription: issueDescription,
                    issueImage: probURL,
                    status: 'Pending'
                };

                // Store issue data and file URL under userId
                const userIssuesRef = doc(db, `issues/${userId}`);
                await setDoc(userIssuesRef, {
                    issueData: issueData
                });

                // Find the best matching professor
                const professorsQuerySnapshot = await getDocs(query(collection(db, "user_data/professor"), where("status", "==", "Free")));
                let matchedProfessor = null;
                let highestMatchScore = 0;

                for (const professorDoc of professorsQuerySnapshot.docs) {
                    const professor = professorDoc.data();
                    const professorRef = doc(db, `user_data/professor/${professorDoc.id}/data.json`);
                    const professorData = (await getDoc(professorRef)).data();
                    const expertise = professorData.FieldOfExpert.split(", ");
                    const matchScore = expertise.reduce((score, field) => {
                        return score + (issueDescription.toLowerCase().includes(field.toLowerCase()) ? 1 : 0);
                    }, 0);

                    if (matchScore > highestMatchScore) {
                        highestMatchScore = matchScore;
                        matchedProfessor = { id: professorDoc.id, ...professor };
                    }
                }

                if (matchedProfessor) {
                    await updateDoc(userIssuesRef, {
                        professorId: matchedProfessor.id,
                        professorName: `${matchedProfessor.firstName} ${matchedProfessor.lastName}`
                    });

                    await updateDoc(doc(db, `user_data/professor/${matchedProfessor.id}/data.json`), {
                        status: 'Assigned'
                    });

                    alert('Issue submitted successfully and matched with a professor!');
                    window.location.href = 'chat.html';
                } else {
                    alert('Issue submitted successfully but no matching professor found.');
                }
            }
        });
    } catch (error) {
        alert(error.message);
    }
});
