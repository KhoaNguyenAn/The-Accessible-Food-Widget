<!DOCTYPE html>
<html>
<head>
    <title>Registration System</title>
</head>
<body>
<form action="register.php" method="post">
    <h2>Register</h2>
    <label>Username</label>
    <input type="text" name="username">
    <br>
    <label>Password</label>
    <input type="password" name="pwd">
    <br>
    <label>Confirm Password</label>
    <input type="password" name="passwordcfm">
    <div>
        <button type="submit" name="submit">Register</button>
    </div>
    <p>
        Already have an account? <a href="loginpage.php">Log in</a>
    </p>
</form>
</body>
</html>