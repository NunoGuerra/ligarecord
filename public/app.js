// Atualiza a lista de jogadores com base na equipe selecionada
document.getElementById('teamName').addEventListener('change', async function(event) {
    const teamName = event.target.value;

    try {
        const response = await fetch(`/playersByTeam/${teamName}`);
        const players = await response.json();
        const playerSelect = document.getElementById('playerName');
        playerSelect.innerHTML = '<option value="">Selecione um jogador</option>';

        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.name;
            option.textContent = player.name;
            playerSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar jogadores:', error);
    }
});

// Ao selecionar um jogador, mostra a seção de eventos e limpa os campos do formulário
document.getElementById('playerName').addEventListener('change', function() {
    document.getElementById('eventSection').style.display = 'block';
    document.getElementById('eventForm').reset(); // Reseta o formulário de eventos
    // Não limpar mais a lista de pontuações aqui
});

// Envia os dados de eventos para calcular os pontos
document.getElementById('eventForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const playerName = document.getElementById('playerName').value;
    const events = {
        goloMarcado: parseInt(document.getElementById('goloMarcado').value, 10),
        goloSofrido: parseInt(document.getElementById('goloSofrido').value, 10),
        penaltiDefendido: parseInt(document.getElementById('penaltiDefendido').value, 10),
        penaltiFalhado: parseInt(document.getElementById('penaltiFalhado').value, 10),
        penaltiConvertido: parseInt(document.getElementById('penaltiConvertido').value, 10),

        vitoria: document.getElementById('vitoria').value === 'Sim',
        cartaoVermelho: document.getElementById('cartaoVermelho').value,
        autogol: parseInt(document.getElementById('autogol').value, 10),
        jogadorDaSemana: document.getElementById('jogadorDaSemana').value === 'Sim',
        capitao: document.getElementById('capitao').value === 'Sim',
        pontuacaoRecord: parseInt(document.getElementById('pontuacaoRecord').value, 10)
    };

    try {
        const response = await fetch('/calculatePoints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerName, events })
        });

        const result = await response.json();
        if (response.ok) {
            updateScoreboard(); // Atualiza a lista de pontuações e total de pontos
        } else {
            alert('Erro ao calcular pontos: ' + result);
        }
    } catch (error) {
        console.error('Erro ao calcular pontos:', error);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const scoreboardList = document.getElementById('scoreboardList');
    const totalPointsElement = document.getElementById('totalPoints');
    
    // Função para atualizar o total de pontos
    function updateTotalPoints() {
        let totalPoints = 0;
        const rows = scoreboardList.querySelectorAll('tr');
        rows.forEach(row => {
            const points = parseInt(row.children[2].textContent, 10);
            if (!isNaN(points)) {
                totalPoints += points;
            }
        });
        totalPointsElement.textContent = totalPoints;
    }

    // Adiciona evento de clique para todos os botões de remover
    scoreboardList.addEventListener('click', function(event) {
        if (event.target.classList.contains('removePlayerButton')) {
            const row = event.target.closest('tr');
            if (row) {
                row.remove();
                updateTotalPoints();
            }
        }
    });
});


// Atualiza a lista de pontuações e exibe o total de pontos
async function updateScoreboard() {
    try {
        const response = await fetch('/selectedPlayers');
        const players = await response.json();
        const scoreboardList = document.getElementById('scoreboardList');
        const totalPointsElement = document.getElementById('totalPoints');
        let totalPoints = 0;

        players.forEach(player => {
            // Verifica se já existe uma linha para o jogador, se sim, atualiza-a
            let row = Array.from(scoreboardList.getElementsByTagName('tr'))
                .find(row => row.cells[0].textContent === player.name);
            
            if (row) {
                row.cells[2].textContent = player.points;
            } else {
                row = document.createElement('tr');
                row.innerHTML = `
                    <td>${player.name}</td>
                    <td>${player.team}</td>
                    <td>${player.points}</td>
                `;
                scoreboardList.appendChild(row);
            }

            // Acumula os pontos do jogador no total
            totalPoints += player.points;
        });

        // Atualiza o valor total de pontos na página
        totalPointsElement.textContent = totalPoints;
    } catch (error) {
        console.error('Erro ao atualizar pontuações:', error);
    }
}
