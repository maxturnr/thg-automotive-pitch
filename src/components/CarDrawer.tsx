'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DealSummary, Car, Expense } from '@/lib/data';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface CarDrawerProps {
  deal: DealSummary | null;
  isNew?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type Tab = 'details' | 'financials' | 'expenses' | 'images';

const emptyCarData: Partial<Car> = {
  make: '',
  model: '',
  reg: '',
  status: 'In Stock',
  type: 'owned',
  paid: null,
  sold: null,
  purchase_date: null,
  sale_date: null,
  deposit_date: null,
  advertised: null,
  advertised_date: null,
  deposit_amount: 0,
  total_income: 0,
  fee: null,
  is_sale_or_return: false,
  notes: null,
  purchase_vat_type: 'no_vat',
};

export default function CarDrawer({ deal, isNew, onClose, onSaved }: CarDrawerProps) {
  const [tab, setTab] = useState<Tab>('details');
  const [editing, setEditing] = useState(isNew ?? false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mileage, setMileage] = useState('');
  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [addingExpense, setAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ type: '', amount: '', date: '', supplier: '', vat_status: 'inclusive' });
  const [savingExpense, setSavingExpense] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);
  // Lookup state (for new vehicles)
  const [lookupReg, setLookupReg] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  const car = deal?.car;

  // Initialize form data
  useEffect(() => {
    if (isNew) {
      setFormData({ ...emptyCarData });
      setMileage('');
      setExpenses([]);
      setLookupDone(false);
      setLookupReg('');
      setLookupError('');
    } else if (car) {
      setFormData({
        make: car.make || '',
        model: car.model || '',
        reg: car.reg || '',
        status: car.status || 'In Stock',
        type: car.type || 'owned',
        paid: car.paid ?? '',
        sold: car.sold ?? '',
        purchase_date: car.purchase_date || '',
        sale_date: car.sale_date || '',
        deposit_date: car.deposit_date || '',
        deposit_amount: car.deposit_amount || '',
        advertised: car.advertised ?? '',
        advertised_date: car.advertised_date || '',
        fee: car.fee ?? '',
        is_sale_or_return: car.is_sale_or_return || false,
        notes: car.notes || '',
        owner_payout_amount: car.owner_payout_amount ?? '',
        owner_name: (car as any).owner_name || '',
        colour: car.colour || '',
        fuel_type: car.fuel_type || '',
        body_type: car.body_type || '',
        transmission: car.transmission || '',
        year: car.year ?? '',
        engine_size: car.engine_size || '',
        doors: car.doors ?? '',
        seats: car.seats ?? '',
        derivative: car.derivative || '',
        vin: car.vin || '',
        engine_power_bhp: car.engine_power_bhp ?? '',
        co2_emissions: car.co2_emissions ?? '',
        retail_value: car.retail_value ?? '',
        trade_value: car.trade_value ?? '',
        purchase_vat_type: car.purchase_vat_type || 'no_vat',
      });
      // Load extras from notes JSON (images, mileage)
      const m = car.mileage;
      if (m != null) {
        setMileage(String(m));
      } else {
        try {
          const parsed = car.notes ? JSON.parse(car.notes) : null;
          if (parsed?.mileage != null) setMileage(String(parsed.mileage));
        } catch {}
      }
      try {
        const parsed = car.notes ? JSON.parse(car.notes) : null;
        if (parsed?.images && Array.isArray(parsed.images)) {
          setImages(parsed.images);
        }
      } catch {}
      // Load expenses from deal
      if (deal?.expenses) {
        setExpenses(deal.expenses);
      }
      setLookupDone(true); // existing car, skip lookup
    }
  }, [car, isNew, deal]);

  // AutoTrader registration lookup
  const handleLookup = async () => {
    if (!lookupReg.trim()) return;
    setLookingUp(true);
    setLookupError('');
    try {
      const res = await fetch('/api/vehicle-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: lookupReg.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLookupError(data.error || 'Lookup failed');
        // Still allow manual entry
        setFormData(prev => ({ ...prev, reg: lookupReg.trim().toUpperCase() }));
        setLookupDone(true);
        return;
      }
      const data = await res.json();
      const v = data.vehicle;
      // Pre-fill form with lookup data
      setFormData(prev => ({
        ...prev,
        reg: v.registration || lookupReg.trim().toUpperCase(),
        make: v.make || '',
        model: v.model || '',
        colour: v.colour || '',
        fuel_type: v.fuel_type || '',
        body_type: v.body_type || '',
        transmission: v.transmission || '',
        year: v.year ?? '',
        engine_size: v.engine_size || '',
        doors: v.doors ?? '',
        seats: v.seats ?? '',
        derivative: v.derivative || '',
        vin: v.vin || '',
        engine_power_bhp: v.engine_power_bhp ?? '',
        co2_emissions: v.co2_emissions ?? '',
        retail_value: v.retail_value ?? '',
        trade_value: v.trade_value ?? '',
      }));
      setLookupDone(true);
    } catch (err: any) {
      setLookupError(err.message || 'Lookup failed');
      setFormData(prev => ({ ...prev, reg: lookupReg.trim().toUpperCase() }));
      setLookupDone(true);
    } finally {
      setLookingUp(false);
    }
  };

  // Run AutoTrader lookup on an existing car and save to Supabase
  const handleRunLookup = async () => {
    const reg = formData.reg?.trim();
    if (!reg || !car) return;
    setLookingUp(true);
    setLookupError('');
    try {
      const res = await fetch('/api/vehicle-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration: reg }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLookupError(data.error || 'Lookup failed');
        return;
      }
      const data = await res.json();
      const v = data.vehicle;
      const updates: Record<string, any> = {};
      if (v.make) updates.make = v.make;
      if (v.model) updates.model = v.model;
      if (v.colour) updates.colour = v.colour;
      if (v.fuel_type) updates.fuel_type = v.fuel_type;
      if (v.body_type) updates.body_type = v.body_type;
      if (v.transmission) updates.transmission = v.transmission;
      if (v.year) updates.year = v.year;
      if (v.engine_size) updates.engine_size = v.engine_size;
      if (v.doors) updates.doors = v.doors;
      if (v.seats) updates.seats = v.seats;
      if (v.derivative) updates.derivative = v.derivative;
      if (v.vin) updates.vin = v.vin;
      if (v.engine_power_bhp) updates.engine_power_bhp = v.engine_power_bhp;
      if (v.co2_emissions) updates.co2_emissions = v.co2_emissions;
      if (v.retail_value) updates.retail_value = v.retail_value;
      if (v.trade_value) updates.trade_value = v.trade_value;

      if (Object.keys(updates).length === 0) {
        setLookupError('No data found for this registration');
        return;
      }
      // Save to Supabase
      const { error } = await supabase.from('cars').update(updates).eq('id', car.id);
      if (error) {
        setLookupError(`Save failed: ${error.message}`);
        return;
      }
      // Update local form data
      setFormData(prev => ({ ...prev, ...updates }));
      setLookupError('');
      onSaved(); // refresh parent data
    } catch (err: any) {
      setLookupError(err.message || 'Lookup failed');
    } finally {
      setLookingUp(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Helpers to clean form values — empty strings must become null for Postgres
      const toStr = (v: any) => (v != null && String(v).trim() !== '') ? String(v).trim() : null;
      const toNum = (v: any) => (v != null && String(v).trim() !== '' && !isNaN(Number(v))) ? Number(v) : null;
      const toDate = (v: any) => (v != null && String(v).trim() !== '') ? String(v).trim() : null;

      const data: Record<string, any> = {
        make: toStr(formData.make),
        model: toStr(formData.model),
        reg: toStr(formData.reg),
        status: formData.status || 'In Stock',
        type: formData.is_sale_or_return ? 'sor' : (formData.type || 'owned'),
        paid: toNum(formData.paid),
        sold: toNum(formData.sold),
        purchase_date: toDate(formData.purchase_date),
        sale_date: toDate(formData.sale_date),
        deposit_date: toDate(formData.deposit_date),
        deposit_amount: toNum(formData.deposit_amount) ?? 0,
        advertised: toNum(formData.advertised),
        advertised_date: toDate(formData.advertised_date),
        fee: toNum(formData.fee),
        is_sale_or_return: formData.is_sale_or_return || false,
        owner_payout_amount: toNum(formData.owner_payout_amount),
        // Vehicle details from AutoTrader
        colour: toStr(formData.colour),
        fuel_type: toStr(formData.fuel_type),
        body_type: toStr(formData.body_type),
        transmission: toStr(formData.transmission),
        year: toNum(formData.year),
        engine_size: toStr(formData.engine_size),
        doors: toNum(formData.doors),
        seats: toNum(formData.seats),
        derivative: toStr(formData.derivative),
        vin: toStr(formData.vin),
        mileage: toNum(mileage),
        engine_power_bhp: toNum(formData.engine_power_bhp),
        co2_emissions: toNum(formData.co2_emissions),
        retail_value: toNum(formData.retail_value),
        trade_value: toNum(formData.trade_value),
        purchase_vat_type: formData.purchase_vat_type || 'no_vat',
      };

      // Store extras (images, mileage) in notes as JSON
      const notesObj: any = {};
      const plainNotes = typeof formData.notes === 'string' ? formData.notes : '';
      let textNotes = plainNotes;
      try {
        const parsed = JSON.parse(plainNotes);
        textNotes = parsed?.text || '';
      } catch { /* plain text */ }
      if (textNotes) notesObj.text = textNotes;
      if (images.length > 0) notesObj.images = images;
      if (mileage && !isNaN(Number(mileage))) notesObj.mileage = Number(mileage);
      data.notes = Object.keys(notesObj).length > 0 ? JSON.stringify(notesObj) : null;

      if (isNew) {
        data.reg = data.reg || '';
        data.registration = data.reg;
        data.account_id = 1;
        data.total_income = 0;
        const { error } = await supabase.from('cars').insert(data);
        if (error) throw error;
      } else if (car) {
        const { error } = await supabase.from('cars').update(data).eq('id', car.id);
        if (error) throw error;
      }

      setEditing(false);
      onSaved();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save: ' + (err as any).message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddExpense = async () => {
    if (!car || !newExpense.type || !newExpense.amount) return;
    setSavingExpense(true);
    try {
      const rawAmount = Number(newExpense.amount);
      let netAmount: number;
      let vatAmount: number;
      let vatLabel: string;
      let vatStatus: string;

      if (newExpense.vat_status === 'inclusive') {
        // 20% VAT included in amount
        netAmount = Math.round((rawAmount / 1.2) * 100) / 100;
        vatAmount = Math.round((rawAmount - netAmount) * 100) / 100;
        vatLabel = '20%';
        vatStatus = 'standard';
      } else if (newExpense.vat_status === 'exclusive') {
        // VAT on top of amount
        netAmount = rawAmount;
        vatAmount = Math.round((rawAmount * 0.2) * 100) / 100;
        vatLabel = '20%';
        vatStatus = 'standard';
      } else {
        // No VAT
        netAmount = rawAmount;
        vatAmount = 0;
        vatLabel = 'No';
        vatStatus = 'zero';
      }

      const totalAmount = newExpense.vat_status === 'exclusive' ? rawAmount + vatAmount : rawAmount;

      const data = {
        stock_id: car.id,
        type: newExpense.type,
        amount: totalAmount,
        net_amount: netAmount,
        vat_amount: vatAmount,
        vat_status: vatStatus,
        vat: vatLabel,
        date: newExpense.date || new Date().toISOString().split('T')[0],
        supplier: newExpense.supplier || null,
        account_id: 1,
        is_overhead: false,
        source: 'manual',
        status: 'Paid',
        payment_status: 'paid',
        currency: 'GBP',
      };
      const { data: inserted, error } = await supabase.from('expenses').insert(data).select();
      if (error) throw error;
      if (inserted && inserted[0]) {
        setExpenses(prev => [...prev, inserted[0] as Expense]);
      }
      setNewExpense({ type: '', amount: '', date: '', supplier: '', vat_status: 'inclusive' });
      setAddingExpense(false);
      onSaved(); // refresh data
    } catch (err) {
      console.error('Add expense error:', err);
      alert('Failed to add expense: ' + (err as any).message);
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Delete this expense?')) return;
    setDeletingExpenseId(expenseId);
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      onSaved(); // refresh data
    } catch (err) {
      console.error('Delete expense error:', err);
      alert('Failed to delete: ' + (err as any).message);
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const BUCKET = 'car-images';

  const uploadFiles = async (files: FileList | File[]) => {
    const carId = car?.id ?? 'new';
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${carId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (error) { console.error('Upload error:', error); continue; }
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
      }
      if (newUrls.length > 0) setImages(prev => [...prev, ...newUrls]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload: ' + (err as any).message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const url = images[index];
    // Try to delete from storage
    try {
      const match = url.match(/\/car-images\/(.+)$/);
      if (match) {
        await supabase.storage.from(BUCKET).remove([match[1]]);
      }
    } catch { /* ignore delete errors */ }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = ''; // reset so same file can be re-selected
    }
  };

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const expenseCount = expenses.length;
  const tabs: { id: Tab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'financials', label: 'Financials' },
    { id: 'expenses', label: `Expenses${expenseCount > 0 ? ` (${expenseCount})` : ''}` },
    { id: 'images', label: `Images${images.length > 0 ? ` (${images.length})` : ''}` },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] transition-opacity duration-200"
        style={{ background: 'rgba(20,19,15,0.32)', backdropFilter: 'blur(6px)' }}
        onClick={handleBackdropClick}
      >
        {/* Drawer */}
        <div className="fixed top-0 right-0 bottom-0 flex items-start justify-end gap-2 z-[9999] p-0 pb-2"
             onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-4 w-8 h-8 border-none rounded-[10px] flex items-center justify-center cursor-pointer text-white text-xl flex-shrink-0"
            style={{ background: 'rgba(20,19,15,0.58)', backdropFilter: 'blur(10px)' }}
          >
            ×
          </button>

          {/* Panel */}
          <div
            ref={panelRef}
            className="w-[min(480px,calc(100vw-40px))] h-[calc(100vh-8px)] bg-white rounded-l-[8px] shadow-xl overflow-y-auto overflow-x-hidden"
            style={{ boxShadow: '-16px 0 40px rgba(20,19,15,0.14)' }}
          >
            {/* Hero */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: (formData.type === 'sor' || formData.is_sale_or_return)
                      ? 'linear-gradient(135deg, #8e8df7 0%, #6b6af0 100%)'
                      : 'linear-gradient(135deg, #35a7f6 0%, #2089d6 100%)'
                  }}
                >
                  <span className="text-white text-lg font-medium">
                    {(formData.make || '?')[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[20px] font-medium text-[#2f2b28] truncate" style={{ lineHeight: 1.2 }}>
                    {isNew ? 'New Vehicle' : `${formData.make} ${formData.model}`}
                  </h2>
                  <p className="text-[13px] text-[#8d867b]">{formData.reg || 'No registration'}</p>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center justify-between mt-4 p-3 rounded-[12px] border" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
                <span className="text-[14px] text-[#5b5248]">Status</span>
                {editing ? (
                  <select
                    value={formData.status || 'In Stock'}
                    onChange={e => updateField('status', e.target.value)}
                    className="text-[13px] px-3 py-1.5 rounded-full border-none font-medium cursor-pointer"
                    style={{ background: '#e9f7ea', color: '#2a7b3f' }}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="On Site">On Site</option>
                    <option value="Sold">Sold</option>
                  </select>
                ) : (
                  <span className={cn(
                    'px-3 py-1.5 rounded-full text-[13px] font-medium',
                    formData.status === 'Sold' ? 'bg-[#e9f7ea] text-[#2a7b3f]' :
                    'bg-[#f0edea] text-[#5b5248]'
                  )}>
                    {formData.status}
                  </span>
                )}
              </div>
            </div>

            {/* Tabs (hidden during lookup step) */}
            {(!isNew || lookupDone) && (
            <div className="flex items-center gap-5 px-5 border-b" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'pb-2.5 border-b-2 border-transparent text-[14px] font-normal cursor-pointer bg-transparent transition-colors whitespace-nowrap',
                    tab === t.id ? 'text-[#2f2b28] !border-[#2f2b28]' : 'text-[#8d867b] hover:text-[#5b5248]'
                  )}
                  style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            )}

            {/* Reg lookup step for new vehicles */}
            {isNew && !lookupDone && (
              <div className="px-5 py-8">
                <div className="max-w-xs mx-auto text-center space-y-5">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(53,167,246,0.1)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="#35a7f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-[#2f2b28]">Look up vehicle</h3>
                    <p className="text-[13px] text-[#958f82] mt-1">Enter a registration to auto-fill vehicle details</p>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={lookupReg}
                      onChange={e => setLookupReg(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') handleLookup(); }}
                      placeholder="e.g. AB12 CDE"
                      className="w-full px-4 py-3 rounded-[12px] border text-[15px] text-[#14130f] bg-white text-center font-medium tracking-wider uppercase"
                      style={{ borderColor: 'rgba(20,19,15,0.12)' }}
                      autoFocus
                    />
                    <button
                      onClick={handleLookup}
                      disabled={lookingUp || !lookupReg.trim()}
                      className="w-full py-3 rounded-[12px] text-[14px] font-medium bg-[#14130f] text-white border-none cursor-pointer disabled:opacity-40"
                    >
                      {lookingUp ? 'Looking up…' : 'Search AutoTrader'}
                    </button>
                    <button
                      onClick={() => setLookupDone(true)}
                      className="w-full py-2.5 text-[13px] text-[#8d867b] bg-transparent border-none cursor-pointer hover:text-[#5b5248]"
                    >
                      Skip — enter details manually
                    </button>
                    {lookupError && (
                      <p className="text-[13px] text-[#d96b61]">{lookupError} — you can still edit the details manually.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab content (hidden during lookup step) */}
            {(!isNew || lookupDone) && (
            <div className="px-5 py-5 space-y-4">
              {tab === 'details' && (
                <>
                  <FieldGroup title="Vehicle Info">
                    {/* Run Lookup button for existing cars without lookup data */}
                    {!isNew && !editing && formData.reg && !formData.vin && (
                      <div className="pb-3 mb-1">
                        <button
                          onClick={handleRunLookup}
                          disabled={lookingUp}
                          className="w-full py-2.5 rounded-[10px] text-[13px] font-medium border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                          style={{ background: 'rgba(53,167,246,0.08)', color: '#35a7f6' }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {lookingUp ? 'Looking up…' : 'Run AutoTrader Lookup'}
                        </button>
                        {lookupError && <p className="text-[12px] text-[#d96b61] mt-1.5 text-center">{lookupError}</p>}
                      </div>
                    )}
                    <DetailField label="Make" value={formData.make} field="make" editing={editing} onChange={updateField} />
                    <DetailField label="Model" value={formData.model} field="model" editing={editing} onChange={updateField} />
                    <DetailField label="Registration" value={formData.reg} field="reg" editing={editing} onChange={updateField} />
                    <DetailField label="Derivative" value={formData.derivative} field="derivative" editing={editing} onChange={updateField} />
                    <MileageField mileage={mileage} editing={editing} onChange={setMileage} />
                    <DetailField label="Year" value={formData.year} field="year" editing={editing} onChange={updateField} />
                    <DetailField label="Colour" value={formData.colour} field="colour" editing={editing} onChange={updateField} />
                    <DetailField label="Body Type" value={formData.body_type} field="body_type" editing={editing} onChange={updateField} />
                    <DetailField label="Fuel Type" value={formData.fuel_type} field="fuel_type" editing={editing} onChange={updateField} />
                    <DetailField label="Transmission" value={formData.transmission} field="transmission" editing={editing} onChange={updateField} />
                    <DetailField label="Engine Size" value={formData.engine_size} field="engine_size" editing={editing} onChange={updateField} />
                    <DetailField label="Power (BHP)" value={formData.engine_power_bhp} field="engine_power_bhp" editing={editing} onChange={updateField} />
                    <DetailField label="Doors" value={formData.doors} field="doors" editing={editing} onChange={updateField} />
                    <DetailField label="Seats" value={formData.seats} field="seats" editing={editing} onChange={updateField} />
                    <DetailField label="VIN" value={formData.vin} field="vin" editing={editing} onChange={updateField} />
                    <DetailField label="Type" value={formData.type} field="type" editing={editing} onChange={updateField}
                      options={[{ value: 'owned', label: 'Owned' }, { value: 'sor', label: 'Sale or Return' }]} />
                    {(formData.type === 'sor' || formData.is_sale_or_return) && (
                      <DetailField label="Owner" value={formData.owner_name} field="owner_name" editing={editing} onChange={updateField} />
                    )}
                  </FieldGroup>

                  <FieldGroup title="Timeline">
                    <DetailField label="Purchase Date" value={formData.purchase_date} field="purchase_date" editing={editing} onChange={updateField} type="date" />
                    <DetailField label="Advertised Date" value={formData.advertised_date} field="advertised_date" editing={editing} onChange={updateField} type="date" />
                    <DetailField label="Deposit Date" value={formData.deposit_date} field="deposit_date" editing={editing} onChange={updateField} type="date" />
                    <DetailField label="Sale Date" value={formData.sale_date} field="sale_date" editing={editing} onChange={updateField} type="date" />
                    {deal?.holdDays != null && deal.holdDays > 0 && !editing && (
                      <div className="flex justify-between py-3 border-b" style={{ borderColor: 'rgba(20,19,15,0.06)' }}>
                        <span className="text-[13px] text-[#7f786d]">Hold Period</span>
                        <span className="text-[14px] text-[#2f2b28]">{deal.holdDays} days</span>
                      </div>
                    )}
                  </FieldGroup>

                  {/* Valuations from AutoTrader */}
                  {(formData.retail_value || formData.trade_value) && !editing && (
                    <FieldGroup title="AutoTrader Valuations">
                      {formData.retail_value && <DetailField label="Retail Value" value={formData.retail_value} field="retail_value" editing={false} onChange={updateField} type="currency" />}
                      {formData.trade_value && <DetailField label="Trade Value" value={formData.trade_value} field="trade_value" editing={false} onChange={updateField} type="currency" />}
                    </FieldGroup>
                  )}

                  <FieldGroup title="Notes">
                    {editing ? (
                      <textarea
                        value={(() => {
                          try {
                            const parsed = formData.notes ? JSON.parse(formData.notes) : null;
                            return parsed?.text || '';
                          } catch { return formData.notes || ''; }
                        })()}
                        onChange={e => {
                          try {
                            const existing = formData.notes ? JSON.parse(formData.notes) : {};
                            updateField('notes', JSON.stringify({ ...existing, text: e.target.value }));
                          } catch {
                            updateField('notes', JSON.stringify({ text: e.target.value }));
                          }
                        }}
                        className="w-full p-3 rounded-[10px] border text-[14px] text-[#14130f] bg-white resize-y min-h-[80px]"
                        style={{ borderColor: 'rgba(20,19,15,0.09)' }}
                        placeholder="Add notes…"
                      />
                    ) : (
                      <p className="text-[14px] text-[#5b5248]">
                        {(() => {
                          try {
                            const parsed = formData.notes ? JSON.parse(formData.notes) : null;
                            return parsed?.text || '—';
                          } catch {
                            return formData.notes || '—';
                          }
                        })()}
                      </p>
                    )}
                  </FieldGroup>
                </>
              )}

              {tab === 'financials' && (
                <>
                  <FieldGroup title="Purchase & Sale">
                    <DetailField label="Purchase Price" value={formData.paid} field="paid" editing={editing} onChange={updateField} type="currency" />
                    <DetailField label="Advertised Price" value={formData.advertised} field="advertised" editing={editing} onChange={updateField} type="currency" />
                    <DetailField label="Sale Price" value={formData.sold} field="sold" editing={editing} onChange={updateField} type="currency" />
                    <DetailField label="Deposit Amount" value={formData.deposit_amount} field="deposit_amount" editing={editing} onChange={updateField} type="currency" />
                  </FieldGroup>

                  <FieldGroup title="VAT Scheme">
                    {editing ? (
                      <div className="flex gap-1.5">
                        {([
                          { value: 'no_vat', label: 'No VAT' },
                          { value: 'margin', label: 'VAT Margin' },
                          { value: 'plus_vat', label: 'Plus VAT' },
                        ] as const).map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, purchase_vat_type: opt.value }))}
                            className="flex-1 py-2.5 rounded-[10px] text-[13px] font-medium border cursor-pointer transition-colors"
                            style={{
                              borderColor: formData.purchase_vat_type === opt.value ? '#14130f' : 'rgba(20,19,15,0.09)',
                              background: formData.purchase_vat_type === opt.value ? '#14130f' : '#fff',
                              color: formData.purchase_vat_type === opt.value ? '#fff' : '#3a3731',
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[14px] text-[#14130f]">
                        {formData.purchase_vat_type === 'plus_vat' ? 'Plus VAT' : formData.purchase_vat_type === 'margin' ? 'VAT Margin' : 'No VAT'}
                      </p>
                    )}
                    {formData.purchase_vat_type === 'plus_vat' && (
                      <p className="text-[12px] text-[#958f82] mt-1">VAT on expenses will be deducted from costs</p>
                    )}
                  </FieldGroup>

                  {(formData.type === 'sor' || formData.is_sale_or_return) && (
                    <FieldGroup title="Sale or Return">
                      <DetailField label="Fee / Commission" value={formData.fee} field="fee" editing={editing} onChange={updateField} type="currency" />
                      <DetailField label="Owner Payout" value={formData.owner_payout_amount} field="owner_payout_amount" editing={editing} onChange={updateField} type="currency" />
                    </FieldGroup>
                  )}

                  {deal && !isNew && (
                    <FieldGroup title="Computed">
                      <div className="space-y-2">
                        <ComputedRow label="Purchase Price" value={formatCurrency(deal.purchasePrice)} />
                        <ComputedRow label="Prep Costs" value={formatCurrency(deal.prepCosts)} sub={`${deal.expenses.filter(e => e.type?.toLowerCase() !== 'vehicle purchase').length} expenses`} />
                        
                        <ComputedRow label="Total Costs" value={formatCurrency(deal.totalCosts)} bold />
                        <ComputedRow label="Total Income" value={formatCurrency(deal.totalIncome)} />

                        {/* VAT breakdown — before net profit */}
                        {deal.car.purchase_vat_type && deal.car.purchase_vat_type !== 'no_vat' && (
                          <div className="pt-2 border-t" style={{ borderColor: 'rgba(20,19,15,0.09)' }}>
                            {deal.car.purchase_vat_type === 'margin' && (
                              <ComputedRow label="VAT on Margin" value={deal.vatOwed > 0 ? formatCurrency(deal.vatOwed) : '£0'} sub="1/6 of sale − purchase" />
                            )}
                            {deal.car.purchase_vat_type === 'plus_vat' && (
                              <ComputedRow label="Output VAT" value={deal.vatOwed > 0 ? formatCurrency(deal.vatOwed) : '£0'} sub="1/6 of sale price" />
                            )}
                            {deal.vatReclaimable > 0 && (
                              <ComputedRow label="VAT Reclaimable" value={`−${formatCurrency(deal.vatReclaimable)}`} valueColor="#35a7f6" />
                            )}
                            <ComputedRow
                              label="Net VAT"
                              value={`${deal.netVat >= 0 ? '' : '−'}${formatCurrency(Math.abs(deal.netVat))}`}
                              valueColor={deal.netVat < 0 ? '#23a56b' : deal.netVat > 0 ? '#d96b61' : undefined}
                              bold
                              sub={deal.netVat > 0 ? 'Owed to HMRC' : deal.netVat < 0 ? 'Reclaimable' : ''}
                            />
                          </div>
                        )}

                        <div className="pt-2 border-t" style={{ borderColor: 'rgba(20,19,15,0.09)' }}>
                          <ComputedRow
                            label="Net Profit"
                            value={`${deal.netProfit > 0 ? '+' : ''}${formatCurrency(deal.netProfit)}`}
                            valueColor={deal.netProfit > 0 ? '#23a56b' : deal.netProfit < 0 ? '#d96b61' : undefined}
                            bold
                          />
                          {deal.roi !== null && (
                            <ComputedRow label="ROI" value={`${deal.roi}%`} valueColor="#35a7f6" />
                          )}
                        </div>
                      </div>
                    </FieldGroup>
                  )}
                </>
              )}

              {tab === 'expenses' && (
                <>
                  {/* Add expense button / form */}
                  {!isNew && car && (
                    <>
                      {addingExpense ? (
                        <div className="border rounded-[14px] overflow-hidden" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
                          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(20,19,15,0.08)', background: '#faf9f7' }}>
                            <h4 className="text-[12px] uppercase tracking-[0.06em] text-[#7a7368] font-medium">New Expense</h4>
                          </div>
                          <div className="px-4 py-3 space-y-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] uppercase tracking-[0.08em] text-[#7a7368] font-medium">Type</label>
                              <select
                                value={newExpense.type}
                                onChange={e => setNewExpense(prev => ({ ...prev, type: e.target.value }))}
                                className="px-3 py-2.5 rounded-[10px] border text-[14px] text-[#14130f] bg-white w-full cursor-pointer"
                                style={{ borderColor: 'rgba(20,19,15,0.09)' }}
                              >
                                <option value="">Select type…</option>
                                <option value="Vehicle Purchase">Vehicle Purchase</option>
                                <option value="Auction Fee">Auction Fee</option>
                                <option value="mechanics">Mechanics</option>
                                <option value="bodywork">Bodywork</option>
                                <option value="mot">MOT</option>
                                <option value="transport">Transport</option>
                                <option value="valet">Valet</option>
                                <option value="parts">Parts</option>
                                <option value="tyres">Tyres</option>
                                <option value="advertising">Advertising</option>
                                <option value="warranty">Warranty</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] uppercase tracking-[0.08em] text-[#7a7368] font-medium">Amount (£)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={newExpense.amount}
                                onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="0.00"
                                className="px-3 py-2.5 rounded-[10px] border text-[14px] text-[#14130f] bg-white w-full"
                                style={{ borderColor: 'rgba(20,19,15,0.09)' }}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] uppercase tracking-[0.08em] text-[#7a7368] font-medium">VAT</label>
                              <div className="flex gap-1.5">
                                {([
                                  { value: 'inclusive', label: '20% Incl' },
                                  { value: 'none', label: 'No VAT' },
                                  { value: 'exclusive', label: '20% Excl' },
                                ] as const).map(opt => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setNewExpense(prev => ({ ...prev, vat_status: opt.value }))}
                                    className="flex-1 py-2 rounded-[10px] text-[13px] font-medium border cursor-pointer transition-colors"
                                    style={{
                                      borderColor: newExpense.vat_status === opt.value ? '#14130f' : 'rgba(20,19,15,0.09)',
                                      background: newExpense.vat_status === opt.value ? '#14130f' : '#fff',
                                      color: newExpense.vat_status === opt.value ? '#fff' : '#3a3731',
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] uppercase tracking-[0.08em] text-[#7a7368] font-medium">Supplier</label>
                              <input
                                type="text"
                                value={newExpense.supplier}
                                onChange={e => setNewExpense(prev => ({ ...prev, supplier: e.target.value }))}
                                placeholder="e.g. Halfords"
                                className="px-3 py-2.5 rounded-[10px] border text-[14px] text-[#14130f] bg-white w-full"
                                style={{ borderColor: 'rgba(20,19,15,0.09)' }}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] uppercase tracking-[0.08em] text-[#7a7368] font-medium">Date</label>
                              <input
                                type="date"
                                value={newExpense.date}
                                onChange={e => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                                className="px-3 py-2.5 rounded-[10px] border text-[14px] text-[#14130f] bg-white w-full"
                                style={{ borderColor: 'rgba(20,19,15,0.09)' }}
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={handleAddExpense}
                                disabled={savingExpense || !newExpense.type || !newExpense.amount}
                                className="flex-1 py-2.5 rounded-[10px] text-[13px] font-medium bg-[#14130f] text-white border-none cursor-pointer disabled:opacity-40"
                              >
                                {savingExpense ? 'Adding…' : 'Add Expense'}
                              </button>
                              <button
                                onClick={() => { setAddingExpense(false); setNewExpense({ type: '', amount: '', date: '', supplier: '', vat_status: 'inclusive' }); }}
                                className="px-4 py-2.5 rounded-[10px] text-[13px] font-medium bg-white text-[#3a3731] border cursor-pointer"
                                style={{ borderColor: 'rgba(20,19,15,0.09)' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingExpense(true)}
                          className="w-full py-2.5 rounded-[12px] text-[13px] font-medium bg-[#14130f] text-white border-none cursor-pointer"
                        >
                          + Add Expense
                        </button>
                      )}
                    </>
                  )}

                  {/* Expenses list */}
                  {expenses.length > 0 ? (
                    <div className="border rounded-[14px] overflow-hidden" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(20,19,15,0.08)', background: '#faf9f7' }}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-[12px] uppercase tracking-[0.06em] text-[#7a7368] font-medium">
                            All Expenses
                          </h4>
                          <span className="text-[13px] font-medium text-[#2f2b28]">
                            {formatCurrency(expenses.reduce((sum, e) => sum + (e.amount || 0), 0))}
                          </span>
                        </div>
                      </div>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
                            <th className="px-4 py-2.5 text-left text-[12px] text-[#8d867b] font-normal">Type</th>
                            <th className="px-4 py-2.5 text-left text-[12px] text-[#8d867b] font-normal">Supplier</th>
                            <th className="px-4 py-2.5 text-right text-[12px] text-[#8d867b] font-normal">Amount</th>
                            <th className="px-2 py-2.5 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map(exp => (
                            <tr key={exp.id} className="border-b group" style={{ borderColor: 'rgba(20,19,15,0.06)' }}>
                              <td className="px-4 py-2.5">
                                <div className="text-[13px] text-[#14130f] capitalize">{exp.type}</div>
                                {exp.date && <div className="text-[11px] text-[#a39c8f]">{formatDate(exp.date)}</div>}
                              </td>
                              <td className="px-4 py-2.5 text-[13px] text-[#958f82]">{exp.supplier || '—'}</td>
                              <td className="px-4 py-2.5 text-right">
                                <div className="text-[13px] text-[#14130f]">{formatCurrency(exp.amount)}</div>
                                {exp.vat_status === 'standard' && exp.vat_amount ? (
                                  <div className="text-[11px] text-[#a39c8f]">inc. {formatCurrency(exp.vat_amount)} VAT</div>
                                ) : exp.vat_status === 'zero' || !exp.vat_amount ? (
                                  <div className="text-[11px] text-[#a39c8f]">No VAT</div>
                                ) : null}
                              </td>
                              <td className="px-2 py-2.5">
                                <button
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  disabled={deletingExpenseId === exp.id}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#d96b61] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none text-sm hover:bg-red-50"
                                  title="Delete expense"
                                >
                                  {deletingExpenseId === exp.id ? '…' : '×'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    !addingExpense && (
                      <div className="py-10 text-center rounded-[10px] border-2 border-dashed" style={{ borderColor: 'rgba(20,19,15,0.1)' }}>
                        <p className="text-[#958f82] text-sm">No expenses logged</p>
                        {!isNew && <p className="text-[#a39c8f] text-xs mt-1">Click &quot;Add Expense&quot; to start tracking</p>}
                      </div>
                    )
                  )}
                </>
              )}

              {tab === 'images' && (
                <>
                  {/* Upload area (always visible in edit mode, or when no images) */}
                  {editing && (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="relative rounded-[14px] border-2 border-dashed cursor-pointer transition-colors"
                      style={{
                        borderColor: dragOver ? '#35a7f6' : 'rgba(20,19,15,0.12)',
                        background: dragOver ? 'rgba(53,167,246,0.04)' : '#faf9f7',
                      }}
                    >
                      <div className="flex flex-col items-center py-8 px-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                          style={{ background: dragOver ? 'rgba(53,167,246,0.12)' : 'rgba(20,19,15,0.06)' }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 3v10m0-10L6 7m4-4l4 4M3 14l.9 2.7A1 1 0 004.8 17.5h10.4a1 1 0 00.9-.8L17 14" stroke={dragOver ? '#35a7f6' : '#8d867b'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {uploading ? (
                          <p className="text-[14px] text-[#35a7f6] font-medium">Uploading…</p>
                        ) : (
                          <>
                            <p className="text-[14px] text-[#2f2b28] font-medium">
                              {dragOver ? 'Drop images here' : 'Drag & drop images'}
                            </p>
                            <p className="text-[12px] text-[#958f82] mt-1">or click to browse • JPG, PNG, WebP up to 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* Image grid */}
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((url, i) => (
                        <div key={i} className="relative group rounded-[10px] overflow-hidden border" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
                          <img
                            src={url}
                            alt={`Car image ${i + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect fill="%23f5f5f5" width="100" height="60"/><text x="50" y="35" text-anchor="middle" fill="%238d867b" font-size="10">No image</text></svg>';
                            }}
                          />
                          {editing && (
                            <button
                              onClick={() => removeImage(i)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    !editing && (
                      <div className="py-10 text-center rounded-[10px] border-2 border-dashed" style={{ borderColor: 'rgba(20,19,15,0.1)' }}>
                        <p className="text-[#958f82] text-sm">No images yet</p>
                        <p className="text-[#a39c8f] text-xs mt-1">Click Edit to upload images</p>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
            )}

            {/* Actions (hidden during lookup step) */}
            {(!isNew || lookupDone) && (
            <div className="sticky bottom-0 bg-white border-t px-5 py-4 flex gap-3" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-[12px] text-[13px] font-medium bg-[#14130f] text-white border-none cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : isNew ? 'Add Vehicle' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => { if (isNew) onClose(); else setEditing(false); }}
                    className="px-5 py-2.5 rounded-[12px] text-[13px] font-medium bg-white text-[#3a3731] border cursor-pointer"
                    style={{ borderColor: 'rgba(20,19,15,0.09)' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 py-2.5 rounded-[12px] text-[13px] font-medium bg-[#14130f] text-white border-none cursor-pointer"
                >
                  Edit Vehicle
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-[14px] overflow-hidden" style={{ borderColor: 'rgba(20,19,15,0.08)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(20,19,15,0.08)', background: '#faf9f7' }}>
        <h4 className="text-[12px] uppercase tracking-[0.06em] text-[#7a7368] font-medium">{title}</h4>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

function DetailField({
  label, value, field, editing, onChange, type = 'text', options,
}: {
  label: string;
  value: any;
  field: string;
  editing: boolean;
  onChange?: (field: string, value: any) => void;
  type?: 'text' | 'date' | 'currency' | 'select';
  options?: { value: string; label: string }[];
}) {
  if (!editing) {
    let display = value;
    if (type === 'currency') display = value ? formatCurrency(Number(value)) : '—';
    else if (type === 'date') display = value ? formatDate(value) : '—';
    else if (options) display = options.find(o => o.value === value)?.label || value || '—';
    else display = value || '—';

    return (
      <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'rgba(20,19,15,0.06)' }}>
        <span className="text-[13px] text-[#7f786d]">{label}</span>
        <span className="text-[14px] text-[#2f2b28] text-right">{display}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 py-2.5 border-b" style={{ borderColor: 'rgba(20,19,15,0.06)' }}>
      <label className="text-[11px] uppercase tracking-[0.08em] text-[#7a7368] font-medium">{label}</label>
      {options ? (
        <select
          value={value || ''}
          onChange={e => onChange?.(field, e.target.value)}
          className="px-3 py-2.5 rounded-[10px] border text-[14px] text-[#14130f] bg-white w-full cursor-pointer"
          style={{ borderColor: 'rgba(20,19,15,0.09)' }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type === 'currency' ? 'number' : type === 'date' ? 'date' : 'text'}
          value={value ?? ''}
          onChange={e => onChange?.(field, e.target.value)}
          placeholder={type === 'currency' ? '0' : ''}
          step={type === 'currency' ? '0.01' : undefined}
          className="px-3 py-2.5 rounded-[10px] border text-[14px] text-[#14130f] bg-white w-full"
          style={{ borderColor: 'rgba(20,19,15,0.09)' }}
        />
      )}
    </div>
  );
}

function MileageField({ mileage, editing, onChange }: { mileage: string; editing: boolean; onChange: (v: string) => void }) {
  const formatted = mileage ? Number(mileage).toLocaleString('en-GB') + ' mi' : '—';
  if (!editing) {
    return (
      <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'rgba(20,19,15,0.06)' }}>
        <span className="text-[13px] text-[#7f786d]">Mileage</span>
        <span className="text-[14px] text-[#2f2b28] text-right">{formatted}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 py-2.5 border-b" style={{ borderColor: 'rgba(20,19,15,0.06)' }}>
      <label className="text-[11px] uppercase tracking-[0.08em] text-[#7a7368] font-medium">Mileage</label>
      <input
        type="number"
        value={mileage}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. 45000"
        className="px-3 py-2.5 rounded-[10px] border text-[14px] text-[#14130f] bg-white w-full"
        style={{ borderColor: 'rgba(20,19,15,0.09)' }}
      />
    </div>
  );
}

function ComputedRow({
  label, value, sub, bold, valueColor,
}: {
  label: string; value: string; sub?: string; bold?: boolean; valueColor?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <div>
        <span className={cn('text-[13px]', bold ? 'text-[#2f2b28] font-medium' : 'text-[#7f786d]')}>{label}</span>
        {sub && <span className="text-[11px] text-[#a39c8f] ml-2">{sub}</span>}
      </div>
      <span
        className={cn('text-[14px]', bold ? 'font-medium' : '')}
        style={{ color: valueColor || '#2f2b28' }}
      >
        {value}
      </span>
    </div>
  );
}
