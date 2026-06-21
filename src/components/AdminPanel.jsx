import React from 'react';
import { PlusCircle, Gift } from 'lucide-react';

export function AdminPanel({ onAddTask, onAddReward }) {
    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-card-bg)',
            padding: '1rem 2rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            zIndex: 100,
            border: '2px solid var(--color-text)',
            width: 'max-content',
            maxWidth: '90%'
        }}>
            <button
                onClick={onAddTask}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap'
                }}
            >
                <PlusCircle size={20} /> Nueva Tarea
            </button>
            <button
                onClick={onAddReward}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'var(--color-secondary)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap'
                }}
            >
                <Gift size={20} /> Nuevo Premio
            </button>
        </div>
    );
}
