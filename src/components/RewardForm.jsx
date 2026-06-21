import React, { useState, useEffect } from 'react';
import { Plus, Save } from 'lucide-react';

export function RewardForm({ onSubmit, initialData = null, onCancel }) {
    const [formData, setFormData] = useState({
        title: '',
        cost: 50
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputStyle = {
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #ddd',
        marginBottom: '1rem',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: 'var(--color-text)',
        fontWeight: 'bold',
        textAlign: 'left'
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label style={labelStyle}>Nombre del Premio</label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    style={inputStyle}
                    placeholder="Ej. Tiempo de TV"
                />
            </div>

            <div>
                <label style={labelStyle}>Coste (Puntos)</label>
                <input
                    type="number"
                    required
                    min="1"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#f0f0f0',
                            borderRadius: 'var(--radius-md)',
                            color: '#666'
                        }}
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--color-text)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {initialData ? <Save size={18} /> : <Plus size={18} />}
                    {initialData ? 'Guardar Cambios' : 'Crear Premio'}
                </button>
            </div>
        </form>
    );
}
