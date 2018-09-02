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
const dictURL = "cmudict/cmudict.dict?v=2";
const transformURL = "transformation.json?v=2";

let CMUdict = new Map();
let wordReplace = new Map();
let phenomeReplace = [];

let retrieveStat = {};
window.addEventListener("load",pageLoad);

function pageLoad() {

    // Request the CMU dictionary
    let dictReq = new XMLHttpRequest();
    dictReq.addEventListener("progress", generateProgressHandler("dict-progress"));
    dictReq.addEventListener("readystatechange", function() {
        if (dictReq.readyState === 4) {
            let loaded = false;
            if (dictReq.status === 200) {
                try {
                    // Construct the CMUdict dictionary.
                    saveDictionary(dictReq.responseText);
                    retrieveDone("dict");
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
    transReq.addEventListener("progress", generateProgressHandler("transform-progress"));
    transReq.addEventListener("readystatechange", function() {
        if (transReq.readyState === 4) {
            let loaded = false;
            if (transReq.status === 200) {
                // Construct the CMUdict dictionary.
                try {
                    saveTransform(transReq.response);
                    retrieveDone("trans");
                    loaded = true;
                } catch(e) {
                    console.log(e);
                }

            }

            let dictStatusElem = document.getElementById("transform-status");
            if (loaded) {
                dictStatusElem.innerText = "Transform Loaded.";
            } else {
                dictStatusElem.innerText = "Transform failed to load";
            }
        }
    });
    transReq.open("GET",transformURL, true);
    transReq.responseType = "json";
    transReq.send();
}

function retrieveDone(reqID) {
    retrieveStat[reqID] = true;

    if (retrieveStat["dict"] && retrieveStat["trans"]) {
        let inputElem = document.getElementById("word-input");
        let buttonElem = document.getElementById("word-button");

        // Setup the HTML elements to respond to input.
        inputElem.addEventListener("keydown",function(event){
            let e = event || window.event;
            if(e.keyCode == 13){
                submitWord();
            }
        });
        buttonElem.addEventListener("click", function(){
            submitWord();
        });
        inputElem.disabled=false;
    }
}

function generateProgressHandler(elemID) {
    let progressElem = document.getElementById(elemID);

    return function(evt) {
        if (evt.lengthComputable) {
            let percentComplete = (evt.loaded / evt.total);
            progressElem.value = percentComplete;
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
    return str.split(" ").map(name => qsm[name] || "?").join("");
}

function saveTransform(transJSON) {
    // Load the direct English -> Quickscript translations.
    for (let replace of transJSON["wordReplace"]) {
        let qsWords = replace[1].map(convertNamesToQS);
        wordReplace.set(replace[0], qsWords);
    }

    // Load the regex transformations.
    for (let replace of transJSON["regexReplace"]) {
        let re = new RegExp(replace[0], replace[1]);
        phenomeReplace.push([re, convertNamesToQS(replace[2])]);
    }

    // Load the plain phenome transformations.
    for (let replace of transJSON["plainReplace"]) {
        let re = new RegExp("\\b" + replace[0] + "\\b", "g");
        phenomeReplace.push([re, convertNamesToQS(replace[1])]);
    }
}

function submitWord() {
    let inputElem = document.getElementById("word-input");
    let phenomElem = document.getElementById("phenomes-output");
    let phenomQSElem = document.getElementById("phenomeQS-output");
    let manualElem = document.getElementById("manual-output");

    let word = inputElem.value.toLowerCase();

    let manualWords = wordReplace.get(word);

    if (manualWords) {
        manualElem.innerText = manualWords.join("\n");
        manualElem.style.display = "inherit";
    } else {
        manualElem.innerText = "";
        manualElem.style.display = "none";
    }

    let phenomes = CMUdict.get(word);

    if (!phenomes && !manualWords) {
        phenomElem.innerText = "<Word not found>";
        phenomQSElem.innerText = "";
        return;
    }

    phenomElem.innerText = phenomes.join("\n");

    let qsTranscripts = [];

    for (let phenomeStr of phenomes) {
        // Transform the phenomes in order.
        for (let transform of phenomeReplace) {
            phenomeStr = phenomeStr.replace(transform[0], transform[1]);
        }
        phenomeStr = phenomeStr.replace(/ /g,"").trim();
        
        qsTranscripts.push(phenomeStr);
    }

    phenomQSElem.innerText = qsTranscripts.join("\n");
}