const testSearchDocuments = [
    {
        "id": 1,
        "title": "hello world",
        "url": "https://helloworld.com/hello",
        "domain": "helloworld.com"
    },
    {
        "id": 2,
        "title": "authentication check",
        "url": "https://authentication.com/hello",
        "domain": "authentication.com"
    }
]

const SUCCESS = "1";
const FAILURE = "0";

const scoreDoc = {
    "title": 10,
    "domain": 1
}

function test1CanPerformPrefixSearch() {
    let results = performDocumentSearch(testSearchDocuments, {"title": 10}, "temp auth");
    if (results.length != 1) {
        console.log("Search length failed");
        return "Search length failed";
    }

    if (results[0]["id"] != 2) {
        console.log("Unexpected document received");
        return "Unexpected document received";
    }

    return SUCCESS;
}

function test2CanRemoveEmptySpacesFromSearchToken() {
    let results = performDocumentSearch(testSearchDocuments, {"title": 10}, "    ");
    if (results.length != 0) {
        console.log("Search length failed");
        return "Search length failed";
    }

    return SUCCESS;
}

function logTestResult(method, testResult) {
    const bookmarkList = document.getElementById('resultList');
    const listItem = document.createElement('li');
    listItem.innerHTML = method + " - " + testResult;
    bookmarkList.appendChild(listItem);
}

function bootStrap() {
    logTestResult("test1CanPerformPrefixSearch", test1CanPerformPrefixSearch());
    logTestResult("test2CanRemoveEmptySpacesFromSearchToken", test2CanRemoveEmptySpacesFromSearchToken());
}

window.onload = bootStrap