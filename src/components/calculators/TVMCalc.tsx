import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { useStore } from '../../store/useStore';

export function TVMCalc() {
  const [calcType, setCalcType] = useState<'FV' | 'PV'>('FV');
  const [pv, setPv] = useState<number | ''>(10000); // Present Value
  const [fv, setFv] = useState<number | ''>(''); // Future Value
  const [rate, setRate] = useState<number | ''>(5); // Annual Interest Rate
  const [periods, setPeriods] = useState<number | ''>(10); // Number of Years

  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const { addToHistory } = useStore();

  const presentValue = Number(pv) || 0;
  const futureValue = Number(fv) || 0;
  const r = (Number(rate) || 0) / 100;
  const n = Number(periods) || 0;

  let calculatedResult = 0;
  
  if (calcType === 'FV') {
    calculatedResult = presentValue * Math.pow(1 + r, n);
  } else {
    calculatedResult = futureValue / Math.pow(1 + r, n);
  }

  const handleSaveToTape = () => {
    addToHistory({
      type: 'tvm',
      title: calcType === 'FV' ? 'Future Value' : 'Present Value',
      inputs: { 
        'Rate %': r * 100, 
        'Years': n, 
        ...(calcType === 'FV' ? {'Present Value': presentValue} : {'Future Value': futureValue})
      },
      results: { 
        [calcType === 'FV' ? 'Future Value' : 'Present Value']: calculatedResult.toFixed(2)
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Time Value of Money (TVM)</h2>
          <p className="text-sm text-slate-500">Calculate present or future value with compound interest.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => setIsFormulaOpen(!isFormulaOpen)}>
            <Info className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveToTape}>
            <Save className="w-4 h-4 mr-2" /> Tape
          </Button>
        </div>
      </div>

       {isFormulaOpen && (
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-4 text-sm text-blue-800 dark:text-blue-200">
            <strong>FV (Future Value)</strong> = PV × (1 + r)^n<br />
            <strong>PV (Present Value)</strong> = FV / (1 + r)^n<br />
            <em>Where r is rate per period, n is number of periods. (Assumes annual compounding).</em>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${calcType === 'FV' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          onClick={() => setCalcType('FV')}
        >
          Find Future Value (FV)
        </button>
        <button
           className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${calcType === 'PV' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
          onClick={() => setCalcType('PV')}
        >
          Find Present Value (PV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {calcType === 'FV' ? (
                <Input
                  label="Present Value (Current Amount)"
                  type="number"
                  prefix="$"
                  value={pv}
                  onChange={(e) => setPv(e.target.value === '' ? '' : Number(e.target.value))}
                />
             ) : (
                 <Input
                  label="Future Value (Target Amount)"
                  type="number"
                  prefix="$"
                  value={fv}
                  onChange={(e) => setFv(e.target.value === '' ? '' : Number(e.target.value))}
                />
             )}
            <Input
              label="Annual Rate (%)"
              type="number"
              suffix="%"
              value={rate}
              onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
            />
             <Input
              label="Number of Periods (Years)"
              type="number"
              value={periods}
              onChange={(e) => setPeriods(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white flex flex-col justify-center">
          <CardContent className="space-y-6 flex flex-col items-center justify-center py-10">
             <div className="text-slate-400 text-sm font-medium mb-1 text-center">
                {calcType === 'FV' ? 'Calculated Future Value' : 'Required Present Value'}
             </div>
             <div className="text-5xl font-bold text-center text-blue-400">
               {formatCurrency(calculatedResult)}
             </div>
             <div className="text-slate-500 text-sm mt-4 text-center">
               {calcType === 'FV' 
                 ? `Your money grows by ${formatCurrency(calculatedResult - presentValue)} over ${n} years.`
                 : `You need to invest this today to reach ${formatCurrency(futureValue)} in ${n} years.`
               }
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
