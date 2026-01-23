​
function verifyCredentials() {
            // Get the value from the username input field
            const usernameInputField = document.getElementById("usernameInput");
            const usernameText = usernameInputField.value.trim();

            // Get the value from the password input field
            const passwordInputField = document.getElementById("passwordInput");
            const passwordText = passwordInputField.value.trim();            


// Validate input (that there is input)
            if (usernameText === "" || passwordText === "") {
                document.getElementById("output").textContent = "Please enter username and password";
                document.getElementById("output").style.color = "red";
                return;
            }
            if (usernameText !== "d" || passwordText !== "p") {
            document.getElementById("output").textContent = "Incorrect username and/or password";
                document.getElementById("output").style.color = "orange";
                return;
            }

            window.location.href = "homePage.html";

            // Optional: clear the input field
            inputField.value = "";

        }
