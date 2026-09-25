/**
 * ==============================================================================
 * BATALHA POKÉMON — MOTOR PRINCIPAL EXPANDIDO (JAVASCRIPT)
 * Inclui:
 * 1. Arenas com Efeitos Específicos
 * 2. Efeitos de Status / Condições (Queimado, Paralisado, Veneno, Congelado, etc.)
 * 3. Sistema de Combos Progressivos
 * 4. Esquiva / Defesa com Reação Rápida (QTE)
 * 5. Barra de Energia (EP) para Ataques Especiais
 * 6. Eventos Dinâmicos de Batalha com Alteração de Regras
 * 7. Modo Aventura Roguelite (Mapa, Lojas, Encontros, Chefes)
 * 8. Chefes com Fases, Transformações e Mudanças de Arena
 * ==============================================================================
 */

// ==========================================
// 1. BANCO DE DADOS DOS POKÉMON DISPONÍVEIS
// ==========================================
const POKEMON_DATA = [
  {
    id: 1,
    name: "Pikachu",
    type: "Elétrico",
    typeClass: "type-eletrico",
    badgeIcon: "⚡",
    description: "Um Pokémon pequeno e ágil que utiliza eletricidade para atacar seus adversários.",
    characteristic: "Ataques rápidos e agilidade.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    passiveId: "speed",
    baseMaxHp: 100
  },
  {
    id: 2,
    name: "Charizard",
    type: "Fogo / Voador",
    typeClass: "type-fogo",
    badgeIcon: "🔥",
    description: "Um poderoso Pokémon que possui chamas na ponta da cauda e pode voar.",
    characteristic: "Ataques fortes e dano contínuo.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    passiveId: "power",
    baseMaxHp: 105
  },
  {
    id: 3,
    name: "Mewtwo",
    type: "Psíquico",
    typeClass: "type-psiquico",
    badgeIcon: "🔮",
    description: "Um Pokémon criado artificialmente, conhecido por seus grandes poderes psíquicos.",
    characteristic: "Ataque especial devastador.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    passiveId: "special",
    baseMaxHp: 110
  },
  {
    id: 4,
    name: "Blastoise",
    type: "Água",
    typeClass: "type-agua",
    badgeIcon: "💧",
    description: "Um Pokémon resistente que utiliza os canhões de água em seu casco durante as batalhas.",
    characteristic: "Defesa e casco impenetrável.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
    passiveId: "defense",
    baseMaxHp: 115
  },
  {
    id: 5,
    name: "Venusaur",
    type: "Planta / Veneno",
    typeClass: "type-planta",
    badgeIcon: "🌿",
    description: "Um Pokémon que possui uma grande flor nas costas e utiliza poderes da natureza.",
    characteristic: "Recupera HP com fotossíntese.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    passiveId: "heal",
    baseMaxHp: 110
  },
  {
    id: 6,
    name: "Gengar",
    type: "Fantasma / Veneno",
    typeClass: "type-fantasma",
    badgeIcon: "👻",
    description: "Um Pokémon misterioso que costuma aparecer escondido nas sombras.",
    characteristic: "Alta chance de ataque crítico.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    passiveId: "crit",
    baseMaxHp: 95
  },
  {
    id: 7,
    name: "Lucario",
    type: "Lutador / Aço",
    typeClass: "type-lutador",
    badgeIcon: "🥊",
    description: "Um Pokémon habilidoso capaz de perceber e utilizar a energia do combate.",
    characteristic: "Dano equilibrado e golpes firmes.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png",
    passiveId: "balanced",
    baseMaxHp: 100
  },
  {
    id: 8,
    name: "Greninja",
    type: "Água / Sombrio",
    typeClass: "type-agua",
    badgeIcon: "💧",
    description: "Um Pokémon rápido e habilidoso que utiliza movimentos ninja para surpreender.",
    characteristic: "Ataque Rápido fortalecido.",
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png",
    passiveId: "fast",
    baseMaxHp: 100
  }
];

// ==========================================
// 2. SISTEMA MODULAR DE ARENAS COM EFEITOS
// ==========================================
const ARENAS_DATA = {
  forest: {
    id: "forest",
    name: "Floresta Encantada",
    icon: "🌿",
    cssTheme: "theme-forest",
    description: "Uma floresta densa e repleta de energia natural.",
    effectText: "Regenera +5 HP para ambos no início de cada turno. Ataques do tipo Planta causam +25% de dano.",
    bgGlow1: "#10b981",
    bgGlow2: "#059669",
    onTurnStart(state) {
      const healP = 5;
      const healE = 5;
      CombatSystem.heal("player", healP, "🌿 Floresta");
      CombatSystem.heal("enemy", healE, "🌿 Floresta");
    },
    modifyDamage(attacker, defender, damage) {
      if (attacker.type && attacker.type.includes("Planta")) {
        return Math.round(damage * 1.25);
      }
      return damage;
    }
  },
  volcano: {
    id: "volcano",
    name: "Vulcão Calcinante",
    icon: "🌋",
    cssTheme: "theme-volcano",
    description: "Calor vulcânico infernal e rios de lava borbulhante.",
    effectText: "Golpes têm 30% de chance de aplicar Queimado 🔥. Tipos Fogo causam +25% de dano extra.",
    bgGlow1: "#ef4444",
    bgGlow2: "#f97316",
    onHit(attackerSide, defenderSide) {
      if (Math.random() < 0.30) {
        CombatSystem.applyStatus(defenderSide, "burn", 3);
      }
    },
    modifyDamage(attacker, defender, damage) {
      if (attacker.type && attacker.type.includes("Fogo")) {
        return Math.round(damage * 1.25);
      }
      return damage;
    }
  },
  ocean: {
    id: "ocean",
    name: "Oceano Profundo",
    icon: "🌊",
    cssTheme: "theme-ocean",
    description: "Correntes marinhas poderosas e atmosfera revigorante.",
    effectText: "Golpes bem-sucedidos geram +15 de Energia (EP) adicional. Golpes Elétricos causam +20% por choque condutivo.",
    bgGlow1: "#0284c7",
    bgGlow2: "#06b6d4",
    onHit(attackerSide) {
      CombatSystem.gainEnergy(attackerSide, 15);
    },
    modifyDamage(attacker, defender, damage) {
      if (attacker.type && attacker.type.includes("Elétrico")) {
        return Math.round(damage * 1.20);
      }
      return damage;
    }
  },
  powerplant: {
    id: "powerplant",
    name: "Usina Elétrica",
    icon: "⚡",
    cssTheme: "theme-powerplant",
    description: "Campos magnéticos e sobrecarga de corrente elétrica.",
    effectText: "Geração de Energia é dobrada (+100%). Golpes têm 25% de chance de aplicar Paralisia ⚡.",
    bgGlow1: "#f59e0b",
    bgGlow2: "#eab308",
    onHit(attackerSide, defenderSide) {
      if (Math.random() < 0.25) {
        CombatSystem.applyStatus(defenderSide, "paralysis", 2);
      }
    },
    modifyEnergyGain(amount) {
      return amount * 2;
    }
  },
  frozenpeak: {
    id: "frozenpeak",
    name: "Pico Nevado",
    icon: "❄️",
    cssTheme: "theme-frozenpeak",
    description: "Ventos polares gelados e tempestades de neve eterna.",
    effectText: "Golpes críticos aplicam Congelado ❄️ por 1 turno. Ataques normais têm 20% de chance de Atordoamento 😵.",
    bgGlow1: "#38bdf8",
    bgGlow2: "#818cf8",
    onHit(attackerSide, defenderSide, isCrit) {
      if (isCrit) {
        CombatSystem.applyStatus(defenderSide, "freeze", 1);
      } else if (Math.random() < 0.20) {
        CombatSystem.applyStatus(defenderSide, "stun", 1);
      }
    }
  },
  shadowrealm: {
    id: "shadowrealm",
    name: "Abismo Espectral",
    icon: "👻",
    cssTheme: "theme-shadowrealm",
    description: "Uma dimensão sombria onde a energia vital é drenada.",
    effectText: "Chance de crítico aumentada em +20%. Todos os golpes roubam 15% de vida (Lifesteal) do dano causado!",
    bgGlow1: "#6366f1",
    bgGlow2: "#a855f7",
    onDamageDealt(attackerSide, damage) {
      const drain = Math.max(1, Math.round(damage * 0.15));
      CombatSystem.heal(attackerSide, drain, "👻 Roubo Vital");
    },
    modifyCritChance(baseChance) {
      return baseChance + 0.20;
    }
  }
};

// ==========================================
// 3. SISTEMA DE ESTADOS DE STATUS / CONDIÇÕES
// ==========================================
const STATUS_CONFIG = {
  burn: {
    name: "Queimado",
    icon: "🔥",
    cssClass: "status-burn",
    auraClass: "aura-burn",
    description: "Sofre 6 de dano a cada turno e causa 15% a menos de dano.",
    onTurnEnd(side) {
      const dmg = 6;
      CombatSystem.takeStatusDamage(side, dmg, "🔥 Queimadura");
    },
    modifyDamageDealt(damage) {
      return Math.round(damage * 0.85);
    }
  },
  paralysis: {
    name: "Paralisado",
    icon: "⚡",
    cssClass: "status-paralysis",
    auraClass: "aura-paralysis",
    description: "40% de chance de ficar paralisado e perder a ação do turno.",
    checkCanAct(side) {
      if (Math.random() < 0.40) {
        addLogMessage(`⚡ ${side === "player" ? "Seu Pokémon" : "O adversário"} está paralisado e não conseguiu se mover!`, "log-special");
        SoundFX.statusTick();
        return false;
      }
      return true;
    }
  },
  poison: {
    name: "Envenenado",
    icon: "☠️",
    cssClass: "status-poison",
    auraClass: "aura-burn",
    description: "Sofre 8 de dano tóxico a cada turno.",
    onTurnEnd(side) {
      const dmg = 8;
      CombatSystem.takeStatusDamage(side, dmg, "☠️ Veneno");
    }
  },
  freeze: {
    name: "Congelado",
    icon: "❄️",
    cssClass: "status-freeze",
    auraClass: "aura-freeze",
    description: "Totalmente imóvel! Perde o turno enquanto estiver congelado.",
    checkCanAct(side) {
      addLogMessage(`❄️ ${side === "player" ? "Seu Pokémon" : "O adversário"} está congelado em gelo sólido e não pode atacar!`, "log-special");
      SoundFX.statusTick();
      return false;
    }
  },
  stun: {
    name: "Atordoado",
    icon: "😵",
    cssClass: "status-stun",
    auraClass: "aura-paralysis",
    description: "Ficou tonto com o impacto e perdeu a ação atual!",
    checkCanAct(side) {
      addLogMessage(`😵 ${side === "player" ? "Seu Pokémon" : "O adversário"} está zonzo e atordoado!`, "log-special");
      SoundFX.statusTick();
      return false;
    }
  },
  regen: {
    name: "Regeneração",
    icon: "🌿",
    cssClass: "status-regen",
    auraClass: "aura-shield",
    description: "Recupera +8 HP no início de cada turno.",
    onTurnStart(side) {
      CombatSystem.heal(side, 8, "🌿 Regeneração");
    }
  }
};

// ==========================================
// 4. CHEFES LENDÁRIOS COM FASES & TRANSFORMAÇÕES
// ==========================================
const BOSSES_DATA = [
  {
    id: "mewtwo_supreme",
    name: "Mewtwo Supremo",
    roleName: "CHEFE SUPREMO",
    type: "Psíquico Lendário",
    typeClass: "type-psiquico",
    badgeIcon: "🔮",
    maxHp: 220,
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    characteristic: "Mestre mental em 3 fases épicas!",
    phases: [
      {
        phase: 1,
        title: "Fase 1: Mente Serena",
        arena: "shadowrealm",
        aura: "",
        dialogue: "Mewtwo analisa sua força com calma calculada...",
        attacks: [
          { name: "Psico-Corte", type: "quick", damage: [14, 20] },
          { name: "Onda Telecinética", type: "strong", damage: [22, 30] }
        ]
      },
      {
        phase: 2,
        triggerHpPercent: 65,
        title: "Fase 2: Despertar Psíquico",
        arena: "powerplant",
        aura: "aura-rage",
        dialogue: "⚠️ Mewtwo libera energia colossal! Uma barreira psíquica surge e a arena se transforma em uma Usina de Alta Tensão!",
        bonusShield: 25,
        attacks: [
          { name: "Sobrecarga Psíquica", type: "strong", damage: [26, 36], applyStatus: "paralysis" },
          { name: "Psico-Explosão", type: "special", damage: [34, 46], applyStatus: "stun" }
        ]
      },
      {
        phase: 3,
        triggerHpPercent: 30,
        title: "Fase 3: Fúria Cósmica Final",
        arena: "volcano",
        aura: "aura-burn",
        dialogue: "🔥 Mewtwo entra em FRENESI CÓSMICO! A arena se torna um Vulcão Apocalíptico e o poder atinge o limite!",
        attacks: [
          { name: "Cataclismo Estelar", type: "special", damage: [38, 52], applyStatus: "burn" },
          { name: "Hiper Raio Destruidor", type: "special", damage: [42, 58] }
        ]
      }
    ]
  },
  {
    id: "charizard_mega",
    name: "Mega Charizard X",
    roleName: "CHEFE DRACÔNICO",
    type: "Fogo / Dragão",
    typeClass: "type-fogo",
    badgeIcon: "🔥",
    maxHp: 200,
    image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    characteristic: "Dragão ancestral de chamas azuis!",
    phases: [
      {
        phase: 1,
        title: "Fase 1: Asas Flamejantes",
        arena: "volcano",
        aura: "",
        dialogue: "Charizard ruge ferozmente, cuspindo fagulhas ardentes!",
        attacks: [
          { name: "Garra de Fogo", type: "quick", damage: [16, 22] },
          { name: "Lança-Chamas", type: "strong", damage: [24, 32] }
        ]
      },
      {
        phase: 2,
        triggerHpPercent: 60,
        title: "Fase 2: Fogo Negro",
        arena: "shadowrealm",
        aura: "aura-rage",
        dialogue: "⚠️ Charizard canaliza o fogo das sombras! A arena é envolta no Abismo Espectral!",
        bonusShield: 20,
        attacks: [
          { name: "Inferno de Sombras", type: "strong", damage: [28, 38], applyStatus: "burn" },
          { name: "Fúria Dracônica", type: "special", damage: [35, 48] }
        ]
      },
      {
        phase: 3,
        triggerHpPercent: 25,
        title: "Fase 3: Erupção Final",
        arena: "volcano",
        aura: "aura-burn",
        dialogue: "🔥 Charizard atinge temperatura máxima! Todo golpe é devastador!",
        attacks: [
          { name: "Apocalipse Flamejante", type: "special", damage: [40, 55], applyStatus: "burn" }
        ]
      }
    ]
  }
];

// ==========================================
// 5. EVENTOS DINÂMICOS DURANTE A BATALHA
// ==========================================
const BATTLE_EVENTS_CONFIG = [
  {
    id: "solar_storm",
    name: "Tempestade Solar ☀️",
    description: "Dano de todos os ataques aumentado em +35%! Mas o calor drena 4 HP no final do turno.",
    durationTurns: 3,
    onModifyDamage: (damage) => Math.round(damage * 1.35),
    onTurnEnd: () => {
      CombatSystem.takeStatusDamage("player", 4, "☀️ Calor Solar");
      CombatSystem.takeStatusDamage("enemy", 4, "☀️ Calor Solar");
    }
  },
  {
    id: "healing_rain",
    name: "Chuva Restauradora 🌧️",
    description: "Águas curativas caem sobre a arena! Todos os golpes curam 25% do dano causado.",
    durationTurns: 3,
    onDamageDealt: (side, damage) => {
      const heal = Math.max(2, Math.round(damage * 0.25));
      CombatSystem.heal(side, heal, "🌧️ Chuva Curativa");
    }
  },
  {
    id: "energy_surge",
    name: "Sobrecarga de Energia ⚡",
    description: "Campos magnéticos intensificados! Geração de EP é dobrada e Ataques Especiais custam 25 EP!",
    durationTurns: 3,
    modifyEnergyCost: (cost) => Math.round(cost / 2),
    modifyEnergyGain: (gain) => gain * 2
  },
  {
    id: "dense_fog",
    name: "Névoa Espessa 🌫️",
    description: "Visibilidade reduzida! A janela de esquiva é mais fácil, mas golpes normais têm 20% de chance de errar.",
    durationTurns: 2,
    modifyMissChance: 0.20
  },
  {
    id: "critical_resonance",
    name: "Ressonância Crítica 💥",
    description: "Energia cósmica concentrada! Todos os golpes têm +40% de chance de acerto crítico!",
    durationTurns: 2,
    modifyCritChance: 0.40
  }
];

// ==========================================
// 6. ITENS DE MOCHILA (MODO AVENTURA)
// ==========================================
const ITEMS_DATA = {
  potion: {
    id: "potion",
    name: "Poção de Cura",
    icon: "🧪",
    price: 35,
    description: "Restaura instantaneamente +45 HP do seu Pokémon.",
    use() {
      if (AdventureState.items.potion <= 0) return false;
      if (playerHP >= currentMaxHP) {
        addLogMessage("ℹ️ Seu HP já está no máximo!", "log-system");
        return false;
      }
      AdventureState.items.potion--;
      CombatSystem.heal("player", 45, "🧪 Poção de Cura");
      SoundFX.heal();
      updateItemsUI();
      return true;
    }
  },
  elixir: {
    id: "elixir",
    name: "Elixir de Energia",
    icon: "⚡",
    price: 30,
    description: "Concede imediatamente +50 de Energia (EP) para ataques especiais.",
    use() {
      if (AdventureState.items.elixir <= 0) return false;
      AdventureState.items.elixir--;
      CombatSystem.gainEnergy("player", 50);
      addLogMessage("⚡ Você usou um Elixir de Energia e recuperou +50 EP!", "log-special");
      SoundFX.special();
      updateItemsUI();
      return true;
    }
  },
  antidote: {
    id: "antidote",
    name: "Antídoto Universal",
    icon: "💊",
    price: 25,
    description: "Remove todos os estados negativos (Queimado, Paralisado, Veneno, etc.).",
    use() {
      if (AdventureState.items.antidote <= 0) return false;
      AdventureState.items.antidote--;
      playerStatuses = {};
      renderStatusEffects();
      addLogMessage("💊 Antídoto usado: Todos os efeitos negativos foram purificados!", "log-special");
      SoundFX.heal();
      updateItemsUI();
      return true;
    }
  }
};

// ==========================================
// 7. EFEITOS SONOROS RETRÔ VIA WEB AUDIO API
// ==========================================
const SoundFX = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  playTone(freq, type, duration, delay = 0, volume = 0.15) {
    try {
      this.init();
      if (!this.ctx) return;
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      }, delay * 1000);
    } catch (e) {
      // Ignora bloqueios de autoplay do navegador
    }
  },
  attack() {
    this.playTone(320, "sawtooth", 0.1);
    this.playTone(480, "triangle", 0.15, 0.08);
  },
  hit() {
    this.playTone(150, "square", 0.2);
    this.playTone(90, "sawtooth", 0.25, 0.05);
  },
  special() {
    this.playTone(280, "sine", 0.1);
    this.playTone(420, "sine", 0.1, 0.08);
    this.playTone(620, "sawtooth", 0.3, 0.16);
  },
  heal() {
    this.playTone(440, "triangle", 0.1);
    this.playTone(660, "triangle", 0.1, 0.08);
    this.playTone(880, "sine", 0.2, 0.16);
  },
  defend() {
    this.playTone(220, "square", 0.12);
    this.playTone(180, "triangle", 0.2, 0.06);
  },
  dodge() {
    this.playTone(600, "sine", 0.08);
    this.playTone(900, "sine", 0.12, 0.05);
  },
  comboUp() {
    this.playTone(523, "triangle", 0.1);
    this.playTone(659, "triangle", 0.12, 0.08);
  },
  phaseShift() {
    this.playTone(180, "sawtooth", 0.3);
    this.playTone(300, "sawtooth", 0.4, 0.2);
    this.playTone(580, "square", 0.5, 0.4);
  },
  statusTick() {
    this.playTone(260, "sawtooth", 0.08);
  },
  coin() {
    this.playTone(987, "square", 0.08);
    this.playTone(1318, "square", 0.15, 0.08);
  },
  victory() {
    this.playTone(523.25, "square", 0.15, 0.0);
    this.playTone(659.25, "square", 0.15, 0.15);
    this.playTone(783.99, "square", 0.15, 0.3);
    this.playTone(1046.50, "square", 0.35, 0.45);
  },
  defeat() {
    this.playTone(400, "sawtooth", 0.2, 0.0);
    this.playTone(320, "sawtooth", 0.25, 0.2);
    this.playTone(200, "sawtooth", 0.4, 0.45);
  }
};

// ==========================================
// 8. ESTADOS GLOBAIS DE JOGO E COMBATE
// ==========================================
let currentMode = "quick"; // 'quick' | 'adventure' | 'boss'
let selectedArenaKey = "random";
let currentArena = ARENAS_DATA.forest;

let currentMaxHP = 100;
let enemyMaxHP = 100;
let playerHP = 100;
let enemyHP = 100;

let playerEP = 30;
let enemyEP = 20;
const MAX_EP = 100;
const SPECIAL_COST = 50;

let playerCombo = 0;
let maxComboStreak = 0;
let totalCombosAchieved = 0;
let totalTurns = 0;

let playerPokemon = null;
let enemyPokemon = null;
let activeBossConfig = null;
let currentBossPhase = 1;

let isTurnInProgress = false;
let isBattleOver = false;

// Estados de Status Ativos { burn: turnsLeft, paralysis: turnsLeft, ... }
let playerStatuses = {};
let enemyStatuses = {};

// Evento de Batalha Ativo
let activeBattleEvent = null;
let activeEventTurnsLeft = 0;

// Quick-Time-Event (QTE)
let reactionTimerId = null;
let isReactionActive = false;
let reactionResolved = false;

// Estado do Modo Aventura
const AdventureState = {
  currentFloor: 1,
  maxFloors: 5,
  gold: 60,
  currentNodeId: null,
  heroHp: 100,
  heroMaxHp: 100,
  startEnergy: 30,
  items: {
    potion: 2,
    elixir: 1,
    antidote: 1
  },
  mapNodes: []
};

// ==========================================
// 9. REFERÊNCIAS DO DOM
// ==========================================
const DOM = {
  // Telas
  selectionScreen: document.getElementById("selection-screen"),
  battleScreen: document.getElementById("battle-screen"),
  adventureScreen: document.getElementById("adventure-screen"),
  pokemonGrid: document.getElementById("pokemon-grid"),
  selectionHeadingTitle: document.getElementById("selection-heading-title"),

  // Modos e Arenas
  modeQuick: document.getElementById("mode-quick"),
  modeAdventure: document.getElementById("mode-adventure"),
  modeBoss: document.getElementById("mode-boss"),
  arenaPickerBar: document.getElementById("arena-picker-bar"),
  arenaPills: document.getElementById("arena-pills"),

  // Topo da Batalha
  btnBackSelect: document.getElementById("btn-back-select"),
  arenaBadge: document.getElementById("arena-badge"),
  arenaIcon: document.getElementById("arena-icon"),
  arenaName: document.getElementById("arena-name"),
  bossPhaseBadge: document.getElementById("boss-phase-badge"),
  bossPhaseText: document.getElementById("boss-phase-text"),
  comboBadge: document.getElementById("combo-badge"),
  comboText: document.getElementById("combo-text"),
  comboBonusSub: document.getElementById("combo-bonus-sub"),
  surpriseBadge: document.getElementById("surprise-badge"),
  surpriseText: document.getElementById("surprise-text"),
  activeRulePill: document.getElementById("active-rule-pill"),
  phaseAlert: document.getElementById("phase-alert"),
  phaseAlertMsg: document.getElementById("phase-alert-msg"),
  criticalAlert: document.getElementById("critical-alert"),
  turnIndicator: document.getElementById("turn-indicator"),

  // Campo de Batalha
  battleArenaElement: document.getElementById("battle-arena-element"),
  bgGlow1: document.getElementById("bg-glow-1"),
  bgGlow2: document.getElementById("bg-glow-2"),

  // Jogador
  playerStatusCard: document.getElementById("player-status-card"),
  playerTypeBadge: document.getElementById("player-type-badge"),
  playerName: document.getElementById("player-name"),
  playerFeature: document.getElementById("player-feature"),
  playerHPText: document.getElementById("player-hp-text"),
  playerHPBar: document.getElementById("player-hp-bar"),
  playerEPBar: document.getElementById("player-ep-bar"),
  playerEPText: document.getElementById("player-ep-text"),
  playerStatusEffects: document.getElementById("player-status-effects"),
  playerSprite: document.getElementById("player-sprite"),
  playerPlatform: document.getElementById("player-platform"),
  playerStatusAura: document.getElementById("player-status-aura"),
  playerDamageContainer: document.getElementById("player-damage-container"),

  // Adversário
  enemyStatusCard: document.getElementById("enemy-status-card"),
  enemyRoleTag: document.getElementById("enemy-role-tag"),
  enemyTypeBadge: document.getElementById("enemy-type-badge"),
  enemyName: document.getElementById("enemy-name"),
  enemyFeature: document.getElementById("enemy-feature"),
  enemyHPText: document.getElementById("enemy-hp-text"),
  enemyHPBar: document.getElementById("enemy-hp-bar"),
  enemyPhaseMarkers: document.getElementById("enemy-phase-markers"),
  enemyEPBar: document.getElementById("enemy-ep-bar"),
  enemyEPText: document.getElementById("enemy-ep-text"),
  enemyStatusEffects: document.getElementById("enemy-status-effects"),
  enemySprite: document.getElementById("enemy-sprite"),
  enemyPlatform: document.getElementById("enemy-platform"),
  enemyStatusAura: document.getElementById("enemy-status-aura"),
  enemyDamageContainer: document.getElementById("enemy-damage-container"),

  // QTE de Defesa / Esquiva
  reactionOverlay: document.getElementById("reaction-overlay"),
  reactionTitle: document.getElementById("reaction-title"),
  reactionTimerBar: document.getElementById("reaction-timer-bar"),
  btnQteDefend: document.getElementById("btn-qte-defend"),
  btnQteDodge: document.getElementById("btn-qte-dodge"),

  // Registro & Controles
  battleLog: document.getElementById("battle-log"),
  battleItemsBar: document.getElementById("battle-items-bar"),
  btnUsePotion: document.getElementById("btn-use-potion"),
  btnUseElixir: document.getElementById("btn-use-elixir"),
  btnUseAntidote: document.getElementById("btn-use-antidote"),
  itemCountPotion: document.getElementById("item-count-potion"),
  itemCountElixir: document.getElementById("item-count-elixir"),
  itemCountAntidote: document.getElementById("item-count-antidote"),

  btnQuick: document.getElementById("btn-quick-attack"),
  btnStrong: document.getElementById("btn-strong-attack"),
  btnSpecial: document.getElementById("btn-special-attack"),

  // Tela Aventura
  advHeroImg: document.getElementById("adv-hero-img"),
  advHeroName: document.getElementById("adv-hero-name"),
  advHeroHp: document.getElementById("adv-hero-hp"),
  advStageText: document.getElementById("adv-stage-text"),
  advGoldText: document.getElementById("adv-gold-text"),
  advBagTotalCount: document.getElementById("adv-bag-total-count"),
  btnAdvQuit: document.getElementById("btn-adv-quit"),
  btnAdvOpenBag: document.getElementById("btn-adv-open-bag"),
  adventureMapTree: document.getElementById("adventure-map-tree"),

  // Modais
  resultModal: document.getElementById("result-modal"),
  modalCard: document.querySelector(".modal-card"),
  modalIcon: document.getElementById("modal-icon"),
  modalTitle: document.getElementById("modal-title"),
  modalDesc: document.getElementById("modal-description"),
  statTurns: document.getElementById("stat-turns"),
  statCombos: document.getElementById("stat-combos"),
  statReward: document.getElementById("stat-reward"),
  btnPlayAgain: document.getElementById("btn-play-again"),

  shopModal: document.getElementById("shop-modal"),
  shopCurrentGold: document.getElementById("shop-current-gold"),
  shopItemsGrid: document.getElementById("shop-items-grid"),
  btnCloseShop: document.getElementById("btn-close-shop"),

  eventModal: document.getElementById("event-modal"),
  eventModalIcon: document.getElementById("event-modal-icon"),
  eventModalTitle: document.getElementById("event-modal-title"),
  eventModalDesc: document.getElementById("event-modal-desc"),
  eventChoicesList: document.getElementById("event-choices-list"),

  restModal: document.getElementById("rest-modal"),
  btnRestHeal: document.getElementById("btn-rest-heal"),
  btnRestTrain: document.getElementById("btn-rest-train"),

  arenaInfoModal: document.getElementById("arena-info-modal"),
  arenaInfoIcon: document.getElementById("arena-info-icon"),
  arenaInfoTitle: document.getElementById("arena-info-title"),
  arenaInfoDesc: document.getElementById("arena-info-desc"),
  arenaInfoEffect: document.getElementById("arena-info-effect"),
  btnCloseArenaInfo: document.getElementById("btn-close-arena-info")
};

// ==========================================
// 10. INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================
function initApp() {
  hideAllModals();
  showScreen("selection");
  renderPokemonSelection();
  setupEventListeners();
  updateArenaTheme("forest");
}

function hideAllModals() {
  const modals = [
    DOM.resultModal,
    DOM.shopModal,
    DOM.eventModal,
    DOM.restModal,
    DOM.arenaInfoModal
  ];
  modals.forEach(modal => {
    if (modal) {
      modal.classList.add("hidden");
      modal.style.display = "none";
    }
  });
}

function showScreen(screenName) {
  DOM.selectionScreen.classList.add("hidden");
  DOM.selectionScreen.style.display = "none";
  DOM.battleScreen.classList.add("hidden");
  DOM.battleScreen.style.display = "none";
  DOM.adventureScreen.classList.add("hidden");
  DOM.adventureScreen.style.display = "none";

  if (screenName === "selection") {
    DOM.selectionScreen.classList.remove("hidden");
    DOM.selectionScreen.style.display = "block";
  } else if (screenName === "battle") {
    DOM.battleScreen.classList.remove("hidden");
    DOM.battleScreen.style.display = "block";
  } else if (screenName === "adventure") {
    DOM.adventureScreen.classList.remove("hidden");
    DOM.adventureScreen.style.display = "block";
  }
}

// ==========================================
// 11. RENDERIZAÇÃO DOS CARDS DE POKÉMON
// ==========================================
function renderPokemonSelection() {
  DOM.pokemonGrid.innerHTML = "";

  POKEMON_DATA.forEach(poke => {
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "pokemon-card-wrapper";

    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.dataset.id = poke.id;

    card.innerHTML = `
      <div class="card-shine"></div>
      <div class="card-header">
        <span class="type-badge ${poke.typeClass}">${poke.badgeIcon} ${poke.type}</span>
      </div>
      <div class="card-img-wrapper">
        <img class="pokemon-card-img" src="${poke.image}" alt="${poke.name}" loading="lazy">
      </div>
      <h3 class="card-name">${poke.name}</h3>
      <p class="card-desc">${poke.description}</p>
      <div class="card-feature-box">
        <span class="feature-label">Característica</span>
        <span class="feature-val">${poke.characteristic}</span>
      </div>
      <button class="btn-choose">Escolher</button>
    `;

    attach3DTiltEffect(card);

    card.addEventListener("click", () => {
      onSelectPokemonForMode(poke);
    });

    cardWrapper.appendChild(card);
    DOM.pokemonGrid.appendChild(cardWrapper);
  });
}

function attach3DTiltEffect(card) {
  const shine = card.querySelector(".card-shine");

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0, -6px, 0)`;

    if (shine) {
      const shineX = (x / rect.width) * 100;
      const shineY = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`;
      shine.style.opacity = "1";
    }
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)";
    if (shine) shine.style.opacity = "0";
  });
}

function onSelectPokemonForMode(pokemon) {
  if (currentMode === "quick") {
    startFreeBattle(pokemon);
  } else if (currentMode === "adventure") {
    startAdventureMode(pokemon);
  } else if (currentMode === "boss") {
    startBossChallenge(pokemon);
  }
}

// ==========================================
// 12. GESTÃO DE MODOS DE JOGO
// ==========================================
function setGameMode(mode) {
  currentMode = mode;
  [DOM.modeQuick, DOM.modeAdventure, DOM.modeBoss].forEach(btn => {
    if (btn) btn.classList.remove("active");
  });

  if (mode === "quick" && DOM.modeQuick) {
    DOM.modeQuick.classList.add("active");
    DOM.arenaPickerBar.style.display = "flex";
    DOM.selectionHeadingTitle.textContent = "Escolha seu Pokémon para Batalha Rápida";
  } else if (mode === "adventure" && DOM.modeAdventure) {
    DOM.modeAdventure.classList.add("active");
    DOM.arenaPickerBar.style.display = "none";
    DOM.selectionHeadingTitle.textContent = "Escolha seu Pokémon Campeão para a Aventura";
  } else if (mode === "boss" && DOM.modeBoss) {
    DOM.modeBoss.classList.add("active");
    DOM.arenaPickerBar.style.display = "none";
    DOM.selectionHeadingTitle.textContent = "Escolha seu Pokémon para o Desafio de Chefe";
  }
}

// ==========================================
// 13. CONFIGURAÇÃO DE ARENAS
// ==========================================
function updateArenaTheme(arenaKey) {
  let chosenKey = arenaKey;
  if (chosenKey === "random") {
    const keys = Object.keys(ARENAS_DATA);
    chosenKey = keys[Math.floor(Math.random() * keys.length)];
  }

  currentArena = ARENAS_DATA[chosenKey] || ARENAS_DATA.forest;

  // Atualiza classes do elemento da Arena
  const allThemes = Object.values(ARENAS_DATA).map(a => a.cssTheme);
  allThemes.forEach(theme => DOM.battleArenaElement.classList.remove(theme));
  DOM.battleArenaElement.classList.add(currentArena.cssTheme);

  // Atualiza glow de fundo
  if (DOM.bgGlow1) DOM.bgGlow1.style.background = currentArena.bgGlow1;
  if (DOM.bgGlow2) DOM.bgGlow2.style.background = currentArena.bgGlow2;

  // Atualiza Badge superior
  DOM.arenaIcon.textContent = currentArena.icon;
  DOM.arenaName.textContent = currentArena.name;
}

// ==========================================
// 14. INICIALIZAÇÃO DE COMBATE
// ==========================================
function startFreeBattle(selectedHero) {
  playerPokemon = selectedHero;
  activeBossConfig = null;

  // Escolhe adversário aleatório diferente do jogador
  const others = POKEMON_DATA.filter(p => p.id !== selectedHero.id);
  enemyPokemon = others[Math.floor(Math.random() * others.length)];

  // Define arena
  updateArenaTheme(selectedArenaKey);

  initBattleCombatants(selectedHero, enemyPokemon, false);
}

function startBossChallenge(selectedHero) {
  playerPokemon = selectedHero;
  const boss = BOSSES_DATA[0]; // Mewtwo Supremo
  activeBossConfig = boss;
  currentBossPhase = 1;

  updateArenaTheme(boss.phases[0].arena);
  initBattleCombatants(selectedHero, boss, true);
}

function initBattleCombatants(hero, rival, isBoss = false) {
  currentMaxHP = hero.baseMaxHp || 100;
  enemyMaxHP = rival.maxHp || rival.baseMaxHp || 100;

  playerHP = currentMode === "adventure" ? AdventureState.heroHp : currentMaxHP;
  enemyHP = enemyMaxHP;

  playerEP = currentMode === "adventure" ? AdventureState.startEnergy : 30;
  enemyEP = 20;

  playerCombo = 0;
  maxComboStreak = 0;
  totalCombosAchieved = 0;
  totalTurns = 0;

  playerStatuses = {};
  enemyStatuses = {};

  activeBattleEvent = null;
  activeEventTurnsLeft = 0;
  isTurnInProgress = false;
  isBattleOver = false;

  setupCombatantUI("player", hero, playerHP, currentMaxHP);
  setupCombatantUI("enemy", rival, enemyHP, enemyMaxHP, isBoss);

  // Reseta elementos visuais
  DOM.battleLog.innerHTML = "";
  addLogMessage(`⚡ Início de combate! ${hero.name} entra no campo da ${currentArena.name}!`, "log-system");
  addLogMessage(`🏟️ Efeito da Arena: ${currentArena.effectText}`, "log-special");

  if (isBoss) {
    DOM.bossPhaseBadge.classList.remove("hidden");
    DOM.enemyPhaseMarkers.classList.remove("hidden");
    DOM.bossPhaseText.textContent = `CHEFE: FASE 1 / ${rival.phases.length}`;
    addLogMessage(`👑 DESAFIO DE CHEFE: ${rival.name} assumiu a ${rival.phases[0].title}!`, "log-enemy");
    if (rival.phases[0].dialogue) addLogMessage(`💬 "${rival.phases[0].dialogue}"`, "log-special");
  } else {
    DOM.bossPhaseBadge.classList.add("hidden");
    DOM.enemyPhaseMarkers.classList.add("hidden");
  }

  // Itens na Batalha (visíveis no modo aventura)
  if (currentMode === "adventure") {
    DOM.battleItemsBar.classList.remove("hidden");
    updateItemsUI();
  } else {
    DOM.battleItemsBar.classList.add("hidden");
  }

  DOM.phaseAlert.classList.add("hidden");
  DOM.criticalAlert.classList.add("hidden");
  DOM.reactionOverlay.classList.add("hidden");
  DOM.surpriseBadge.classList.add("hidden");
  DOM.activeRulePill.classList.add("hidden");

  updateEnergyBar("player", playerEP);
  updateEnergyBar("enemy", enemyEP);
  updateComboUI();
  renderStatusEffects();

  showScreen("battle");
  enableAttackButtons(true);

  DOM.turnIndicator.textContent = "Sua Vez de Atacar!";
  DOM.turnIndicator.style.color = "#38bdf8";
}

function setupCombatantUI(side, pokemon, hp, maxHp, isBoss = false) {
  if (side === "player") {
    DOM.playerName.textContent = pokemon.name;
    DOM.playerTypeBadge.className = `type-badge ${pokemon.typeClass}`;
    DOM.playerTypeBadge.innerHTML = `${pokemon.badgeIcon} ${pokemon.type}`;
    DOM.playerFeature.textContent = pokemon.characteristic;
    DOM.playerSprite.src = pokemon.image;
    DOM.playerSprite.alt = pokemon.name;
    updateHPBar("player", hp, maxHp);
  } else {
    DOM.enemyName.textContent = pokemon.name;
    DOM.enemyTypeBadge.className = `type-badge ${pokemon.typeClass}`;
    DOM.enemyTypeBadge.innerHTML = `${pokemon.badgeIcon} ${pokemon.type}`;
    DOM.enemyFeature.textContent = pokemon.characteristic;
    DOM.enemySprite.src = pokemon.image;
    DOM.enemySprite.alt = pokemon.name;
    if (DOM.enemyRoleTag) {
      DOM.enemyRoleTag.textContent = isBoss ? pokemon.roleName : "ADVERSÁRIO";
    }
    updateHPBar("enemy", hp, maxHp);
  }
}

// ==========================================
// 15. SISTEMA DE HP, EP E BARRAS VISUAIS
// ==========================================
function updateHPBar(side, current, max) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const textElem = side === "player" ? DOM.playerHPText : DOM.enemyHPText;
  const barElem = side === "player" ? DOM.playerHPBar : DOM.enemyHPBar;

  textElem.textContent = `${Math.ceil(current)} / ${max} HP`;
  barElem.style.width = `${pct}%`;

  barElem.classList.remove("medium", "danger");
  if (pct <= 30) {
    barElem.classList.add("danger");
  } else if (pct <= 55) {
    barElem.classList.add("medium");
  }

  if (side === "player") {
    if (pct <= 30 && current > 0) {
      DOM.criticalAlert.classList.remove("hidden");
    } else {
      DOM.criticalAlert.classList.add("hidden");
    }
  }
}

function updateEnergyBar(side, ep) {
  const pct = Math.max(0, Math.min(100, (ep / MAX_EP) * 100));
  const barElem = side === "player" ? DOM.playerEPBar : DOM.enemyEPBar;
  const textElem = side === "player" ? DOM.playerEPText : DOM.enemyEPText;

  barElem.style.width = `${pct}%`;
  textElem.textContent = `${ep} / ${MAX_EP} EP`;

  // Destaca o botão Especial se tiver EP suficiente
  if (side === "player") {
    const cost = activeBattleEvent && activeBattleEvent.modifyEnergyCost
      ? activeBattleEvent.modifyEnergyCost(SPECIAL_COST)
      : SPECIAL_COST;

    if (ep >= cost && !isTurnInProgress && !isBattleOver) {
      DOM.btnSpecial.classList.add("critical-highlight");
      DOM.btnSpecial.disabled = false;
    } else {
      DOM.btnSpecial.classList.remove("critical-highlight");
      if (ep < cost) {
        DOM.btnSpecial.disabled = true;
      }
    }
  }
}

// ==========================================
// 16. PROGRESSÃO DE COMBOS
// ==========================================
function advancePlayerCombo() {
  playerCombo++;
  if (playerCombo > maxComboStreak) maxComboStreak = playerCombo;

  if (playerCombo === 2) {
    SoundFX.comboUp();
    addLogMessage("🔥 COMBO x2 ativado! (+10% de Dano)", "log-special");
  } else if (playerCombo === 3) {
    totalCombosAchieved++;
    SoundFX.comboUp();
    addLogMessage("🔥 COMBO x3! (+25% de Dano no próximo golpe!)", "log-special");
  } else if (playerCombo === 4) {
    SoundFX.comboUp();
    addLogMessage("⚡ COMBO x4! (+40% de Dano + Chance Crítica!)", "log-special");
  } else if (playerCombo >= 5) {
    SoundFX.special();
    addLogMessage("💥 SUPER COMBO x5! (+60% de Dano e CRÍTICO GARANTIDO!)", "log-special");
  }

  updateComboUI();
}

function resetPlayerCombo() {
  if (playerCombo > 1) {
    addLogMessage("⚠️ O adversário quebrou o seu ritmo! Sequência de COMBO resetada.", "log-system");
  }
  playerCombo = 0;
  updateComboUI();
}

function updateComboUI() {
  if (playerCombo > 0) {
    DOM.comboBadge.classList.remove("hidden");
    DOM.comboText.textContent = `COMBO x${playerCombo}!`;
    
    let bonusText = "+10% Dano";
    if (playerCombo === 3) bonusText = "+25% Dano";
    else if (playerCombo === 4) bonusText = "+40% Dano";
    else if (playerCombo >= 5) bonusText = "+60% Crítico!";
    DOM.comboBonusSub.textContent = bonusText;
  } else {
    DOM.comboBadge.classList.add("hidden");
  }
}

// ==========================================
// 17. EXECUÇÃO DE ATAQUES DO JOGADOR
// ==========================================
function handlePlayerAttack(attackType) {
  if (isTurnInProgress || isBattleOver) return;

  // Verifica custo de energia do Especial
  const currentCost = activeBattleEvent && activeBattleEvent.modifyEnergyCost
    ? activeBattleEvent.modifyEnergyCost(SPECIAL_COST)
    : SPECIAL_COST;

  if (attackType === "special" && playerEP < currentCost) {
    addLogMessage(`⚠️ Energia insuficiente! O Ataque Especial requer ${currentCost} EP (você tem ${playerEP} EP).`, "log-system");
    return;
  }

  isTurnInProgress = true;
  enableAttackButtons(false);
  totalTurns++;

  // Processa início de turno de status (ex: congelado, paralisado, atordoado)
  const canAct = CombatSystem.checkCanAct("player");
  if (!canAct) {
    // Perdeu a ação por status
    setTimeout(() => {
      endPlayerTurnPhase();
    }, 1000);
    return;
  }

  // Consumo / Ganho de EP
  if (attackType === "special") {
    playerEP = Math.max(0, playerEP - currentCost);
    updateEnergyBar("player", playerEP);
    SoundFX.special();
  } else if (attackType === "quick") {
    let gain = 30;
    if (currentArena.modifyEnergyGain) gain = currentArena.modifyEnergyGain(gain);
    if (activeBattleEvent && activeBattleEvent.modifyEnergyGain) gain = activeBattleEvent.modifyEnergyGain(gain);
    CombatSystem.gainEnergy("player", gain);
    SoundFX.attack();
  } else if (attackType === "strong") {
    let gain = 15;
    if (currentArena.modifyEnergyGain) gain = currentArena.modifyEnergyGain(gain);
    if (activeBattleEvent && activeBattleEvent.modifyEnergyGain) gain = activeBattleEvent.modifyEnergyGain(gain);
    CombatSystem.gainEnergy("player", gain);
    SoundFX.attack();
  }

  DOM.turnIndicator.textContent = `${playerPokemon.name} atacando...`;
  DOM.playerSprite.classList.add("anim-player-attack");

  setTimeout(() => {
    DOM.playerSprite.classList.remove("anim-player-attack");

    // Cálculo do Dano
    const damageCalc = calculateDamage("player", attackType);

    // Aplica no adversário
    enemyHP = Math.max(0, enemyHP - damageCalc.finalDamage);
    SoundFX.hit();

    DOM.enemySprite.classList.add("anim-hit");
    setTimeout(() => DOM.enemySprite.classList.remove("anim-hit"), 450);

    showFloatingText(
      DOM.enemyDamageContainer,
      `-${damageCalc.finalDamage} HP`,
      damageCalc.isCrit ? "crit" : "normal"
    );

    updateHPBar("enemy", enemyHP, enemyMaxHP);

    let logMsg = `⚔️ ${playerPokemon.name} desferiu ${getAttackName(attackType)} e causou ${damageCalc.finalDamage} de dano!`;
    if (damageCalc.isCrit) logMsg += " 💥 ACERTO CRÍTICO!";
    if (damageCalc.comboMultiplier > 1) logMsg += ` (Combo +${Math.round((damageCalc.comboMultiplier - 1) * 100)}%)`;
    addLogMessage(logMsg, "log-player");

    // Habilidades Passivas
    if (playerPokemon.passiveId === "heal" && playerHP > 0 && playerHP < currentMaxHP) {
      CombatSystem.heal("player", 10, "🌿 Síntese do Venusaur");
    }

    // Gatilhos de Arena
    if (currentArena.onHit) {
      currentArena.onHit("player", "enemy", damageCalc.isCrit);
    }
    if (currentArena.onDamageDealt) {
      currentArena.onDamageDealt("player", damageCalc.finalDamage);
    }
    if (activeBattleEvent && activeBattleEvent.onDamageDealt) {
      activeBattleEvent.onDamageDealt("player", damageCalc.finalDamage);
    }

    // Avança Combo
    advancePlayerCombo();

    // Passiva do Pikachu: Segundo golpe surpresa
    if (playerPokemon.passiveId === "speed" && Math.random() < 0.35 && enemyHP > 0) {
      setTimeout(() => {
        const extraDmg = Math.floor(Math.random() * 8) + 8;
        enemyHP = Math.max(0, enemyHP - extraDmg);
        updateHPBar("enemy", enemyHP, enemyMaxHP);
        showFloatingText(DOM.enemyDamageContainer, `-${extraDmg} HP`, "normal");
        addLogMessage(`⚡ Agilidade do Pikachu! Desferiu um raio surpresa de ${extraDmg} de dano!`, "log-special");
      }, 450);
    }

    // Checa transição de fases do Chefe
    if (activeBossConfig) {
      checkBossPhaseTransition();
    }

    // Verifica se derrotou o inimigo
    if (enemyHP <= 0) {
      setTimeout(() => endGame(true), 600);
      return;
    }

    endPlayerTurnPhase();

  }, 350);
}

function endPlayerTurnPhase() {
  // Processa efeitos de status de final de turno do Jogador
  CombatSystem.processTurnEndStatuses("player");

  if (playerHP <= 0) {
    setTimeout(() => endGame(false), 500);
    return;
  }

  // Turno do Inimigo após pausa
  setTimeout(() => {
    triggerEnemyTurn();
  }, 900);
}

// ==========================================
// 18. TURNO DO ADVERSÁRIO & QTE DE ESQUIVA/DEFESA
// ==========================================
function triggerEnemyTurn() {
  if (isBattleOver) return;

  DOM.turnIndicator.textContent = `Atenção! ${enemyPokemon.name} está agindo...`;
  DOM.turnIndicator.style.color = "#f87171";

  // Verifica se o inimigo pode agir (congelado, atordoado, paralisado)
  const canAct = CombatSystem.checkCanAct("enemy");
  if (!canAct) {
    setTimeout(() => {
      endEnemyTurnPhase();
    }, 1000);
    return;
  }

  // Escolha do ataque do inimigo
  let enemyAttackType = "quick";
  if (activeBossConfig) {
    const phaseCfg = activeBossConfig.phases[currentBossPhase - 1];
    const attacks = phaseCfg.attacks || [];
    const chosen = attacks[Math.floor(Math.random() * attacks.length)];
    enemyAttackType = chosen ? chosen.type : "strong";
  } else {
    const r = Math.random();
    if (r > 0.65 && enemyEP >= 40) {
      enemyAttackType = "special";
      enemyEP = Math.max(0, enemyEP - 40);
    } else if (r > 0.35) {
      enemyAttackType = "strong";
      enemyEP = Math.min(MAX_EP, enemyEP + 15);
    } else {
      enemyAttackType = "quick";
      enemyEP = Math.min(MAX_EP, enemyEP + 25);
    }
    updateEnergyBar("enemy", enemyEP);
  }

  // Inicia QTE de Reação (Defesa ou Esquiva)
  startReactionQTE(enemyAttackType);
}

/**
 * Quick-Time-Event (QTE): Janela de 1.8s onde o jogador pode reagir
 */
function startReactionQTE(incomingAttackType) {
  isReactionActive = true;
  reactionResolved = false;

  DOM.reactionOverlay.classList.remove("hidden");
  DOM.reactionTitle.textContent = `⚠️ ${enemyPokemon.name} vai usar ${getAttackName(incomingAttackType)}! REAGIR:`;
  DOM.reactionTimerBar.style.width = "100%";

  const durationMs = 1800;
  const startTime = Date.now();

  if (reactionTimerId) clearInterval(reactionTimerId);

  reactionTimerId = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, durationMs - elapsed);
    const pct = (remaining / durationMs) * 100;
    DOM.reactionTimerBar.style.width = `${pct}%`;

    if (remaining <= 0) {
      clearInterval(reactionTimerId);
      if (!reactionResolved) {
        resolveReaction("none", incomingAttackType);
      }
    }
  }, 30);
}

function resolveReaction(action, attackType) {
  if (reactionResolved) return;
  reactionResolved = true;
  isReactionActive = false;
  if (reactionTimerId) clearInterval(reactionTimerId);

  DOM.reactionOverlay.classList.add("hidden");

  // Animação de investida do inimigo
  DOM.enemySprite.classList.add("anim-enemy-attack");

  setTimeout(() => {
    DOM.enemySprite.classList.remove("anim-enemy-attack");

    let rawDamageResult = calculateDamage("enemy", attackType);
    let finalDamage = rawDamageResult.finalDamage;

    if (action === "dodge") {
      // Esquiva Perfeita: 0 Dano + Gera Energia + Bônus de Combo!
      finalDamage = 0;
      SoundFX.dodge();
      showFloatingText(DOM.playerDamageContainer, "ESQUIVA PERFEITA! 💨", "heal");
      addLogMessage(`💨 ESQUIVA PERFEITA! Você desviou do ataque de ${enemyPokemon.name} e contra-atacou o ritmo!`, "log-special");
      CombatSystem.gainEnergy("player", 15);
      advancePlayerCombo();

    } else if (action === "defend") {
      // Defesa: Reduz 65% do dano + Gera +20 EP
      finalDamage = Math.max(1, Math.round(finalDamage * 0.35));
      SoundFX.defend();
      showFloatingText(DOM.playerDamageContainer, `🛡️ BLOQUEADO (-${finalDamage})`, "crit");
      addLogMessage(`🛡️ POSTURA DEFENSIVA! Dano absorvido e reduzido para ${finalDamage}! Ganhou +20 EP.`, "log-special");
      CombatSystem.gainEnergy("player", 20);

      // Aplica dano reduzido
      playerHP = Math.max(0, playerHP - finalDamage);
      updateHPBar("player", playerHP, currentMaxHP);

    } else {
      // Falha / Sem Reação: Sofre dano completo e quebra combo
      SoundFX.hit();
      playerHP = Math.max(0, playerHP - finalDamage);
      updateHPBar("player", playerHP, currentMaxHP);

      DOM.playerSprite.classList.add("anim-hit");
      setTimeout(() => DOM.playerSprite.classList.remove("anim-hit"), 450);

      showFloatingText(DOM.playerDamageContainer, `-${finalDamage} HP`, rawDamageResult.isCrit ? "crit" : "normal");
      addLogMessage(`💥 ${enemyPokemon.name} acertou em cheio com ${getAttackName(attackType)} causando ${finalDamage} de dano!`, "log-enemy");

      resetPlayerCombo();
    }

    // Gatilhos de Arena para o golpe inimigo
    if (finalDamage > 0) {
      if (currentArena.onHit) currentArena.onHit("enemy", "player", rawDamageResult.isCrit);
      if (currentArena.onDamageDealt) currentArena.onDamageDealt("enemy", finalDamage);
    }

    // Checa se o jogador caiu
    if (playerHP <= 0) {
      setTimeout(() => endGame(false), 600);
      return;
    }

    endEnemyTurnPhase();

  }, 350);
}

function endEnemyTurnPhase() {
  // Processa status de fim de turno do inimigo
  CombatSystem.processTurnEndStatuses("enemy");

  if (enemyHP <= 0) {
    setTimeout(() => endGame(true), 500);
    return;
  }

  // Efeito de Arena por turno (ex: cura da floresta)
  if (currentArena.onTurnStart) {
    currentArena.onTurnStart();
  }

  // Verifica e processa Evento de Batalha
  checkAndAdvanceBattleEvents();

  // Devolve o turno ao jogador
  isTurnInProgress = false;
  enableAttackButtons(true);
  DOM.turnIndicator.textContent = "Sua Vez de Atacar!";
  DOM.turnIndicator.style.color = "#38bdf8";
}

// ==========================================
// 19. CÁLCULO GERAL DE DANO & MULTIPLICADORES
// ==========================================
function calculateDamage(attackerSide, attackType) {
  const attacker = attackerSide === "player" ? playerPokemon : enemyPokemon;
  const defender = attackerSide === "player" ? enemyPokemon : playerPokemon;

  let base = 0;
  if (attackType === "quick") base = Math.floor(Math.random() * 8) + 14;   // 14 a 21
  else if (attackType === "strong") base = Math.floor(Math.random() * 12) + 22; // 22 a 33
  else if (attackType === "special") base = Math.floor(Math.random() * 15) + 36; // 36 a 50

  // Passivas do Pokémon
  if (attacker.passiveId === "power") base = Math.round(base * 1.15);
  if (attacker.passiveId === "balanced") {
    if (attackType === "quick") base = Math.max(18, base);
    if (attackType === "strong") base = Math.max(26, base);
    if (attackType === "special") base = Math.max(40, base);
  }
  if (attacker.passiveId === "fast" && attackType === "quick") base = Math.round(base * 1.25);
  if (attacker.passiveId === "special" && attackType === "special") base = Math.round(base * 1.30);
  if (defender.passiveId === "defense") base = Math.round(base * 0.80);

  // Modificadores de Arena
  if (currentArena.modifyDamage) {
    base = currentArena.modifyDamage(attacker, defender, base);
  }

  // Modificadores de Eventos da Batalha
  if (activeBattleEvent && activeBattleEvent.onModifyDamage) {
    base = activeBattleEvent.onModifyDamage(base);
  }

  // Modificador de Status: Queimado causa -15%
  const statuses = attackerSide === "player" ? playerStatuses : enemyStatuses;
  if (statuses.burn) {
    base = Math.round(base * 0.85);
  }

  // Combo do Jogador
  let comboMult = 1.0;
  let guaranteedCrit = false;
  if (attackerSide === "player") {
    if (playerCombo === 2) comboMult = 1.10;
    else if (playerCombo === 3) comboMult = 1.25;
    else if (playerCombo === 4) comboMult = 1.40;
    else if (playerCombo >= 5) {
      comboMult = 1.60;
      guaranteedCrit = true;
    }
  }

  base = Math.round(base * comboMult);

  // Chance de Crítico
  let isCrit = guaranteedCrit;
  if (!isCrit) {
    let critRate = attacker.passiveId === "crit" ? 0.35 : 0.12;
    if (currentArena.modifyCritChance) critRate = currentArena.modifyCritChance(critRate);
    if (activeBattleEvent && activeBattleEvent.modifyCritChance) critRate += activeBattleEvent.modifyCritChance;
    if (attackerSide === "player" && playerCombo >= 4) critRate += 0.20;

    if (Math.random() < critRate) {
      isCrit = true;
    }
  }

  if (isCrit) {
    base = Math.round(base * 1.7);
  }

  return {
    finalDamage: Math.max(1, base),
    isCrit,
    comboMultiplier: comboMult
  };
}

// ==========================================
// 20. SISTEMA DE REGRAS E EVENTOS ALEATÓRIOS
// ==========================================
function checkAndAdvanceBattleEvents() {
  if (activeBattleEvent) {
    activeEventTurnsLeft--;
    if (activeBattleEvent.onTurnEnd) activeBattleEvent.onTurnEnd();

    if (activeEventTurnsLeft <= 0) {
      addLogMessage(`⌛ O evento ${activeBattleEvent.name} chegou ao fim. As regras normais foram restauradas.`, "log-system");
      activeBattleEvent = null;
      DOM.surpriseBadge.classList.add("hidden");
      DOM.activeRulePill.classList.add("hidden");
    } else {
      DOM.surpriseBadge.classList.remove("hidden");
      DOM.surpriseText.textContent = `${activeBattleEvent.name} (${activeEventTurnsLeft}T)`;
    }
    return;
  }

  // Chance de 25% de disparar um novo evento se nenhum estiver ativo
  if (Math.random() < 0.25 && !isBattleOver) {
    const event = BATTLE_EVENTS_CONFIG[Math.floor(Math.random() * BATTLE_EVENTS_CONFIG.length)];
    activeBattleEvent = event;
    activeEventTurnsLeft = event.durationTurns;

    DOM.surpriseBadge.classList.remove("hidden");
    DOM.surpriseText.textContent = `${event.name} (${activeEventTurnsLeft}T)`;
    DOM.activeRulePill.classList.remove("hidden");
    DOM.activeRulePill.textContent = event.name;

    addLogMessage(`🎲 EVENTO DINÂMICO ATIVADO: ${event.name}! ${event.description}`, "log-special");
    SoundFX.special();
  }
}

// ==========================================
// 21. GERENCIAMENTO DE STATUS (COMBAT SYSTEM)
// ==========================================
const CombatSystem = {
  applyStatus(side, statusId, duration) {
    const targetMap = side === "player" ? playerStatuses : enemyStatuses;
    targetMap[statusId] = Math.max(targetMap[statusId] || 0, duration);

    const cfg = STATUS_CONFIG[statusId];
    const targetName = side === "player"
      ? (playerPokemon ? playerPokemon.name : "Seu Pokémon")
      : (enemyPokemon ? enemyPokemon.name : "Adversário");
    addLogMessage(`${cfg.icon} ${targetName} agora está sob o efeito de ${cfg.name}!`, "log-special");
    SoundFX.statusTick();

    renderStatusEffects();
  },

  checkCanAct(side) {
    const targetMap = side === "player" ? playerStatuses : enemyStatuses;
    // Checa congelamento
    if (targetMap.freeze) {
      targetMap.freeze--;
      if (targetMap.freeze <= 0) delete targetMap.freeze;
      renderStatusEffects();
      return STATUS_CONFIG.freeze.checkCanAct(side);
    }
    // Checa atordoamento
    if (targetMap.stun) {
      delete targetMap.stun;
      renderStatusEffects();
      return STATUS_CONFIG.stun.checkCanAct(side);
    }
    // Checa paralisia
    if (targetMap.paralysis) {
      return STATUS_CONFIG.paralysis.checkCanAct(side);
    }
    return true;
  },

  processTurnEndStatuses(side) {
    const targetMap = side === "player" ? playerStatuses : enemyStatuses;
    for (const [key, turns] of Object.entries(targetMap)) {
      const cfg = STATUS_CONFIG[key];
      if (cfg && cfg.onTurnEnd) {
        cfg.onTurnEnd(side);
      }
      targetMap[key] = turns - 1;
      if (targetMap[key] <= 0) {
        delete targetMap[key];
      }
    }
    renderStatusEffects();
  },

  takeStatusDamage(side, amount, sourceName) {
    const name = side === "player"
      ? (playerPokemon ? playerPokemon.name : "Seu Pokémon")
      : (enemyPokemon ? enemyPokemon.name : "O adversário");

    if (side === "player") {
      playerHP = Math.max(0, playerHP - amount);
      updateHPBar("player", playerHP, currentMaxHP);
      showFloatingText(DOM.playerDamageContainer, `-${amount} HP`, "crit");
      addLogMessage(`⚠️ ${name} sofreu ${amount} de dano por ${sourceName}!`, "log-enemy");
    } else {
      enemyHP = Math.max(0, enemyHP - amount);
      updateHPBar("enemy", enemyHP, enemyMaxHP);
      showFloatingText(DOM.enemyDamageContainer, `-${amount} HP`, "crit");
      addLogMessage(`💥 ${name} sofreu ${amount} de dano por ${sourceName}!`, "log-player");
    }
  },

  heal(side, amount, sourceName = "Cura") {
    const name = side === "player"
      ? (playerPokemon ? playerPokemon.name : "Seu Pokémon")
      : (enemyPokemon ? enemyPokemon.name : "O adversário");

    if (side === "player") {
      playerHP = Math.min(currentMaxHP, playerHP + amount);
      updateHPBar("player", playerHP, currentMaxHP);
      showFloatingText(DOM.playerDamageContainer, `+${amount} HP`, "heal");
      addLogMessage(`🌿 ${name} recuperou +${amount} HP via ${sourceName}!`, "log-special");
    } else {
      enemyHP = Math.min(enemyMaxHP, enemyHP + amount);
      updateHPBar("enemy", enemyHP, enemyMaxHP);
      showFloatingText(DOM.enemyDamageContainer, `+${amount} HP`, "heal");
    }
  },

  gainEnergy(side, amount) {
    if (side === "player") {
      playerEP = Math.min(MAX_EP, playerEP + amount);
      updateEnergyBar("player", playerEP);
    } else {
      enemyEP = Math.min(MAX_EP, enemyEP + amount);
      updateEnergyBar("enemy", enemyEP);
    }
  }
};

function renderStatusEffects() {
  // Jogador
  DOM.playerStatusEffects.innerHTML = "";
  for (const [key, turns] of Object.entries(playerStatuses)) {
    const cfg = STATUS_CONFIG[key];
    if (cfg) {
      const pill = document.createElement("span");
      pill.className = `status-pill ${cfg.cssClass}`;
      pill.innerHTML = `${cfg.icon} ${cfg.name} (${turns})`;
      DOM.playerStatusEffects.appendChild(pill);
    }
  }

  // Adversário
  DOM.enemyStatusEffects.innerHTML = "";
  for (const [key, turns] of Object.entries(enemyStatuses)) {
    const cfg = STATUS_CONFIG[key];
    if (cfg) {
      const pill = document.createElement("span");
      pill.className = `status-pill ${cfg.cssClass}`;
      pill.innerHTML = `${cfg.icon} ${cfg.name} (${turns})`;
      DOM.enemyStatusEffects.appendChild(pill);
    }
  }
}

// ==========================================
// 22. SISTEMA DE FASES DO CHEFE
// ==========================================
function checkBossPhaseTransition() {
  if (!activeBossConfig) return;

  const currentHpPct = (enemyHP / enemyMaxHP) * 100;
  const phases = activeBossConfig.phases;

  for (let i = phases.length - 1; i >= 1; i--) {
    const phaseCfg = phases[i];
    if (phaseCfg.triggerHpPercent !== undefined && currentHpPct <= phaseCfg.triggerHpPercent && currentBossPhase < phaseCfg.phase) {
      triggerBossPhaseShift(phaseCfg);
      break;
    }
  }
}

function triggerBossPhaseShift(newPhaseCfg) {
  currentBossPhase = newPhaseCfg.phase;

  SoundFX.phaseShift();

  DOM.bossPhaseText.textContent = `CHEFE: FASE ${currentBossPhase} / ${activeBossConfig.phases.length}`;
  DOM.phaseAlert.classList.remove("hidden");
  DOM.phaseAlertMsg.textContent = `⚠️ TRANSFORMAÇÃO! ${activeBossConfig.name.toUpperCase()} ENTROU NA ${newPhaseCfg.title.toUpperCase()}!`;

  setTimeout(() => {
    DOM.phaseAlert.classList.add("hidden");
  }, 4000);

  // Altera Arena se o chefe mudar o ambiente
  if (newPhaseCfg.arena) {
    updateArenaTheme(newPhaseCfg.arena);
    addLogMessage(`🌋 A arena tremeu violentamente e foi transformada em ${currentArena.name}!`, "log-special");
  }

  // Aplica Escudo bônus
  if (newPhaseCfg.bonusShield) {
    enemyHP = Math.min(enemyMaxHP, enemyHP + newPhaseCfg.bonusShield);
    updateHPBar("enemy", enemyHP, enemyMaxHP);
    showFloatingText(DOM.enemyDamageContainer, `+${newPhaseCfg.bonusShield} ESCUDO`, "heal");
    addLogMessage(`🛡️ Uma barreira protetora envolve o chefe, garantindo +${newPhaseCfg.bonusShield} de resistência!`, "log-enemy");
  }

  if (newPhaseCfg.dialogue) {
    addLogMessage(`👑 "${newPhaseCfg.dialogue}"`, "log-special");
  }
}

// ==========================================
// 23. MODO AVENTURA: MAPA, LOJA E ENCONTROS
// ==========================================
function startAdventureMode(selectedHero) {
  AdventureState.currentFloor = 1;
  AdventureState.gold = 60;
  AdventureState.heroMaxHp = selectedHero.baseMaxHp || 100;
  AdventureState.heroHp = AdventureState.heroMaxHp;
  AdventureState.startEnergy = 30;
  AdventureState.items = { potion: 2, elixir: 1, antidote: 1 };

  playerPokemon = selectedHero;

  generateAdventureMap();
  updateAdventureHUD();
  showScreen("adventure");
}

function generateAdventureMap() {
  // Gera 5 andares com caminhos ramificados
  AdventureState.mapNodes = [
    {
      floor: 1,
      nodes: [
        { id: "f1_n1", type: "battle", name: "Trilha Inicial", icon: "⚔️", desc: "Combate contra treinador errante.", status: "available" }
      ]
    },
    {
      floor: 2,
      nodes: [
        { id: "f2_n1", type: "mystery", name: "Clareira Oculta", icon: "❓", desc: "Um enigma na floresta.", status: "locked" },
        { id: "f2_n2", type: "battle", name: "Desfiladeiro", icon: "⚔️", desc: "Inimigo ágil com tesouros.", status: "locked" }
      ]
    },
    {
      floor: 3,
      nodes: [
        { id: "f3_n1", type: "shop", name: "PokéMart", icon: "🛒", desc: "Compre itens de suporte.", status: "locked" },
        { id: "f3_n2", type: "rest", name: "Fogueira", icon: "🏕️", desc: "Descanse e recupere vida.", status: "locked" }
      ]
    },
    {
      floor: 4,
      nodes: [
        { id: "f4_n1", type: "elite", name: "Guardião de Elite", icon: "💀", desc: "Inimigo forte antes do ápice.", status: "locked" }
      ]
    },
    {
      floor: 5,
      nodes: [
        { id: "f5_n1", type: "boss", name: "Templo do Chefe", icon: "👑", desc: "Chefe Supremo com 3 Fases!", status: "locked" }
      ]
    }
  ];

  renderAdventureMapTree();
}

function renderAdventureMapTree() {
  DOM.adventureMapTree.innerHTML = "";

  AdventureState.mapNodes.forEach(stage => {
    const row = document.createElement("div");
    row.className = "map-stage-row";

    stage.nodes.forEach(node => {
      const nodeEl = document.createElement("div");
      nodeEl.className = `map-node ${node.status} ${node.type === "boss" ? "node-boss" : ""}`;
      nodeEl.dataset.id = node.id;

      nodeEl.innerHTML = `
        <div class="node-icon-box">${node.icon}</div>
        <div class="node-info">
          <span class="node-name">${node.name}</span>
          <span class="node-type-label">${node.desc}</span>
        </div>
      `;

      if (node.status === "available") {
        nodeEl.addEventListener("click", () => {
          handleSelectAdventureNode(node);
        });
      }

      row.appendChild(nodeEl);
    });

    DOM.adventureMapTree.appendChild(row);
  });
}

function handleSelectAdventureNode(node) {
  AdventureState.currentNodeId = node.id;

  if (node.type === "battle" || node.type === "elite") {
    // Escolhe adversário aleatório
    const pool = POKEMON_DATA.filter(p => p.id !== playerPokemon.id);
    enemyPokemon = pool[Math.floor(Math.random() * pool.length)];
    activeBossConfig = null;
    updateArenaTheme("random");
    initBattleCombatants(playerPokemon, enemyPokemon, false);

  } else if (node.type === "boss") {
    // Chefe com fases
    startBossChallenge(playerPokemon);

  } else if (node.type === "shop") {
    openShopModal();

  } else if (node.type === "mystery") {
    openMysteryEventModal();

  } else if (node.type === "rest") {
    openRestModal();
  }
}

function advanceAdventureStage() {
  // Marca o nó atual como concluído e abre os nós do próximo andar
  const currentFloorIdx = AdventureState.currentFloor - 1;
  const currentFloor = AdventureState.mapNodes[currentFloorIdx];

  if (currentFloor) {
    const node = currentFloor.nodes.find(n => n.id === AdventureState.currentNodeId);
    if (node) node.status = "completed";
  }

  AdventureState.currentFloor++;

  if (AdventureState.currentFloor > AdventureState.maxFloors) {
    // Vitória total na Aventura!
    alert("🎉 PARABÉNS! Você conquistou todos os andares da Aventura e derrotou o Chefe Supremo!");
    resetGameToSelection();
    return;
  }

  // Libera os nós do novo andar
  const nextFloor = AdventureState.mapNodes[AdventureState.currentFloor - 1];
  if (nextFloor) {
    nextFloor.nodes.forEach(n => n.status = "available");
  }

  updateAdventureHUD();
  renderAdventureMapTree();
  showScreen("adventure");
}

function updateAdventureHUD() {
  if (playerPokemon) {
    DOM.advHeroImg.src = playerPokemon.image;
    DOM.advHeroName.textContent = playerPokemon.name;
  }
  DOM.advHeroHp.textContent = `HP: ${AdventureState.heroHp} / ${AdventureState.heroMaxHp}`;
  DOM.advStageText.textContent = `${AdventureState.currentFloor} / ${AdventureState.maxFloors}`;
  DOM.advGoldText.textContent = `🪙 ${AdventureState.gold}`;

  const bagCount = (AdventureState.items.potion || 0) + (AdventureState.items.elixir || 0) + (AdventureState.items.antidote || 0);
  DOM.advBagTotalCount.textContent = bagCount;
}

function updateItemsUI() {
  DOM.itemCountPotion.textContent = AdventureState.items.potion || 0;
  DOM.itemCountElixir.textContent = AdventureState.items.elixir || 0;
  DOM.itemCountAntidote.textContent = AdventureState.items.antidote || 0;

  DOM.btnUsePotion.disabled = (AdventureState.items.potion <= 0);
  DOM.btnUseElixir.disabled = (AdventureState.items.elixir <= 0);
  DOM.btnUseAntidote.disabled = (AdventureState.items.antidote <= 0);
}

// ==========================================
// 24. MODAL: LOJA POKÉMART
// ==========================================
function openShopModal() {
  DOM.shopCurrentGold.textContent = `🪙 ${AdventureState.gold}`;
  DOM.shopItemsGrid.innerHTML = "";

  Object.values(ITEMS_DATA).forEach(item => {
    const card = document.createElement("div");
    card.className = "shop-item-card";

    card.innerHTML = `
      <div class="shop-item-header">
        <span class="shop-item-icon">${item.icon}</span>
        <div>
          <h4 class="shop-item-title">${item.name}</h4>
          <p class="shop-item-desc">${item.description}</p>
        </div>
      </div>
      <div class="shop-item-footer">
        <span class="shop-item-price">🪙 ${item.price} Moedas</span>
        <button class="btn-buy-item" data-id="${item.id}" ${AdventureState.gold < item.price ? "disabled" : ""}>
          Comprar
        </button>
      </div>
    `;

    const buyBtn = card.querySelector(".btn-buy-item");
    buyBtn.addEventListener("click", () => {
      if (AdventureState.gold >= item.price) {
        AdventureState.gold -= item.price;
        AdventureState.items[item.id] = (AdventureState.items[item.id] || 0) + 1;
        SoundFX.coin();
        openShopModal();
        updateAdventureHUD();
      }
    });

    DOM.shopItemsGrid.appendChild(card);
  });

  DOM.shopModal.classList.remove("hidden");
  DOM.shopModal.style.display = "flex";
}

// ==========================================
// 25. MODAL: ENCONTRO MISTERIOSO
// ==========================================
function openMysteryEventModal() {
  DOM.eventChoicesList.innerHTML = "";

  const events = [
    {
      title: "O Mago das Poções",
      icon: "🧙‍♂️",
      desc: "Um sábio viajante oferece uma poção cintilante e pede para você testar.",
      choices: [
        {
          text: "Beber a Poção Misteriosa",
          action: () => {
            if (Math.random() < 0.6) {
              AdventureState.heroHp = Math.min(AdventureState.heroMaxHp, AdventureState.heroHp + 40);
              alert("✨ A poção era revigorante! Você recuperou +40 HP!");
            } else {
              AdventureState.gold += 45;
              alert("🪙 O mago achou sua coragem incrível e te premiou com +45 Poké-Moedas!");
            }
            DOM.eventModal.classList.add("hidden");
            DOM.eventModal.style.display = "none";
            advanceAdventureStage();
          }
        },
        {
          text: "Pedir moedas em vez de poção",
          action: () => {
            AdventureState.gold += 20;
            alert("🪙 O viajante aceitou e te deu +20 Moedas!");
            DOM.eventModal.classList.add("hidden");
            DOM.eventModal.style.display = "none";
            advanceAdventureStage();
          }
        }
      ]
    },
    {
      title: "Baú Antigo nas Sombras",
      icon: "📦",
      desc: "Você encontra um baú de tesouro lacrado com inscrições misteriosas.",
      choices: [
        {
          text: "Forçar a fechadura do baú",
          action: () => {
            AdventureState.gold += 40;
            AdventureState.items.potion = (AdventureState.items.potion || 0) + 1;
            alert("🎉 Sucesso! Você encontrou +40 Moedas e 1 Poção de Cura!");
            DOM.eventModal.classList.add("hidden");
            DOM.eventModal.style.display = "none";
            advanceAdventureStage();
          }
        },
        {
          text: "Examinar com cautela e seguir viagem",
          action: () => {
            AdventureState.items.elixir = (AdventureState.items.elixir || 0) + 1;
            alert("⚡ Você encontrou 1 Elixir de Energia jogado ao lado do baú!");
            DOM.eventModal.classList.add("hidden");
            DOM.eventModal.style.display = "none";
            advanceAdventureStage();
          }
        }
      ]
    }
  ];

  const ev = events[Math.floor(Math.random() * events.length)];
  DOM.eventModalTitle.textContent = ev.title;
  DOM.eventModalIcon.textContent = ev.icon;
  DOM.eventModalDesc.textContent = ev.desc;

  ev.choices.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "event-choice-btn";
    btn.innerHTML = `<strong>${c.text}</strong>`;
    btn.addEventListener("click", c.action);
    DOM.eventChoicesList.appendChild(btn);
  });

  DOM.eventModal.classList.remove("hidden");
  DOM.eventModal.style.display = "flex";
}

// ==========================================
// 26. MODAL: FOGUEIRA DE DESCANSO
// ==========================================
function openRestModal() {
  DOM.restModal.classList.remove("hidden");
  DOM.restModal.style.display = "flex";
}

// ==========================================
// 27. FINAL DA BATALHA & REINÍCIO
// ==========================================
function endGame(isVictory) {
  isBattleOver = true;
  enableAttackButtons(false);
  DOM.criticalAlert.classList.add("hidden");
  DOM.reactionOverlay.classList.add("hidden");

  DOM.modalCard.classList.remove("victory", "defeat");

  const goldEarned = isVictory ? (activeBossConfig ? 60 : 35) : 10;
  if (currentMode === "adventure") {
    AdventureState.gold += goldEarned;
    AdventureState.heroHp = Math.max(1, playerHP);
  }

  if (isVictory) {
    SoundFX.victory();
    DOM.modalCard.classList.add("victory");
    DOM.modalIcon.textContent = "🏆";
    DOM.modalTitle.textContent = "VITÓRIA ÉPICA!";
    DOM.modalDesc.textContent = `${playerPokemon.name} superou o combate contra ${enemyPokemon.name}!`;
    DOM.statReward.textContent = `🪙 +${goldEarned}`;
    addLogMessage(`🏆 Fim de batalha: ${playerPokemon.name} é o grande campeão! Ganhou +${goldEarned} Moedas.`, "log-special");
  } else {
    SoundFX.defeat();
    DOM.modalCard.classList.add("defeat");
    DOM.modalIcon.textContent = "💀";
    DOM.modalTitle.textContent = "DERROTA...";
    DOM.modalDesc.textContent = `${enemyPokemon.name} levou a melhor desta vez. Prepare sua estratégia e tente novamente!`;
    DOM.statReward.textContent = "🪙 +10";
    addLogMessage(`💀 Fim de batalha: Você foi derrotado neste confronto.`, "log-enemy");
  }

  DOM.statTurns.textContent = `${totalTurns} turnos`;
  DOM.statCombos.textContent = `${totalCombosAchieved} combos`;

  DOM.resultModal.classList.remove("hidden");
  DOM.resultModal.style.display = "flex";
}

function handlePostBattleContinue() {
  hideAllModals();

  if (currentMode === "adventure") {
    if (playerHP > 0) {
      advanceAdventureStage();
    } else {
      // Derrota na aventura: reinicia para seleção
      alert("Sua jornada na Aventura terminou. Tente novamente com um novo campeão!");
      resetGameToSelection();
    }
  } else {
    resetGameToSelection();
  }
}

function resetGameToSelection() {
  hideAllModals();
  showScreen("selection");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================
// 28. HELPERS VISUAIS E LOG
// ==========================================
function showFloatingText(container, text, type = "normal") {
  const popup = document.createElement("span");
  popup.className = `damage-popup ${type}`;
  popup.textContent = text;
  container.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 1200);
}

function addLogMessage(message, className = "log-player") {
  const p = document.createElement("p");
  p.className = `log-entry ${className}`;
  p.innerHTML = message;
  DOM.battleLog.appendChild(p);
  DOM.battleLog.scrollTop = DOM.battleLog.scrollHeight;
}

function getAttackName(type) {
  switch (type) {
    case "quick": return "Ataque Rápido ⚡";
    case "strong": return "Ataque Forte 💥";
    case "special": return "Ataque Especial 🔥";
    default: return "Ataque";
  }
}

function enableAttackButtons(enabled) {
  DOM.btnQuick.disabled = !enabled;
  DOM.btnStrong.disabled = !enabled;

  const currentCost = activeBattleEvent && activeBattleEvent.modifyEnergyCost
    ? activeBattleEvent.modifyEnergyCost(SPECIAL_COST)
    : SPECIAL_COST;

  DOM.btnSpecial.disabled = !enabled || (playerEP < currentCost);
}

// ==========================================
// 29. EVENT LISTENERS DO JOGO
// ==========================================
function setupEventListeners() {
  // Seletores de Modo de Jogo
  DOM.modeQuick.addEventListener("click", () => setGameMode("quick"));
  DOM.modeAdventure.addEventListener("click", () => setGameMode("adventure"));
  DOM.modeBoss.addEventListener("click", () => setGameMode("boss"));

  // Pílulas de Seleção de Arena
  const arenaPills = DOM.arenaPills.querySelectorAll(".arena-pill");
  arenaPills.forEach(pill => {
    pill.addEventListener("click", () => {
      arenaPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      selectedArenaKey = pill.dataset.arena;
      updateArenaTheme(selectedArenaKey);
    });
  });

  // Botões de Ataque
  DOM.btnQuick.addEventListener("click", () => handlePlayerAttack("quick"));
  DOM.btnStrong.addEventListener("click", () => handlePlayerAttack("strong"));
  DOM.btnSpecial.addEventListener("click", () => handlePlayerAttack("special"));

  // Reação Rápida / QTE (Clique)
  DOM.btnQteDefend.addEventListener("click", () => resolveReaction("defend", "incoming"));
  DOM.btnQteDodge.addEventListener("click", () => resolveReaction("dodge", "incoming"));

  // Reação Rápida via Teclado (D = Defesa, Espaço = Esquiva)
  window.addEventListener("keydown", (e) => {
    if (!isReactionActive || reactionResolved) return;

    if (e.key === "d" || e.key === "D") {
      e.preventDefault();
      resolveReaction("defend", "incoming");
    } else if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      resolveReaction("dodge", "incoming");
    }
  });

  // Mochila durante Batalha
  DOM.btnUsePotion.addEventListener("click", () => ITEMS_DATA.potion.use());
  DOM.btnUseElixir.addEventListener("click", () => ITEMS_DATA.elixir.use());
  DOM.btnUseAntidote.addEventListener("click", () => ITEMS_DATA.antidote.use());

  // Navegação e Modais
  DOM.btnBackSelect.addEventListener("click", () => {
    if (confirm("Deseja sair do combate atual?")) {
      resetGameToSelection();
    }
  });

  DOM.btnPlayAgain.addEventListener("click", handlePostBattleContinue);

  // Modal da Loja
  DOM.btnCloseShop.addEventListener("click", () => {
    DOM.shopModal.classList.add("hidden");
    DOM.shopModal.style.display = "none";
    advanceAdventureStage();
  });

  // Modal de Descanso
  DOM.btnRestHeal.addEventListener("click", () => {
    AdventureState.heroHp = Math.min(AdventureState.heroMaxHp, AdventureState.heroHp + 50);
    SoundFX.heal();
    alert("🌿 Seu Pokémon descansou e recuperou +50 HP!");
    DOM.restModal.classList.add("hidden");
    DOM.restModal.style.display = "none";
    advanceAdventureStage();
  });

  DOM.btnRestTrain.addEventListener("click", () => {
    AdventureState.startEnergy = 50;
    SoundFX.special();
    alert("⚡ Treinamento concluído! Você começará as próximas lutas com 50 EP!");
    DOM.restModal.classList.add("hidden");
    DOM.restModal.style.display = "none";
    advanceAdventureStage();
  });

  // Modal de Info da Arena
  DOM.arenaBadge.addEventListener("click", () => {
    DOM.arenaInfoIcon.textContent = currentArena.icon;
    DOM.arenaInfoTitle.textContent = currentArena.name;
    DOM.arenaInfoDesc.textContent = currentArena.description;
    DOM.arenaInfoEffect.innerHTML = `<strong>Efeito em Combate:</strong> ${currentArena.effectText}`;
    DOM.arenaInfoModal.classList.remove("hidden");
    DOM.arenaInfoModal.style.display = "flex";
  });

  DOM.btnCloseArenaInfo.addEventListener("click", () => {
    DOM.arenaInfoModal.classList.add("hidden");
    DOM.arenaInfoModal.style.display = "none";
  });

  // Sair da Aventura
  DOM.btnAdvQuit.addEventListener("click", () => {
    if (confirm("Deseja abandonar a rota de aventura e voltar para o menu principal?")) {
      resetGameToSelection();
    }
  });

  DOM.btnAdvOpenBag.addEventListener("click", () => {
    alert(`🎒 Mochila do Campeão:\n- 🧪 Poções de HP: ${AdventureState.items.potion || 0}\n- ⚡ Elixires de EP: ${AdventureState.items.elixir || 0}\n- 💊 Antídotos: ${AdventureState.items.antidote || 0}\n- 🪙 Poké-Moedas: ${AdventureState.gold}`);
  });
}

// Inicia aplicação após o carregamento da página
document.addEventListener("DOMContentLoaded", initApp);
