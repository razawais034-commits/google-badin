const profileForm = document.getElementById('profileForm');
const googleSignInButton = document.getElementById('googleSignIn');
const saveProfileButton = document.getElementById('saveProfile');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const statusMessage = document.getElementById('status');
const signedInUser = document.getElementById('signedInUser');
const userLabel = document.getElementById('userLabel');
const avatar = document.getElementById('avatar');

let currentUser = null;

function setStatus(message, type = '') {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
}

function updateUserDetails(user) {
    currentUser = user;
    nameInput.value = user.displayName || nameInput.value;
    emailInput.value = user.email || emailInput.value;
    userLabel.textContent = `Signed in as ${user.email}`;
    avatar.textContent = (user.displayName || user.email || 'G').charAt(0).toUpperCase();
    signedInUser.hidden = false;
}

function signInWithGoogle() {
    googleSignInButton.disabled = true;
    setStatus('Opening Google sign-in...');

    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
        .then(function (result) {
            updateUserDetails(result.user);
            setStatus('Signed in. Review your details and save your profile.', 'success');
        })
        .catch(function (error) {
            console.error(error);
            setStatus(error.code === 'auth/popup-closed-by-user' ? 'Sign-in was cancelled.' : 'Could not sign in. Please try again.', 'error');
        })
        .then(function () {
            googleSignInButton.disabled = false;
        });
}

function saveProfile(event) {
    event.preventDefault();
    if (!profileForm.checkValidity()) {
        profileForm.reportValidity();
        return;
    }
    if (!currentUser) {
        setStatus('Please continue with Google before saving your profile.', 'error');
        return;
    }
    saveProfileButton.disabled = true;
    saveProfileButton.textContent = 'Saving...';
    firebase.database().ref('users/' + currentUser.uid).set({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            photoURL: currentUser.photoURL || '',
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        })
        .then(function () {
            setStatus('Profile saved successfully to Firebase.', 'success');
        })
        .catch(function (error) {
            console.error(error);
            setStatus('Profile could not be saved. Check your Firebase Database rules.', 'error');
        })
        .then(function () {
            saveProfileButton.disabled = false;
            saveProfileButton.textContent = 'Save profile';
        });
}

googleSignInButton.addEventListener('click', signInWithGoogle);
profileForm.addEventListener('submit', saveProfile);