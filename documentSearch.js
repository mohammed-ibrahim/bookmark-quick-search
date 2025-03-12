
function splitAndNormalise(textInput) {
    if (textInput) {
        let text = textInput.toLowerCase();
        return text.split(" ").filter(n => n);
    }

    return [];
}

const FULL_MATCH_SCORE = 20;
const STARTS_WITH_MATCH_SCORE = 15;
const SINGLE_TERM_IN_FIELD_SCORE = 10;
const PROCESSED_TERM_SCORE = 5;

function evaluateScoreForField(field, boost, searchText, listOfSearchTerms) {

    if (field == undefined) {
        return 0;
    }

    if (field == searchText) {
        return FULL_MATCH_SCORE * boost;
    }

    if (field.startsWith(searchText)) {
        return STARTS_WITH_MATCH_SCORE * boost;
    }

    if (listOfSearchTerms.length == 1) {
        if (field.includes(searchText)) {
            return SINGLE_TERM_IN_FIELD_SCORE * boost;
        }
    }

    const fieldValues = splitAndNormalise(field);


    let numOfTermMatches = 0;
    let numOfTermStartsWith = 0;

    for (const fieldValue of fieldValues) {
        for (const term of listOfSearchTerms) {
            if (fieldValue == term) {
                numOfTermMatches += 1;
            } else if (fieldValue.startsWith(term)) {
                numOfTermStartsWith += 1;
            }
        }
    }

    const allMatchCount = numOfTermMatches + numOfTermStartsWith;

    if (allMatchCount == 0) {
        return 0;
    }

    return ((PROCESSED_TERM_SCORE * allMatchCount)/(listOfSearchTerms.length)) * boost;
}

function performDocumentSearch(documents, scoreDocs, searchText) {
    const listOfSearchTerms = splitAndNormalise(searchText);

    if (listOfSearchTerms.length < 1) {
        return [];
    }

    for (const searchDocument of documents) {
        let documentScore = 0;
        for (const documentFieldName in scoreDocs) {
            const documentFieldBoost = scoreDocs[documentFieldName];
            const fieldScore = evaluateScoreForField(searchDocument[documentFieldName], documentFieldBoost, searchText, listOfSearchTerms);
            documentScore += fieldScore;
            searchDocument[documentFieldName.concat("_score")] = fieldScore;
        }
        searchDocument.matchScore = documentScore;
    }

    let filteredResults = documents.filter(function (searchObj) {
        return searchObj.matchScore > 0;
    });

    filteredResults.sort(function(a, b) { return b.matchScore - a.matchScore })
    return filteredResults;
}