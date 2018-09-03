# QS-Dict
Software to approximately transform words of Orthodox English Spelling into Quickscript.

[Live Version](https://akovaski.github.io/QS-Dict/qs-dict.html)

This is not a true dictionary, but rather a phonetic transformation from english
words to Quickscript. Some standardized spellings may be transformed incorrectly.

# How it works

## Manually transforming words
If the word matches any of the words in the `wordReplace` array in `transformation.js`,
the spellings provided are displayed to the user. The page then continues to attempt
to tranform the word phonetically.

## Phonetically transforming words
The page checks for an entry of the word in the CMU Pronunciation dictionary
(`cmudict/cmudict.dict`). The dictionary outputs
[phonetic symbols](https://en.wikipedia.org/wiki/ARPABET) that represent how the
word is pronounced.

Those phonetic symbols are then mapped to Quickscript characters. This mapping is
usually fairly simple because Quickscript characters are mostly phonetic. However,
there are some additional rules to help handle edge cases. This phonetic mapping
is specified in `transformation.js`. The transformation first runs the regex
replacements specified in `regexReplace`, and then runs the plain phonetic
replacements specified in `plainReplace`.

# Open Source projects used
[The Carnegie Mellon Pronouncing Dictionary](https://github.com/cmusphinx/cmudict)
[The "Abbots Morton Experiment" font for Quickscript](https://github.com/adiabatic/abbots-morton-experiment)