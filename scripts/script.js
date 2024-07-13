var sentence = '';
var guess_sentence = '';
var length = 0;
var mistakes = 0;
var points = 0;

var yes = new Audio('yes.wav');
var no = new Audio('no.wav');

var letters = new Array(26);

for (var i = 0; i < letters.length; i++) {
    letters[i] = String.fromCharCode(65 + i);
}

document.addEventListener('DOMContentLoaded', start);

function start() {
    fetchRandomWord().then(word => {
        sentence = word.toUpperCase();
        length = sentence.length;
        initializeGuessSentence();
        revealRandomLetters(3);
        writeSentence();
        initializeAlphabet();
        fetchWordDefinition(word);
    });
}

function fetchRandomWord() {
    return fetch('https://random-word-api.vercel.app/api?words=1')
        .then(response => response.json())
        .then(data => data[0])
        .catch(error => console.error('Error fetching random word:', error));
}

function fetchWordDefinition(word) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => response.json())
        .then(data => {
            if (data[0] && data[0].meanings[0] && data[0].meanings[0].definitions[0]) {
                var definition = data[0].meanings[0].definitions[0].definition;
                document.getElementById('definition').innerHTML = 'Definition: ' + definition;
            } else {
                document.getElementById('definition').innerHTML = 'Definition not found.';
            }
        })
        .catch(error => {
            console.error('Error fetching word definition:', error);
            document.getElementById('definition').innerHTML = 'Definition not found.';
        });
}

function initializeGuessSentence() {
    guess_sentence = '';
    for (var i = 0; i < length; i++) {
        if (sentence.charAt(i) === ' ') {
            guess_sentence += ' ';
        } else {
            guess_sentence += '-';
        }
    }
}

function revealRandomLetters(count) {
    var indices = [];
    while (indices.length < count) {
        var randomIndex = Math.floor(Math.random() * length);
        if (!indices.includes(randomIndex) && guess_sentence.charAt(randomIndex) === '-') {
            indices.push(randomIndex);
            guess_sentence = guess_sentence.ustawZnak(randomIndex, sentence.charAt(randomIndex));
        }
    }
    writeSentence();
}

function writeSentence() {
    document.getElementById('board').innerHTML = guess_sentence;
}

function initializeAlphabet() {
    var div_contents = '';
    for (var i = 0; i < 26; i++) {
        var element = 'letter' + i;
        div_contents += '<div class="letter" onclick="check(' + i + ')" id="' + element + '">' + letters[i] + '</div>';
    }
    document.getElementById('alfabet').innerHTML = div_contents;
}

String.prototype.ustawZnak = function (miejsce, znak) {
    if (miejsce > this.length - 1) {
        return this.toString();
    } else {
        return this.substr(0, miejsce) + znak + this.substr(miejsce + 1);
    }
};

function check(num) {
    var trafiona = false;

    for (var i = 0; i < length; i++) {
        if (sentence.charAt(i) === letters[num]) {
            guess_sentence = guess_sentence.ustawZnak(i, letters[num]);
            trafiona = true;
        }
    }

    if (trafiona) {
        yes.play();
        var element = 'letter' + num;
        document.getElementById(element).style.cursor = 'pointer';
        writeSentence();
    } else {
        no.play();
        var element = 'letter' + num;
        document.getElementById(element).style.background = '#330000';
        document.getElementById(element).style.color = '#C00000';
        document.getElementById(element).style.border = '3px solid #C00000';
        document.getElementById(element).style.cursor = 'default';
        document.getElementById(element).setAttribute('onclick', ';');

        
        mistakes++;
        var image = 'img/s' + mistakes + '.jpg';
        document.getElementById('gallows').innerHTML = '<img src="' + image + '" alt="">';
    }

    
    if (sentence === guess_sentence) {
        points += 30;
        document.getElementById('alfabet').innerHTML = 'That\'s right! Correct word: ' + sentence + '. You have ' + points + ' points.<br><br><span class="reset" onclick="startNewWord()">NEXT WORD</span>';
    }

    
    if (mistakes >= 9) {
        document.getElementById('alfabet').innerHTML = 'You lose! Correct word: ' + sentence + '<br><br><span class="reset" onclick="location.reload()">GAME OVER. TRY AGAIN?</span>';
    }
}

function startNewWord() {
    mistakes = 0;
    document.getElementById('gallows').innerHTML = '<img src="img/s0.jpg" alt="">';
    start();
}
