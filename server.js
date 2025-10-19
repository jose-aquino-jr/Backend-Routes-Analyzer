const express = require('express');
const cors = require('cors');
const RealTimeOpportunityHunter = require('./data/IA');
const AviationDataCollector = require('./data/DataCollectorIA');

const app = express();
app.use(cors());
app.use(express.static('public'));

const ia = new RealTimeOpportunityHunter();
const dataCollector = new AviationDataCollector();

dataCollector.startAutomaticCollection(240);

// CORREÇÃO: Lista de mercados com TODOS os campos necessários
const mercados = [
    { destino: "JFK", pais: "EUA", continente: "América", trend: "crescendo", distancia: 7685 },
    { destino: "MIA", pais: "EUA", continente: "América", trend: "normal", distancia: 6852 },
    { destino: "LAX", pais: "EUA", continente: "América", trend: "crescendo", distancia: 10085 },
    { destino: "MCO", pais: "EUA", continente: "América", trend: "crescendo", distancia: 6523 },
    { destino: "FLL", pais: "EUA", continente: "América", trend: "explodindo", distancia: 6721 },
    { destino: "YYZ", pais: "Canadá", continente: "América", trend: "normal", distancia: 8365 },
    { destino: "LIS", pais: "Portugal", continente: "Europa", trend: "explodindo", distancia: 7489 },
    { destino: "MAD", pais: "Espanha", continente: "Europa", trend: "crescendo", distancia: 8023 },
    { destino: "CDG", pais: "França", continente: "Europa", trend: "crescendo", distancia: 9176 },
    { destino: "FCO", pais: "Itália", continente: "Europa", trend: "normal", distancia: 9395 },
    { destino: "LHR", pais: "Reino Unido", continente: "Europa", trend: "crescendo", distancia: 9560 },
    { destino: "AMS", pais: "Holanda", continente: "Europa", trend: "crescendo", distancia: 9785 },
    { destino: "FRA", pais: "Alemanha", continente: "Europa", trend: "normal", distancia: 9845 },
    { destino: "EZE", pais: "Argentina", continente: "América", trend: "normal", distancia: 1690 },
    { destino: "SCL", pais: "Chile", continente: "América", trend: "crescendo", distancia: 2580 },
    { destino: "BOG", pais: "Colômbia", continente: "América", trend: "explodindo", distancia: 4445 },
    { destino: "LIM", pais: "Peru", continente: "América", trend: "normal", distancia: 3465 },
    { destino: "CCS", pais: "Venezuela", continente: "América", trend: "normal", distancia: 4635 },
    { destino: "DXB", pais: "Emirados Árabes", continente: "Ásia", trend: "explodindo", distancia: 12150 },
    { destino: "TLV", pais: "Israel", continente: "Ásia", trend: "crescendo", distancia: 11120 },
    { destino: "NRT", pais: "Japão", continente: "Ásia", trend: "crescendo", distancia: 18560 },
    { destino: "JNB", pais: "África do Sul", continente: "África", trend: "crescendo", distancia: 7925 }
];

// Rotas da API - VERSÃO CORRIGIDA
app.get('/api/rotas', async (req, res) => {
    const { pais, continente, minScore } = req.query;

    try {
        console.log('🔄 Iniciando análise de rotas...');
        
        // CORREÇÃO: Usar for...of em vez de Promise.all para melhor controle de erro
        const rotas = [];
        
        for (const mercado of mercados) {
            try {
                console.log(`📊 Processando: GRU -> ${mercado.destino}`);
                const oportunidade = await ia.analyzeOpportunity("GRU", mercado);
                
                // CORREÇÃO CRÍTICA: Garantir que todos os campos estejam presentes
                const rotaCompleta = {
                    ...oportunidade,
                    // Campos que o frontend espera
                    origem: oportunidade.origem || "GRU",
                    destino: oportunidade.destino,
                    pais: oportunidade.pais,
                    continente: oportunidade.continente,
                    score: oportunidade.score,
                    // CORREÇÃO: Garantir que passageiros cheguem de ambos os nomes
                    passageirosPotenciais: oportunidade.passageirosPotenciais,
                    passageirosAnuais: oportunidade.passageirosPotenciais, // mesmo valor
                    // CORREÇÃO: Garantir que a distância chegue
                    distancia: mercado.distancia, // ← PEGA DA LISTA DE MERCADOS
                    voosExistentes: oportunidade.voosExistentes || 0,
                    aeronaveRecomendada: oportunidade.aeronaveRecomendada,
                    trend: oportunidade.trend,
                    sazonalidade: oportunidade.sazonalidade || 0
                };
                
                rotas.push(rotaCompleta);
                console.log(`✅ ${mercado.destino} - Score: ${oportunidade.score}, Distância: ${mercado.distancia}km`);
                
            } catch (error) {
                console.error(`❌ Erro ao processar ${mercado.destino}:`, error.message);
                // Continua processando outras rotas mesmo se uma falhar
            }
        }

        console.log(`🎯 Total de Rotas processadas: ${rotas.length}`);

        // Aplicar filtros
        let resultados = rotas;
        if (pais) {
            resultados = resultados.filter(r => r.pais === pais);
            console.log(`🌎 Filtro país: ${pais} -> ${resultados.length} rotas`);
        }
        if (continente) {
            resultados = resultados.filter(r => r.continente === continente);
            console.log(`🗺️ Filtro continente: ${continente} -> ${resultados.length} rotas`);
        }
        if (minScore) {
            const minScoreNum = parseFloat(minScore);
            resultados = resultados.filter(r => r.score >= minScoreNum);
            console.log(`🎯 Filtro score mínimo: ${minScore} -> ${resultados.length} rotas`);
        }

        // Ordenar por score (maior primeiro)
        resultados.sort((a, b) => b.score - a.score);
        
        // CORREÇÃO: Log para debug - verificar se os dados estão corretos
        if (resultados.length > 0) {
            console.log('📋 Dados enviados para frontend (primeira rota):', {
                destino: resultados[0].destino,
                distancia: resultados[0].distancia,
                score: resultados[0].score,
                aeronave: resultados[0].aeronaveRecomendada,
                passageiros: resultados[0].passageirosPotenciais
            });
        }

        res.json(resultados);
        
    } catch (error) {
        console.error('💥 Erro geral ao analisar rotas:', error);
        res.status(500).json({ 
            error: 'Erro ao analisar rotas',
            details: error.message 
        });
    }
});

// Restante das rotas permanece igual
app.get('/api/coletar-dados', async (req, res) => {
    try {
        const dados = await dataCollector.collectRealTimeData();
        res.json({ 
            success: true, 
            message: `${dados.length} rotas coletadas`,
            data: dados 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/filtros', (req, res) => {
    const paises = [
        "EUA", "Portugal", "Espanha", "França", "Argentina", 
        "Canadá", "Itália", "Reino Unido", "Chile", "Colômbia", "Peru",
        "Venezuela", "Emirados Árabes", "Israel", "Japão", "África do Sul",
        "Holanda", "Alemanha"
    ];
    
    const continentes = ["América", "Europa", "Ásia", "África"];
    
    res.json({ 
        paises: paises.sort(), // Ordenar alfabeticamente
        continentes: continentes.sort()
    });
});

app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Sistema Azul Route Analyzer funcionando!'
    });
});

app.listen(3000, () => {
    console.log('✅ Server rodando na porta 3000');
    console.log('📊 Coletor de dados iniciado');
    console.log('🌐 Frontend disponível em: http://localhost:3000');
    console.log('🚀 API disponível em: http://localhost:3000/api/rotas');
});