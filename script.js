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
        var parentId = parentDiv.id;
        var newlink = window.location.href.split('?')[0] + "?blog=" + parentId + "&bo=true"
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
    sidebar(true)
    revealDirectChildDivs(parentId);
}

function seePostOnly(blogid) {
    hideDirectChildDivs("blogDIV");
    if(document.getElementById(blogid) == null){
        
    }
    document.getElementById(blogid).parentNode.style.display = "block";
    if (!Array.from(document.querySelectorAll('[onclick*="revealBlogPosts(\'blogDIV\')"]')).length > 0) {
        document.getElementById(blogid).parentNode.insertAdjacentHTML("afterbegin", '<button onclick="revealBlogPosts(\'blogDIV\')" class="btn-blog">See all posts</button>')
    }
    sidebar(false);
    document.querySelectorAll('#openPost_button')?.forEach(button => button.style.display = 'none');
}

function openPostOnly(e) {
    const id = getParentIdC(e);
    console.log(id);
    seePostOnly(id);
}

var blogid = "";

document.addEventListener("DOMContentLoaded", function() {
    w3IncludeHTML();
    hideDirectChildDivs("mainDIV");
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);


    blogid = urlParams.get('blog');
    s = urlParams.get('s');
    blogonly = urlParams.get('bo');

    if (blogid) {
        document.getElementById("blogDIV").style.display = "block";
    } else if (s) {
        var redirecturl = "";
        switch (s) {
            case "itch":
                redirecturl = "https://interbullet-art.itch.io/";
                break;
            case "github":
                redirecturl = "https://github.com/IkariDevGIT";
                break;
            case "civit":
                redirecturl = "https://civitai.com/user/ikaridev";
                break;
            case "ayumi":
                redirecturl = "https://rentry.co/ayumi_erp_rating";
                break;
        }
        if (redirecturl != "") {
            window.location.replace(redirecturl);
        } else {
            document.getElementById("homeDIV").style.display = "block";
        }
    } else {
        document.getElementById("homeDIV").style.display = "block";
    }
});
window.addEventListener('load', function() {
    document.querySelectorAll('.blogbox')?.forEach(item => item.insertAdjacentHTML("beforeend", '<div id="smallline" style="margin-top: 40px;"></div><div style="display: flex; justify-content: right; height: auto;"><button onclick="getParentId(this)" class="btn-blog">Share</button><button onclick="openPostOnly(this)" class="btn-blog" id="openPost_button">Open post</button></div>'));
    if (blogid) {
        document.getElementById(blogid).scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center'
        });
        if (!!blogonly == true) {
            seePostOnly(blogid)
        }
    }
})


/**
 * @param {Integer} site index
 */
function switchTo(toI) {
    hideDirectChildDivs("mainDIV");
    sidebar(true);
    revealBlogPosts("blogDIV");
    switch (toI) {
        case 0:
            document.getElementById("homeDIV").style.display = "block";
            break;
        case 1:
            document.getElementById("aboutDIV").style.display = "block";
            break;
        case 2:
            document.getElementById("blogDIV").style.display = "block";
            break;
        case 100:
            document.getElementById("secretDIV").style.display = "block";
            break;
    }
}