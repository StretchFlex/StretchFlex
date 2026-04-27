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

        const contentType = response.headers.get('content-type') || '';

        if (response.ok) {
            let data;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('Unexpected login response content type:', contentType, text);
                alert('Login succeeded but server returned an invalid response.');
                return;
            }

            // Store the access token
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('role', data.role);
            // Redirect to home page
            window.location.href = "homePage.html";
        } else {
            let errorMessage = "Login failed";
            const text = await response.text();
            if (text) {
                try {
                    const errorData = JSON.parse(text);
                    errorMessage = errorData.message || text;
                } catch {
                    errorMessage = text;
                }
            } else if (response.statusText) {
                errorMessage = response.statusText;
            }
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert("An error occurred during login");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginBtn').addEventListener('click', verifyCredentials);
});
