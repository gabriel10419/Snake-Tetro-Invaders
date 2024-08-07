const canvas = document.getElementById("canvasJogo");
        const ctx = canvas.getContext("2d");
        const displayTimer = document.getElementById("timer");
        const displayTempoJogo = document.getElementById("tempoJogo");
        const displayModo = document.getElementById("modo");
        const telaVitoria = document.getElementById("telaVitoria");
        const telaGameover = document.getElementById("telaGameover");
        const displayMaiorPontuacao = document.getElementById("maiorPontuacao");
        const tamanhoGrid = 20;
        const qtdTilesX = canvas.width / tamanhoGrid;
        const qtdTilesY = canvas.height / tamanhoGrid;
        let cobra, direcao, comida, fimDeJogo, modoEstático, timer, tempoJogo, intervaloPrincipal, intervaloTetris, intervaloBalas, intervaloCobra, intervaloTiroAlien, intervaloTempoJogo;
        let gridTetris = Array.from({ length: qtdTilesY }, () => Array(qtdTilesX).fill(null));
        let peçaTetris = [];
        let naves = [];
        let balaAtual = null;
        let balasJogador = [];
        const velocidadeJogo = 1000; // Intervalo de tempo global em milissegundos
        let velocidadeTetris = velocidadeJogo / 4; // Velocidade de queda da peça de Tetris
        let quedaRapidaTetris = false;
        let maiorPontuacao = Number.MAX_SAFE_INTEGER;

        function inicializarJogo() {
            cobra = [{ x: qtdTilesX / 2, y: qtdTilesY / 2 }];
            direcao = { x: 0, y: 0 };
            colocarComida();
            modoEstático = false;
            fimDeJogo = false;
            timer = 5;
            tempoJogo = 0;
            naves = gerarNaves();
            balaAtual = null;
            balasJogador = [];
            gridTetris = Array.from({ length: qtdTilesY }, () => Array(qtdTilesX).fill(null));
            limparIntervalos();
            displayModo.textContent = "Cobra";
            displayTimer.textContent = timer;
            displayTempoJogo.textContent = tempoJogo;
            telaVitoria.style.display = "none";
            telaGameover.style.display = "none";
            intervaloPrincipal = setInterval(atualizarTimer, velocidadeJogo);
            intervaloCobra = setInterval(moverCobra, velocidadeJogo / 10);
            intervaloBalas = setInterval(moverBalas, velocidadeJogo / 10);
            intervaloTiroAlien = setInterval(atirarBalasAliens, velocidadeJogo);
            intervaloTempoJogo = setInterval(atualizarTempoJogo, velocidadeJogo);
        }

        function colocarComida() {
            do {
                comida = { x: Math.floor(Math.random() * qtdTilesX), y: Math.floor(Math.random() * qtdTilesY) };
            } while (estaOcupado(comida.x, comida.y));
        }

        function estaOcupado(x, y) {
            return cobra.some(segmento => segmento.x === x && segmento.y === y) ||
                   gridTetris[y][x] !== null ||
                   naves.some(nave => nave.x === x && nave.y === y);
        }

        function atualizarTempoJogo() {
            tempoJogo++;
            displayTempoJogo.textContent = tempoJogo;
        }

        function gerarNaves() {
            const novasNaves = [];
            for (let x = 0; x < qtdTilesX; x++) {
                novasNaves.push({ x: x, y: 0 });
            }
            return novasNaves;
        }

        function atualizarTimer() {
            if (modoEstático) return;
            timer--;
            displayTimer.textContent = timer;
            if (timer <= 0) {
                mudarParaTetris();
            }
        }

        function limparIntervalos() {
            clearInterval(intervaloPrincipal);
            clearInterval(intervaloTetris);
            clearInterval(intervaloBalas);
            clearInterval(intervaloCobra);
            clearInterval(intervaloTiroAlien);
            clearInterval(intervaloTempoJogo);
        }

        function mudarParaTetris() {
            console.log("Mudando para o modo Tetris");
            modoEstático = true;
            displayModo.textContent = "Tetris";
            clearInterval(intervaloCobra);
            clearInterval(intervaloPrincipal);
            prepararPeçaTetris();
            intervaloTetris = setInterval(quedaEstaticaCobra, velocidadeTetris);
        }

        function prepararPeçaTetris() {
    // Garantir que a peça Tetris seja criada corretamente
    if (cobra.length > 0) {
        peçaTetris = [...cobra];
    } else {
        peçaTetris = [
            { x: Math.floor(qtdTilesX / 2), y: 0 },
            { x: Math.floor(qtdTilesX / 2), y: 1 }
        ];
    }

    const minY = Math.min(...peçaTetris.map(segmento => segmento.y));
    peçaTetris = peçaTetris.map(segmento => ({ x: segmento.x, y: segmento.y - minY }));
    cobra = [];
    comida = null;

    // Limpar blocos temporários antes de começar
    gridTetris = Array.from({ length: qtdTilesY }, () => Array(qtdTilesX).fill(null));
}


        document.addEventListener("keydown", manipularTecla);
        function manipularTecla(evento) {
            if (modoEstático) {
                manipularTeclasModoEstatico(evento);
            } else {
                manipularTeclasModoCobra(evento);
            }
        }

        function manipularTeclasModoEstatico(evento) {
            switch (evento.key) {
                case "a":
                case "ArrowLeft":
                    if (podeMoverParaEsquerda()) {
                        peçaTetris = peçaTetris.map(segmento => ({ x: segmento.x - 1, y: segmento.y }));
                    }
                    break;
                case 'd':
                case "ArrowRight":
                    if (podeMoverParaDireita()) {
                        peçaTetris = peçaTetris.map(segmento => ({ x: segmento.x + 1, y: segmento.y }));
                    }
                    break;
                case 's':
                case "ArrowDown":
                    quedaRapidaTetris = true;
                    quedaEstaticaCobra();
                    break;
                case 'w':
                case "ArrowUp":
                    quedaRapidaTetris = false;
                    break;
            }
        }

        function manipularTeclasModoCobra(evento) {
            switch (evento.key) {
                case 'w':
                case "ArrowUp":
                    if (direcao.y === 0) direcao = { x: 0, y: -1 };
                    break;
                case 's':
                case "ArrowDown":
                    if (direcao.y === 0) direcao = { x: 0, y: 1 };
                    break;
                case 'a':
                case "ArrowLeft":
                    if (direcao.x === 0) direcao = { x: -1, y: 0 };
                    break;
                case 'd':
                case "ArrowRight":
                    if (direcao.x === 0) direcao = { x: 1, y: 0 };
                    break;
            }
        }

        function podeMoverParaEsquerda() {
            return peçaTetris.every(segmento => segmento.x > 0 && !gridTetris[segmento.y][segmento.x - 1]);
        }

        function podeMoverParaDireita() {
            return peçaTetris.every(segmento => segmento.x < qtdTilesX - 1 && !gridTetris[segmento.y][segmento.x + 1]);
        }

        function iniciarJogo() {
            inicializarJogo();
            loopJogo();
        }

        function reiniciarJogo() {
            limparIntervalos();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            inicializarJogo();
        }

        function loopJogo() {
            if (fimDeJogo) {
                exibirFimDeJogo();
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            desenharGridTetris();
            if (!modoEstático) {
                desenharComida();
                desenharCobra();
            }
            desenharNaves();
            desenharBalas();
            desenharGrid();
            verificarColisoesBalas();
            if (naves.length === 0) {
                exibirTelaVitoria();
            }
        }

        function exibirFimDeJogo() {
            telaGameover.style.display = "flex";
            limparIntervalos();
        }

        function exibirTelaVitoria() {
            limparIntervalos();
            if (tempoJogo < maiorPontuacao) {
                maiorPontuacao = tempoJogo;
                displayMaiorPontuacao.textContent = maiorPontuacao;
            }
            telaVitoria.style.display = "flex";
        }

        function desenharGrid() {
            ctx.strokeStyle = "#333";
            for (let i = 0; i < qtdTilesX; i++) {
                ctx.beginPath();
                ctx.moveTo(i * tamanhoGrid, 0);
                ctx.lineTo(i * tamanhoGrid, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < qtdTilesY; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * tamanhoGrid);
                ctx.lineTo(canvas.width, i * tamanhoGrid);
                ctx.stroke();
            }
        }

        function moverCobra() {
            const cabeca = { x: cobra[0].x + direcao.x, y: cobra[0].y + direcao.y };
            cobra.unshift(cabeca);
            if (cabeca.x === comida.x && cabeca.y === comida.y) {
                colocarComida();
            } else {
                cobra.pop();
            }
            verificarColisao();
            loopJogo(); // Garante que o jogo seja desenhado após o movimento da cobra
        }

        function verificarColisao() {
            const cabeca = cobra[0];
            for (let i = 1; i < cobra.length; i++) {
                if (cabeca.x === cobra[i].x && cabeca.y === cobra[i].y) {
                    // Resetar posição da cobra sem reiniciar o jogo
                    cobra = [{ x: qtdTilesX / 2, y: qtdTilesY / 2 }];
                    direcao = { x: 0, y: 0 };
                    colocarComida();
                }
            }
            if (cabeca.x < 0 || cabeca.x >= qtdTilesX || cabeca.y < 0 || cabeca.y >= qtdTilesY) {
                // Resetar posição da cobra sem reiniciar o jogo
                cobra = [{ x: qtdTilesX / 2, y: qtdTilesY / 2 }];
                direcao = { x: 0, y: 0 };
                colocarComida();
            }
        }

        function desenharCobra() {
            if (!modoEstático) {
                ctx.fillStyle = "lime";
                cobra.forEach(segmento => {
                    ctx.fillRect(segmento.x * tamanhoGrid, segmento.y * tamanhoGrid, tamanhoGrid, tamanhoGrid);
                });
            }
        }

        function desenharComida() {
            if (!modoEstático) {
                ctx.fillStyle = "red";
                ctx.fillRect(comida.x * tamanhoGrid, comida.y * tamanhoGrid, tamanhoGrid, tamanhoGrid);
            }
        }

        function quedaEstaticaCobra() {
    if (!modoEstático) return;

    let podeCair = true;
    for (let i = 0; i < peçaTetris.length; i++) {
        const segmento = peçaTetris[i];
        if (segmento.y + 1 >= qtdTilesY || gridTetris[segmento.y + 1][segmento.x]) {
            podeCair = false;
            break;
        }
    }

    if (podeCair) {
        // A peça Tetris ainda pode cair
        peçaTetris = peçaTetris.map(segmento => ({ x: segmento.x, y: segmento.y + 1 }));
    } else {
        // Transformar a peça atual em blocos sólidos
        peçaTetris.forEach(segmento => {
            if (segmento.y === 0) {
                fimDeJogo = true;
            }
            gridTetris[segmento.y][segmento.x] = "solid";
        });

        if (fimDeJogo) {
            exibirFimDeJogo();
            return;
        }

        // Verificar e remover linhas completas
        const linhasCompletas = verificarLinhasCompletas();

        if (linhasCompletas.length > 0) {
            console.log("Linhas completas: ", linhasCompletas);
            linhasCompletas.forEach(() => {
                atirarBalaJogador();
            });
        }

        // Preparar a próxima peça Tetris
        prepararPeçaTetris();  // Cria uma nova peça Tetris

        // Resetar para o modo Cobra se necessário
        resetarParaModoCobra();
    }

    desenharJogo();
}




        function desenharGridTetris() {
            ctx.fillStyle = "blue";
            for (let y = 0; y < qtdTilesY; y++) {
                for (let x = 0; x < qtdTilesX; x++) {
                    if (gridTetris[y][x] === "solid") {
                        ctx.fillRect(x * tamanhoGrid, y * tamanhoGrid, tamanhoGrid, tamanhoGrid);
                    } else if (modoEstático) {
                        ctx.clearRect(x * tamanhoGrid, y * tamanhoGrid, tamanhoGrid, tamanhoGrid);
                    }
                }
            }
            peçaTetris.forEach(segmento => {
                ctx.fillRect(segmento.x * tamanhoGrid, segmento.y * tamanhoGrid, tamanhoGrid, tamanhoGrid);
            });
        }

        function verificarLinhasCompletas() {
    const linhasCompletas = [];
    for (let y = 0; y < qtdTilesY; y++) {
        if (gridTetris[y].every(celula => celula === "solid")) {
            linhasCompletas.push(y);
        }
    }
    if (linhasCompletas.length > 0) {
        console.log("Linhas completas: ", linhasCompletas);
    }
    linhasCompletas.forEach(linha => {
        gridTetris.splice(linha, 1);
        gridTetris.unshift(Array(qtdTilesX).fill(null));
    });
    return linhasCompletas;
}



        function desenharNaves() {
            ctx.fillStyle = "white";
            naves.forEach(nave => {
                ctx.fillRect(nave.x * tamanhoGrid, nave.y * tamanhoGrid, tamanhoGrid * 2, tamanhoGrid);
            });
        }

        function moverBalas() {
            if (balaAtual) {
                balaAtual.y++;
                if (verificarColisaoBala(balaAtual)) {
                    balaAtual = null;
                } else if (balaAtual.y >= qtdTilesY) {
                    balaAtual = null;
                }
            }
            balasJogador = balasJogador.filter(bala => {
                bala.y--;
                if (bala.y < 0) {
                    return false;
                }
                if (verificarColisaoBala(bala)) {
                    return false;
                }
                return true;
            });
            desenharBalas();
        }

        function verificarColisaoBala(bala) {
    if (bala.y >= 0 && bala.y < qtdTilesY && bala.x >= 0 && bala.x < qtdTilesX) {
        if (gridTetris[bala.y][bala.x] === "solid" || gridTetris[bala.y][bala.x] === "white") {
            gridTetris[bala.y][bala.x] = null;  // Certifique-se de que o bloco seja removido
            return true;
        }
        // Verificar colisão com naves
        for (let i = 0; i < naves.length; i++) {
            const nave = naves[i];
            if (bala.x >= nave.x && bala.x < nave.x + 2 && bala.y === nave.y) {
                naves.splice(i, 1);
                return true;
            }
        }
    }
    return false;
}


        function desenharBalas() {
            ctx.fillStyle = "yellow";
            if (balaAtual) {
                ctx.fillRect(balaAtual.x * tamanhoGrid, balaAtual.y * tamanhoGrid, tamanhoGrid, tamanhoGrid);
            }
            ctx.fillStyle = "orange";
            balasJogador.forEach(bala => {
                ctx.fillRect(bala.x * tamanhoGrid, bala.y * tamanhoGrid, tamanhoGrid, tamanhoGrid);
            });
        }

        function verificarColisoesBalas() {
            if (balaAtual && gridTetris[Math.floor(balaAtual.y)] && gridTetris[Math.floor(balaAtual.y)][Math.floor(balaAtual.x)]) {
                gridTetris[Math.floor(balaAtual.y)][Math.floor(balaAtual.x)] = null;
                balaAtual = null;
            }
        }

        function atirarBalasAliens() {
            console.log("Atirando bala alienígena");
            if (!balaAtual) {
                const nave = naves[Math.floor(Math.random() * naves.length)];
                balaAtual = { x: nave.x, y: nave.y + 1 };
            }
        }

        function atirarBalaJogador(x = null) {
            console.log("Estado de peçaTetris antes de atirar: ", peçaTetris);

    console.log("Atirando bala do jogador");
    if (x === null) {
        if (peçaTetris.length > 0) {  // Adicionado: Verifica se peçaTetris não está vazio
            x = peçaTetris[peçaTetris.length - 1].x;
        } else {
            console.error("Erro: peçaTetris está vazia ou indefinida.");
            return;  // Sai da função se não há segmento para disparar
        }
    }
    balasJogador.push({ x: x, y: qtdTilesY - 1 });
}


        function atirarBalasJogadorDeTodasColunas() {
            console.log("Atirando balas do jogador de todas as colunas");
            for (let x = 0; x < qtdTilesX; x++) {
                atirarBalaJogador(x);
            }
        }

        function desenharJogo() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            desenharGridTetris();
            if (!modoEstático) {
                desenharComida();
                desenharCobra();
            }
            desenharNaves();
            desenharBalas();
            desenharGrid();
        }

        function resetarParaModoCobra() {
    // Limpar peça Tetris e o grid
    peçaTetris = [];
    cobra = [{ x: qtdTilesX / 2, y: qtdTilesY / 2 }];
    direcao = { x: 0, y: 0 };
    colocarComida();
    modoEstático = false;
    timer = 5;
    displayModo.textContent = "Cobra";
    displayTimer.textContent = timer;
    
    // Certifique-se de limpar qualquer bloco remanescente
    for (let y = 0; y < qtdTilesY; y++) {
        for (let x = 0; x < qtdTilesX; x++) {
            if (gridTetris[y][x] === "white") {
                gridTetris[y][x] = null;
            }
        }
    }

    clearInterval(intervaloTetris);
    intervaloPrincipal = setInterval(atualizarTimer, velocidadeJogo);
    intervaloCobra = setInterval(moverCobra, velocidadeJogo / 10);
}


        iniciarJogo();