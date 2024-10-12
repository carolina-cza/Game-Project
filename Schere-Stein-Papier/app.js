new Vue({
    el: '#app',
    data: {
        page: 'start',
        playerChoice: '',
        computerChoice: '',
        result: ''
    },
    methods: {
        play(choice) {
            this.playerChoice = choice;
            const choices = ['Schere', 'Stein', 'Papier'];
            this.computerChoice = choices[Math.floor(Math.random() * choices.length)];
            this.result = this.determineWinner(this.playerChoice, this.computerChoice);
        },
        determineWinner(player, computer) {
            if (player === computer) {
                return 'Unentschieden';
            } else if (
                (player === 'Schere' && computer === 'Papier') ||
                (player === 'Stein' && computer === 'Schere') ||
                (player === 'Papier' && computer === 'Stein')
            ) {
                return 'Du gewinnst!';
            } else {
                return 'Computer gewinnt!';
            }
        }
    }
});
