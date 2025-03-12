
function recursivelyLoadBookmarksToList(nodes, items) {
    for (const node of nodes) {
        if (node.url) {
            items.push({
                "url": node.url,
                "title": node.title,
                "domain": getDomainName(node.url)
            });
        } else if (node.children) {
            recursivelyLoadBookmarksToList(node.children, items);
        }
    }
}

function getDomainName(url, subdomain) {
    try {
        // Ensure the URL has a scheme; if not, prepend 'http://'
        let formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'http://' + url;

        // Use the URL constructor to parse the domain
        let domain = new URL(formattedUrl).hostname;

        return domain;
    } catch (error) {
        console.error("Invalid URL", error);
        return null;
    }
}

function scanBookMarksAndFlatten(bookmarkItems) {
    var items = [];
    recursivelyLoadBookmarksToList(bookmarkItems[0].children, items);
    return items;
}

function onRejected(error) {
    console.log(`An error: ${error}`);
}

function searchBookMarksAndFillTheUl(userInputSearchText) {
    const bookmarkList = document.getElementById('bookmarkList');

    while( bookmarkList.firstChild ){
        bookmarkList.removeChild( bookmarkList.firstChild );
    }

    chrome.bookmarks.getTree().then(scanBookMarksAndFlatten, onRejected)
        .then((flattenedBookMarks) => {
            let tabIndex = 2;

            const scoreDoc = {
                "title": 10,
                "domain": 1
            }

            // let dump = JSON.stringify(flattenedBookMarks);
            // document.getElementById("infomation_bar").innerHTML = dump;
            // return;

            let results = performDocumentSearch(flattenedBookMarks, scoreDoc, userInputSearchText);

            for (const result of results) {
                const listItem = document.createElement('li');
                listItem.innerHTML = result.title + "<br/><label>" + result.domain + "</label>"
                listItem.setAttribute("link", result.url);
                listItem.onclick = function () {
                    openInNewTab(result.url);
                }

                const searchResultId = tabIndex - 1;
                listItem.id = "search_results_".concat("" + searchResultId);
                listItem.tabIndex = tabIndex;
                tabIndex++;
                bookmarkList.appendChild(listItem);
            }

            // for (const bookMarkSearchResultItem of flattenedBookMarks) {
            //     if (bookMarkSearchResultItem.title.toLowerCase().includes(userInputSearchText)) {
            //         const listItem = document.createElement('li');
            //         listItem.innerHTML = bookMarkSearchResultItem.title;
            //         listItem.setAttribute("link", bookMarkSearchResultItem.url);
            //
            //         const searchResultId = tabIndex - 1;
            //         listItem.id = "search_results_".concat("" + searchResultId);
            //         listItem.tabIndex = tabIndex;
            //         tabIndex++;
            //         bookmarkList.appendChild(listItem);
            //     }
            // }
        });
}

document.onkeyup = processKeyStrokeV2;

function processUpArrow(e) {
    const inputEditor = document.getElementById("searchSuggest");

    if (document.activeElement == inputEditor) {
        // do nothing
        return;
    }

    const tabIndex = document.activeElement.tabIndex;
    if (tabIndex) {

        if (tabIndex <= 2) {
            inputEditor.focus();
            return;
        }

        //at this point tab index is greater than 2
        let preLiElementId = tabIndex - 2;
        const previousLiElement = document.getElementById("search_results_".concat("" + preLiElementId))
        if (previousLiElement) {
            previousLiElement.focus();
        }
    }
}

function processDownArrow(e) {
    const inputEditor = document.getElementById("searchSuggest");
    if (document.activeElement == inputEditor) {
        const firstLiElement = document.getElementById("search_results_1");
        if (firstLiElement) {
            firstLiElement.focus();
        }
        return;
    }

    const tabIndex = document.activeElement.tabIndex;
    if (tabIndex) {
        const nextLiItemElement = document.getElementById("search_results_".concat("" + tabIndex))
        if (nextLiItemElement) {
            nextLiItemElement.focus();
        }
    }
}

function processKeyStrokeV2(e) {
    e = e || window.event;

    // console.log(e.keyCode);
    if (e.keyCode == '38') {
        // up arrow
        processUpArrow(e);
    } else if (e.keyCode == '40') {
        // down arrow
        processDownArrow(e);
    } else if (e.keyCode == '13') {

        if (document.activeElement) {
            const attributeValue = document.activeElement.getAttribute("link");
            if (attributeValue) {
                openInNewTab(attributeValue);
            }
        }
    }
}

function openInNewTab(url) {
    window.open(url, '_blank').focus();
}

function searchBookMarksWithControlOnUserInput(term) {
    var searchSuggestInputElement = document.querySelector('input');
    var duration = 500;
    clearTimeout(searchSuggestInputElement._timer);
    searchSuggestInputElement._timer = setTimeout(()=>{
        searchBookMarksAndFillTheUl(term);
    }, duration);
}

function processKeyStroke(event) {

    if (event.key == "Enter") {

    } else if (event.keyCode == 8) {

    } else {
        var textBar = document.getElementById("searchSuggest");

        if (textBar.value.length > 2) {
            searchBookMarksWithControlOnUserInput(textBar.value);
        }
    }

}

function bootStrap() {
    document.getElementById("searchSuggest").addEventListener("input", function(event) {
        processKeyStroke(event);
    });
    document.getElementById("searchSuggest").focus();
}

window.onload = bootStrap
