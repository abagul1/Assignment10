class Card {
  constructor(value, suit) {
    if(value.value) { // allow for copy constructor
      suit = value.suit;
      value = value.value;
    }
    if(value == 'J' || value == 11) {
      this.value = 11;
      this.disp = 'J';
    } else if(value == 'Q' || value == 12) {
      this.value = 12;
      this.disp = 'Q';
    } else if(value == 'K' || value == 13) {
      this.value = 13;
      this.disp = 'K';
    } else if(value == 'A' || value == 1) {
      this.value = 1;
      this.disp = 'A';
    } else {
      this.value = this.disp = value;
    }
    this.suit = suit;
    if(suit == "spades" || suit == "&spades;" || suit == '♠') {
      this.suit = '&spades;';
    } else if(suit == "clubs" || suit == "&clubs;" || suit == '♣') {
      this.suit = '&clubs;';
    } else if(suit == "diamonds" || suit == "&diams;" || suit == '♦') {
      this.suit = '&diams;';
    } else if(suit == "hearts" || suit == "&hearts;" || suit == '♥') {
      this.suit = '&hearts;';
    } else {
      throw "Invalid suit: " + suit;
    }
    this.isBlk = false;
    if(this.suit == '&spades;' || this.suit == '&clubs;') {
      this.isBlk = true;
    }
  }
  getValue() {
    return this.value;
  }
  getSuit() {
    return this.suit;
  }
  isBlack() {
    return this.isBlk;
  }
  toString() {
    return '<span style="color:' + (this.isBlk ? "black" : "red") + '">'
            + this.disp + this.suit + "</span>";
  }
}
