import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Package, 
  Wrench, 
  Zap, 
  TrendingUp, 
  Info, 
  Trash2, 
  Plus, 
  Clock, 
  Users, 
  DollarSign, 
  PieChart as PieChartIcon, 
  Settings,
  ArrowRight,
  Factory,
  Briefcase,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// --- Constants & Utilities ---
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']; // Blue, Green, Amber, Red

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
      <Icon size={24} />
    </div>
    <div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

// --- Main Component ---
export default function App() {
  // --- State Management ---
  const [view, setView] = useState('landing'); // landing, calculator, results
  const [mode, setMode] = useState('product'); // product, service
  const [advancedMode, setAdvancedMode] = useState(false);
  
  // Batch / Job Data
  const [general, setGeneral] = useState({
    name: '',
    batchSize: 100, // Units produced
    durationHours: 4,
    durationMinutes: 0,
    monthlyOpDays: 26,
    dailyOpHours: 8,
    capacityUtilization: 100, // Percentage
  });

  // Materials
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Raw Material A', price: 1000, packSize: 10, consumption: 1, wastage: 0 }
  ]);

  // Labor
  const [labor, setLabor] = useState({
    type: 'salary', // salary or piece
    salaryPerWorker: 15000,
    workers: 2,
    pieceRate: 5,
  });

  // Overheads
  const [overheads, setOverheads] = useState([
    { id: 1, name: 'Rent', cost: 20000 },
    { id: 2, name: 'Electricity', cost: 5000 },
  ]);

  // Profit Simulation
  const [targetMargin, setTargetMargin] = useState(20); // %
  const [sellingPriceOverride, setSellingPriceOverride] = useState(0);

  // --- Calculations ---
  const results = useMemo(() => {
    // 1. Material Cost
    let totalMaterialCost = 0;
    materials.forEach(m => {
      const pricePerUnit = m.price / (m.packSize || 1);
      const effectiveConsumption = m.consumption / ((100 - m.wastage) / 100);
      totalMaterialCost += pricePerUnit * effectiveConsumption;
    });

    // 2. Labor Cost
    let totalLaborCost = 0;
    const totalBatchHours = general.durationHours + (general.durationMinutes / 60);
    
    if (labor.type === 'piece') {
      // Piece Rate: Rate * Batch Size
      totalLaborCost = labor.pieceRate * general.batchSize;
    } else {
      // Salary: (Salary / (Days * Hours)) * BatchDuration * Workers
      const hourlyRate = labor.salaryPerWorker / (general.monthlyOpDays * general.dailyOpHours);
      totalLaborCost = hourlyRate * totalBatchHours * labor.workers;
    }

    // 3. Overhead Cost (Absorption)
    // Formula: (Monthly Bills / (MonthlyCapacityHours * Utilization%)) * BatchDuration
    const totalMonthlyOverhead = overheads.reduce((acc, curr) => acc + Number(curr.cost), 0);
    const monthlyCapacityHours = general.monthlyOpDays * general.dailyOpHours;
    const effectiveMonthlyHours = monthlyCapacityHours * (general.capacityUtilization / 100);
    
    // Safety check for divide by zero
    const overheadHourlyRate = effectiveMonthlyHours > 0 ? totalMonthlyOverhead / effectiveMonthlyHours : 0;
    const allocatedOverhead = overheadHourlyRate * totalBatchHours;

    // Totals
    const totalBatchCost = totalMaterialCost + totalLaborCost + allocatedOverhead;
    const unitCost = general.batchSize > 0 ? totalBatchCost / general.batchSize : 0;

    // Break Even & Profit
    // Simplified Fixed Cost Allocation for Break Even
    // Fixed Costs = Allocated Overhead + (Indirect Labor if added)
    const fixedCostPerBatch = allocatedOverhead; 
    const variableCostPerBatch = totalMaterialCost + totalLaborCost;
    const variableCostPerUnit = variableCostPerBatch / general.batchSize;

    return {
      totalMaterialCost,
      totalLaborCost,
      allocatedOverhead,
      totalBatchCost,
      unitCost,
      fixedCostPerBatch,
      variableCostPerUnit,
      variableCostPerBatch
    };
  }, [general, materials, labor, overheads]);

  // Sync Selling Price Override default
  useEffect(() => {
    if (view === 'results' && sellingPriceOverride === 0) {
      setSellingPriceOverride(Math.ceil(results.unitCost * 1.2));
    }
  }, [view, results.unitCost]);


  // --- Event Handlers ---
  const handleMaterialChange = (id, field, value) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: Number(value) } : m));
  };
  const handleMaterialNameChange = (id, value) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, name: value } : m));
  };
  const addMaterial = () => {
    setMaterials([...materials, { id: Date.now(), name: '', price: 0, packSize: 1, consumption: 0, wastage: 0 }]);
  };
  const removeMaterial = (id) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleOverheadChange = (id, field, value) => {
    setOverheads(overheads.map(o => o.id === id ? { ...o, [field]: field === 'name' ? value : Number(value) } : o));
  };
  const addOverhead = () => setOverheads([...overheads, { id: Date.now(), name: '', cost: 0 }]);
  const removeOverhead = (id) => setOverheads(overheads.filter(o => o.id !== id));

  const startCalculation = (selectedMode) => {
    setMode(selectedMode);
    setView('calculator');
    // Set defaults based on mode
    if (selectedMode === 'service') {
        setGeneral(prev => ({...prev, batchSize: 1, name: 'Service Job'}));
    } else {
        setGeneral(prev => ({...prev, batchSize: 100, name: 'New Product'}));
    }
  };

  // --- Views ---

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-12 max-w-2xl">
          <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <Calculator size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">True Cost Calculator</h1>
          <p className="text-lg text-slate-600">
            Stop guessing your profits. Scientifically calculate the actual cost of your 
            products or services in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          <button 
            onClick={() => startCalculation('product')}
            className="group relative bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl transition-all text-left"
          >
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
              <Factory size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">I Manufacture Products</h3>
            <p className="text-slate-500">For batch production like food, garments, electronics, etc.</p>
            <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
              Start Product Costing <ArrowRight size={18} className="ml-2" />
            </div>
          </button>

          <button 
            onClick={() => startCalculation('service')}
            className="group relative bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:shadow-xl transition-all text-left"
          >
            <div className="bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
              <Briefcase size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">I Provide Services</h3>
            <p className="text-slate-500">For repair shops, consulting, logistics, freelancers.</p>
            <div className="mt-6 flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform">
              Start Service Costing <ArrowRight size={18} className="ml-2" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'results') {
    const profit = sellingPriceOverride - results.unitCost;
    const marginPercent = sellingPriceOverride > 0 ? (profit / sellingPriceOverride) * 100 : 0;
    const isLoss = profit < 0;
    
    // Break Even Quantity = Fixed Costs / (Price - Variable Cost per unit)
    const contributionMargin = sellingPriceOverride - results.variableCostPerUnit;
    const breakEvenQty = contributionMargin > 0 ? Math.ceil(results.fixedCostPerBatch / contributionMargin) : 'Infinity';

    const chartData = [
      { name: 'Materials', value: results.totalMaterialCost },
      { name: 'Labor', value: results.totalLaborCost },
      { name: 'Overheads', value: results.allocatedOverhead },
    ];

    return (
      <div className="min-h-screen bg-slate-50 p-4 pb-20">
         <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setView('calculator')} className="flex items-center text-slate-500 hover:text-slate-800 font-medium">
                    <ArrowRight size={20} className="rotate-180 mr-2" /> Edit Inputs
                </button>
                <button onClick={() => window.print()} className="flex items-center text-blue-600 font-medium">
                    <Save size={20} className="mr-2" /> Save PDF
                </button>
            </div>

            {/* Hero Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 text-center">
                    <p className="text-slate-400 font-medium mb-2 uppercase tracking-wide">True Unit Cost</p>
                    <h1 className="text-6xl font-extrabold mb-2">{formatCurrency(results.unitCost)}</h1>
                    <p className="text-slate-400">Total Batch Cost: {formatCurrency(results.totalBatchCost)}</p>
                </div>
                {/* Abstract bg shapes */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20 translate-x-10 translate-y-10"></div>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Cost Breakdown */}
                <Card>
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center">
                        <PieChartIcon size={18} className="mr-2 text-slate-400" /> Cost Structure
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Profit Simulator */}
                <Card className={isLoss ? 'border-red-200 bg-red-50' : 'border-emerald-100 bg-emerald-50/50'}>
                    <h3 className="font-bold text-slate-700 mb-6 flex items-center">
                        <TrendingUp size={18} className="mr-2 text-slate-400" /> Profit Simulator
                    </h3>
                    
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2 font-medium text-slate-600">
                            <span>Selling Price</span>
                            <span>{formatCurrency(sellingPriceOverride)}</span>
                        </div>
                        <input 
                            type="range" 
                            min={Math.floor(results.unitCost * 0.5)} 
                            max={Math.ceil(results.unitCost * 3)} 
                            value={sellingPriceOverride}
                            onChange={(e) => setSellingPriceOverride(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Net Profit / Unit</p>
                            <p className={`text-xl font-bold ${isLoss ? 'text-red-600' : 'text-emerald-600'}`}>
                                {formatCurrency(profit)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase font-bold">Margin</p>
                            <p className={`text-xl font-bold ${isLoss ? 'text-red-600' : 'text-emerald-600'}`}>
                                {marginPercent.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

             {/* Insight Cards */}
             <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Card className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Break-even Qty</p>
                    <p className="text-2xl font-bold text-slate-800">{breakEvenQty} <span className="text-sm font-normal text-slate-400">units</span></p>
                    <p className="text-xs text-slate-500 mt-2">To cover fixed costs</p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Variable Cost</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(results.variableCostPerUnit)}</p>
                    <p className="text-xs text-slate-500 mt-2">Cost that scales with volume</p>
                </Card>
                <Card className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Fixed Cost</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(results.fixedCostPerBatch)}</p>
                    <p className="text-xs text-slate-500 mt-2">Allocated to this batch</p>
                </Card>
            </div>
         </div>
      </div>
    );
  }

  // --- Calculator View ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2">
            <button onClick={() => setView('landing')} className="text-slate-400 hover:text-slate-600">
                <ArrowRight className="rotate-180" size={20} />
            </button>
            <h1 className="font-bold text-slate-800">{general.name || (mode === 'product' ? 'New Product' : 'New Service')}</h1>
        </div>
        <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-4">
                <span className="text-sm text-slate-500">Advanced Mode</span>
                <button 
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${advancedMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${advancedMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
               Est. {formatCurrency(results.unitCost)} <span className="text-slate-400 font-normal">/unit</span>
            </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-24 space-y-6">
        
        {/* 1. Batch / Job Setup */}
        <Card>
            <SectionHeader 
                icon={mode === 'product' ? Package : Briefcase} 
                title={mode === 'product' ? "Batch Setup" : "Job Details"} 
                subtitle={mode === 'product' ? "How many do you make at once?" : "Specifics of this service job."}
            />
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input 
                        type="text" 
                        value={general.name}
                        onChange={(e) => setGeneral({...general, name: e.target.value})}
                        placeholder={mode === 'product' ? "e.g., Chocolate Cake, Cotton Shirt" : "e.g., AC Repair, Wedding Photo Shoot"}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {mode === 'product' ? 'Batch Size' : 'Jobs Count'}
                        </label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={general.batchSize}
                                onChange={(e) => setGeneral({...general, batchSize: Number(e.target.value)})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xl font-bold text-slate-800"
                            />
                            <span className="absolute right-3 top-3.5 text-slate-400 text-sm font-medium">units</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Duration
                        </label>
                        <div className="flex gap-2">
                             <div className="relative flex-1">
                                <input 
                                    type="number" 
                                    value={general.durationHours}
                                    onChange={(e) => setGeneral({...general, durationHours: Number(e.target.value)})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                />
                                <span className="absolute right-2 top-3.5 text-xs text-slate-400">hrs</span>
                             </div>
                             <div className="relative flex-1">
                                <input 
                                    type="number" 
                                    value={general.durationMinutes}
                                    onChange={(e) => setGeneral({...general, durationMinutes: Number(e.target.value)})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                                />
                                <span className="absolute right-2 top-3.5 text-xs text-slate-400">min</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        {/* 2. Materials */}
        <Card>
            <SectionHeader 
                icon={Zap} 
                title={mode === 'product' ? "Materials" : "Consumables"} 
                subtitle="What items are consumed directly?" 
            />
            <div className="space-y-4">
                {materials.map((m, index) => (
                    <div key={m.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
                        <div className="flex justify-between items-start mb-3">
                            <input 
                                type="text" 
                                placeholder="Item Name" 
                                value={m.name}
                                onChange={(e) => handleMaterialNameChange(m.id, e.target.value)}
                                className="bg-transparent font-bold text-slate-700 placeholder-slate-400 focus:outline-none w-full"
                            />
                            {materials.length > 1 && (
                                <button onClick={() => removeMaterial(m.id)} className="text-slate-300 hover:text-red-400">
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">Buy Price</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-slate-400 text-sm">₹</span>
                                    <input 
                                        type="number" 
                                        value={m.price} 
                                        onChange={(e) => handleMaterialChange(m.id, 'price', e.target.value)}
                                        className="w-full pl-6 p-2 bg-white rounded-lg border border-slate-200 text-sm" 
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">Pack Size</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={m.packSize} 
                                        onChange={(e) => handleMaterialChange(m.id, 'packSize', e.target.value)}
                                        className="w-full p-2 bg-white rounded-lg border border-slate-200 text-sm" 
                                    />
                                    <span className="absolute right-2 top-2 text-slate-400 text-xs">kg/L/pc</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                             <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">Used in this batch</span>
                                <span className="font-bold text-blue-600">{m.consumption}</span>
                             </div>
                             <input 
                                type="range" 
                                min="0" 
                                max={m.packSize * 2} // Allow using more than 1 pack just in case
                                step={m.packSize / 100}
                                value={m.consumption}
                                onChange={(e) => handleMaterialChange(m.id, 'consumption', e.target.value)}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                             />
                        </div>

                        {advancedMode && (
                             <div className="mt-3 pt-3 border-t border-slate-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-amber-600 flex items-center">
                                        <TrendingUp size={12} className="mr-1" /> Wastage: {m.wastage}%
                                    </span>
                                    <input 
                                        type="range" 
                                        min="0" max="50" 
                                        value={m.wastage}
                                        onChange={(e) => handleMaterialChange(m.id, 'wastage', e.target.value)}
                                        className="w-32 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                </div>
                             </div>
                        )}
                    </div>
                ))}
                
                <button 
                    onClick={addMaterial}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 font-medium transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add Material
                </button>
            </div>
        </Card>

        {/* 3. Labor */}
        <Card>
            <SectionHeader 
                icon={Users} 
                title="Labor" 
                subtitle="Human effort cost." 
            />
            
            <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
                <button 
                    onClick={() => setLabor({...labor, type: 'salary'})}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${labor.type === 'salary' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                >
                    Monthly Salary
                </button>
                <button 
                    onClick={() => setLabor({...labor, type: 'piece'})}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${labor.type === 'piece' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                >
                    Piece Rate
                </button>
            </div>

            {labor.type === 'salary' ? (
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Total Monthly Salary per Worker</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-slate-400">₹</span>
                            <input 
                                type="number" 
                                value={labor.salaryPerWorker}
                                onChange={(e) => setLabor({...labor, salaryPerWorker: Number(e.target.value)})}
                                className="w-full pl-8 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Workers on this Batch</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" min="1" max="50" 
                                value={labor.workers}
                                onChange={(e) => setLabor({...labor, workers: Number(e.target.value)})}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100">
                                {labor.workers}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rate Per Piece</label>
                    <div className="relative">
                         <span className="absolute left-3 top-3.5 text-slate-400">₹</span>
                         <input 
                            type="number" 
                            value={labor.pieceRate}
                            onChange={(e) => setLabor({...labor, pieceRate: Number(e.target.value)})}
                            className="w-full pl-8 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                        />
                    </div>
                </div>
            )}
        </Card>

        {/* 4. Overheads */}
        <Card>
            <SectionHeader 
                icon={Factory} 
                title="Overheads" 
                subtitle="Monthly fixed bills (Rent, Electricity, etc.)" 
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
                {overheads.map(o => (
                    <div key={o.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                             <input 
                                type="text" 
                                value={o.name}
                                onChange={(e) => handleOverheadChange(o.id, 'name', e.target.value)}
                                className="bg-transparent font-medium text-slate-700 text-sm w-24 focus:outline-none"
                                placeholder="Name"
                            />
                            {overheads.length > 1 && (
                                <button onClick={() => removeOverhead(o.id)} className="text-slate-300 hover:text-red-400">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute left-2 top-1.5 text-xs text-slate-400">₹</span>
                            <input 
                                type="number" 
                                value={o.cost}
                                onChange={(e) => handleOverheadChange(o.id, 'cost', e.target.value)}
                                className="w-full pl-5 p-1 bg-white rounded border border-slate-200 text-sm font-bold"
                            />
                        </div>
                    </div>
                ))}
                <button 
                    onClick={addOverhead}
                    className="bg-white p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>
            
            {/* Logic Explanation / Toggles */}
            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 flex gap-3 items-start">
                <Info size={16} className="mt-0.5 shrink-0" />
                <div>
                    <p className="font-bold mb-1">How this is calculated:</p>
                    <p className="opacity-80">
                        We take your total monthly bill ({formatCurrency(overheads.reduce((a,b) => a + Number(b.cost), 0))}) 
                        and divide it by your total monthly working hours 
                        ({general.monthlyOpDays * general.dailyOpHours} hrs) to find the hourly shop cost.
                    </p>
                </div>
            </div>

            {advancedMode && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                     <label className="block text-sm font-medium text-slate-700 mb-2">Capacity Utilization (%)</label>
                     <div className="flex items-center gap-4">
                        <input 
                            type="range" min="10" max="100" 
                            value={general.capacityUtilization}
                            onChange={(e) => setGeneral({...general, capacityUtilization: Number(e.target.value)})}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <span className="w-12 h-8 flex items-center justify-center bg-purple-50 text-purple-600 font-bold rounded-lg border border-purple-100 text-sm">
                            {general.capacityUtilization}%
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Lower utilization increases cost per unit because you pay rent even when not working.
                    </p>
                </div>
            )}
        </Card>

        {/* Global Operational Hours Settings (Hidden unless Advanced or Needed) */}
        {advancedMode && (
             <Card>
                 <SectionHeader icon={Settings} title="Operational Settings" />
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Working Days/Month</label>
                        <input 
                            type="number" 
                            value={general.monthlyOpDays}
                            onChange={(e) => setGeneral({...general, monthlyOpDays: Number(e.target.value)})}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hours/Day</label>
                        <input 
                            type="number" 
                            value={general.dailyOpHours}
                            onChange={(e) => setGeneral({...general, dailyOpHours: Number(e.target.value)})}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                     </div>
                 </div>
             </Card>
        )}

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-20">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Batch Cost</p>
                    <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(results.totalBatchCost)}</p>
                </div>
                <button 
                    onClick={() => setView('results')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center"
                >
                    View Results <ArrowRight size={20} className="ml-2" />
                </button>
            </div>
      </div>
    </div>
  );
}