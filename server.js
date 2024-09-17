const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta 'public'

// Base de dados em memória com posições atualizadas
let players = [
    { team: 'Benfica', name: 'Rafa Silva', position: 'Avançado', points: 0 },
    { team: 'Benfica', name: 'Jan Vertonghen', position: 'Defesa', points: 0 },
    { team: 'Porto', name: 'Pepe', position: 'Defesa', points: 0 },
    { team: 'Porto', name: 'Taremi', position: 'Avançado', points: 0 },
    { team: 'Sporting', name: 'Pote', position: 'Meio-Campo', points: 0 },
    { team: 'Sporting', name: 'Coates', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'João Valido', position: 'Guarda Redes', points: 0 },
    { team: 'Arouca', name: 'Nico Mantl', position: 'Guarda Redes', points: 0 },
    { team: 'Arouca', name: 'Thiago Silva', position: 'Guarda Redes', points: 0 },
    { team: 'Arouca', name: 'José Fontán', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'Tiago Esgaio', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'Chico Lamba', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'Weverson Costa', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'Alex Pinto', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'Matías Rocha', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'Nino Galovic', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'Mateus Quaresma', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'Amadou Danté', position: 'Defesa', points: 0 },
    { team: 'Arouca', name: 'Eboué Kouassi', position: 'Meio-Campo', points: 0} 
];
let selectedPlayers = [];

// Rota para obter a lista de jogadores
app.get('/players', (req, res) => {
    res.json(players);
});

// Rota para obter jogadores por equipe
app.get('/playersByTeam/:team', (req, res) => {
    const { team } = req.params;
    const teamPlayers = players.filter(p => p.team === team);
    res.json(teamPlayers);
});

// Rota para calcular pontos
app.post('/calculatePoints', (req, res) => {
    const { playerName, events } = req.body;
    const player = players.find(p => p.name === playerName);
    if (!player) {
        return res.status(404).send('Jogador não encontrado');
    }

    let points = 0;

    // Pontuação Record
    const recordPoints = events.pontuacaoRecord === 5 ? 7 : events.pontuacaoRecord;

    // Reiniciar a pontuação do jogador
    player.points = 0;

    // Processa todos os eventos
    points += events.goloMarcado * (player.position === 'Avançado' ? 2 :
                player.position === 'Meio-Campo' ? 3 :
                player.position === 'Defesa' ? 4 : 20);
    points -= events.goloSofrido * (player.position === 'Guarda-Redes' ? 2 : 1);
    if (player.position === 'Guarda-Redes') points += events.penaltiDefendido * 2;
    if (player.position !== 'Guarda-Redes') points -= events.penaltiFalhado * 2;
    if (player.position !== 'Guarda-Redes') points += events.penaltiConvertido * 2;
    if (events.cleanSheet) {
        if (player.position === 'Guarda-Redes') points += 2;
        else if (player.position === 'Defesa') points += 1;
    }
    if (events.vitoria) points += 1;
    if (events.goloMarcado >= 3) points += 5; // Hat-Trick
    points -= (events.cartaoVermelho === 'Direto' ? 3 : events.cartaoVermelho === 'Acumulação' ? 1 : 0);
    points -= events.autogol * 2;
    if (events.jogadorDaSemana) points += 5;

    points += recordPoints; // Adiciona a Pontuação Record

    // **Lógica para dobrar pontos se o jogador for o capitão**
    if (events.capitao === true) {
        points *= 2;
    }

    // Atualiza os pontos do jogador
    player.points = points;  // <-- Aqui garantimos que a pontuação seja reiniciada e não acumulada

    // Adiciona o jogador à lista de jogadores selecionados (se ainda não estiver presente)
    const existingPlayer = selectedPlayers.find(p => p.name === player.name);
    if (!existingPlayer) {
        selectedPlayers.push(player);
    } else {
        existingPlayer.points = player.points; // Atualiza os pontos do jogador na lista de selecionados
    }

    res.json({ player });
});

// Rota para obter os jogadores selecionados
app.get('/selectedPlayers', (req, res) => {
    res.json(selectedPlayers);
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
