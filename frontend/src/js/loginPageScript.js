async function verifyCredentials() {
    // Get the value from the username input field
    const usernameInputField = document.getElementById("usernameInput");
    const usernameText = usernameInputField.value.trim();

    // Get the value from the password input field
    const passwordInputField = document.getElementById("passwordInput");
    const passwordText = passwordInputField.value.trim();

    // Validate input (that there is input)
    if (usernameText === "" || passwordText === "") {
        alert("Please enter username and password");
        return;
    }

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameText,
                password: passwordText
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Store the access token
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('role', data.role);
            // Redirect to home page
            window.location.href = "homePage.html";
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Login failed");
        }
    } catch (error) {
        console.error('Login error:', error);
        alert("An error occurred during login");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginBtn').addEventListener('click', verifyCredentials);
});
