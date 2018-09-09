/*
Copyright 2018 akovaski

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const dictURL = "cmudict/cmudict.txt";
const transformURL = "transformation.json?v=7";
const JSONtestTransformURL = "test/test-transform.json";

let CMUdict = new Map();
let wordReplace = new Map();
let phenomeReplace = [];

let retrieveStat = {};
window.addEventListener("load",pageLoad);

function pageLoad() {

    let hash = window.location.hash.substr(1);
    if (hash) {
        let inputElem = document.getElementById("word-input");
        inputElem.value = hash;
    }

    // Request the CMU dictionary
    let dictReq = new XMLHttpRequest();
    let dictProgressElem = document.getElementById("dict-progress");
    dictReq.addEventListener("progress", generateProgressHandler(dictProgressElem));
    dictReq.addEventListener("readystatechange", function() {
        if (dictReq.readyState === 4) {
            let loaded = false;
            if (dictReq.status === 200) {
                try {
                    // Construct the CMUdict dictionary.
                    saveDictionary(dictReq.responseText);
                    retrieveDone("dict");
                    dictProgressElem.value = 1;
                    loaded = true;
                } catch(e) {
                    console.log(e);
                }

            }

            let dictStatusElem = document.getElementById("dict-status");
            if (loaded) {
                dictStatusElem.innerText = "Dictionary Loaded.";
            } else {
                dictStatusElem.innerText = "Dictionary failed to load";
            }
        }
    });
    dictReq.open("GET",dictURL, true);
    dictReq.responseType = "text";
    dictReq.send();


    // Request the transformation json file
    let transReq = new XMLHttpRequest();
    let transProgressElem = document.getElementById("transform-progress");
    transReq.addEventListener("progress", generateProgressHandler(transProgressElem));
    transReq.addEventListener("readystatechange", function() {
        if (transReq.readyState === 4) {
            let loaded = false;
            if (transReq.status === 200) {
                // Construct the CMUdict dictionary.
                try {
                    saveTransform(transReq.response);
                    retrieveDone("trans");
                    transProgressElem.value = 1;
                    loaded = true;
                } catch(e) {
                    console.log(e);
                }

            }

            let transStatusElem = document.getElementById("transform-status");
            if (loaded) {
                transStatusElem.innerText = "Transform Loaded.";
            } else {
                transStatusElem.innerText = "Transform failed to load";
            }
        }
    });
    transReq.open("GET",transformURL, true);
    transReq.responseType = "json";
    transReq.send();

    let titleElem = document.getElementById("title");
    let alternativeText = " "; // Quickscript Dictionary
    titleElem.addEventListener("click", function() {
        let curText = titleElem.innerText;
        titleElem.innerText = alternativeText;
        alternativeText = curText;
    });
}

function retrieveDone(reqID) {
    retrieveStat[reqID] = true;

    if (retrieveStat["dict"] && retrieveStat["trans"]) {
        let inputElem = document.getElementById("word-input");
        let buttonElem = document.getElementById("word-button");

        // Setup the HTML elements to respond to input.
        function submitWordAndAddHistory() {
            history.pushState("", "", "#" + inputElem.value);
            submitWord();
        }
        inputElem.addEventListener("keydown",function(event){
            let e = event || window.event;
            if(e.keyCode == 13){
                submitWordAndAddHistory();
            }
        });
        buttonElem.addEventListener("click", function(){
            submitWordAndAddHistory();
        });
        inputElem.disabled=false;
        buttonElem.disabled=false;

        if (inputElem.value) {
            submitWord(); // The input value may be specified by navigating to the page via a   
        }

        // execute whenever the url hash is updated (going back/forward through history)
        // or when pushstate is called
        window.addEventListener("popstate", function(evt) {
            let hash = document.location.hash.substr(1);
            if (hash) {
                inputElem.value = hash;
                submitWord();
            }
        })
    }
}

function generateProgressHandler(progressElem) {
    return function(evt) {
        if (evt.lengthComputable) {
            let percentComplete = (evt.loaded / evt.total);
            progressElem.value = percentComplete;
        } else {
            let remaining = 1 - progressElem.value;
            progressElem.value += remaining/4;
        }
    };
}

function saveDictionary(dictText) {
    let lines = dictText.trim().split("\n");

    for (let line of lines) {
        let re = /^(.*?)(?:\([0-9]+\))?\s(.*)$/;
        let matches = re.exec(line);
        if (matches) {
            let word = matches[1];
            let phonemes = matches[2];
            
            let wordEntry = CMUdict.get(word) || [];
            try {
            wordEntry.push(phonemes);
            }catch (e) {
                console.log(e);
            }
            CMUdict.set(word, wordEntry);
        } else {
            console.log("line does not match: " + line);
        }
    }
}

let qsm = { // Quickscript map
    "pea":   "\uE650",
    "bay":   "\uE651",
    "tea":   "\uE652",
    "day":   "\uE653",
    "key":   "\uE654",
    "gay":   "\uE655",
    "thaw":  "\uE656",
    "they":  "\uE657",
    "fee":   "\uE658",
    "vie":   "\uE659",
    "see":   "\uE65A",
    "zoo":   "\uE65B",
    "she":   "\uE65C",
    "j'ai":  "\uE65D",
    "cheer": "\uE65E",
    "jay":   "\uE65F",
    "ye":    "\uE660",
    "way":   "\uE661",
    "he":    "\uE662",
    "why":   "\uE663",
    "ing":   "\uE664",
    "may":   "\uE665",
    "no":    "\uE666",
    "low":   "\uE667",
    "roe":   "\uE668",
    "it":    "\uE670",
    "eat":   "\uE671",
    "et":    "\uE672",
    "eight": "\uE673",
    "at":    "\uE674",
    "i":     "\uE675",
    "ah":    "\uE676",
    "awe":   "\uE677",
    "ox":    "\uE678",
    "oy":    "\uE679",
    "utter": "\uE67A",
    "out":   "\uE67B",
    "owe":   "\uE67C",
    "foot":  "\uE67D",
    "ooze":  "\uE67E",
};

function convertNamesToQS(str) {
    return str.split(" ").map(name => qsm[name] || name).join("");
}

function convertQSToNames(str) {
    let reverseLookup = {};
    for (let name in qsm) {
        reverseLookup[qsm[name]] = name;
    }
    return str.split("").map(qsChar => reverseLookup[qsChar] || qsChar).join(" ");
}

function saveTransform(transJSON) {
    // Load the direct English -> Quickscript translations.
    for (let replace of transJSON["wordReplace"]) {
        let qsWords = replace[1];
        wordReplace.set(replace[0], qsWords);
    }

    // Load the regex transformations.
    for (let replace of transJSON["regexReplace"]) {
        let reStr = replace[0];
        let substituteStr = replace[1];
        let flag = replace[2];
        let wordContitionStr = replace[3];

        if (flag === "plain") {
            reStr = "\\b" + reStr + "\\b";
            flag = "g";
        } else if (flag === "prefix") {
            reStr = "^([ a-z]*)" + reStr + "(?= )";
            flag = "";
            substituteStr = "$1 " + substituteStr;
        } else if (flag === "suffix") {
            reStr = "(?!^)\\b" + reStr + "(?=[ a-z]*$)";
            flag = "";
        }

        let re = new RegExp(reStr, flag);
        let wordConditionRe;
        if (wordContitionStr) {
            wordConditionRe = new RegExp(wordContitionStr);
        }
        phenomeReplace.push([re, substituteStr, wordConditionRe]);
    }
}

function submitWord() {
    let inputElem = document.getElementById("word-input");
    let phenomElem = document.getElementById("phenomes-output");
    let QSOutElem = document.getElementById("quickscript-output");
    let notFoundElem = document.getElementById("word-not-found-display");

    let word = inputElem.value;
    let results = getQSTranscripts(word);
    let phenomes = results[0];
    let manualTranscripts = results[1];
    let qsTranscripts = results[2];
    if (manualTranscripts.length === 0 && qsTranscripts.length === 0) {
        notFoundElem.innerText = "<Word not found: \"" + word + "\">";
    } else {
        notFoundElem.innerText = "";
    }

    phenomElem.innerText = phenomes.join("\n");
    QSOutElem.innerHTML = "";
    addQSOut(QSOutElem, manualTranscripts, "resultPreferred");
    addQSOut(QSOutElem, qsTranscripts, "resultNormal");
}

function getQSTranscripts(wordInput) {
    let word = wordInput.toLowerCase();
    let manualTranscripts = (wordReplace.get(word) || []).map(convertNamesToQS);
    let phenomes = CMUdict.get(word) || [];

    let qsTranscripts = [];

    for (let phenomeStr of phenomes) {
        let qsStr = transformPhenome(phenomeStr, word);

        if (!manualTranscripts.includes(qsStr) && !qsTranscripts.includes(qsStr)) {
            qsTranscripts.push(qsStr);
        }
    }
    return [phenomes, manualTranscripts, qsTranscripts];
}

function transformPhenome(phenomeStr, word, usedTransforms) {
        // Transform the phenomes in order.
        for (let transform of phenomeReplace) {
            let wordConditionRe = transform[2];
            if (wordConditionRe && !word.match(wordConditionRe)) {
                continue;
            }
            let updatedStr = phenomeStr.replace(transform[0], transform[1]);
            if (wordConditionRe && phenomeStr !== updatedStr) {
                word = word.replace(wordConditionRe, "");
            }
            if (usedTransforms && phenomeStr !== updatedStr) {
                usedTransforms.push(transform);
            }
            phenomeStr = updatedStr;
        }
        phenomeStr = convertNamesToQS(phenomeStr);
        return phenomeStr;
}

function addQSOut(elem, qsStrings, styleClass) {
    for (let str of qsStrings) {
        let div = document.createElement("div");
        div.innerText = str;
        div.className = styleClass;

        elem.appendChild(div);
    }
}

// not called anywhere, just used for testing
function testTransform() {
    
    // Request the transformation json file
    let testReq = new XMLHttpRequest();
    testReq.addEventListener("readystatechange", function() {
        if (testReq.readyState === 4) {
            let loaded = false;
            if (testReq.status === 200) {
                // Construct the CMUdict dictionary.
                try {
                    let tests = testReq.response;
                    let numFails = 0;
                    for (let test of tests) {
                        // the test file should have words and verified transformations in the format of:
                        // [
                        //    ["word", ["way utter roe day", ...]] ...
                        // ]
                        let word = test[0];
                        let spellings = test[1].map(convertNamesToQS);

                        let results = getQSTranscripts(word);
                        let transcripts = results[1].concat(results[2]);
                        
                        let same = spellings.length === transcripts.length &&
                                   spellings.every((val)=>transcripts.includes(val));
                        if (!same) {
                            console.log("Mismatch: " + word);
                            console.log("Expected: " + JSON.stringify(spellings.map(convertQSToNames)));
                            console.log("Actual:   " + JSON.stringify(transcripts.map(convertQSToNames)));

                            numFails += 1;
                        }
                    }

                    if (numFails > 0) {
                        console.log(numFails + " tests failed.");
                    } else {
                        console.log("All " + tests.length + " tests ran successfully.");
                    }
                } catch(e) {
                    console.log(e);
                }

            } else {
                console.log("Could not load test file");
            }
        }
    });
    // request tests, bypass the cache
    testReq.open("GET",JSONtestTransformURL + "?" + Date.now(), true);
    testReq.responseType = "json";
    testReq.send();
}