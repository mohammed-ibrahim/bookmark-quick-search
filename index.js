
function recursivelyLoadBookmarksToList(nodes, items) {
    for (const node of nodes) {
        if (node.url) {
            items.push(node);
        } else if (node.children) {
            recursivelyLoadBookmarksToList(node.children, items);
        }
    }
}

function logTree(bookmarkItems) {
    var items = [];
    recursivelyLoadBookmarksToList(bookmarkItems[0].children, items);
    return items;
}

function onRejected(error) {
    console.log(`An error: ${error}`);
}

function flattenBookMarks(term) {
    const bookmarkList = document.getElementById('bookmarkList');

    while( bookmarkList.firstChild ){
        bookmarkList.removeChild( bookmarkList.firstChild );
    }


    term = term.toLowerCase();
    let gettingTree = chrome.bookmarks.getTree();

    gettingTree.then(logTree, onRejected)
        .then((bookMarkSearchResults) => {
            let tabIndex = 2;
            for (const bookMarkSearchResultItem of bookMarkSearchResults) {
                if (bookMarkSearchResultItem.title.toLowerCase().includes(term)) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = bookMarkSearchResultItem.title;
                    listItem.setAttribute("link", bookMarkSearchResultItem.url);

                    const searchResultId = tabIndex - 1;
                    listItem.id = "search_results_".concat("" + searchResultId);
                    listItem.tabIndex = tabIndex;
                    tabIndex++;
                    bookmarkList.appendChild(listItem);
                }
            }
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

function searchBookMarks(term) {
    flattenBookMarks(term);
}

function processKeyStroke(event) {

    if (event.key == "Enter") {

    } else if (event.keyCode == 8) {

    } else {
        var textBar = document.getElementById("searchSuggest");

        if (textBar.value.length > 2) {
            searchBookMarks(textBar.value);
        }
    }

}

function bootStrap() {
    console.log('Hello World From Extension1');
    document.getElementById("searchSuggest").addEventListener("input", function(event) {
        processKeyStroke(event);
    });
    document.getElementById("searchSuggest").focus();
}

window.onload = bootStrap
