var url = "http://localhost:7878";

function registerUser() {
    var username = document.getElementsByClassName("username");
    var password = document.getElementsByClassName("password");

    $.ajax({
        url: url + "/register",
        method: "post",
        data: {
            username: username[0].value,
            password: password[0].value
        }
    }).success(function(response){
        alert(response.message);
    }).error(function(response) {
        alert(response.message);
    });
}

function loginUser() {
    var username = document.getElementsByClassName("username");
    var password = document.getElementsByClassName("password");

    $.ajax({
        url: url + "/login",
        method: "post",
        data: {
            username: username[0].value,
            password: password[0].value
        }
    }).success(function(response){
        window.location.assign("/home");
    }).error(function(response){
        alert("Incorrect username or password!");
    });
}

function getUser() {
    var username = document.getElementsByClassName("username");
    $.ajax({
      url: url + "/user",
      method: "get"
    }).success(function(response){
        document.getElementsByClassName("username")[0].innerHTML = response.username;
    }).error(function(response) {
        alert("Cannot fetch data. Please try again");
    });
}
