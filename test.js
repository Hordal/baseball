// 게임 상태 변수
let gameState = {
    players: [],
    currentPlayerIndex: 0,
    isGameOver: false,
};

// 현재 타자의 시도 관련 변수
let currentAnswer = [];
let tries = [];

// ========================================
// 게임 설정 및 시작
// ========================================
UI.start1PBtn.addEventListener('click', () => {
    setupGame(1);
});

UI.playAgainBtn.addEventListener('click', () => {
    restartGame();
});

UI.start2PBtn.addEventListener('click', () => {
    UI.showScreen('player-setup');
});

UI.startGameBtn.addEventListener('click', () => {
    const p1Name = UI.player1NameInput.value || 'Player 1';
    const p2Name = UI.player2NameInput.value || 'Player 2';
    setupGame(2, [p1Name, p2Name]);
});

// 이름 입력 후 Enter 키로 게임 시작
[UI.player1NameInput, UI.player2NameInput].forEach(input => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') UI.startGameBtn.click();
    });
});

function setupGame(playerCount, names = ['Player 1']) {
    gameState.players = names.map((name, index) => ({
        name,
        score: 0,
        outs: 0,
        inning: index === 0 ? '초' : '말',
    }));

    if (playerCount === 2) {
        // 순서 랜덤 섞기
        if (Math.random() < 0.5) {
            [gameState.players[0], gameState.players[1]] = [gameState.players[1], gameState.players[0]];
            gameState.players[0].inning = '초';
            gameState.players[1].inning = '말';
        }
    }

    UI.showScreen('board');

    startTurn();
}

// ========================================
// 턴 관리
// ========================================
function startTurn() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.outs >= 3) {
        nextPlayer();
        return;
    }
    
    // 새로운 정답 숫자 생성
    const answerSet = new Set();
    while (answerSet.size < 4) {
        answerSet.add(String(Math.floor(Math.random() * 10)));
    }
    currentAnswer = Array.from(answerSet);
    console.log(`정답 (${currentPlayer.name}): ${currentAnswer.join('')}`);

    // 상태 초기화
    tries = [];
    gameState.bases = [0, 0, 0]; // 1루, 2루, 3루
    UI.updateScoreboard(gameState);
    UI.addLog(`--- ${currentPlayer.name}의 9회${currentPlayer.inning} 공격 ---`);
}

function nextPlayer() {
    gameState.currentPlayerIndex++;
    if (gameState.currentPlayerIndex >= gameState.players.length) {
        endGame();
    } else {
        startTurn();
    }
}

// ========================================
// 게임 로직 (폼 제출)
// ========================================
UI.form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (gameState.isGameOver) return;

    const value = UI.input.value;
    UI.input.value = '';
    UI.input.focus();

    // 입력값 검증
    if (value.length !== 4 || new Set(value).size !== 4) {
        alert('중복되지 않는 4자리 숫자를 입력하세요.');
        return;
    }
    if (tries.includes(value)) {
        alert('이미 시도한 숫자입니다.');
        return;
    }

    tries.push(value);
    const { strike, ball } = checkStrikeBall(value);

    // 정답을 맞췄을 경우
    if (strike === 4) {
        const attemptCount = tries.length;
        let hitType;
        if (attemptCount === 1) hitType = 4; // 홈런
        else if (attemptCount <= 3) hitType = 3; // 3루타
        else if (attemptCount <= 5) hitType = 2; // 2루타
        else if (attemptCount <= 8) hitType = 1; // 1루타
        else { // 8번 초과 (9번째 시도부터)
            UI.addLog(`${value} -> 8번 안에 맞추지 못해 아웃!`);
            addOut(); // 아웃 처리 후
            startNewBatter();
            return;
        }
        
        const hitText = {1:'1루타', 2:'2루타', 3:'3루타', 4:'홈런'}[hitType];
        UI.addLog(`${value} -> 정답! ${attemptCount}번 만에 ${hitText}!`);
        advanceRunners(hitType);
        startNewBatter();

    } else { // 못 맞췄을 경우
        UI.addLog(`${value}: ${strike}S ${ball}B (시도: ${tries.length}/8)`);
        if (tries.length >= 8) {
            addOut();
            UI.addLog(`8번 안에 맞추지 못해 아웃!`);
            startNewBatter();
        }
    }
});

function checkStrikeBall(value) {
    let strike = 0, ball = 0;
    for (let i = 0; i < 4; i++) {
        if (value[i] === currentAnswer[i]) {
            strike++;
        } else if (currentAnswer.includes(value[i])) {
            ball++;
        }
    }
    return { strike, ball };
}

function startNewBatter() {
    // 다음 타자를 위해 정답과 시도 횟수 초기화
    const answerSet = new Set();
    while (answerSet.size < 4) {
        answerSet.add(String(Math.floor(Math.random() * 10)));
    }
    currentAnswer = Array.from(answerSet);
    console.log(`정답 (${gameState.players[gameState.currentPlayerIndex].name}): ${currentAnswer.join('')}`);
    tries = [];
    UI.updateScoreboard(gameState);
}

// ========================================
// 야구 규칙 관련 함수
// ========================================
function addOut() {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    currentPlayer.outs++;
    if (currentPlayer.outs >= 3) {
        UI.addLog(`--- 3아웃! 공수교대 ---`);
        nextPlayer();
    }
}

function advanceRunners(hitType) {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    let newScore = 0;
    
    // 기존 주자 진루
    const newBases = [0, 0, 0];
    for (let i = 2; i >= 0; i--) { // 3루부터 확인
        if (gameState.bases[i] === 1) {
            const newBase = i + hitType;
            if (newBase >= 3) { // 홈인
                newScore++;
            } else {
                newBases[newBase] = 1;
            }
        }
    }

    // 타자 주자 진루
    if (hitType >= 4) { // 홈런
        newScore++;
    } else {
        newBases[hitType - 1] = 1;
    }
    
    gameState.bases = newBases;
    currentPlayer.score += newScore;
    if (newScore > 0) {
        UI.addLog(`${newScore}점 득점!`);
    }
}

// ========================================
// UI 업데이트 및 게임 종료
// ========================================
function endGame() {
    gameState.isGameOver = true;
    UI.showScreen('over');
    let resultMessage;
    const p1 = gameState.players[0];
    const p2 = gameState.players[1];

    if (!p2) { // 1인용 게임
        resultMessage = `게임 종료! 최종 점수: ${p1.score}점`;
    } else { // 2인용 게임
        if (p1.score > p2.score) resultMessage = `${p1.name} 승리!`;
        else if (p2.score > p1.score) resultMessage = `${p2.name} 승리!`;
        else resultMessage = '무승부!';
    }
    UI.showGameResult(resultMessage);
}

function restartGame() {
    // 게임 상태 초기화
    gameState = {
        players: [],
        currentPlayerIndex: 0,
        isGameOver: false,
    };
    currentAnswer = [];
    tries = [];

    // UI 리셋
    UI.reset();
}