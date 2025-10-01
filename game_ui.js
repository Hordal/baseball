// UI 객체: 모든 DOM 요소와 UI 조작 메서드를 관리
const UI = {
    // DOM 요소 선택
    gameSetupDiv: document.querySelector('#game-setup'),
    gameBoardDiv: document.querySelector('#game-board'),
    gameOverDiv: document.querySelector('#game-over'),
    playerSetupDiv: document.querySelector('#player-setup'),
    start1PBtn: document.querySelector('#start-1p'),
    start2PBtn: document.querySelector('#start-2p'),
    player1NameInput: document.querySelector('#player1-name'), // ID가 고유하므로 그대로 사용
    player2NameInput: document.querySelector('#player2-name'), // ID가 고유하므로 그대로 사용
    startGameBtn: document.querySelector('#start-game'), // ID가 고유하므로 그대로 사용
    gameResultH2: document.querySelector('#game-result'),
    playAgainBtn: document.querySelector('#play-again'),
    scoreboardDiv: document.querySelector('#scoreboard'),
    input: document.querySelector('#input'),
    form: document.querySelector('#form'),
    logs: document.querySelector('#logs'),

    // 화면 전환 메서드
    showScreen(screenName) {
        this.gameSetupDiv.classList.add('hidden');
        this.gameBoardDiv.classList.add('hidden');
        this.gameOverDiv.classList.add('hidden');
        this.playerSetupDiv.classList.add('hidden');

        if (screenName === 'setup') {
            this.gameSetupDiv.classList.remove('hidden');
        } else if (screenName === 'board') {
            this.gameBoardDiv.classList.remove('hidden');
        } else if (screenName === 'over') {
            this.gameOverDiv.classList.remove('hidden');
        } else if (screenName === 'player-setup') {
            this.playerSetupDiv.classList.remove('hidden');
        }
    },

    // 스코어보드 업데이트
    updateScoreboard(gameState) {
        const p1 = gameState.players[0];
        const p2 = gameState.players[1];
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];

        let scoreHtml = `<div class="score-info">
                            <span>${p1.name}: ${p1.score}</span>`;
        if (p2) {
            scoreHtml += `<span>${p2.name}: ${p2.score}</span>`;
        }
        scoreHtml += `</div>`;

        const inningHtml = `<div class="inning-info">
                                9회 ${currentPlayer.inning} | ${currentPlayer.name} 공격
                            </div>`;

        const bases = gameState.bases || [0, 0, 0];
        const outs = currentPlayer.outs || 0;
        const statusHtml = `
            <div class="game-status">
                <div class="outs-container">
                    <span>OUT</span>
                    <div class="out-light ${outs > 0 ? 'on' : ''}"></div>
                    <div class="out-light ${outs > 1 ? 'on' : ''}"></div>
                </div>
                <div class="bases-container">
                    <div id="base-2" class="base ${bases[1] ? 'on' : ''}"></div>
                    <div id="base-3" class="base ${bases[2] ? 'on' : ''}"></div>
                    <div id="base-1" class="base ${bases[0] ? 'on' : ''}"></div>
                </div>
            </div>`;

        this.scoreboardDiv.innerHTML = scoreHtml + inningHtml + statusHtml;
    },

    // 로그 추가
    addLog(message) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        this.logs.prepend(entry); // 최신 기록이 위로 오도록 prepend 사용
    },

    // 게임 종료 결과 표시
    showGameResult(resultMessage) {
        this.gameResultH2.textContent = resultMessage;
    },

    // UI 초기화 (다시하기)
    reset() {
        this.player1NameInput.value = '';
        this.player2NameInput.value = '';
        this.logs.innerHTML = '';
        this.form.classList.remove('hidden');
        this.showScreen('setup');
    }
};