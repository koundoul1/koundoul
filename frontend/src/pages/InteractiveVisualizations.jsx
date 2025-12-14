import React, { useState } from 'react';
import { 
  Globe, 
  Atom, 
  Zap, 
  Triangle, 
  Square, 
  Circle,
  Eye,
  Layers,
  BarChart3,
  PieChart,
  Droplets,
  FlaskConical,
  Gauge
} from 'lucide-react';

// Composants de visualisation - déclarés en dehors du composant principal
const PythagorasDemo = () => {
  const [sideA, setSideA] = useState(3);
  const [sideB, setSideB] = useState(4);
  const sideC = Math.sqrt(sideA * sideA + sideB * sideB);
  const areaA = sideA * sideA;
  const areaB = sideB * sideB;

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4">Théorème de Pythagore : a² + b² = c²</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2">Côté A: {sideA}</label>
            <input type="range" min="1" max="10" value={sideA} onChange={(e) => setSideA(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-white text-sm mb-2">Côté B: {sideB}</label>
            <input type="range" min="1" max="10" value={sideB} onChange={(e) => setSideB(Number(e.target.value))} className="w-full" />
          </div>
          <div className="bg-black/20 p-4 rounded text-white text-sm">
            <div>a² = {sideA}² = {areaA}</div>
            <div>b² = {sideB}² = {areaB}</div>
            <div>c² = a² + b² = {areaA + areaB}</div>
            <div className="font-bold text-green-400 mt-2">c = √{areaA + areaB} = {sideC.toFixed(2)}</div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <svg width="250" height="200" viewBox="0 0 250 200" className="border border-gray-600 rounded bg-gray-900">
            <line x1="50" y1="50" x2="50" y2={50 + sideA * 15} stroke="#3b82f6" strokeWidth="3" />
            <text x="45" y={75 + sideA * 7.5} fill="#3b82f6" fontSize="14" fontWeight="bold">a={sideA}</text>
            <line x1="50" y1={50 + sideA * 15} x2={50 + sideB * 15} y2={50 + sideA * 15} stroke="#ef4444" strokeWidth="3" />
            <text x={75 + sideB * 7.5} y={55 + sideA * 15} fill="#ef4444" fontSize="14" fontWeight="bold">b={sideB}</text>
            <line x1="50" y1="50" x2={50 + sideB * 15} y2={50 + sideA * 15} stroke="#10b981" strokeWidth="3" />
            <text x={75 + sideB * 7.5} y={35 + sideA * 7.5} fill="#10b981" fontSize="12" fontWeight="bold">c={sideC.toFixed(1)}</text>
            <path d={`M 50 ${50 + sideA * 15 - 10} L 50 ${50 + sideA * 15} L 60 ${50 + sideA * 15}`} fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const InteractiveVisualizations = () => {
  const [activeTab, setActiveTab] = useState('math');
  const [selectedVisualization, setSelectedVisualization] = useState(null);

  // Visualisations disponibles
  const visualizations = {
    math: [
      {
        id: 'pythagoras',
        title: 'Théorème de Pythagore',
        description: 'Construction interactive du théorème',
        icon: <Triangle className="h-6 w-6" />,
        component: 'PythagorasDemo'
      },
      {
        id: 'functions',
        title: 'Fonctions 3D',
        description: 'Manipulation de fonctions mathématiques',
        icon: <Square className="h-6 w-6" />,
        component: 'Functions3D'
      },
      {
        id: 'geometry',
        title: 'Géométrie Spatiale',
        description: 'Formes géométriques en 3D',
        icon: <Circle className="h-6 w-6" />,
        component: 'Geometry3D'
      },
      {
        id: 'graphs',
        title: 'Graphes et Statistiques',
        description: 'Visualisation de données',
        icon: <BarChart3 className="h-6 w-6" />,
        component: 'GraphsAndStats'
      },
      {
        id: 'trigonometry',
        title: 'Trigonométrie Interactive',
        description: 'Cercle trigonométrique animé',
        icon: <Circle className="h-6 w-6" />,
        component: 'TrigonometryDemo'
      },
      {
        id: 'integral',
        title: 'Intégrales et Aires',
        description: 'Calcul d\'aires sous les courbes',
        icon: <PieChart className="h-6 w-6" />,
        component: 'IntegralDemo'
      }
    ],
    physics: [
      {
        id: 'pendulum',
        title: 'Pendule Simple',
        description: 'Simulation du mouvement pendulaire',
        icon: <Zap className="h-6 w-6" />,
        component: 'PendulumLab'
      },
      {
        id: 'projectile',
        title: 'Mouvement de Projectile',
        description: 'Trajectoire parabolique interactive',
        icon: <Globe className="h-6 w-6" />,
        component: 'ProjectileMotion'
      },
      {
        id: 'circuits',
        title: 'Circuits Électriques',
        description: 'Laboratoire virtuel de circuits',
        icon: <Zap className="h-6 w-6" />,
        component: 'CircuitLab'
      },
      {
        id: 'waves',
        title: 'Ondes et Interférences',
        description: 'Simulation d\'ondes superposées',
        icon: <Layers className="h-6 w-6" />,
        component: 'WaveSimulation'
      },
      {
        id: 'shm',
        title: 'Mouvement Harmonique Simple',
        description: 'Oscillations et ressorts',
        icon: <Layers className="h-6 w-6" />,
        component: 'SimpleHarmonicMotion'
      },
      {
        id: 'coulomb',
        title: 'Loi de Coulomb',
        description: 'Forces électrostatiques',
        icon: <Zap className="h-6 w-6" />,
        component: 'CoulombLaw'
      },
      {
        id: 'refraction',
        title: 'Prisme et Réfraction',
        description: 'Optique géométrique',
        icon: <Eye className="h-6 w-6" />,
        component: 'RefractionDemo'
      }
    ],
    chemistry: [
      {
        id: 'molecules',
        title: 'Molécules 3D',
        description: 'Visualisation de molécules tournantes',
        icon: <Atom className="h-6 w-6" />,
        component: 'MoleculeViewer'
      },
      {
        id: 'reactions',
        title: 'Réactions Chimiques',
        description: 'Animation des réactions',
        icon: <Zap className="h-6 w-6" />,
        component: 'ReactionAnimation'
      },
      {
        id: 'periodic',
        title: 'Tableau Périodique Interactif',
        description: 'Exploration des éléments',
        icon: <Globe className="h-6 w-6" />,
        component: 'PeriodicTable'
      },
      {
        id: 'kinetics',
        title: 'Cinétique Chimique',
        description: 'Vitesse des réactions',
        icon: <Gauge className="h-6 w-6" />,
        component: 'ChemicalKinetics'
      },
      {
        id: 'equilibrium',
        title: 'Équilibre Chimique',
        description: 'Principe de Le Chatelier',
        icon: <Droplets className="h-6 w-6" />,
        component: 'ChemicalEquilibrium'
      },
      {
        id: 'ph',
        title: 'pH et Acidité',
        description: 'Indicateurs et pH-métrie',
        icon: <FlaskConical className="h-6 w-6" />,
        component: 'PHDemo'
      }
    ]
  };

  // Fonction pour rendre chaque visualisation
  const renderVisualization = (componentName) => {
    switch(componentName) {
      case 'PythagorasDemo':
        return <PythagorasDemo />;
      case 'Functions3D':
        return <Functions3D />;
      case 'Geometry3D':
        return <Geometry3D />;
      case 'GraphsAndStats':
        return <GraphsAndStats />;
      case 'TrigonometryDemo':
        return <TrigonometryDemo />;
      case 'IntegralDemo':
        return <IntegralDemo />;
      case 'PendulumLab':
        return <PendulumLab />;
      case 'ProjectileMotion':
        return <ProjectileMotion />;
      case 'CircuitLab':
        return <CircuitLab />;
      case 'WaveSimulation':
        return <WaveSimulation />;
      case 'SimpleHarmonicMotion':
        return <SimpleHarmonicMotion />;
      case 'CoulombLaw':
        return <CoulombLaw />;
      case 'RefractionDemo':
        return <RefractionDemo />;
      case 'MoleculeViewer':
        return <MoleculeViewer />;
      case 'ReactionAnimation':
        return <ReactionAnimation />;
      case 'PeriodicTable':
        return <PeriodicTable />;
      case 'ChemicalKinetics':
        return <ChemicalKinetics />;
      case 'ChemicalEquilibrium':
        return <ChemicalEquilibrium />;
      case 'PHDemo':
        return <PHDemo />;
      default:
        return (
          <div className="bg-white/5 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
            <p className="text-gray-400 text-center">
              Cette visualisation sera disponible prochainement.<br />
              Composant : {componentName}
            </p>
          </div>
        );
    }
  };

  // Composant Pythagoras Demo
  const PythagorasDemo = () => {
    const [sideA, setSideA] = useState(3);
    const [sideB, setSideB] = useState(4);
    const sideC = Math.sqrt(sideA * sideA + sideB * sideB);
    const areaA = sideA * sideA;
    const areaB = sideB * sideB;

    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Théorème de Pythagore : a² + b² = c²</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2">Côté A: {sideA}</label>
              <input type="range" min="1" max="10" value={sideA} onChange={(e) => setSideA(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Côté B: {sideB}</label>
              <input type="range" min="1" max="10" value={sideB} onChange={(e) => setSideB(Number(e.target.value))} className="w-full" />
            </div>
            <div className="bg-black/20 p-4 rounded text-white text-sm">
              <div>a² = {sideA}² = {areaA}</div>
              <div>b² = {sideB}² = {areaB}</div>
              <div>c² = a² + b² = {areaA + areaB}</div>
              <div className="font-bold text-green-400 mt-2">c = √{areaA + areaB} = {sideC.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="250" height="200" viewBox="0 0 250 200" className="border border-gray-600 rounded bg-gray-900">
              <line x1="50" y1="50" x2="50" y2={50 + sideA * 15} stroke="#3b82f6" strokeWidth="3" />
              <text x="45" y={75 + sideA * 7.5} fill="#3b82f6" fontSize="14" fontWeight="bold">a={sideA}</text>
              <line x1="50" y1={50 + sideA * 15} x2={50 + sideB * 15} y2={50 + sideA * 15} stroke="#ef4444" strokeWidth="3" />
              <text x={75 + sideB * 7.5} y={55 + sideA * 15} fill="#ef4444" fontSize="14" fontWeight="bold">b={sideB}</text>
              <line x1="50" y1="50" x2={50 + sideB * 15} y2={50 + sideA * 15} stroke="#10b981" strokeWidth="3" />
              <text x={75 + sideB * 7.5} y={35 + sideA * 7.5} fill="#10b981" fontSize="12" fontWeight="bold">c={sideC.toFixed(1)}</text>
              <path d={`M 50 ${50 + sideA * 15 - 10} L 50 ${50 + sideA * 15} L 60 ${50 + sideA * 15}`} fill="none" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Fonctions 3D
  const Functions3D = () => {
    const [functionType, setFunctionType] = useState('sine');
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Graphiques de Fonctions</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2">Type:</label>
            <select value={functionType} onChange={(e) => setFunctionType(e.target.value)} className="koundoul-input w-full">
              <option value="sine">sin(x)</option>
              <option value="cos">cos(x)</option>
              <option value="quadratic">x²</option>
            </select>
          </div>
          <svg width="100%" height="300" viewBox="0 0 600 300" className="bg-gray-900 rounded">
            <line x1="0" y1="150" x2="600" y2="150" stroke="#666" />
            <line x1="300" y1="0" x2="300" y2="300" stroke="#666" />
            <path d={`M 0 150 ${Array.from({length: 600}, (_, i) => {
              const x = (i - 300) / 50;
              let y = 0;
              if (functionType === 'sine') y = -Math.sin(x) * 100;
              else if (functionType === 'cos') y = -Math.cos(x) * 100;
              else if (functionType === 'quadratic') y = -(x * x / 100) * 100;
              return `L ${i} ${150 + y}`;
            }).join(' ')}`} fill="none" stroke="#3b82f6" strokeWidth="2" />
          </svg>
        </div>
      </div>
    );
  };

  // Géométrie 3D
  const Geometry3D = () => (
    <div className="bg-white/5 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4">Formes Géométriques 3D</h3>
      <div className="grid grid-cols-3 gap-4">
        {['Cube', 'Sphère', 'Pyramide'].map((shape, idx) => (
          <div key={idx} className="bg-black/20 rounded-lg p-4 text-center">
            <div className="text-white font-bold mb-2">{shape}</div>
            <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
              {idx === 0 && (
                <>
                  <polygon points="40,20 80,20 90,40 50,40" fill="#3b82f6" opacity="0.6" />
                  <polygon points="50,40 90,40 80,60 40,60" fill="#3b82f6" />
                </>
              )}
              {idx === 1 && <circle cx="60" cy="60" r="30" fill="#ef4444" opacity="0.7" />}
              {idx === 2 && (
                <>
                  <polygon points="60,20 90,60 30,60" fill="#10b981" opacity="0.7" />
                  <polygon points="30,60 90,60 60,80" fill="#10b981" />
                </>
              )}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );

  // Graphiques et Statistiques
  const GraphsAndStats = () => {
    const data = [65, 59, 80, 81, 56, 55, 40, 75, 45, 70];
    const max = Math.max(...data);
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Graphique de Barres</h3>
        <svg width="100%" height="250" viewBox="0 0 500 250" className="bg-gray-900 rounded">
          {data.map((value, index) => (
            <g key={index}>
              <rect x={index * 50 + 20} y={200 - (value / max) * 180} width="30" height={(value / max) * 180} fill="#3b82f6" />
              <text x={index * 50 + 35} y="230" fill="white" fontSize="12" textAnchor="middle">{index + 1}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // Trigonométrie
  const TrigonometryDemo = () => {
    const [angle, setAngle] = useState(30);
    const angleRad = angle * Math.PI / 180;
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Cercle Trigonométrique</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2">Angle: {angle}°</label>
              <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" />
            </div>
            <div className="bg-black/20 p-4 rounded text-white text-sm">
              <div>sin({angle}°) = {Math.sin(angleRad).toFixed(3)}</div>
              <div>cos({angle}°) = {Math.cos(angleRad).toFixed(3)}</div>
              <div>tan({angle}°) = {Math.tan(angleRad).toFixed(3)}</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="250" height="250" viewBox="-130 -130 260 260" className="bg-gray-900 rounded">
              <circle cx="0" cy="0" r="100" fill="none" stroke="#888" strokeWidth="2" />
              <line x1="-120" y1="0" x2="120" y2="0" stroke="#666" strokeWidth="1" />
              <line x1="0" y1="-120" x2="0" y2="120" stroke="#666" strokeWidth="1" />
              <line x1="0" y1="0" x2={100*Math.cos(angleRad)} y2={-100*Math.sin(angleRad)} stroke="#3b82f6" strokeWidth="2" />
              <circle cx={100*Math.cos(angleRad)} cy={-100*Math.sin(angleRad)} r="5" fill="#ef4444" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Intégrales
  const IntegralDemo = () => {
    const [a, setA] = useState(0);
    const [b, setB] = useState(Math.PI);
    const integral = Math.sin(b) - Math.sin(a);
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Intégrale de sin(x)</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-white text-sm mb-2">a: {a.toFixed(2)}</label><input type="range" min="0" max="6.28" step="0.1" value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-white text-sm mb-2">b: {b.toFixed(2)}</label><input type="range" min="0" max="6.28" step="0.1" value={b} onChange={(e) => setB(Number(e.target.value))} className="w-full" /></div>
            <div className="bg-black/20 p-4 rounded text-white text-sm">∫sin(x)dx = {integral.toFixed(3)}</div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-900 rounded">
              <path d={`M 0 100 ${Array.from({length: 300}, (_, i) => {
                const x = i * 6.28 / 300;
                return `L ${i} ${100 - 50 * Math.sin(x)}`;
              }).join(' ')}`} fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Pendule
  const PendulumLab = () => {
    const [length, setLength] = useState(10);
    const [angle, setAngle] = useState(30);
    const period = 2 * Math.PI * Math.sqrt(length / 9.81);
    const frequency = 1 / period;
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Pendule Simple</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-white text-sm mb-2">Longueur: {length} m</label><input type="range" min="5" max="20" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-white text-sm mb-2">Angle: {angle}°</label><input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" /></div>
            <div className="bg-black/20 p-4 rounded text-white text-sm">
              <div>T = {period.toFixed(2)} s</div>
              <div>f = {frequency.toFixed(2)} Hz</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="200" height="300" viewBox="0 0 200 300" className="bg-gray-900 rounded">
              <line x1="100" y1="0" x2={100 + 50 * Math.sin(angle * Math.PI / 180)} y2={50 * Math.cos(angle * Math.PI / 180)} stroke="white" strokeWidth="2" />
              <circle cx={100 + 50 * Math.sin(angle * Math.PI / 180)} cy={50 * Math.cos(angle * Math.PI / 180)} r="10" fill="#ef4444" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Projectile
  const ProjectileMotion = () => {
    const [velocity, setVelocity] = useState(20);
    const [angle, setAngle] = useState(45);
    const angleRad = angle * Math.PI / 180;
    const maxRange = (velocity * velocity * Math.sin(2 * angleRad)) / 9.81;
    const maxHeight = (velocity * velocity * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * 9.81);
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Mouvement de Projectile</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-white text-sm mb-2">Vitesse: {velocity} m/s</label><input type="range" min="5" max="50" value={velocity} onChange={(e) => setVelocity(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-white text-sm mb-2">Angle: {angle}°</label><input type="range" min="0" max="90" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" /></div>
            <div className="bg-black/20 p-4 rounded text-white text-sm">
              <div>Portée: {maxRange.toFixed(2)} m</div>
              <div>Hauteur: {maxHeight.toFixed(2)} m</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-900 rounded">
              <line x1="0" y1="180" x2="300" y2="180" stroke="#888" strokeWidth="2" />
              <path d={`M 10 180 Q ${maxRange/2 + 10} ${180 - maxHeight*2} ${maxRange + 10} 180`} fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Circuit
  const CircuitLab = () => (
    <div className="bg-white/5 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4">Circuit Électrique</h3>
      <div className="bg-black/20 p-4 rounded text-white text-sm">
        <div>Circuit: Batterie - Résistance - LED</div>
        <div>Courant: 25 mA</div>
        <div>Voltage: 5V</div>
      </div>
    </div>
  );

  // Ondes
  const WaveSimulation = () => {
    const [frequency, setFrequency] = useState(2);
    const [amplitude, setAmplitude] = useState(30);
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Simulation d'Ondes</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-white text-sm mb-2">Fréquence: {frequency} Hz</label><input type="range" min="1" max="5" step="0.1" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-white text-sm mb-2">Amplitude: {amplitude}</label><input type="range" min="10" max="60" value={amplitude} onChange={(e) => setAmplitude(Number(e.target.value))} className="w-full" /></div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-900 rounded">
              <path d={`M 0 100 ${Array.from({length: 300}, (_, i) => {
                return `L ${i} ${100 + amplitude * Math.sin(i * frequency * 0.1)}`;
              }).join(' ')}`} fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Mouvement Harmonique Simple
  const SimpleHarmonicMotion = () => {
    const [amplitude, setAmplitude] = useState(50);
    const [frequency, setFrequency] = useState(1);
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Mouvement Harmonique Simple</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-white text-sm mb-2">Amplitude: {amplitude}</label><input type="range" min="10" max="100" value={amplitude} onChange={(e) => setAmplitude(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-white text-sm mb-2">Fréquence: {frequency} Hz</label><input type="range" min="0.5" max="5" step="0.1" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-full" /></div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-900 rounded">
              <path d={`M 0 100 ${Array.from({length: 300}, (_, i) => {
                return `L ${i} ${100 + amplitude * Math.sin(i * frequency / 10)}`;
              }).join(' ')}`} fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Coulomb
  const CoulombLaw = () => {
    const [q1, setQ1] = useState(1);
    const [q2, setQ2] = useState(1);
    const [distance, setDistance] = useState(1);
    const k = 9e9;
    const force = (k * q1 * q2) / (distance * distance);
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Loi de Coulomb</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-white text-sm mb-2">q1: {q1} µC</label><input type="range" min="1" max="10" value={q1} onChange={(e) => setQ1(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-white text-sm mb-2">q2: {q2} µC</label><input type="range" min="1" max="10" value={q2} onChange={(e) => setQ2(Number(e.target.value))} className="w-full" /></div>
            <div><label className="block text-white text-sm mb-2">Distance: {distance} m</label><input type="range" min="0.5" max="5" step="0.1" value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full" /></div>
            <div className="bg-black/20 p-4 rounded text-white text-sm">F = {(force/1e6).toFixed(2)} N</div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-900 rounded">
              <circle cx="50" cy="100" r="15" fill="#ef4444" />
              <text x="42" y="105" fill="white" fontSize="12" fontWeight="bold">+</text>
              <circle cx="250" cy="100" r="15" fill="#ef4444" />
              <text x="242" y="105" fill="white" fontSize="12" fontWeight="bold">+</text>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Réfraction
  const RefractionDemo = () => {
    const [angleIncident, setAngleIncident] = useState(30);
    const n1 = 1;
    const n2 = 1.5;
    const angleRefracte = Math.asin((n1 * Math.sin(angleIncident * Math.PI / 180)) / n2) * 180 / Math.PI;
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Réfraction de la Lumière</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-white text-sm mb-2">Angle incident: {angleIncident}°</label><input type="range" min="0" max="90" value={angleIncident} onChange={(e) => setAngleIncident(Number(e.target.value))} className="w-full" /></div>
            <div className="bg-black/20 p-4 rounded text-white text-sm">
              <div>n₁ = {n1}</div>
              <div>n₂ = {n2}</div>
              <div>Angle réfracté = {angleRefracte.toFixed(1)}°</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-900 rounded">
              <line x1="0" y1="100" x2="300" y2="100" stroke="#3b82f6" strokeWidth="2" />
              <line x1="100" y1="0" x2="200" y2="100" stroke="yellow" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Molécules 3D interactives
  const MoleculeViewer = () => {
    const [selectedMolecule, setSelectedMolecule] = useState(0);
    const [angleY, setAngleY] = useState(0);
    const [angleX, setAngleX] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const molecules = [
      { 
        name: 'Eau (H₂O)', 
        formula: 'H₂O',
        atoms: [
          { element: 'O', x: 0, y: 0, z: 0, color: '#8b5cf6' },
          { element: 'H', x: -0.96, y: 0.24, z: 0, color: '#ef4444' },
          { element: 'H', x: 0.96, y: 0.24, z: 0, color: '#ef4444' }
        ],
        bonds: [[0, 1], [0, 2]]
      },
      { 
        name: 'Méthane (CH₄)', 
        formula: 'CH₄',
        atoms: [
          { element: 'C', x: 0, y: 0, z: 0, color: '#6366f1' },
          { element: 'H', x: 0, y: 1, z: 0, color: '#ef4444' },
          { element: 'H', x: 0, y: -0.333, z: 0.943, color: '#ef4444' },
          { element: 'H', x: -0.816, y: -0.333, z: -0.471, color: '#ef4444' },
          { element: 'H', x: 0.816, y: -0.333, z: -0.471, color: '#ef4444' }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [0, 4]]
      },
      { 
        name: 'Dioxyde de Carbone (CO₂)', 
        formula: 'CO₂',
        atoms: [
          { element: 'C', x: 0, y: 0, z: 0, color: '#6366f1' },
          { element: 'O', x: -1.16, y: 0, z: 0, color: '#8b5cf6' },
          { element: 'O', x: 1.16, y: 0, z: 0, color: '#8b5cf6' }
        ],
        bonds: [[0, 1], [0, 2]]
      },
      {
        name: 'Ammoniac (NH₃)',
        formula: 'NH₃',
        atoms: [
          { element: 'N', x: 0, y: 0, z: 0, color: '#3b82f6' },
          { element: 'H', x: 0.95, y: 0, z: 0, color: '#ef4444' },
          { element: 'H', x: -0.317, y: 0.905, z: 0, color: '#ef4444' },
          { element: 'H', x: -0.317, y: -0.452, z: 0.783, color: '#ef4444' }
        ],
        bonds: [[0, 1], [0, 2], [0, 3]]
      },
      {
        name: 'Éthane (C₂H₆)',
        formula: 'C₂H₆',
        atoms: [
          { element: 'C', x: -0.75, y: 0, z: 0, color: '#6366f1' },
          { element: 'C', x: 0.75, y: 0, z: 0, color: '#6366f1' },
          { element: 'H', x: -0.75, y: 1, z: 0, color: '#ef4444' },
          { element: 'H', x: -1.25, y: -0.5, z: 0.866, color: '#ef4444' },
          { element: 'H', x: -1.25, y: -0.5, z: -0.866, color: '#ef4444' },
          { element: 'H', x: 0.75, y: 1, z: 0, color: '#ef4444' },
          { element: 'H', x: 1.25, y: -0.5, z: 0.866, color: '#ef4444' },
          { element: 'H', x: 1.25, y: -0.5, z: -0.866, color: '#ef4444' }
        ],
        bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [1, 6], [1, 7]]
      }
    ];

    React.useEffect(() => {
      if (!isPlaying) return;
      const interval = setInterval(() => {
        setAngleY(prev => (prev + 2) % 360);
      }, 50);
      return () => clearInterval(interval);
    }, [isPlaying]);

    const rotatePoint = (point, angleX, angleY) => {
      const radX = (angleX * Math.PI) / 180;
      const radY = (angleY * Math.PI) / 180;

      let { x, y, z } = point;
      
      // Rotation autour de l'axe Y
      const tempX = x;
      x = tempX * Math.cos(radY) - z * Math.sin(radY);
      z = tempX * Math.sin(radY) + z * Math.cos(radY);
      
      // Rotation autour de l'axe X
      const tempY = y;
      y = tempY * Math.cos(radX) - z * Math.sin(radX);
      z = tempY * Math.sin(radX) + z * Math.cos(radX);
      
      return { x, y, z };
    };

    const project3D = (point, distance = 5) => {
      const scale = 80;
      const x2d = (point.x / (distance + point.z)) * scale;
      const y2d = (point.y / (distance + point.z)) * scale;
      return { x: x2d, y: y2d, r: 10 + (point.z + 2) * 5 };
    };

    const mol = molecules[selectedMolecule];

    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Molécules 3D Interactives</h3>
        
        {/* Sélection de la molécule */}
        <div className="mb-4">
          <label className="block text-white text-sm mb-2">Choisir une molécule:</label>
          <select 
            value={selectedMolecule} 
            onChange={(e) => setSelectedMolecule(Number(e.target.value))}
            className="koundoul-input w-full"
          >
            {molecules.map((mol, idx) => (
              <option key={idx} value={idx}>{mol.name} ({mol.formula})</option>
            ))}
          </select>
        </div>

        {/* Contrôles */}
        <div className="mb-4 flex gap-4 items-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isPlaying ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
            }`}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Lecture'}
          </button>
          <button
            onClick={() => setAngleY(0)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            🔄 Réinitialiser
          </button>
          <div className="text-white text-sm">
            Rotation Y: {angleY.toFixed(0)}°
          </div>
        </div>

        {/* Visualisation 3D */}
        <div className="flex items-center justify-center bg-black/20 rounded-lg p-8">
          <svg width="400" height="400" viewBox="0 0 400 400" className="border border-gray-600 rounded bg-gray-900">
            {/* Axes de référence */}
            <line x1="50" y1="200" x2="350" y2="200" stroke="#333" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="200" y1="50" x2="200" y2="350" stroke="#333" strokeWidth="1" strokeDasharray="5,5" />
            
            {/* Liaisons */}
            {mol.bonds.map((bond, idx) => {
              const atom1 = rotatePoint(mol.atoms[bond[0]], angleX, angleY);
              const atom2 = rotatePoint(mol.atoms[bond[1]], angleX, angleY);
              const p1 = project3D(atom1);
              const p2 = project3D(atom2);
              
              return (
                <line
                  key={`bond-${idx}`}
                  x1={200 + p1.x}
                  y1={200 - p1.y}
                  x2={200 + p2.x}
                  y2={200 - p2.y}
                  stroke="white"
                  strokeWidth="3"
                  opacity="0.6"
                />
              );
            })}
            
            {/* Atomes */}
            {mol.atoms.map((atom, idx) => {
              const rotated = rotatePoint(atom, angleX, angleY);
              const projected = project3D(rotated);
              
              return (
                <g key={`atom-${idx}`}>
                  <circle
                    cx={200 + projected.x}
                    cy={200 - projected.y}
                    r={projected.r}
                    fill={atom.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={200 + projected.x}
                    y={200 - projected.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {atom.element}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Informations */}
        <div className="mt-4 bg-black/20 rounded-lg p-4">
          <div className="text-white font-bold text-lg mb-2">{mol.name}</div>
          <div className="text-gray-300 text-sm mb-2">Formule: <strong>{mol.formula}</strong></div>
          <div className="text-gray-400 text-xs">
            💡 Conseil: Cliquez sur "Pause" pour explorer la molécule manuellement
          </div>
        </div>
      </div>
    );
  };

  // Réactions Chimiques Animées
  const ReactionAnimation = () => {
    const [selectedReaction, setSelectedReaction] = useState(0);
    const [animationStep, setAnimationStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const reactions = [
      {
        name: 'Combustion du Méthane',
        equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
        type: 'Combustion',
        energy: 'Libère: 890 kJ/mol',
        reactants: [
          { formula: 'CH₄', color: '#3b82f6', count: 1 },
          { formula: 'O₂', color: '#ef4444', count: 2 }
        ],
        products: [
          { formula: 'CO₂', color: '#10b981', count: 1 },
          { formula: 'H₂O', color: '#60a5fa', count: 2 }
        ],
        description: 'Réaction exothermique permettant la production d\'énergie'
      },
      {
        name: 'Synthese de l\'Eau',
        equation: '2H₂ + O₂ → 2H₂O',
        type: 'Synthèse',
        energy: 'Libère: 286 kJ/mol',
        reactants: [
          { formula: 'H₂', color: '#60a5fa', count: 2 },
          { formula: 'O₂', color: '#ef4444', count: 1 }
        ],
        products: [
          { formula: 'H₂O', color: '#60a5fa', count: 2 }
        ],
        description: 'Formation d\'eau à partir de ses éléments'
      },
      {
        name: 'Réspiration Cellulaire',
        equation: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
        type: 'Oxydation',
        energy: 'Libère: 2870 kJ/mol',
        reactants: [
          { formula: 'C₆H₁₂O₆', color: '#8b5cf6', count: 1 },
          { formula: 'O₂', color: '#ef4444', count: 6 }
        ],
        products: [
          { formula: 'CO₂', color: '#10b981', count: 6 },
          { formula: 'H₂O', color: '#60a5fa', count: 6 }
        ],
        description: 'Transformation du glucose en présence d\'oxygène'
      },
      {
        name: 'Photosynthèse',
        equation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
        type: 'Synthèse',
        energy: 'Nécessite: 2870 kJ/mol',
        reactants: [
          { formula: 'CO₂', color: '#10b981', count: 6 },
          { formula: 'H₂O', color: '#60a5fa', count: 6 }
        ],
        products: [
          { formula: 'C₆H₁₂O₆', color: '#8b5cf6', count: 1 },
          { formula: 'O₂', color: '#ef4444', count: 6 }
        ],
        description: 'Transformation du dioxyde de carbone en glucose'
      },
      {
        name: 'Oxydation du Fer',
        equation: '4Fe + 3O₂ → 2Fe₂O₃',
        type: 'Oxydation',
        energy: 'Libère: 1648 kJ/mol',
        reactants: [
          { formula: 'Fe', color: '#6366f1', count: 4 },
          { formula: 'O₂', color: '#ef4444', count: 3 }
        ],
        products: [
          { formula: 'Fe₂O₃', color: '#f59e0b', count: 2 }
        ],
        description: 'Formation de la rouille (oxyde de fer)'
      },
      {
        name: 'Neutralisation Acide-Base',
        equation: 'HCl + NaOH → NaCl + H₂O',
        type: 'Neutralisation',
        energy: 'Libère: 57 kJ/mol',
        reactants: [
          { formula: 'HCl', color: '#ef4444', count: 1 },
          { formula: 'NaOH', color: '#3b82f6', count: 1 }
        ],
        products: [
          { formula: 'NaCl', color: '#10b981', count: 1 },
          { formula: 'H₂O', color: '#60a5fa', count: 1 }
        ],
        description: 'Acide + Base → Sel + Eau'
      },
      {
        name: 'Décomposition de l\'Eau',
        equation: '2H₂O → 2H₂ + O₂',
        type: 'Électrolyse',
        energy: 'Nécessite: 286 kJ/mol',
        reactants: [
          { formula: 'H₂O', color: '#60a5fa', count: 2 }
        ],
        products: [
          { formula: 'H₂', color: '#60a5fa', count: 2 },
          { formula: 'O₂', color: '#ef4444', count: 1 }
        ],
        description: 'Dissociation de l\'eau par électrolyse'
      },
      {
        name: 'Fermentation Alcoolique',
        equation: 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂',
        type: 'Fermentation',
        energy: 'Nécessite: Enzymes',
        reactants: [
          { formula: 'C₆H₁₂O₆', color: '#8b5cf6', count: 1 }
        ],
        products: [
          { formula: 'C₂H₅OH', color: '#f59e0b', count: 2 },
          { formula: 'CO₂', color: '#10b981', count: 2 }
        ],
        description: 'Transformation du glucose en éthanol et CO₂'
      }
    ];

    const currentReaction = reactions[selectedReaction];

    // Animation automatique
    React.useEffect(() => {
      if (!isPlaying) return;
      const interval = setInterval(() => {
        setAnimationStep(prev => (prev + 1) % 100);
      }, 100);
      return () => clearInterval(interval);
    }, [isPlaying]);

    const getAnimationProgress = () => {
      if (animationStep < 30) return 0; // Réactifs visibles
      if (animationStep < 70) return (animationStep - 30) / 40; // Transition
      return 1; // Produits visibles
    };

    const progress = getAnimationProgress();

    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Réactions Chimiques Animées</h3>

        {/* Sélection de réaction */}
        <div className="mb-6">
          <label className="block text-white text-sm mb-2">Choisir une réaction :</label>
          <select
            value={selectedReaction}
            onChange={(e) => {
              setSelectedReaction(Number(e.target.value));
              setAnimationStep(0);
            }}
            className="koundoul-input w-full"
          >
            {reactions.map((rxn, idx) => (
              <option key={idx} value={idx}>
                {rxn.name} ({rxn.type})
              </option>
            ))}
          </select>
        </div>

        {/* Informations de la réaction */}
        <div className="mb-6 bg-blue-900/30 rounded-lg p-4">
          <div className="text-white font-semibold text-lg mb-2">{currentReaction.name}</div>
          <div className="text-gray-300 text-sm mb-1">Type : <strong>{currentReaction.type}</strong></div>
          <div className="text-gray-300 text-sm mb-2">Énergie : <strong>{currentReaction.energy}</strong></div>
          <div className="text-gray-300 text-xs italic">{currentReaction.description}</div>
        </div>

        {/* Animation de la réaction */}
        <div className="mb-6 bg-black/20 rounded-lg p-8">
          <svg width="100%" height="200" viewBox="0 0 800 200" className="bg-gray-900 rounded-lg">
            {/* Réactifs */}
            <g opacity={1 - progress}>
              {currentReaction.reactants.map((reactant, idx) => {
                const x = 100 + idx * 150;
                const totalCount = currentReaction.reactants.length;
                return (
                  <g key={`reactant-${idx}`}>
                    <circle cx={x} cy="100" r="30" fill={reactant.color} stroke="white" strokeWidth="2" />
                    <text x={x} y="105" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                      {reactant.formula}
                    </text>
                    {reactant.count > 1 && (
                      <text x={x + 25} y="85" fill="white" fontSize="12">{reactant.count}</text>
                    )}
                  </g>
                );
              })}
              {/* Signe + entre réactifs */}
              {currentReaction.reactants.length > 1 && currentReaction.reactants.slice(0, -1).map((_, idx) => (
                <text key={`plus-r-${idx}`} x={175 + idx * 150} y="105" fill="white" fontSize="24" fontWeight="bold">+</text>
              ))}
            </g>

            {/* Flèche de réaction */}
            <g opacity={progress * 0.5 + 0.5}>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#60a5fa" />
                </marker>
              </defs>
              <line x1="380" y1="100" x2="480" y2="100" stroke="#60a5fa" strokeWidth="3" markerEnd="url(#arrowhead)" />
              <text x="430" y="110" textAnchor="middle" fill="#60a5fa" fontSize="16" fontWeight="bold">
                {progress > 0.5 ? '→' : '→'}
              </text>
            </g>

            {/* Produits */}
            <g opacity={progress}>
              {currentReaction.products.map((product, idx) => {
                const x = 550 + idx * 150;
                return (
                  <g key={`product-${idx}`}>
                    <circle cx={x} cy="100" r="30" fill={product.color} stroke="white" strokeWidth="2" />
                    <text x={x} y="105" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                      {product.formula}
                    </text>
                    {product.count > 1 && (
                      <text x={x + 25} y="85" fill="white" fontSize="12">{product.count}</text>
                    )}
                  </g>
                );
              })}
              {/* Signe + entre produits */}
              {currentReaction.products.length > 1 && currentReaction.products.slice(0, -1).map((_, idx) => (
                <text key={`plus-p-${idx}`} x={625 + idx * 150} y="105" fill="white" fontSize="24" fontWeight="bold">+</text>
              ))}
            </g>

            {/* Atomes animés (en transition) */}
            {progress > 0 && progress < 1 && (
              <g opacity={progress * (1 - progress) * 4}>
                <circle cx={400 + progress * 100} cy="100" r="8" fill="#ffff00" opacity="0.8">
                  <animate attributeName="r" values="5;10;5" dur="0.5s" repeatCount="indefinite" />
                </circle>
                <circle cx={400 + progress * 80} cy="90" r="6" fill="#00ffff" opacity="0.6">
                  <animate attributeName="r" values="3;8;3" dur="0.7s" repeatCount="indefinite" />
                </circle>
                <circle cx={400 + progress * 120} cy="110" r="7" fill="#ff00ff" opacity="0.6">
                  <animate attributeName="r" values="4;9;4" dur="0.6s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </svg>
        </div>

        {/* Contrôles */}
        <div className="flex gap-4 items-center justify-center mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isPlaying ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
            }`}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Lancer l\'animation'}
          </button>
          <button
            onClick={() => {
              setAnimationStep(0);
              setIsPlaying(false);
            }}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            🔄 Réinitialiser
          </button>
          <div className="text-white text-sm">
            Progression : {Math.round(progress * 100)}%
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="bg-black/30 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Liste de toutes les réactions */}
        <div className="mt-6">
          <h4 className="text-white font-semibold mb-3">Toutes les réactions :</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {reactions.map((rxn, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedReaction(idx);
                  setAnimationStep(0);
                }}
                className={`p-3 rounded-lg text-sm transition-all ${
                  selectedReaction === idx
                    ? 'bg-blue-600 text-white border-2 border-blue-400'
                    : 'bg-black/20 text-gray-300 border-2 border-transparent hover:bg-black/30'
                }`}
              >
                <div className="font-semibold">{rxn.name}</div>
                <div className="text-xs mt-1">{rxn.type}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Tableau périodique
  const PeriodicTable = () => {
    const elements = [
      { symbol: 'H', name: 'Hydrogène', number: 1, mass: '1.008', type: 'Non-métal', group: 1, period: 1 },
      { symbol: 'He', name: 'Hélium', number: 2, mass: '4.003', type: 'Gaz noble', group: 18, period: 1 },
      { symbol: 'Li', name: 'Lithium', number: 3, mass: '6.941', type: 'Métal alcalin', group: 1, period: 2 },
      { symbol: 'Be', name: 'Béryllium', number: 4, mass: '9.012', type: 'Métal alcalino-terreux', group: 2, period: 2 },
      { symbol: 'B', name: 'Bore', number: 5, mass: '10.81', type: 'Métalloïde', group: 13, period: 2 },
      { symbol: 'C', name: 'Carbone', number: 6, mass: '12.01', type: 'Non-métal', group: 14, period: 2 },
      { symbol: 'N', name: 'Azote', number: 7, mass: '14.01', type: 'Non-métal', group: 15, period: 2 },
      { symbol: 'O', name: 'Oxygène', number: 8, mass: '16.00', type: 'Non-métal', group: 16, period: 2 },
      { symbol: 'F', name: 'Fluor', number: 9, mass: '19.00', type: 'Halogène', group: 17, period: 2 },
      { symbol: 'Ne', name: 'Néon', number: 10, mass: '20.18', type: 'Gaz noble', group: 18, period: 2 },
      { symbol: 'Na', name: 'Sodium', number: 11, mass: '22.99', type: 'Métal alcalin', group: 1, period: 3 },
      { symbol: 'Mg', name: 'Magnésium', number: 12, mass: '24.31', type: 'Métal alcalino-terreux', group: 2, period: 3 },
      { symbol: 'Al', name: 'Aluminium', number: 13, mass: '26.98', type: 'Métal pauvre', group: 13, period: 3 },
      { symbol: 'Si', name: 'Silicium', number: 14, mass: '28.09', type: 'Métalloïde', group: 14, period: 3 },
      { symbol: 'P', name: 'Phosphore', number: 15, mass: '30.97', type: 'Non-métal', group: 15, period: 3 },
      { symbol: 'S', name: 'Soufre', number: 16, mass: '32.07', type: 'Non-métal', group: 16, period: 3 },
      { symbol: 'Cl', name: 'Chlore', number: 17, mass: '35.45', type: 'Halogène', group: 17, period: 3 },
      { symbol: 'Ar', name: 'Argon', number: 18, mass: '39.95', type: 'Gaz noble', group: 18, period: 3 },
      { symbol: 'K', name: 'Potassium', number: 19, mass: '39.10', type: 'Métal alcalin', group: 1, period: 4 },
      { symbol: 'Ca', name: 'Calcium', number: 20, mass: '40.08', type: 'Métal alcalino-terreux', group: 2, period: 4 },
      { symbol: 'Sc', name: 'Scandium', number: 21, mass: '44.96', type: 'Métal de transition', group: 3, period: 4 },
      { symbol: 'Ti', name: 'Titane', number: 22, mass: '47.87', type: 'Métal de transition', group: 4, period: 4 },
      { symbol: 'V', name: 'Vanadium', number: 23, mass: '50.94', type: 'Métal de transition', group: 5, period: 4 },
      { symbol: 'Cr', name: 'Chrome', number: 24, mass: '52.00', type: 'Métal de transition', group: 6, period: 4 },
      { symbol: 'Mn', name: 'Manganèse', number: 25, mass: '54.94', type: 'Métal de transition', group: 7, period: 4 },
      { symbol: 'Fe', name: 'Fer', number: 26, mass: '55.85', type: 'Métal de transition', group: 8, period: 4 },
      { symbol: 'Co', name: 'Cobalt', number: 27, mass: '58.93', type: 'Métal de transition', group: 9, period: 4 },
      { symbol: 'Ni', name: 'Nickel', number: 28, mass: '58.69', type: 'Métal de transition', group: 10, period: 4 },
      { symbol: 'Cu', name: 'Cuivre', number: 29, mass: '63.55', type: 'Métal de transition', group: 11, period: 4 },
      { symbol: 'Zn', name: 'Zinc', number: 30, mass: '65.38', type: 'Métal de transition', group: 12, period: 4 },
      { symbol: 'Ga', name: 'Gallium', number: 31, mass: '69.72', type: 'Métal pauvre', group: 13, period: 4 },
      { symbol: 'Ge', name: 'Germanium', number: 32, mass: '72.64', type: 'Métalloïde', group: 14, period: 4 },
      { symbol: 'As', name: 'Arsenic', number: 33, mass: '74.92', type: 'Métalloïde', group: 15, period: 4 },
      { symbol: 'Se', name: 'Sélénium', number: 34, mass: '78.96', type: 'Non-métal', group: 16, period: 4 },
      { symbol: 'Br', name: 'Brome', number: 35, mass: '79.90', type: 'Halogène', group: 17, period: 4 },
      { symbol: 'Kr', name: 'Krypton', number: 36, mass: '83.80', type: 'Gaz noble', group: 18, period: 4 },
    ];

    const getElementColor = (type) => {
      const colors = {
        'Métal alcalin': 'bg-yellow-500',
        'Métal alcalino-terreux': 'bg-yellow-600',
        'Métal de transition': 'bg-blue-500',
        'Métal pauvre': 'bg-gray-500',
        'Métalloïde': 'bg-green-500',
        'Non-métal': 'bg-green-400',
        'Halogène': 'bg-purple-400',
        'Gaz noble': 'bg-pink-400',
        'Lanthanide': 'bg-teal-500',
        'Actinide': 'bg-orange-500',
      };
      return colors[type] || 'bg-gray-600';
    };

    const [selectedElement, setSelectedElement] = useState(null);
    const [filteredType, setFilteredType] = useState(null);

    // Filtrer les éléments par type
    const filteredElements = filteredType 
      ? elements.filter(el => el.type === filteredType)
      : elements;

    // Structure du tableau périodique standard
    const tableStructure = [
      [1, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 2],
      [3, 4, null, null, null, null, null, null, null, null, null, null, 5, 6, 7, 8, 9, 10],
      [11, 12, null, null, null, null, null, null, null, null, null, null, 13, 14, 15, 16, 17, 18],
      [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    ];

    const getElementByNumber = (num) => {
      return elements.find(e => e.number === num);
    };

    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Tableau Périodique Interactif</h3>
        
                 {/* Légende avec filtres cliquables */}
         <div className="mb-4 p-4 bg-black/20 rounded-lg">
           <div className="text-white text-sm font-semibold mb-2">Types d'éléments (Cliquez pour filtrer):</div>
           <div className="flex flex-wrap gap-2">
             <button
               onClick={() => setFilteredType(null)}
               className={`flex items-center gap-1 px-2 py-1 rounded border transition-all ${!filteredType ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/5'}`}
             >
               <div className="w-4 h-4 bg-gray-600 rounded"></div>
               <span className="text-white text-xs">Tous</span>
               {filteredType === null && <span className="text-xs text-green-400 ml-1">({filteredElements.length})</span>}
             </button>
             {['Métal alcalin', 'Métal alcalino-terreux', 'Métal de transition', 'Métal pauvre', 'Métalloïde', 'Non-métal', 'Halogène', 'Gaz noble'].map(type => {
               const count = elements.filter(el => el.type === type).length;
               return (
                 <button
                   key={type}
                   onClick={() => setFilteredType(type)}
                   className={`flex items-center gap-1 px-2 py-1 rounded border transition-all ${filteredType === type ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/5'}`}
                 >
                   <div className={`w-4 h-4 ${getElementColor(type)} rounded`}></div>
                   <span className="text-white text-xs">{type}</span>
                   {filteredType === type && <span className="text-xs text-green-400 ml-1">({count})</span>}
                 </button>
               );
             })}
           </div>
         </div>

                 {/* Tableau périodique filtré */}
         <div className="overflow-x-auto mb-4">
           {filteredType ? (
             // Vue filtrée - affiche uniquement les éléments du type sélectionné
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
               {filteredElements.map((element) => (
                 <div
                   key={element.number}
                   onClick={() => setSelectedElement(element)}
                   className={`${getElementColor(element.type)} rounded cursor-pointer hover:scale-105 transition-transform p-3 flex flex-col items-center justify-center text-white border-2 border-white/30 hover:border-white`}
                 >
                   <span className="text-xs font-bold">{element.number}</span>
                   <span className="text-lg font-bold">{element.symbol}</span>
                   <span className="text-xs opacity-75">{element.name}</span>
                   <span className="text-xs opacity-75">{element.mass}</span>
                 </div>
               ))}
             </div>
           ) : (
             // Vue complète - tableau standard
             <table className="border-collapse">
               <tbody>
                 {tableStructure.map((row, rowIdx) => (
                   <tr key={rowIdx}>
                     {row.map((num, colIdx) => {
                       const element = num ? getElementByNumber(num) : null;
                       return (
                         <td key={colIdx}>
                           {element ? (
                             <div
                               onClick={() => setSelectedElement(element)}
                               className={`${getElementColor(element.type)} rounded cursor-pointer hover:scale-110 transition-transform p-2 min-w-[50px] min-h-[60px] flex flex-col items-center justify-center text-white border-2 border-transparent hover:border-white`}
                             >
                               <span className="text-xs font-bold">{element.number}</span>
                               <span className="text-sm font-bold">{element.symbol}</span>
                               <span className="text-xs opacity-75">{element.mass}</span>
                             </div>
                           ) : (
                             <div className="p-2 min-w-[50px] min-h-[60px]"></div>
                           )}
                         </td>
                       );
                     })}
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>

        {/* Informations détaillées */}
        {selectedElement && (
          <div className="bg-white/10 rounded-lg p-4 text-white">
            <h4 className="text-xl font-bold mb-3">{selectedElement.name}</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><strong>Symbole:</strong> {selectedElement.symbol}</div>
              <div><strong>Numéro atomique:</strong> {selectedElement.number}</div>
              <div><strong>Masse atomique:</strong> {selectedElement.mass} u</div>
              <div><strong>Type:</strong> {selectedElement.type}</div>
              <div><strong>Groupe:</strong> {selectedElement.group}</div>
              <div><strong>Période:</strong> {selectedElement.period}</div>
            </div>
            {selectedElement.type === 'Gaz noble' && (
              <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs">
                💡 <strong>Gaz noble:</strong> Éléments non réactifs, couche de valence complète.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // pH
  const PHDemo = () => {
    const [ph, setPh] = useState(7);
    const type = ph < 7 ? 'Acide' : ph > 7 ? 'Basique' : 'Neutre';
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Échelle de pH</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-white text-sm mb-2">pH: {ph.toFixed(1)}</label><input type="range" min="0" max="14" step="0.1" value={ph} onChange={(e) => setPh(Number(e.target.value))} className="w-full" /></div>
            <div className="bg-black/20 p-4 rounded text-white text-sm">Nature: {type}</div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full h-32 bg-gradient-to-r from-red-600 via-green-500 to-blue-600 rounded" />
          </div>
        </div>
      </div>
    );
  };

  // Cinétique
  const ChemicalKinetics = () => {
    const [temperature, setTemperature] = useState(298);
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Cinétique Chimique</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="block text-white text-sm mb-2">Température: {temperature} K</label><input type="range" min="273" max="373" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full" /></div>
            <div className="bg-black/20 p-4 rounded text-white text-sm">Loi d'Arrhenius appliquée</div>
          </div>
          <div className="flex items-center justify-center">
            <svg width="300" height="200" viewBox="0 0 300 200" className="bg-gray-900 rounded">
              <path d={`M 0 180 ${Array.from({length: 300}, (_, i) => {
                return `L ${i} ${180 - (i * 100 / 300)}`;
              }).join(' ')}`} fill="none" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Équilibre Chimique - Principe de Le Chatelier
  const ChemicalEquilibrium = () => {
    const [pressure, setPressure] = useState(1);
    const [temperature, setTemperature] = useState(298);
    const [concentrationProduct, setConcentrationProduct] = useState(50);

    // Calcul de l'équilibre
    const calculateEquilibrium = () => {
      // Simplification pédagogique : Plus la pression/température change, plus l'équilibre se décale
      const pressureEffect = (pressure - 1) * 30; // Effet sur la position de l'équilibre
      const tempEffect = (temperature - 298) * 0.5;
      
      // Réactifs N₂ + 3H₂ (proportionnellement moins quand pression augmente)
      const reactants = Math.max(20, 70 - pressureEffect * 0.3 + tempEffect);
      
      // Produits 2NH₃ (augmentent avec la pression dans cette réaction)
      const products = Math.max(20, 70 + pressureEffect * 0.7 - tempEffect * 1.2);
      
      return {
        reactants: Math.min(90, Math.max(10, reactants)),
        products: Math.min(90, Math.max(10, products)),
        message: pressure > 1.2 
          ? "Pression élevée → Équilibre vers NH₃" 
          : pressure < 0.8 
          ? "Pression faible → Équilibre vers réactifs"
          : "Équilibre en faveur des produits"
      };
    };

    const equilibrium = calculateEquilibrium();

    return (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Équilibre Chimique - Principe de Le Chatelier</h3>
        <div className="mb-4 bg-blue-900/30 rounded-lg p-4">
          <p className="text-white font-semibold mb-2">Réaction : N₂ + 3H₂ ⇌ 2NH₃</p>
          <p className="text-gray-300 text-sm">ΔH = -92 kJ/mol (Réaction exothermique)</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contrôles */}
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2">
                Pression: {pressure.toFixed(1)} atm
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={pressure} 
                onChange={(e) => setPressure(Number(e.target.value))} 
                className="w-full" 
              />
              <div className="text-gray-400 text-xs mt-1">
                {pressure > 1.1 && "⬆️ Pression augmente → favorise NH₃"}
                {pressure < 0.9 && "⬇️ Pression diminue → favorise N₂ + H₂"}
              </div>
            </div>

            <div>
              <label className="block text-white text-sm mb-2">
                Température: {temperature} K ({temperature - 273}°C)
              </label>
              <input 
                type="range" 
                min="273" 
                max="400" 
                step="5" 
                value={temperature} 
                onChange={(e) => setTemperature(Number(e.target.value))} 
                className="w-full" 
              />
              <div className="text-gray-400 text-xs mt-1">
                {temperature > 320 && "⬆️ Température augmente → favorise réactifs"}
                {temperature < 280 && "⬇️ Température diminue → favorise NH₃"}
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded text-white text-sm">
              <div className="font-semibold mb-2">Principe de Le Chatelier :</div>
              <ul className="text-xs space-y-1 text-gray-300">
                <li>• Augmenter pression → favorise moins de molécules</li>
                <li>• Diminuer température → favorise réaction exothermique</li>
                <li>• La réaction s'ajuste pour minimiser la perturbation</li>
              </ul>
            </div>

            <div className="bg-green-900/30 p-3 rounded text-white text-xs">
              💡 <strong>Interprétation actuelle :</strong> {equilibrium.message}
            </div>
          </div>

          {/* Visualisation */}
          <div className="flex items-center justify-center">
            <svg width="400" height="300" viewBox="0 0 400 300" className="bg-gray-900 rounded-lg">
              {/* Titre */}
              <text x="200" y="30" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">
                Position de l'équilibre
              </text>

              {/* Réactifs (N₂ + 3H₂) */}
              <g>
                <rect 
                  x="50" 
                  y={250 - equilibrium.reactants * 2} 
                  width="120" 
                  height={equilibrium.reactants * 2} 
                  fill="#ef4444" 
                  rx="5"
                />
                <text x="110" y={245 - equilibrium.reactants * 2} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">
                  {equilibrium.reactants.toFixed(0)}%
                </text>
                <text x="110" y="275" fill="white" fontSize="11" textAnchor="middle">
                  N₂ + 3H₂
                </text>
              </g>

              {/* Flèches d'équilibre */}
              <g>
                <line x1="180" y1="220" x2="200" y2="220" stroke="white" strokeWidth="3" markerEnd="url(#arrow)" />
                <line x1="220" y1="220" x2="240" y2="220" stroke="white" strokeWidth="3" markerStart="url(#arrow)" />
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="white" />
                  </marker>
                </defs>
                <text x="210" y="215" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">
                  ⇌
                </text>
              </g>

              {/* Produits (2NH₃) */}
              <g>
                <rect 
                  x="270" 
                  y={250 - equilibrium.products * 2} 
                  width="120" 
                  height={equilibrium.products * 2} 
                  fill="#10b981" 
                  rx="5"
                />
                <text x="330" y={245 - equilibrium.products * 2} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">
                  {equilibrium.products.toFixed(0)}%
                </text>
                <text x="330" y="275" fill="white" fontSize="11" textAnchor="middle">
                  2NH₃
                </text>
              </g>

              {/* Axe des concentrations */}
              <line x1="30" y1="250" x2="370" y2="250" stroke="#666" strokeWidth="2" />
              <text x="380" y="255" fill="#888" fontSize="10" dominantBaseline="middle">0%</text>
            </svg>
          </div>
        </div>

        {/* Informations pédagogiques */}
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="bg-red-900/30 p-3 rounded-lg">
            <div className="text-white font-semibold text-sm mb-1">Augmenter Pression</div>
            <div className="text-gray-300 text-xs">
              → L'équilibre se déplace vers moins de molécules (2NH₃ au lieu de 4)
            </div>
          </div>
          <div className="bg-blue-900/30 p-3 rounded-lg">
            <div className="text-white font-semibold text-sm mb-1">Diminuer Température</div>
            <div className="text-gray-300 text-xs">
              → L'équilibre se déplace vers la réaction exothermique (NH₃)
            </div>
          </div>
          <div className="bg-green-900/30 p-3 rounded-lg">
            <div className="text-white font-semibold text-sm mb-1">État d'équilibre</div>
            <div className="text-gray-300 text-xs">
              → Vitesse réaction directe = vitesse réaction inverse
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Visualisations Interactives</h1>
            <p className="text-gray-300 mb-8">Explorez les concepts scientifiques de manière interactive et visuelle.</p>
            
            <div className="flex gap-4 mb-6">
              <button onClick={() => setActiveTab('math')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'math' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                📐 Mathématiques
              </button>
              <button onClick={() => setActiveTab('physics')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'physics' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                ⚛️ Physique
              </button>
              <button onClick={() => setActiveTab('chemistry')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'chemistry' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                🧪 Chimie
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visualizations[activeTab]?.map((viz) => (
                <div key={viz.id} onClick={() => setSelectedVisualization(viz)} className="bg-white/5 hover:bg-white/10 rounded-xl p-6 cursor-pointer transition-all border border-white/10 hover:border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white">{viz.icon}</span>
                    <h3 className="text-lg font-bold text-white">{viz.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{viz.description}</p>
                </div>
              ))}
            </div>

            {selectedVisualization && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-white">{selectedVisualization.icon}</span>
                      <h2 className="text-2xl font-bold text-white">{selectedVisualization.title}</h2>
                    </div>
                    <button onClick={() => setSelectedVisualization(null)} className="text-gray-400 hover:text-white transition-colors">✕</button>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-300 mb-4">{selectedVisualization.description}</p>
                    {renderVisualization(selectedVisualization.component)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveVisualizations;
