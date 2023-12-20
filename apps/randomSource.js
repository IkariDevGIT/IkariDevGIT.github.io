var websites = [
    ""
];

function getRandomWebsite() {
    var link = websites[Math.floor((Math.random() * websites.length))]
    document.getElementById("randomWeb_P").innerHTML = `${link}`;
    document.getElementById("randomWeb_P").href = `${link}`;
}
