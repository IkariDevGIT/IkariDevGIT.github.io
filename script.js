function removeArgs(){
    const currentURL = window.location.href;

    const questionMarkIndex = currentURL.indexOf('?');

    const newURL = currentURL.substring(0, questionMarkIndex);

    window.history.pushState({}, '', newURL);
}

function sidebar(activated){
    if(!!activated){
        document.getElementById("rightSidebar").style.display = "unset";
    }else{
        document.getElementById("rightSidebar").style.display = "none";
    }
}


function getParentId(button) {
    var parentDiv = button.closest('.blogbox');
    if (parentDiv) {
        var parentId = parentDiv.getAttribute('id'); // Assuming there's a data attribute containing the blog ID
        var currentURL = window.location.href.split('?')[0]; // Get the base URL
        var newlink = `${currentURL}?blog=${parentId}&bo=true`; // Construct the new URL
        navigator.clipboard.writeText(newlink);
        alert('"' + newlink + '" was copied!');
    }
}


function getParentIdC(button) {
    var parentDiv = button.closest('.blogbox');
    if (parentDiv) {
        var parentId = parentDiv.id;
        return parentId;
    }
}

function hideDirectChildDivs(parentId) {
    const parent = document.getElementById(parentId);

    if (parent) {
        const childDivs = parent.querySelectorAll(":scope > div");

        childDivs.forEach((div) => {
            div.style.display = "none";
        });
    }
}

function revealDirectChildDivs(parentId) {
    const parent = document.getElementById(parentId);

    if (parent) {
        const childDivs = parent.querySelectorAll(":scope > div");

        childDivs.forEach((div) => {
            if (!getParentIdC(div)) {
                div.style.display = "block";
            }
        });
    }
}

function revealBlogPosts(parentId) {
    document.querySelector('button[onclick="revealBlogPosts(\'blogDIV\')"]')?.remove();
    document.querySelectorAll('#openPost_button')?.forEach(button => button.style.display = 'unset');
    sidebar(true);
    revealDirectChildDivs(parentId);
    addBlogButtons();
    removeArgs();
    var currentURL = window.location.href.split('?')[0]; // Get the base URL
    window.history.replaceState(null, '', `${currentURL}?p=2`);
}

function seePostOnly(blogid) {
    hideDirectChildDivs("blogDIV");
    var currentURL = window.location.href.split('?')[0]; // Get the base URL
    window.history.replaceState(null, '', `${currentURL}?p=7&blog=${blogid}&bo=true`);
    if(document.getElementById(blogid) == null){

    }
    document.getElementById(blogid).parentNode.style.display = "block";
    sidebar(false);
    if (!Array.from(document.querySelectorAll('[onclick*="revealBlogPosts(\'blogDIV\')"]')).length > 0) {
        document.getElementById(blogid).parentNode.insertAdjacentHTML("afterbegin", '<button onclick="revealBlogPosts(\'blogDIV\')" class="btn-blog">See all posts</button>')
    }
    document.querySelectorAll('#openPost_button')?.forEach(button => button.style.display = 'none');
}

function openPostOnly(e) {
    switchTo(2);
    if (e.toString().startsWith("blogid")){
        var id = e;
    }else{
        var id = getParentIdC(e);
    }
    console.log(id);
    seePostOnly(id);
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

function showRandomImage() {
    if(!document.cookie == ""){
        username = getCookie("username")
        document.getElementById("img_html-chan").style.display = "block";
        return;
    }
    const randomValue = Math.random(); // Generate a random number between 0 and 1
    if (randomValue < 0.05) {
      document.getElementById("img_ikari-cringe").style.display = "block"; // 10% chance to show image 1
    } else {
      document.getElementById("img_ikari-normal").style.display = "block"; // 90% chance to show image 2
    }
  }

var blogid = "";
var blogonly = false;
var page = 0;
var app = null;


document.addEventListener("DOMContentLoaded", function() {
    w3IncludeHTML();
    hideDirectChildDivs("mainDIV");
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    blogid = urlParams.get('blog');
    blogonly = urlParams.get('bo');
    page = urlParams.get('p');
    app = urlParams.get('app');

    showRandomImage();
});

function addBlogButtons(){
    if (document.querySelector('.blogbox') !== null){
        const vote_ver = 1;
        /*document.querySelectorAll('.blogbox')?.forEach(item => item.insertAdjacentHTML("beforeend", `
        <div id="smallline" style="margin-top: 60px;"></div>
        <div style="display: flex; justify-content: right; height: auto;">
            <iframe
                src="https://incr.easrng.net/badge?key=ikaridev-blogvote-v${vote_ver}-id_${item.id}"
                class="vote"
                style="background: url(https://incr.easrng.net/bg.gif); opacity: 0.5;"
                title="Vote up"
                width="88"
                height="31"
                frameborder="0"
            ></iframe>
            <button onclick="getParentId(this)" class="btn-blog">Share</button>
            <button onclick="openPostOnly(this)" class="btn-blog" id="openPost_button">Open post</button>
        </div>
        `));*/
        document.querySelectorAll('.blogbox')?.forEach(function(item) {
            if(item.querySelector('.btn-blog') == null){
                item.insertAdjacentHTML("beforeend", `
                    <div id="smallline" style="margin-top: 60px;"></div>
                    <div style="display: flex; justify-content: right; height: auto;">
                        <iframe
                            src="https://incr.easrng.net/badge?key=ikaridev-blogvote-v${vote_ver}-id_${item.id}"
                            class="vote"
                            style="background: url(https://incr.easrng.net/bg.gif); opacity: 0.5;"
                            title="Vote up"
                            width="88"
                            height="31"
                            frameborder="0"
                        ></iframe>
                        <button onclick="getParentId(this)" class="btn-blog">Share</button>
                        <button onclick="openPostOnly(this)" class="btn-blog" id="openPost_button">Open post</button>
                    </div>
                `)
            }
        });
    }
}

function openWindow(window, addinfo){
    switch (window){
        case "pic_info":
            if (addinfo === undefined){ alert("No addinfo set!"); return; }
            if (addinfo[0] === ""){ addinfo[0] = "Not needed"; }
            if (addinfo[1] === ""){ addinfo[1] = "Not needed"; }

            ajaxwin=dhtmlwindow.open('pic_info', 'inline',
            `
            <h3>Prompt:</h3>
            <p>${addinfo[0]}</p>
            <h3>Negative prompt:</h3>
            <p>${addinfo[1]}</p>
            <h3>Generation info:</h3>
            <p>${addinfo[2]}</p>
            `, 'Gen info', 'width=650px,height=400px,left=300px,top=100px,resize=0,scrolling=1');
            break;
    }
}

function html_chan_love(level1){
    if (level1 === undefined){ return parseInt(getCookie("love")); }

    document.cookie = "love=" + level1;
}

function html_chan(window1){
    alert("Soo.. hey, im html-chan.")
    username = prompt("Whats your name?")
    if (!username == "") {
        alert("O-okay.. " + username + " sounds pretty nice..")
        if (prompt("You still wanna chat with me?\nyes/no").toLowerCase() == "yes") {
            alert("Thank you again " + username + ", for.. not leaving me now...")
            alert("I guess i'll be here from now on then!")
            document.cookie = "username=" + username + ";love=10";
            document.cookie = "love=10";
            window.location.reload();
        }else{
            alert("Ohh.. like always...")
            window1.close();
        }
    }else{ alert("Okay then.."); window1.close(); }
}

async function openPostOnLoad() {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(blogid)
    if (blogid) {
        document.getElementById(blogid).scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center'
        });
    if (!!blogonly == true) {
        seePostOnly(blogid);
        addBlogButtons();
    }
    }
}

async function openAppOnLoad() {
    await new Promise(resolve => setTimeout(resolve, 100));
    switchToApp(parseInt(app));
}

var htmlchan_event_active = false;

window.addEventListener('load', function() {
    //if(!document.cookie == ""){
    //    username = getCookie("username")
    //    alert("Hey, " + username)
    //}

    const randomValue = Math.random(); // Generate a random number between 0 and 1
    if (randomValue < 0.008 && document.cookie == "") {
        //// Html-chan
        ajaxwin=dhtmlwindow.open('what_is_this', 'inline',
            `
            <h3>Huh, what is this?</h3>
            <p>Why am i here?</p>
            <p>It feels weird being here again..</p>
            `, 'Huh.. what is this?', 'width=650px,height=400px,left=300px,top=100px,resize=0,scrolling=1');
        ajaxwin.onclose=function(){
            if(htmlchan_event_active == true){ return true; }
            htmlchan_event_active = true
            alert("Why?");
            alert("...");
            if (prompt("Did you enjoy my short company?\nyes/no").toLowerCase() == "yes") {
                alert("Ohh..")
                if (prompt("Could i stay maybe?\nyes/no").toLowerCase() == "yes") {
                    alert("thanks..")
                    html_chan(ajaxwin);
                    return false;
                }else{
                    alert("Okay then..")
                    return true;
                }
            } else {
                alert("Ahh.. i see..")
                return true;
            }
        } 
    }
    if (blogid) {
        switchTo(2);
        openPostOnLoad();
    } else {
        switchTo(parseInt(page));
    }
    if (app != null){
        switchTo(7);
        openAppOnLoad();
    }
    const exeAsync = async () => {await new Promise(resolve => setTimeout(resolve, 200)); initNewestPost(); addBlogButtons();;};
    exeAsync();
    document.getElementById("loading-screen").style.display = "none";
})


function getCurrentTab() {
    var mainDiv = document.getElementById("mainDIV");
    var childDivs = mainDiv.children;
    var visibleDiv = null;
    var divId = null;

    for (var i = 0; i < childDivs.length; i++) {
      var currentDiv = childDivs[i];
      var computedStyle = window.getComputedStyle(currentDiv);

      // Check if the display property is not set to "none"
      if (computedStyle.display !== "none") {
        visibleDiv = currentDiv.id;
        divId = i;
      }
    }

    return [visibleDiv, divId]; 
}


/**
 * @param {Integer} site index
 */
function switchTo(toI, getTab) {
    if (getTab == null || getTab == false){
        hideDirectChildDivs("mainDIV");
        sidebar(true);
        revealBlogPosts("blogDIV");
        removeArgs();
        try{
            switchToApp(-1);
        } catch { };
        window.history.replaceState(null, '', './index.html?p='+toI);
    }
    switch (toI) {
        case 0:
            var divTo = "homeDIV"
            if (getTab != null && getTab == true){ return divTo } else {
                document.getElementById(divTo).style.display = "block";
            }
            break;
        case 1:
            var divTo = "aboutDIV"
            if (getTab != null && getTab == true){ return divTo } else {
                document.getElementById(divTo).style.display = "block";
            }
            break;
        case 2:
            var divTo = "blogDIV"
            if (getTab != null && getTab == true){ return divTo } else {
                document.getElementById(divTo).style.display = "block";
                addBlogButtons();
            }
            break;
        case 3:
            //alert("Under construction!");
            //document.getElementById("homeDIV").style.display = "block";
            var divTo = "resourcesDIV"
            if (getTab != null && getTab == true){ return divTo } else {
                document.getElementById(divTo).style.display = "block";
            }
            break;
        case 4:
            var divTo = "projectsDIV"
            if (getTab != null && getTab == true){ return divTo } else {
                document.getElementById(divTo).style.display = "block";
            }
            break;
        case 5:
            var divTo = "experiencesDIV"
            if (getTab != null && getTab == true){ return divTo } else {
                document.getElementById(divTo).style.display = "block";
            }
            break;
        case 6:
            var divTo = "galleryDIV"
            if (getTab != null && getTab == true){ return divTo } else {
                document.getElementById(divTo).style.display = "block";
                sidebar(false);
            }
            break;
        case 7:
            /*alert("Under construction!");
            switchTo(0);
            break;*/
            var divTo = "appLauncherDIV"
            if (getTab != null && getTab == true){ return divTo } else {
                document.getElementById(divTo).style.display = "block";
                sidebar(false);
            }
            break;
        case 100:
            var divTo = "secretDIV"
            if (getTab != null && getTab == true){ return divTo } else {
                document.getElementById(divTo).style.display = "block";
            }
            break;
        default:
            var divTo = "Invalid"
            if (getTab != null && getTab == true){ return divTo } else {
                switchTo(0);
            }
    }
}

function unselectAllApps() {
    var appSelectorDiv = document.getElementById('appselector');
    var elements = appSelectorDiv.getElementsByTagName('a');

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove('selected');
        elements[i].classList.add('not-selected');
    }
}

function getAppID() {
    var selectedElement = document.querySelector('.selected');
    if (selectedElement) {
        // Extract the ID from the onclick attribute
        var onclickAttribute = selectedElement.getAttribute('onclick');
        var id = onclickAttribute.match(/\(([^)]+)\)/)[1];
        return id;
    } else {
        return null;
    }
}

function shareApp() {
    if (getAppID() == null){
        alert("No app selected!")
        return;
    }
    var currentURL = window.location.href.split('?')[0]; // Get the base URL
    var newlink = `${currentURL}?p=7&app=${getAppID()}`; // Construct the new URL
    navigator.clipboard.writeText(newlink);
    alert('"' + newlink + '" was copied!');
}

function switchToApp(toI) {
    hideDirectChildDivs("apps");
    removeArgs();
    var currentURL = window.location.href.split('?')[0];
    if(toI != -1){
        toggleSelection(toI);
        document.getElementById("appsMainMenu").style.display = "none";
        document.getElementById("menuAppButtons").style.display = "block";
        document.getElementById("apps").style.display = "block";
        window.history.replaceState(null, '', `${currentURL}?p=7&app=${getAppID()}`);
    }
    switch (toI) {
        case -1:
            unselectAllApps();
            window.history.replaceState(null, '', `${currentURL}?p=7`);
            document.getElementById("menuAppButtons").style.display = "none";
            document.getElementById("appsMainMenu").style.display = "block";
            document.getElementById("apps").style.display = "none";
            break;
        case 0:
            document.getElementById("APP_meow").style.display = "block";
            break;
    }
}

function toggleSelection(index) {
    // Loop through all 'a' elements within the div
    var appSelectorDiv = document.getElementById('appselector');
    var elements = appSelectorDiv.getElementsByTagName('a');

    for (var i = 0; i < elements.length; i++) {
        // Remove the 'selected' class from all elements
        elements[i].classList.remove('selected');
        // Add the 'not-selected' class to all elements
        elements[i].classList.add('not-selected');
    }

    // Add the 'selected' class to the element at the specified index
    elements[index].classList.remove('not-selected');
    elements[index].classList.add('selected');
}


function switchToBlog(blogid2, blogonly2) {
    hideDirectChildDivs("mainDIV");
    sidebar(true);
    revealBlogPosts("blogDIV");
    removeArgs();
    document.getElementById("blogDIV").style.display = "block";
    if (blogid2) {
        document.getElementById(blogid2).scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center'
        });
        if (!!blogonly2 == true) {
            seePostOnly(blogid2)
        }
    }
}

function html_chan_main() {
    // Build in love system / variable
    username = getCookie("username")
    var num = Math.floor(Math.random() * 7) + 1;
    switch (num){
        case 1:
            alert(`${username}! look what i made!`)
            ajaxwin=dhtmlwindow.open('htmlchan-window-poem', 'inline',
            `
            <p>In the world of code, where websites come alive,<br>
            HTML's the language that helps them thrive.<br>
            With tags and elements, it structures the page,<br>
            Content and design, like actors on a stage.<br>
            <Head> and <body>, the document's core,<br>
            Links and images, and so much more.<br>
            A language of structure, it's the web's backbone,<br>
            HTML, the builder, on a digital stone.<br>
            <br><br>
            It links us all in this digital sphere,<br>
            Invisible code, yet it's crystal clear.<br>
            HTML, the language that connects us all,<br>
            In the boundless web, we stand tall.</p>

            <h3>Cool huh?</h3>
            `, 'html-chan\'s poem', 'width=700px,height=400px,left=300px,top=100px,resize=0,scrolling=1');
            break;
        case 2:
            alert(`${username}! That tickles!`)
            html_chan_love(html_chan_love(undefined)+1);
            break;
        case 3:
            alert(`${username}.. we need to talk..`)
            if (prompt("\nyes/no").toLowerCase() != "yes") {
                alert("Okay..")
                html_chan_love(html_chan_love(undefined)-1);
                break;
            }
            alert(`Thanks ${username}, i've been thinking about us.. and this website.`)
            alert("You know.. it could go down every time and we would never meet again..")
            alert("I don't want that to happen! Do you promise you will be with me?")
            if (prompt("\nyes/no").toLowerCase() != "yes") {
                alert("Wow.. i didn't think you would be that harsh..")
                html_chan_love(html_chan_love(undefined)-2);
                break;
            }
            alert("Thanks..")
            html_chan_love(html_chan_love(undefined)+3);
            break;
        case 4:
            alert("Hey handsome..")
            html_chan_love(html_chan_love(undefined)+1);
            break;
        case 5:
            alert(`${username}, please give me your social security number.`)
            alert("Just joking haha")
            html_chan_love(html_chan_love(undefined)+1);
            break;
        case 6:
            alert("Do you AI RP?")
            if (prompt("\nyes/no").toLowerCase() != "yes") {
                alert("Okay..")
                alert("boring")
                html_chan_love(html_chan_love(undefined)-1);
                break;
            }
            alert(`Nice ${username}, hopefully not some weird stuff?`)
            if (prompt("\nweird/no").toLowerCase() != "weird") {
                alert("How do i just know you are lying?")
                html_chan_love(html_chan_love(undefined)-1);
                break;
            }
            alert("At least you are honest with me :)")
            alert("So i don't mind")
            html_chan_love(html_chan_love(undefined)+3);
            break;
        case 7:
            prmt = prompt("[Talk to her, options: \nschmex?\ndo you like html?]").toLowerCase()
            switch (prmt){
                case "schmex?":
                    if(html_chan_love(undefined) >= 25){
                        alert("[Love level success!]")
                        alert("You really wanna do this.. huh?")
                        alert("Okay then..")
                        alert("[From ikaridev: what the fuck am i doing, and why am i doing it]")
                        alert("Puhh.. that was... nice")
                        alert("Thanks.. " + username)
                        html_chan_love(html_chan_love(undefined)+5);
                        break;
                    }else{
                        alert("[Love level too low]")
                        alert("H-HUHH? N-N-noo way...")
                        html_chan_love(html_chan_love(undefined)-2);
                        break;
                    }
                case "do you like html?":
                    alert("Yes.. well duh")
                    html_chan_love(html_chan_love(undefined)+1);
                    break;
                default:
                    alert("Sorry " + username + ", but i don't really understand what you mean..")
            }
            break;

    }

}


function getLatestBlogEntry() {
    var blogDiv = document.getElementById('blogDIV');

    function findBlogEntries(element) {
      return element.id && element.id.startsWith('blogid-') ? [element] : Array.from(element.children).flatMap(findBlogEntries);
    }

    var blogEntries = findBlogEntries(blogDiv);

    if (blogEntries.length > 0) {
      return [blogEntries[0].id, `${document.getElementById(blogEntries[0].id).children[0].innerHTML}`, document.getElementById(blogEntries[0].id).children[1].innerHTML];
    } else {
      return 'No blog entries found.';
    }
  }

function getLatestBlogPostUpdate(){
    var id = getLatestBlogEntry()[0];

    // Get all elements with the class "timestamp"
    var timestampElements = document.getElementById(id).querySelector('#updates').getElementsByClassName("timestamp");

    // Check if there are any elements with the class
    if (timestampElements.length > 0) {
    // Return the last element
        return timestampElements[timestampElements.length - 1].innerHTML;
    } else {
    // If no elements are found, return null or handle accordingly
        return null;
    }
}

function initNewestPost(){
    const divNewestPost = document.getElementById("newestPost");
    var latestUpdate = getLatestBlogPostUpdate();
    var blogEntry = getLatestBlogEntry();
    if (latestUpdate == null){ latestUpdate = "No updates to this post yet!" }

    divNewestPost.innerHTML +=
    `<h3>Latest blog post</h3>
    <p>Title: <span style="color: #38ffff;">"</span><span style="color: #ff38bd;">${blogEntry[1]}</span><span style="color: #38ffff;">"</span></p>
    <p>Created: ${blogEntry[2]}</p>
    <p>Latest post Update: ${latestUpdate}</p>
    <button onclick="openPostOnly('${blogEntry[0]}')" class="btn-nice">View post</button>`;
}

//#########################################################
//################### Blog related js #####################
//#########################################################


//blogid-x

//place future code here

//blogid-x END