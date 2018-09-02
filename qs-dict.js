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

let CMUdict = {};
window.addEventListener("load",pageLoad);

function pageLoad() {
    let dictReq = new XMLHttpRequest();
    let inputElem = document.getElementById("word-input");
    let buttonElem = document.getElementById("word-button");

    
    dictReq.addEventListener("progress", function(evt) {
        console.log("progress " + evt.loaded);
        if (evt.lengthComputable) {
            let percentComplete = (evt.loaded / evt.total);
            document.getElementById("progress").value = percentComplete;
        }
    });
    dictReq.addEventListener("readystatechange", function() {
        if (dictReq.readyState === 4) {
            let statusElem = document.getElementById("status");
            if (dictReq.status === 200) {

                // construct the CMUdict dictionary

                let lines = dictReq.responseText.trim().split("\n");

                for (let line of lines) {
                    let re = /^(.*?)(?:\([0-9]+\))?\t(.*)$/;
                    let matches = re.exec(line);
                    if (matches) {
                        let word = matches[1];
                        let phonemes = matches[2];
                        
                        let wordEntry = CMUdict[word] || [];
                        wordEntry.push(phonemes);
                        CMUdict[word] = wordEntry;
                    } else {
                        console.log("line does not match: " + line);
                    }
                }

                // Setup the HTML elements to respond to input

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
                statusElem.innerText = "Dictionary Loaded.";
            } else {
                statusElem.innerText = "Dictionary failed to load";
            }
        }
    });
    dictReq.open("GET","cmudict/cmudict.0.7a_SPHINX_40", true);
    dictReq.send();
}

let phenomeMap = {
    "AA": "\uE676", // Ah
    "AE": "\uE674", // At
    "AH": "\uE67A", // Utter
    "AO": "\uE677", // Awe
    "AW": "\uE67B", // Out
    "AY": "\uE675", // I
    "B":  "\uE651", // Bay
    "CH": "\uE65E", // Cheer
    "D":  "\uE653", // Day
    "DH": "\uE657", // They
    "EH": "\uE672", // Et
    "ER": "\uE67A\uE668", // Utter-Roe
    "EY": "\uE673", // Eight
    "F":  "\uE658", // Fee
    "G":  "\uE655", // Gay
    "HH": "\uE662", // He
    "IH": "\uE670", // It
    "IY": "\uE671", // Eat
    "JH": "\uE65F", // Jay
    "K":  "\uE654", // Key
    "L":  "\uE667", // Low
    "M":  "\uE665", // May
    "N":  "\uE666", // No
    "NG": "\uE664", // Ing
    "OW": "\uE67C", // Owe
    "OY": "\uE679", // Oy
    "P":  "\uE650", // Pea
    "R":  "\uE668", // Roe
    "S":  "\uE65A", // See
    "SH": "\uE65C", // She
    "T":  "\uE652", // Tea
    "TH": "\uE656", // Thaw
    "UH": "\uE67D", // Foot
    "UW": "\uE67E", // Ooze
    "V":  "\uE659", // Vie
    "W":  "\uE661", // Way
    "WH": "\uE663", // Why
    "Y":  "\uE660", // Ye
    "Z":  "\uE65B", // Zoo
    "ZH": "\uE65D", // J'ai
};

function submitWord() {
    let inputElem = document.getElementById("word-input");
    let phenomElem = document.getElementById("phenomes-output");
    let qsElem = document.getElementById("quickscript-output");

    let word = inputElem.value.toUpperCase();

    let phenomes = CMUdict[word];

    if (!phenomes) {
        phenomElem.innerText = "<Word not found>";
        qsElem.innerText = "";
        return;
    }

    phenomElem.innerText = phenomes.join("\n");

    let qsTranscripts = [];

    for (let phenomeStr of phenomes) {
        // The CMU phonetic dictionary stores the Why sound as HH W
        phenomeStr = " " + phenomeStr + " ";
        phenomeStr = phenomeStr.replace(" HH W "," WH ").trim();
        
        let qsStr = "";
        for (let phenome of phenomeStr.split(" ")) {
            let qsChar = phenomeMap[phenome] || "?";
            qsStr += qsChar;
        }
        
        qsTranscripts.push(qsStr);
    }

    qsElem.innerText = qsTranscripts.join("\n");
}