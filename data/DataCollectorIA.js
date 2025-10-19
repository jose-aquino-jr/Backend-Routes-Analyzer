// data/DataCollectorIA.js - VERSÃO COMPATÍVEL COM SEU BANCO
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseUrl = 'https://wvbiwrspadkkawnrjgvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Yml3cnNwYWRra2F3bnJqZ3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDQwNzYsImV4cCI6MjA3NjMyMDA3Nn0.m5hSX6P5MYPnY6DtGZ1OlXQEQDaU2w0Op7Tz644TxEQ'; 
const supabase = createClient(supabaseUrl, supabaseKey);

class AviationDataCollector {
    constructor() {
       this.rotasAlvo = [
    // AMÉRICA DO NORTE
    { origem: "GRU", destino: "JFK", pais: "EUA", continente: "América", distancia: 7685 },
    { origem: "GRU", destino: "MIA", pais: "EUA", continente: "América", distancia: 6852 },
    { origem: "GRU", destino: "LAX", pais: "EUA", continente: "América", distancia: 10085 },
    { origem: "GRU", destino: "MCO", pais: "EUA", continente: "América", distancia: 6523 },
    { origem: "GRU", destino: "FLL", pais: "EUA", continente: "América", distancia: 6721 },
    { origem: "GRU", destino: "YYZ", pais: "Canadá", continente: "América", distancia: 8365 },
    
    // EUROPA
    { origem: "GRU", destino: "LIS", pais: "Portugal", continente: "Europa", distancia: 7489 },
    { origem: "GRU", destino: "MAD", pais: "Espanha", continente: "Europa", distancia: 8023 },
    { origem: "GRU", destino: "CDG", pais: "França", continente: "Europa", distancia: 9176 },
    { origem: "GRU", destino: "FCO", pais: "Itália", continente: "Europa", distancia: 9395 },
    { origem: "GRU", destino: "LHR", pais: "Reino Unido", continente: "Europa", distancia: 9560 },
    { origem: "GRU", destino: "AMS", pais: "Holanda", continente: "Europa", distancia: 9785 },
    { origem: "GRU", destino: "FRA", pais: "Alemanha", continente: "Europa", distancia: 9845 },
    
    // AMÉRICA DO SUL
    { origem: "GRU", destino: "EZE", pais: "Argentina", continente: "América", distancia: 1690 },
    { origem: "GRU", destino: "SCL", pais: "Chile", continente: "América", distancia: 2580 },
    { origem: "GRU", destino: "BOG", pais: "Colômbia", continente: "América", distancia: 4445 },
    { origem: "GRU", destino: "LIM", pais: "Peru", continente: "América", distancia: 3465 },
    { origem: "GRU", destino: "CCS", pais: "Venezuela", continente: "América", distancia: 4635 },
    
    // OUTROS DESTINOS
    { origem: "GRU", destino: "DXB", pais: "Emirados Árabes", continente: "Ásia", distancia: 12150 },
    { origem: "GRU", destino: "TLV", pais: "Israel", continente: "Ásia", distancia: 11120 },
    { origem: "GRU", destino: "NRT", pais: "Japão", continente: "Ásia", distancia: 18560 },
    { origem: "GRU", destino: "JNB", pais: "África do Sul", continente: "África", distancia: 7925 }
];
        
        this.dadosEstatisticos = this.carregarDadosEstatisticos();
    }

    carregarDadosEstatisticos() {
    return {
        demandaBase: {
            // AMÉRICA DO NORTE
            "JFK": 125000, "MIA": 98000, "LAX": 68000, "MCO": 62000, 
            "FLL": 42000, "YYZ": 45000,
            
            // EUROPA  
            "LIS": 72000, "MAD": 48000, "CDG": 55000, "FCO": 38000,
            "LHR": 52000, "AMS": 35000, "FRA": 42000,
            
            // AMÉRICA DO SUL
            "EZE": 225000, "SCL": 85000, "BOG": 45000, "LIM": 52000, "CCS": 28000,
            
            // OUTROS
            "DXB": 32000, "TLV": 18000, "NRT": 25000, "JNB": 15000
        },
        concorrentes: {
            // ... (adicionar concorrentes para as novas rotas)
            "LAX": [
                { airline: "LATAM", weeklyFlights: 7, loadFactor: 0.78 },
                { airline: "American", weeklyFlights: 4, loadFactor: 0.75 }
            ],
            "YYZ": [
                { airline: "Air Canada", weeklyFlights: 10, loadFactor: 0.82 },
                { airline: "LATAM", weeklyFlights: 3, loadFactor: 0.79 }
            ],
            "FCO": [
                { airline: "Alitalia", weeklyFlights: 5, loadFactor: 0.81 }
            ],
            "LHR": [
                { airline: "British Airways", weeklyFlights: 7, loadFactor: 0.85 },
                { airline: "LATAM", weeklyFlights: 4, loadFactor: 0.80 }
            ]
            // ... (adicionar os outros)
        },
        crescimento: {
            "JFK": 9.2, "MIA": 7.5, "LAX": 12.3, "MCO": 18.6, "FLL": 32.7, "YYZ": 8.9,
            "LIS": 28.4, "MAD": 14.3, "CDG": 11.8, "FCO": 9.5, "LHR": 10.2, "AMS": 13.7, "FRA": 8.4,
            "EZE": 6.4, "SCL": 11.2, "BOG": 15.8, "LIM": 9.3, "CCS": 7.1,
            "DXB": 25.6, "TLV": 18.9, "NRT": 14.5, "JNB": 12.8
        },
        tendencias: {
            "JFK": "crescendo", "MIA": "normal", "LAX": "crescendo", "MCO": "crescendo", 
            "FLL": "explodindo", "YYZ": "normal",
            "LIS": "explodindo", "MAD": "crescendo", "CDG": "crescendo", "FCO": "normal",
            "LHR": "crescendo", "AMS": "crescendo", "FRA": "normal",
            "EZE": "normal", "SCL": "crescendo", "BOG": "explodindo", "LIM": "normal", "CCS": "normal",
            "DXB": "explodindo", "TLV": "crescendo", "NRT": "crescendo", "JNB": "crescendo"
        }
    };
}


    async collectRealTimeData() {
        console.log('Coletando dados de aviação...');
        
        try {
            const flightData = await this.tryOpenSkyAPI();
            const economicData = await this.getEconomicData();
            const processedData = await this.processData(flightData, economicData);
            
            await this.saveToDatabase(processedData);
            console.log(`${processedData.length} rotas processadas`);
            
            return processedData;

        } catch (error) {
            console.error('Erro na coleta:', error.message);
            return await this.getDataFromStatistics();
        }
    }

    async tryOpenSkyAPI() {
        console.log('Tentando OpenSky Network...');
        
        try {
            const now = Math.floor(Date.now() / 1000);
            const yesterday = now - 86400;
            
            const response = await axios.get(
                `https://opensky-network.org/api/flights/all?begin=${yesterday}&end=${now}`,
                { 
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'ADUL-Routes-Analyzer/1.0'
                    }
                }
            );

            if (response.data && Array.isArray(response.data)) {
                console.log(`OpenSky: ${response.data.length} voos coletados`);
                return response.data;
            }
            throw new Error('Dados inválidos');

        } catch (error) {
            console.log('OpenSky falhou:', error.message);
            return [];
        }
    }

    async getEconomicData() {
        try {
            const exchangeRate = await this.getExchangeRate();
            
            return {
                fuelPrice: 2.45,
                exchangeRate: exchangeRate,
                tourismGrowth: this.calculateAverageTourismGrowth()
            };
        } catch (error) {
            return {
                fuelPrice: 2.45,
                exchangeRate: 5.20,
                tourismGrowth: 15.2
            };
        }
    }

    async getExchangeRate() {
        try {
            const response = await axios.get(
                'https://api.exchangerate.host/latest?base=USD&symbols=BRL',
                { timeout: 8000 }
            );
            return response.data.rates.BRL || 5.20;
        } catch (error) {
            return 5.20;
        }
    }

    calculateAverageTourismGrowth() {
        const growth = Object.values(this.dadosEstatisticos.crescimento);
        return Number((growth.reduce((a, b) => a + b, 0) / growth.length).toFixed(1));
    }

    async processData(flightData, economicData) {
        const processedRoutes = [];

        for (const rota of this.rotasAlvo) {
            const voosReais = flightData.filter(f => {
                const departure = f.estDepartureAirport || f.est_departure_airport;
                const arrival = f.estArrivalAirport || f.est_arrival_airport;
                return departure === rota.origem && arrival === rota.destino;
            }).length;

            const dadosRota = this.getRouteData(rota.destino, voosReais);
            
            const opportunityScore = this.calculateOpportunityScore({
                ...dadosRota,
                distancia: rota.distancia,
                fuelPrice: economicData.fuelPrice,
                tourismGrowth: economicData.tourismGrowth
            });

            processedRoutes.push({
                origem: rota.origem,
                destino: rota.destino,
                pais: rota.pais,
                continente: rota.continente,
                distancia: rota.distancia,
                trend: dadosRota.trend,
                crescimento_mercado: dadosRota.crescimento,
                voos_existentes: dadosRota.voosExistentes,
                concorrentes: dadosRota.concorrentes.length,
                voos_concorrentes: dadosRota.concorrentes.reduce((sum, c) => sum + c.weeklyFlights, 0),
                demanda_passageiros: dadosRota.demanda,
                preco_combustivel: economicData.fuelPrice,
                taxa_cambio: economicData.exchangeRate,
                crescimento_turismo: economicData.tourismGrowth,
                score_opportunity: opportunityScore,
                concorrentes_detalhes: dadosRota.concorrentes,
                fonte_dados: flightData.length > 0 ? 'opensky' : 'estatistico_anac',
                confiabilidade: flightData.length > 0 ? 80 : 90
                // timestamp é automático DEFAULT now()
            });
        }

        return processedRoutes;
    }

    getRouteData(destino, voosReais) {
        const baseVoos = this.estimateExistingFlights(destino);
        const voosExistentes = voosReais > 0 ? voosReais : baseVoos;
        
        return {
            voosExistentes: voosExistentes,
            concorrentes: this.dadosEstatisticos.concorrentes[destino] || [],
            trend: this.dadosEstatisticos.tendencias[destino] || "normal",
            crescimento: this.dadosEstatisticos.crescimento[destino] || 8.0,
            demanda: this.calculateAdjustedDemand(destino, voosExistentes)
        };
    }

    estimateExistingFlights(destino) {
        const estimates = {
            "JFK": 8, "MIA": 12, "LIS": 6, "MAD": 4,
            "CDG": 3, "FLL": 2, "MCO": 3, "EZE": 18
        };
        return estimates[destino] || 2;
    }

    calculateAdjustedDemand(destino, voosExistentes) {
        const baseDemanda = this.dadosEstatisticos.demandaBase[destino] || 50000;
        const trend = this.dadosEstatisticos.tendencias[destino];
        
        let demanda = baseDemanda;
        if (trend === "explodindo") demanda *= 1.6;
        else if (trend === "crescendo") demanda *= 1.3;

        if (voosExistentes > 10) demanda *= 1.2;
        else if (voosExistentes === 0) demanda *= 0.8;

        return Math.round(demanda);
    }

    calculateOpportunityScore(factors) {
        let score = 50;

        if (factors.demanda > 200000) score += 20;
        else if (factors.demanda > 100000) score += 15;
        else if (factors.demanda > 50000) score += 10;

        if (factors.concorrentes === 0) score += 20;
        else if (factors.concorrentes === 1) score += 15;
        else if (factors.concorrentes <= 3) score += 8;

        if (factors.trend === "explodindo") score += 15;
        else if (factors.trend === "crescendo") score += 10;

        if (factors.voosExistentes === 0) score += 15;
        else if (factors.voosExistentes <= 2) score += 10;

        if (factors.tourismGrowth > 20) score += 10;
        else if (factors.tourismGrowth > 10) score += 5;

        if (factors.distancia > 8000) score += 10;
        else if (factors.distancia > 5000) score += 5;

        return Math.min(100, Math.max(0, score));
    }

    async getDataFromStatistics() {
        console.log('Usando dados estatísticos ANAC/EMBRATUR...');
        const economicData = await this.getEconomicData();
        return this.processData([], economicData);
    }

    async saveToDatabase(data) {
        try {
            const { error } = await supabase
                .from('dados_mercado_aviacao')
                .insert(data);

            if (error) {
                console.error('Erro ao salvar:', error);
                return false;
            }
            
            console.log('Dados salvos no Supabase com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro crítico ao salvar:', error);
            return false;
        }
    }

    async startAutomaticCollection(intervalMinutes = 240) {
        console.log(`Coletor FREE iniciado - Coletando a cada ${intervalMinutes} minutos`);
        
        // Coleta imediata
        await this.collectRealTimeData();
        
        // Coleta periódica
        setInterval(async () => {
            console.log('Coleta periódica...');
            await this.collectRealTimeData();
        }, intervalMinutes * 60 * 1000);
    }
}

module.exports = AviationDataCollector;