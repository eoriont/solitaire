var deck = [];
var piles = [[], [], [], [], [], [], []];
var acePiles = [[], [], [], []];
var deckFlippedPile = [];
var cursorCard;
var cursorCardPile;
var cursorArea;
var cursorCardX, cursorCardY;

const cardWidth = 50;
const cardHeight = 70;
const cardPaddingX = 10;
const cardPaddingY = 20;

let score, moves;

function createDeck() {
    let deck = [];
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 4; j++) {
            deck.push({
                suit: j,
                number: i + 1,
                revealed: false,
                dragging: false
            });
        }
    }
    return deck;
}

function setupPiles() {
    // Add cards to each pile
    for (let i = 0; i < piles.length; i++) {
        for (let j = 0; j < i + 1; j++) {
            piles[i].push(deck.pop());
        }
    }

    // Reveal last card of each pile
    for (let pile of piles) {
        pile[pile.length - 1].revealed = true;
    }

    // Reveal all cards in the deck
    for (let card of deck) {
        card.revealed = true
    }
}

function setup() {
    // Setup score
    score = 0;
    moves = 0;

    // Make deck
    deck = shuffle(createDeck());
    setupPiles()

    // Put canvas in div#markdown
    let c = createCanvas(500, 500)
    document.getElementById("markdown").appendChild(c.elt)
}

function draw() {
    renderPiles();
    handleMouse();
    drawScores();
}

function drawScores() {
    fill("black")
    stroke("black")
    textSize(20)
    textAlign(LEFT)
    text(`Time: ${Math.floor(millis() / 1000)}`, (cardWidth + cardPaddingX) * 4, height - cardHeight + 15)
    text(`Score: ${score}`, (cardWidth + cardPaddingX) * 4, height - cardHeight + 35)
    text(`Moves: ${moves}`, (cardWidth + cardPaddingX) * 4, height - cardHeight + 55)
}

function handleMouse() {
    // Select card that cursor is on
    let mouseArea, pile, layer, card;
    if (mouseX > width - cardWidth) {
        // Deck area
        if (mouseY > cardHeight) {
            mouseArea = "deck";
            card = deckFlippedPile[deckFlippedPile.length - 1];
        }
    } else if (mouseY < height - cardHeight) {
        // Piles
        mouseArea = "piles";
        pile = constrain(Math.floor(mouseX / (cardWidth + cardPaddingX)), 0, piles.length - 1)
        layer = constrain(Math.floor(mouseY / cardPaddingY), 0, piles[pile].length - 1)
        card = piles[pile][layer]
    } else if (mouseY > height - cardHeight) {
        // Ace piles
        mouseArea = "acePiles";
        pile = constrain(Math.floor(mouseX / (cardWidth + cardPaddingX)), 0, acePiles.length - 1)
        card = acePiles[pile][acePiles[pile].length - 1]
    }

    // Handle picking up
    if (mouseIsPressed && !cursorCard) {
        if (card && card.revealed) {
            card.dragging = true
            cursorCard = card
            cursorCardPile = pile;
            cursorArea = mouseArea;
        }
    }

    // Handle dropping
    if (!mouseIsPressed && cursorCard) {
        let ccPile = piles[cursorCardPile]
        let ccAcePile = acePiles[cursorCardPile]
        if (mouseArea == "piles" && cursorArea == "piles") {
            if (doesCardFitOnPile(cursorCard, card)
                || (piles[pile].length == 0 && cursorCard.number == 13)) {
                let cards = popCard(cursorCardPile, cursorCard);
                piles[pile] = piles[pile].concat(cards)
                if (ccPile.length >= 1) {
                    ccPile[ccPile.length - 1].revealed = true
                }
                moves++;
                score += 10
            }
        } else if (mouseArea == "acePiles" && cursorArea == "piles") {
            if (doesCardFitOnAcePile(cursorCard, card)
                || (acePiles[pile].length == 0 && cursorCard.number == 1)) {
                // TODO: check if card pile only is 1 card
                acePiles[pile].push(cursorCard);
                ccPile.pop()
                if (ccPile.length >= 1) {
                    ccPile[ccPile.length - 1].revealed = true
                }
                moves++;
                score += 10
            }
        } else if (mouseArea == "piles" && cursorArea == "acePiles") {
            if (doesCardFitOnPile(cursorCard, card)) {
                piles[pile].push(cursorCard)
                ccAcePile.pop();
                moves++;
                score += 10
            }
        } else if (mouseArea == "acePiles" && cursorArea == "acePiles") {
            if (acePiles[pile].length == 0 && cursorCard.number == 1) {
                acePiles[pile].push(cursorCard);
                ccAcePile.pop()
                if (ccPile.length >= 1) {
                    ccPile[ccPile.length - 1].revealed = true
                }
                moves++;
                score += 10
            }
        } else if (mouseArea == "piles" && cursorArea == "deck") {
            if (doesCardFitOnPile(cursorCard, card)
                || (piles[pile].length == 0 && cursorCard.number == 13)) {
                piles[pile].push(cursorCard)
                deckFlippedPile.pop()
                moves++;
                score += 10
            }
        } else if (mouseArea == "acePiles" && cursorArea == "deck") {
            if (doesCardFitOnAcePile(cursorCard, card)
                || (acePiles[pile].length == 0 && cursorCard.number == 1)) {
                // TODO: check if card pile only is 1 card
                acePiles[pile].push(cursorCard);
                deckFlippedPile.pop()
                moves++;
                score += 10
            }
        }

        // Reset cursor state
        cursorCard.dragging = false
        cursorCard = null;
        cursorCardPile = null;
        cursorArea = null;
    }
}

function getSuit(card) {
    return {
        0: "D",
        1: "C",
        2: "H",
        3: "S"
    }[card.suit]
}

function drawCard(card, x, y) {
    if (card.revealed || keyIsDown(32) && card.number) {
        fill('azure')
        rect(x, y, cardWidth, cardHeight);

        fill('black')
        if (["D", "H"].includes(getSuit(card))) {
            fill("red")
        }
        textSize(16);
        textAlign(LEFT);
        text(enLang(card), x + 2, y + 15)
        textAlign(RIGHT);
        text(enLang(card), x + 48, y + 68)

        let suit = getSuit(card);
        noStroke()
        if (suit == "D") {
            fill("red")
            push();
            translate(x + 25, y + 20);
            rotate(PI / 4)
            rect(0, 0, 20, 20)
            pop();
        } else if (suit == "C") {
            fill("black")
            push()
            translate(x + 25, y + 20);
            rect(-3, 8, 6, 20)
            ellipse(0, 5, 15, 15);
            ellipse(-8, 15, 15, 15);
            ellipse(8, 15, 15, 15);
            pop();
        } else if (suit == "H") {
            fill("red")
            push();
            translate(x + 25, y + 25);
            ellipse(-8, 7, 20, 20);
            ellipse(8, 7, 20, 20);
            rotate(PI / 4)
            rect(1, 1, 20, 20)
            pop()
        } else if (suit == "S") {
            fill("black")
            push();
            translate(x + 25, y + 15);
            ellipse(-8, 20, 18, 18);
            ellipse(8, 20, 18, 18);
            rect(-3, 20, 6, 15)
            rotate(PI / 4)
            rect(0, 0, 20, 20)
            pop()
        }
        stroke("black")
    } else {
        fill('lightblue')
        rect(x, y, 50, 70);
    }
}

function doesCardFitOnPile(newCard, oldCard) {
    if (!oldCard) return false;
    // true: red, false: black
    let oldCol = [0, 2].includes(oldCard.suit)
    let newCol = [0, 2].includes(newCard.suit)

    if (oldCol == newCol) return false;
    return oldCard.number == newCard.number + 1
}

function popCard(pile, card) {
    let cards = []
    while (cards[cards.length - 1] != card) {
        cards.push(piles[pile].pop())
    }
    return reverse(cards)
}

function enLang(card) {
    return {
        1: "A",
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
        11: "J",
        12: "Q",
        13: "K"
    }[card.number];
}

function doesCardFitOnAcePile(newCard, oldCard) {
    if (!oldCard) return false;
    if (newCard.suit != oldCard.suit) return false;
    return newCard.number == oldCard.number + 1
}

function mousePressed() {
    if (mouseX > width - cardWidth && mouseY < cardHeight) {
        if (deck.length == 0) {
            deck = reverse(deckFlippedPile);
            deckFlippedPile = []
        } else {
            deckFlippedPile = deckFlippedPile.concat(reverse(deck.splice(-3, 3)));
        }
    }
}

document.addEventListener("keypress", e => e.preventDefault())

function renderPiles() {
    background("white")
    // Piles
    for (let i = 0; i < piles.length; i++) {
        fill('white')
        rect(i * (cardWidth + cardPaddingX), 0, cardWidth, cardHeight)
        for (let j = 0; j < piles[i].length; j++) {
            let card = piles[i][j]
            if (!card.dragging) {
                drawCard(card, i * (cardWidth + cardPaddingX), j * cardPaddingY);
            } else {
                drawCard(card, mouseX, mouseY);
            }
        }
    }

    // Ace Piles
    for (let i = 0; i < acePiles.length; i++) {
        fill('white')
        rect(i * (cardWidth + cardPaddingX), height - cardHeight, cardWidth, cardHeight)
        for (let j = 0; j < acePiles[i].length; j++) {
            let card = acePiles[i][j]
            if (!card.dragging) {
                drawCard(card, i * (cardWidth + cardPaddingX), height - cardHeight);
            } else {
                drawCard(card, mouseX, mouseY);
            }
        }
    }

    // Deck
    fill('white')
    rect(width - cardWidth, 0, cardWidth, cardHeight)
    if (deck.length > 0) {
        drawCard({ revealed: false }, width - cardWidth, 0)
    }

    // Revealed deck (flipped pile)
    fill('white')
    rect(width - cardWidth, cardHeight + cardPaddingY, cardWidth, cardHeight)
    for (let i = 0; i < 3; i++) {
        let card = deckFlippedPile[deckFlippedPile.length - 3 + i];
        if (!card) continue
        if (!card.dragging) {
            drawCard(card, width - cardWidth, cardHeight + cardPaddingY * (1 + i));
        } else {
            drawCard(card, mouseX, mouseY);
        }
    }
}