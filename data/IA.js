const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wvbiwrspadkkawnrjgvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Yml3cnNwYWRra2F3bnJqZ3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDQwNzYsImV4cCI6MjA3NjMyMDA3Nn0.m5hSX6P5MYPnY6DtGZ1OlXQEQDaU2w0Op7Tz644TxEQ';
const supabase = createClient(supabaseUrl, supabaseKey);

class RealTimeOpportunityHunter {
    constructor() {
        this.rotasAzulAtuais = ["MIA", "LIS", "MCO", "FLL", "MAD", "EZE"];
    }

    async analyzeOpportunity(origem, mercado) {
        console.log(`🔍 Analisando oportunidade: ${origem} -> ${mercado.destino}`);
        
        // Busca dados REAIS do DataCollector
        const dadosReais = await this.getRealMarketData(origem, mercado.destino);
        
        let score = 50;

        // Fator: Voos existentes
        const voosExistentes = dadosReais.voos_existentes || 0;
        console.log(`✈️ Voos existentes: ${voosExistentes}`);
        if (voosExistentes === 0) score += 25;
        else if (voosExistentes <= 2) score += 15;

        // Fator: Tendência do mercado
        const trend = dadosReais.trend || mercado.trend;
        console.log(`📈 Trend: ${trend}`);
        if (trend === "explodindo") score += 20;
        else if (trend === "crescendo") score += 12;

        // Fator: Sazonalidade
        const seasonScore = this.analyzeCurrentSeason(mercado.destino);
        console.log(`🌤️ Sazonalidade: ${seasonScore}`);
        score += seasonScore;

        // Fator: Demanda
        const demanda = dadosReais.demanda_passageiros || this.calculatePotentialPassengers(mercado);
        console.log(`👥 Demanda: ${demanda} passageiros`);
        if (demanda > 150000) score += 10;
        else if (demanda > 100000) score += 7;
        else if (demanda > 50000) score += 5;

        // Fator: Concorrência
        const concorrentes = dadosReais.concorrentes || 0;
        console.log(`🏢 Concorrentes: ${concorrentes}`);
        if (concorrentes === 0) score += 15;
        else if (concorrentes <= 2) score += 8;

        const scoreFinal = Math.min(100, Math.max(0, score));
        console.log(`🎯 Score final: ${scoreFinal}`);

        // CORREÇÃO: Incluir TODOS os campos necessários para o frontend
        const oportunidade = {
            origem,
            destino: mercado.destino,
            pais: mercado.pais,
            continente: mercado.continente,
            score: scoreFinal,
            // CORREÇÃO: Garantir que todos os campos cheguem no front
            passageirosPotenciais: demanda,
            passageirosAnuais: demanda, // campo alternativo para o front
            voosExistentes: voosExistentes,
            distancia: mercado.distancia, // ← CORREÇÃO CRÍTICA: Adicionar distância
            aeronaveRecomendada: this.recommendAircraftByDistance(mercado.distancia),
            trend: trend,
            sazonalidade: seasonScore,
            dados_reais: dadosReais,
            timestamp: new Date().toISOString()
        };

        await this.saveOpportunity(oportunidade);
        return oportunidade;
    }

        async getRealMarketData(origem, destino) {
            try {
                console.log(`📊 Buscando dados reais para: ${origem}-${destino}`);
                
                const { data, error } = await supabase
                    .from('dados_mercado_aviacao')
                    .select('*')
                    .eq('origem', origem)
                    .eq('destino', destino)
                    .order('timestamp', { ascending: false })
                    .limit(1);

                if (error) {
                    console.log('❌ Erro ao buscar dados:', error.message);
                    return this.getFallbackData(destino);
                }

                if (!data || data.length === 0) {
                    console.log('ℹ️ Nenhum dado encontrado, usando fallback');
                    return this.getFallbackData(destino);
                }

                console.log('✅ Dados reais encontrados');
                return data[0];
            } catch (error) {
                console.log('❌ Erro geral ao buscar dados:', error.message);
                return this.getFallbackData(destino);
            }
        }

        getFallbackData(destino) {
            console.log(`🔄 Usando dados fallback para: ${destino}`);
            
            const fallbackData = {
                "JFK": { voos_existentes: 8, trend: "crescendo", demanda_passageiros: 125000, concorrentes: 3 },
                "MIA": { voos_existentes: 12, trend: "normal", demanda_passageiros: 98000, concorrentes: 3 },
                "LIS": { voos_existentes: 6, trend: "explodindo", demanda_passageiros: 72000, concorrentes: 2 },
                "MAD": { voos_existentes: 4, trend: "crescendo", demanda_passageiros: 48000, concorrentes: 1 },
                "CDG": { voos_existentes: 3, trend: "crescendo", demanda_passageiros: 55000, concorrentes: 1 },
                "FLL": { voos_existentes: 2, trend: "explodindo", demanda_passageiros: 42000, concorrentes: 1 },
                "MCO": { voos_existentes: 3, trend: "crescendo", demanda_passageiros: 62000, concorrentes: 1 },
                "EZE": { voos_existentes: 18, trend: "normal", demanda_passageiros: 225000, concorrentes: 2 }
            };

            return fallbackData[destino] || { 
                voos_existentes: 0, 
                trend: "normal", 
                demanda_passageiros: 50000, 
                concorrentes: 0 
            };
        }

        analyzeCurrentSeason(destino) {
    const now = new Date();
    const month = now.getMonth() + 1;

    const seasonalPatterns = {
        "MCO": [12, 1, 2, 3, 6, 7], // Orlando - verão e Natal
        "LIS": [6, 7, 8, 9], // Lisboa - verão europeu
        "JFK": [5, 6, 7, 8, 9, 12], // NYC - verão e Natal
        "MIA": [11, 12, 1, 2, 3, 4], // Miami - inverno
        "MAD": [5, 6, 7, 8, 9], // Madrid - verão
        "CDG": [5, 6, 7, 8, 9], // Paris - verão
        "FLL": [11, 12, 1, 2, 3, 4] // Fort Lauderdale - inverno
    };

    const isHighSeason = seasonalPatterns[destino]?.includes(month);
    console.log(`📅 Mês ${month}, Alta temporada: ${isHighSeason}`);

    // Retorna 15 se alta temporada, 5 se baixa, e 0 se destino não estiver definido
    return isHighSeason !== undefined ? (isHighSeason ? 15 : 5) : 0;
}


        calculatePotentialPassengers(mercado) {
            const base = 150000;
            const multiplier = mercado.trend === "explodindo" ? 2.5 :
                            mercado.trend === "crescendo" ? 1.8 : 1.2;
            return Math.round(base * multiplier);
        }

        recommendAircraftByDistance(distancia) {
        // CORREÇÃO: Garantir que sempre retorne uma aeronave válida
        if (!distancia || distancia === 0) {
            console.log('⚠️ Distância não informada, usando padrão A330-200');
            return "A330-200";
        }
        
        let aeronave;
        if (distancia < 4000) aeronave = "A320neo";
        else if (distancia < 7000) aeronave = "A321neo";
        else if (distancia < 9000) aeronave = "A330-200";
        else aeronave = "A350-900";
        
        console.log(`✈️ Aeronave recomendada: ${aeronave} (${distancia}km)`);
        return aeronave;
    }

        async saveOpportunity(opp) {
            try {
                console.log(`💾 Salvando oportunidade: ${opp.origem}-${opp.destino}`);
                
                const { error } = await supabase.from('oportunidades_analisadas').insert([{
                    origem: opp.origem,
                    destino: opp.destino,
                    pais: opp.pais,
                    continente: opp.continente,
                    score: opp.score,
                    passageiros_potenciais: opp.passageirosPotenciais,
                    trend: opp.trend,
                    sazonalidade: opp.sazonalidade,
                    voos_existentes: opp.voosExistentes,
                    aeronave_recomendada: opp.aeronaveRecomendada,
                    dados_reais: opp.dados_reais,
                    timestamp: opp.timestamp
                }]);

                if (error) {
                    console.log('❌ Erro ao salvar oportunidade:', error.message);
                    // Tenta salvar em outra tabela se a primeira não existir
                    await this.saveToMercados(opp);
                } else {
                    console.log('✅ Oportunidade salva com sucesso');
                }
            } catch (error) {
                console.error('❌ Erro crítico ao salvar:', error);
            }
        }

        async saveToMercados(opp) {
            try {
                // Fallback: salva na tabela mercados existente
                const { error } = await supabase.from('mercados').insert([{
                    destino: opp.destino,
                    pais: opp.pais,
                    continente: opp.continente,
                    distancia: opp.dados_reais?.distancia || 0,
                    trend: opp.trend
                }]);

                if (error) {
                    console.log('❌ Também não foi possível salvar em mercados:', error.message);
                } else {
                    console.log('✅ Salvo na tabela mercados como fallback');
                }
            } catch (error) {
                console.log('❌ Erro no fallback:', error.message);
            }
        }
    }


    module.exports = RealTimeOpportunityHunter;
